import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListSupplies, getListSuppliesQueryKey, useCreateSupply, useDeleteSupply, useUpdateSupply } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Package, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PetSupplies({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: supplies, isLoading } = useListSupplies(petId, {
    query: { enabled: !!petId, queryKey: getListSuppliesQueryKey(petId) }
  });
  
  const deleteSupply = useDeleteSupply();
  const createSupply = useCreateSupply();
  const updateSupply = useUpdateSupply();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "Food", 
    currentStock: "",
    unit: "bags",
    lowStockThreshold: ""
  });

  const handleDelete = (supplyId: number) => {
    deleteSupply.mutate({ petId, supplyId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSuppliesQueryKey(petId) })
    });
  };

  const handleUpdateStock = (supplyId: number, current: number, delta: number) => {
    const supply = supplies?.find(s => s.id === supplyId);
    if (!supply) return;
    const newStock = Math.max(0, current + delta);
    updateSupply.mutate({
      petId,
      supplyId,
      data: {
        name: supply.name,
        category: supply.category,
        currentStock: newStock,
        unit: supply.unit,
        lowStockThreshold: supply.lowStockThreshold
      }
    }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSuppliesQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSupply.mutate({
      petId,
      data: {
        name: formData.name,
        category: formData.category,
        currentStock: Number(formData.currentStock),
        unit: formData.unit,
        lowStockThreshold: Number(formData.lowStockThreshold),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSuppliesQueryKey(petId) });
        setOpen(false);
        setFormData({ name: "", category: "Food", currentStock: "", unit: "bags", lowStockThreshold: "" });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Supplies & Inventory</h1>
            <p className="text-muted-foreground">Keep track of food, treats, and essentials.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Supply Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dry Kibble, Training Treats" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Stock</Label>
                    <Input type="number" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} required className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="bags, cups, boxes..." required className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Alert me when stock reaches</Label>
                  <Input type="number" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} required className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createSupply.isPending} className="w-full rounded-xl">Save Item</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-3xl" />)}
          </div>
        ) : !supplies?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No supplies tracked</h3>
            <p className="text-muted-foreground">Start tracking food and essentials to never run out.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplies.map(supply => (
              <Card key={supply.id} className={`p-5 rounded-3xl border-border/50 shadow-sm ${supply.isLowStock ? 'bg-destructive/5 border-destructive/20' : 'bg-card'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-medium">{supply.name}</h3>
                    <p className="text-sm text-muted-foreground">{supply.category}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(supply.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive -mr-2 -mt-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-light tracking-tight">{supply.currentStock}</div>
                      <div className="text-sm text-muted-foreground">{supply.unit} left</div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleUpdateStock(supply.id, supply.currentStock, -1)}>-</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleUpdateStock(supply.id, supply.currentStock, 1)}>+</Button>
                    </div>
                  </div>
                  
                  {supply.isLowStock && (
                    <div className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 py-1.5 px-3 rounded-md">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Time to restock</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PetLayout>
  );
}