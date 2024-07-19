import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    anniversary: "",
  });
  const [editCustomer, setEditCustomer] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, [currentCustomerPage, search]);

  const fetchCustomers = async () => {
    const start = (currentCustomerPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from("customers")
      .select("*", { count: "exact" })
      .ilike("name", `%${search}%`)
      .range(start, end);

    if (error) {
      console.log("Error fetching customers:", error);
    } else {
      setCustomers(data);
      setTotalCustomers(count);
    }
  };

  const fetchOrderHistory = async (customerId) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId);

    if (error) {
      console.log("Error fetching order history:", error);
    } else {
      const aggregatedOrders = data.reduce((acc, order) => {
        const existingOrder = acc.find(
          (item) => item.food_item === order.food_item
        );
        if (existingOrder) {
          existingOrder.quantity += order.quantity;
        } else {
          acc.push({ ...order });
        }
        return acc;
      }, []);
      setOrderHistory(aggregatedOrders);
    }
  };

  const handleAddCustomer = async () => {
    setIsLoading(true);
    const { error } = await supabase.from("customers").insert([newCustomer]);
    setIsLoading(false);
    if (error) {
      console.log("Error adding customer:", error);
      showToast("Error adding customer", "error");
    } else {
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        date_of_birth: "",
        anniversary: "",
      });
      setIsAddDialogOpen(false);
      fetchCustomers();
      showToast("Customer added successfully", "success");
    }
  };

  const handleEditCustomer = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("customers")
      .update(editCustomer)
      .eq("id", editCustomer.id);
    setIsLoading(false);
    if (error) {
      console.log("Error updating customer:", error);
      showToast("Error updating customer", "error");
    } else {
      setEditCustomer(null);
      setIsEditDialogOpen(false);
      fetchCustomers();
      showToast("Customer updated successfully", "success");
    }
  };

  const handleDeleteCustomer = async (id) => {
    setIsLoading(true);
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("customer_id", id);
    const { error: customerError } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);
    setIsLoading(false);
    if (customerError || ordersError) {
      console.log("Error deleting customer and related data:", customerError || ordersError);
      showToast("Error deleting customer", "error");
    } else {
      setCustomers(customers.filter((customer) => customer.id !== id));
      setIsDeleteDialogOpen(false);
      showToast("Customer deleted successfully", "success");
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchOrderHistory(customer.id);
    setIsViewDialogOpen(true);
  };

  const showToast = (message, type) => {
    toast[type](message);
  };

  const handleCustomerPageChange = (page) => {
    if (page > 0 && page <= Math.ceil(totalCustomers / PAGE_SIZE)) {
      setCurrentCustomerPage(page);
    }
  };

  return (
    <Card className="shadow-xl -mt-4 overflow-y-hidden bg-white rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Customer Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 rounded-md p-2 focus:ring focus:ring-emerald-200"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-md px-4 py-2"
              >
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Add Customer
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Name"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full p-2 rounded-md"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full p-2 rounded-md"
                />
                <Input
                  type="text"
                  placeholder="Phone"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full p-2 rounded-md"
                  required
                />
                <Input
                  type="text"
                  placeholder="Address"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="w-full p-2 rounded-md"
                />
                <div className="flex flex-col space-y-1">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={newCustomer.date_of_birth}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        date_of_birth: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-md"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <Label>Anniversary</Label>
                  <Input
                    type="date"
                    value={newCustomer.anniversary}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        anniversary: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-md"
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="rounded-md px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCustomer}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-md px-4 py-2"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto rounded-md border">
          <Table className="w-full bg-white shadow-lg rounded-md">
            <TableHeader className="sticky top-0 bg-gray-100">
              <TableRow>
                <TableCell className="p-4">No</TableCell>
                <TableCell className="p-4">Customer Code</TableCell>
                <TableCell className="p-4">Name</TableCell>
                <TableCell className="p-4">Email</TableCell>
                <TableCell className="p-4">Phone</TableCell>
                <TableCell className="p-4">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-gray-50 shadow-sm"
                >
                  <TableCell className="p-4">
                    {(currentCustomerPage - 1) * PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell className="p-4">{customer.customer_code}</TableCell>
                  <TableCell className="p-4">{customer.name}</TableCell>
                  <TableCell className="p-4">{customer.email}</TableCell>
                  <TableCell className="p-4">{customer.phone}</TableCell>
                  <TableCell className="p-4 flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSelectCustomer(customer)}
                      className="rounded-md px-4 py-2 bg-blue-500 hover:bg-blue-400 hover:text-white text-white"
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditCustomer(customer);
                        setIsEditDialogOpen(true);
                      }}
                      className="rounded-md px-4 py-2 bg-yellow-500 hover:bg-yellow-400 hover:text-white text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="rounded-md px-4 py-2 bg-red-500 hover:bg-red-400 hover:text-white text-white"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div> 
        <Pagination className={"mt-4"}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handleCustomerPageChange(currentCustomerPage - 1)}
                disabled={currentCustomerPage === 1}
              />
            </PaginationItem>
            {[...Array(Math.ceil(totalCustomers / PAGE_SIZE)).keys()].map((page) => (
              <PaginationItem key={page + 1}>
                <PaginationLink
                  href="#"
                  onClick={() => handleCustomerPageChange(page + 1)}
                  isActive={page + 1 === currentCustomerPage}
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handleCustomerPageChange(currentCustomerPage + 1)}
                disabled={currentCustomerPage === Math.ceil(totalCustomers / PAGE_SIZE)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        {selectedCustomer && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="p-6 rounded-lg shadow-lg max-w-5xl h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Customer Details
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Customer Details</TabsTrigger>
                  <TabsTrigger value="history">Order History</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="flex space-x-8">
                    <div className="w-1/2  p-4 rounded-md">
                      <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                      <p className="mb-2">
                        <strong>Customer Code:</strong> {selectedCustomer.customer_code}
                      </p>
                      <p className="mb-2">
                        <strong>Name:</strong> {selectedCustomer.name}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong> {selectedCustomer.email}
                      </p>
                      <p className="mb-2">
                        <strong>Phone:</strong> {selectedCustomer.phone}
                      </p>
                      <p className="mb-2">
                        <strong>Address:</strong> {selectedCustomer.address}
                      </p>
                      <p className="mb-2">
                        <strong>Date of Birth:</strong> {selectedCustomer.date_of_birth}
                      </p>
                      <p className="mb-2">
                        <strong>Anniversary:</strong> {selectedCustomer.anniversary}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="w-full bg-gray-50 p-4 rounded-md h-[50vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Order History</h2>
                    <Table className="w-full bg-white shadow-lg rounded-md">
                      <TableHeader className="sticky top-0 bg-gray-100">
                        <TableRow>
                          <TableCell className="p-4">No</TableCell>
                          <TableCell className="p-4">Food Item</TableCell>
                          <TableCell className="p-4">Food Code</TableCell>
                          <TableCell className="p-4">Quantity</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderHistory.map((order, index) => (
                          <TableRow
                            key={order.id}
                            className="hover:bg-gray-50 shadow-sm"
                          >
                            <TableCell className="p-4">{index + 1}</TableCell>
                            <TableCell className="p-4">{order.food_item}</TableCell>
                            <TableCell className="p-4">{order.food_code}</TableCell>
                            <TableCell className="p-4">{order.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="bg-blue-500 text-white rounded-md px-4 py-2"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {editCustomer && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Edit Customer
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Name"
                  value={editCustomer.name}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, name: e.target.value })
                  }
                  className="w-full p-2 rounded-md"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={editCustomer.email}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, email: e.target.value })
                  }
                  className="w-full p-2 rounded-md"
                />
                <Input
                  type="text"
                  placeholder="Phone"
                  value={editCustomer.phone}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, phone: e.target.value })
                  }
                  className="w-full p-2 rounded-md"
                  required
                />
                <Input
                  type="text"
                  placeholder="Address"
                  value={editCustomer.address}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      address: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded-md"
                />
                <div className="flex flex-col space-y-1">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={editCustomer.date_of_birth}
                    onChange={(e) =>
                      setEditCustomer({
                        ...editCustomer,
                        date_of_birth: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-md"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <Label>Anniversary</Label>
                  <Input
                    type="date"
                    value={editCustomer.anniversary}
                    onChange={(e) =>
                      setEditCustomer({
                        ...editCustomer,
                        anniversary: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-md"
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="rounded-md px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditCustomer}
                  className="bg-emerald-500 text-white rounded-md px-4 py-2"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {selectedCustomerId && (
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Are you sure you want to delete this customer?
                </DialogTitle>
              </DialogHeader>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="rounded-md px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteCustomer(selectedCustomerId);
                  }}
                  className="bg-red-500 text-white rounded-md px-4 py-2"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      <ToastContainer />
    </Card>
  );
};

export default CustomerManagement;
