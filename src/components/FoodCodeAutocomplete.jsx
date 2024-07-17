import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Loader2 } from 'lucide-react';

const FoodCodeAutocomplete = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (inputValue.length > 0) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('food_items')
          .select('code, name')
          .ilike('code', `${inputValue}%`)
          .order('code')
          .limit(5);

        if (error) {
          console.error('Error fetching food items:', error);
        } else {
          setResults(data);
        }
        setIsLoading(false);
      } else {
        setResults([]);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowResults(true);
  };

  const handleSelectItem = (item) => {
    setInputValue(item.code);
    setShowResults(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Enter food code"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowResults(true)}
        className="w-full"
      />
      {showResults && (
        <Command className="absolute z-50 w-full mt-1 border rounded-md shadow-md bg-white">
          <CommandEmpty>
            {isLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </div>
            ) : (
              'No results found'
            )}
          </CommandEmpty>
          <CommandGroup>
            {results.map((item) => (
              <CommandItem
                key={item.code}
                onSelect={() => handleSelectItem(item)}
                className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100"
              >
                <span className="font-medium">{item.code}</span>
                <span className="text-gray-600">{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      )}
    </div>
  );
};

export default FoodCodeAutocomplete;
