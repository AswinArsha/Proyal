import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const FoodManagement = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [newFood, setNewFood] = useState({ name: '', code: '' });
  const [editFood, setEditFood] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFoodItems();

    const foodSubscription = supabase
      .channel('public:food_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, payload => {
        switch (payload.eventType) {
          case 'INSERT':
            setFoodItems(prev => [...prev, payload.new]);
            break;
          case 'UPDATE':
            setFoodItems(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
            break;
          case 'DELETE':
            setFoodItems(prev => prev.filter(item => item.id !== payload.old.id));
            break;
          default:
            break;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(foodSubscription);
    };
  }, []);

  useEffect(() => {
    setFilteredItems(
      foodItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, foodItems]);

  const fetchFoodItems = async () => {
    const { data, error } = await supabase.from('food_items').select('*');
    if (error) console.log('Error fetching food items:', error);
    else setFoodItems(data);
  };

  const handleAddFood = async () => {
    const { error } = await supabase.from('food_items').insert([newFood]);
    if (error) console.log('Error adding food item:', error);
    else setNewFood({ name: '', code: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditFood = async () => {
    const { error } = await supabase.from('food_items').update(editFood).eq('id', editFood.id);
    if (error) console.log('Error updating food item:', error);
    else setEditFood(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteFood = async (id) => {
    const { error } = await supabase.from('food_items').delete().eq('id', id);
    if (error) console.log('Error deleting food item:', error);
    else setFoodItems(foodItems.filter(item => item.id !== id));
  };

  return (
    <Card className="shadow-xl bg-white rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Food Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <Input
            type="text"
            placeholder="Search by name or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 rounded-md p-2"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsAddDialogOpen(true);
                setIsEditDialogOpen(false);
              }} className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-md px-4 py-2">Add Food Item</Button>
            </DialogTrigger>
            <DialogContent className="p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Add Food Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Food Name"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full p-2 rounded-md"
                />
                <Input
                  type="text"
                  placeholder="Food Code"
                  value={newFood.code}
                  onChange={(e) => setNewFood({ ...newFood, code: e.target.value })}
                  className="w-full p-2 rounded-md"
                />
              </div>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-md px-4 py-2">Cancel</Button>
                <Button onClick={handleAddFood} className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-md px-4 py-2">Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="max-h-[calc(100vh-13rem)] overflow-y-auto rounded-md border"> 
          <Table className="w-full bg-white shadow-lg rounded-md">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableCell className="p-4">No</TableCell>
                <TableCell className="p-4">Food Name</TableCell>
                <TableCell className="p-4">Food Code</TableCell>
                <TableCell className="p-4">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="p-4">{index + 1}</TableCell>
                  <TableCell className="p-4">{item.name}</TableCell>
                  <TableCell className="p-4">{item.code}</TableCell>
                  <TableCell className="p-4 flex space-x-2">
                    <Button variant="outline" onClick={() => {
                      setEditFood(item);
                      setIsEditDialogOpen(true);
                      setIsAddDialogOpen(false);
                    }} className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white hover:text-white">Edit</Button>
                    <Button variant="outline" onClick={() => {
                      setSelectedFoodId(item.id);
                      setIsDeleteDialogOpen(true);
                    }} className="rounded-md px-4 py-2 bg-red-500 hover:bg-red-400 text-white hover:text-white">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {editFood && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Edit Food Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Food Name"
                  value={editFood.name}
                  onChange={(e) => setEditFood({ ...editFood, name: e.target.value })}
                  className="w-full p-2 rounded-md"
                />
                <Input
                  type="text"
                  placeholder="Food Code"
                  value={editFood.code}
                  onChange={(e) => setEditFood({ ...editFood, code: e.target.value })}
                  className="w-full p-2 rounded-md"
                />
              </div>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-md px-4 py-2">Cancel</Button>
                <Button onClick={handleEditFood} className="bg-blue-500 text-white rounded-md px-4 py-2">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {selectedFoodId && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Are you sure you want to delete this item?</DialogTitle>
              </DialogHeader>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-md px-4 py-2">Cancel</Button>
                <Button onClick={() => {
                  handleDeleteFood(selectedFoodId);
                  setIsDeleteDialogOpen(false);
                }} className="bg-red-500 text-white rounded-md px-4 py-2">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default FoodManagement;