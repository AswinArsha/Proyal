import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RewardManagement = () => {
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [foodItems, setFoodItems] = useState([{ code: '', name: '', quantity: 1 }, { code: '', name: '', quantity: 1 }, { code: '', name: '', quantity: 1 }]);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '', date_of_birth: '', anniversary: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchField, setSearchField] = useState('');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerName(customerId);
    }
  }, [customerId]);

  const fetchCustomerName = async (id) => {
    setIsLoading(true);
    const { data, error } = await supabase.from('customers').select('name').eq('customer_code', id).single();
    setIsLoading(false);
    if (error) {
      console.log('Error fetching customer name:', error);
      setCustomerName('');
    } else {
      setCustomerName(data ? data.name : '');
    }
  };

  const handleFoodCodeChange = async (index, value) => {
    setActiveIndex(index);
    setSearchField('code');
    const newFoodItems = [...foodItems];
    newFoodItems[index].code = value;
    setFoodItems(newFoodItems);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchFoodItems(value, 'code');
    }, 300);
  };

  const handleFoodNameChange = async (index, value) => {
    setActiveIndex(index);
    setSearchField('name');
    const newFoodItems = [...foodItems];
    newFoodItems[index].name = value;
    setFoodItems(newFoodItems);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchFoodItems(value, 'name');
    }, 300);
  };

  const handleQuantityChange = (index, value) => {
    const newFoodItems = [...foodItems];
    newFoodItems[index].quantity = value;
    setFoodItems(newFoodItems);
  };

  const searchFoodItems = async (query, field) => {
    if (query.length >= 1) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('food_items')
        .select('code, name')
        .ilike(field, `${query}%`)
        .order(field, { ascending: true })
        .limit(5);

      setIsLoading(false);
      if (error) {
        console.log('Error fetching food items:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectFoodItem = (item, index) => {
    const newFoodItems = [...foodItems];
    newFoodItems[index] = { code: item.code, name: item.name, quantity: newFoodItems[index].quantity };
    setFoodItems(newFoodItems);
    setSearchResults([]);
    setActiveIndex(null);
  };

  const addFoodInput = () => {
    setFoodItems([...foodItems, { code: '', name: '', quantity: 1 }]);
  };

  const handleAddCustomer = async () => {
    setIsLoading(true);
    const { error } = await supabase.from('customers').insert([newCustomer]);
    setIsLoading(false);
    if (error) {
      console.log('Error adding customer:', error);
      showToast('Error adding customer', 'error');
    } else {
      setNewCustomer({ name: '', email: '', phone: '', address: '', date_of_birth: '', anniversary: '' });
      setIsAddCustomerDialogOpen(false);
      showToast('Customer added successfully', 'success');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const { data: customerData, error: customerError } = await supabase.from('customers').select('id').eq('customer_code', customerId).single();

    if (customerError || !customerData) {
      showToast('Customer ID not found', 'error');
      setIsLoading(false);
      return;
    }

    const customerID = customerData.id;

    const filteredFoodItems = foodItems.filter(item => item.code && item.name);

    for (const item of filteredFoodItems) {
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('customer_id', customerID)
        .eq('food_item', item.name);

      if (error) {
        console.log('Error checking order history:', error);
        continue;
      }

      if (count >= 9) {
        showToast(`Customer is ordering ${item.name} for the 10th time!`, 'info');
      }

      const { error: insertError } = await supabase.from('orders').insert({
        customer_id: customerID,
        food_item: item.name,
        food_code: item.code,  // Include the food code here
        quantity: item.quantity
      });

      if (insertError) {
        console.log('Error adding order:', insertError);
      }
    }

    setIsLoading(false);
    showToast('Orders submitted successfully', 'success');
    clearForm();
  };

  const clearForm = () => {
    setCustomerId('');
    setCustomerName('');
    setFoodItems([{ code: '', name: '', quantity: 1 }, { code: '', name: '', quantity: 1 }, { code: '', name: '', quantity: 1 }]);
  };

  const showToast = (message, type) => {
    toast[type](message);
  };

  return (
    <Card className="shadow-xl bg-white rounded-lg max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reward Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Input
            type="text"
            placeholder="Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full sm:w-1/2"
          />
          <div className="relative w-full sm:w-1/2">
            <Input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              readOnly
              className="w-full"
            />
            {!customerName && (
              <Button 
                onClick={() => setIsAddCustomerDialogOpen(true)} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-400 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                +
              </Button>
            )}
          </div>
        </div>
        
        {foodItems.map((item, index) => (
          <div key={index} className="relative flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/3 relative">
              <Input
                type="text"
                placeholder="Food Code"
                value={item.code}
                onChange={(e) => handleFoodCodeChange(index, e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-1/3 relative">
              <Input
                type="text"
                placeholder="Food Name"
                value={item.name}
                onChange={(e) => handleFoodNameChange(index, e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-1/3 relative">
              <Input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                className="w-full"
              />
            </div>

            {activeIndex === index && searchResults.length > 0 && (
              <div className="absolute z-10 w-full sm:w-[calc(200% + 1rem)] bg-white border border-gray-300 rounded-md shadow-lg mt-1 left-0 top-full -translate-x-4 translate-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.code}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                    onClick={() => selectFoodItem(result, index)}
                  >
                    <span>{result.code}</span>
                    <span>{result.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="flex justify-between">
          <Button onClick={addFoodInput} className="bg-green-500 hover:bg-green-400 text-white">
            Add Food Item
          </Button>
          <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-400 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit
          </Button>
        </div>
      </CardContent>

      <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date_of_birth" className="text-right">
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={newCustomer.date_of_birth}
                onChange={(e) => setNewCustomer({ ...newCustomer, date_of_birth: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="anniversary" className="text-right">
                Anniversary
              </Label>
              <Input
                id="anniversary"
                type="date"
                value={newCustomer.anniversary}
                onChange={(e) => setNewCustomer({ ...newCustomer, anniversary: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddCustomer} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </Card>
  );
};

export default RewardManagement;
