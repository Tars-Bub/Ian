import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, searchMenuItems 
} from '../../posLogic';
// ─── Real-time sync ────────────────────────────────────────────────────────
import { syncManager } from '@/lib/sync';

const categories = ['Sulit Meals', 'Silog Meals', 'Rice Toppings', 'A La Carte', 'Finger Foods', 'Beverages', 'Coffee', 'Others'];

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',           // ← New field for image URL
  });

  const loadItems = async () => {
    const result = await searchMenuItems(searchQuery, selectedCategory);
    setItems(result);
  };

  useEffect(() => {
    loadItems();
  }, [searchQuery, selectedCategory]);

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '', description: '', image: '' });
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const itemPayload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        image: formData.image.trim() || null,   // Save image URL
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemPayload);
        toast.success("Item updated successfully");
        // ── Notify admin ──────────────────────────────────────────────────
        syncManager.inventoryAction('edit_item', { ...itemPayload, id: editingItem.id });
      } else {
        await addMenuItem(itemPayload);
        toast.success("Item added successfully");
        // ── Notify admin ──────────────────────────────────────────────────
        syncManager.inventoryAction('add_item', itemPayload);
      }
      
      setIsOpen(false);
      resetForm();
      loadItems();
    } catch (error) {
      toast.error("Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || '',
      image: item.image || '',
    });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await deleteMenuItem(id);
    toast.success("Item deleted");
    loadItems();
    // ── Notify admin ──────────────────────────────────────────────────
    syncManager.inventoryAction('delete_item', { id });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Item Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div>
                <Label>Price (₱) *</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Image URL (optional)</Label>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  value={formData.image} 
                  onChange={(e) => setFormData({...formData, image: e.target.value})} 
                />
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="preview" className="w-32 h-32 object-cover rounded border" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <Button type="submit" className="w-full">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
<div className="flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
                        <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table with Image */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border" onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="text-right">₱{Number(item.price).toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}