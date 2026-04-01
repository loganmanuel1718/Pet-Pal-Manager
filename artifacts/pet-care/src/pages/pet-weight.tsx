import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListWeightEntries, getListWeightEntriesQueryKey, useCreateWeightEntry, useDeleteWeightEntry } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PetWeight({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: weights, isLoading } = useListWeightEntries(petId, {
    query: { enabled: !!petId, queryKey: getListWeightEntriesQueryKey(petId) }
  });
  
  const deleteWeight = useDeleteWeightEntry();
  const createWeight = useCreateWeightEntry();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ weightKg: "", recordedAt: new Date().toISOString().split('T')[0] });

  const handleDelete = (entryId: number) => {
    deleteWeight.mutate({ petId, entryId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListWeightEntriesQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWeight.mutate({
      petId,
      data: {
        weightKg: Number(formData.weightKg),
        unit: "kg",
        recordedAt: new Date(formData.recordedAt).toISOString(),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWeightEntriesQueryKey(petId) });
        setOpen(false);
        setFormData({ weightKg: "", recordedAt: new Date().toISOString().split('T')[0] });
      }
    });
  };

  const chartData = weights 
    ? [...weights].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
        .map(w => ({
          date: new Date(w.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          weight: w.weightKg,
          id: w.id
        }))
    : [];

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Weight History</h1>
            <p className="text-muted-foreground">Track growth and health over time.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Log Weight</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Log Weight</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" value={formData.weightKg} onChange={e => setFormData({...formData, weightKg: e.target.value})} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={formData.recordedAt} onChange={e => setFormData({...formData, recordedAt: e.target.value})} required className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createWeight.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-3xl" />
            <div className="h-40 bg-muted rounded-3xl" />
          </div>
        ) : !weights?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Scale className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No weight entries</h3>
            <p className="text-muted-foreground">Start logging weight to see trends.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl border-border/50 shadow-sm">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                      formatter={(value: number) => [`${value} kg`, 'Weight']}
                    />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: "hsl(var(--card))"}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {[...weights].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).map(entry => (
                <Card key={entry.id} className="p-4 rounded-2xl flex justify-between items-center bg-card border-border/50">
                  <div>
                    <div className="font-medium text-lg">{entry.weightKg} <span className="text-sm text-muted-foreground font-normal">kg</span></div>
                    <div className="text-sm text-muted-foreground">{new Date(entry.recordedAt).toLocaleDateString()}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PetLayout>
  );
}