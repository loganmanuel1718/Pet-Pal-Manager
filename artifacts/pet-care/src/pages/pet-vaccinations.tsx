import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListVaccinations, getListVaccinationsQueryKey, useCreateVaccination, useDeleteVaccination } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Syringe, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PetVaccinations({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: vaccines, isLoading } = useListVaccinations(petId, {
    query: { enabled: !!petId, queryKey: getListVaccinationsQueryKey(petId) }
  });
  
  const deleteVax = useDeleteVaccination();
  const createVax = useCreateVaccination();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    vaccineName: "", 
    dateGiven: "", 
    nextDueDate: "",
    administeredBy: "",
    notes: ""
  });

  const handleDelete = (vaxId: number) => {
    deleteVax.mutate({ petId, vaccinationId: vaxId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListVaccinationsQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVax.mutate({
      petId,
      data: {
        vaccineName: formData.vaccineName,
        dateGiven: formData.dateGiven,
        nextDueDate: formData.nextDueDate || undefined,
        administeredBy: formData.administeredBy || undefined,
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVaccinationsQueryKey(petId) });
        setOpen(false);
        setFormData({ vaccineName: "", dateGiven: "", nextDueDate: "", administeredBy: "", notes: "" });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Vaccinations</h1>
            <p className="text-muted-foreground">Records and next due dates.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Record</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Vaccination Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Vaccine Name</Label>
                  <Input value={formData.vaccineName} onChange={e => setFormData({...formData, vaccineName: e.target.value})} placeholder="e.g. Rabies" required className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Given</Label>
                    <Input type="date" value={formData.dateGiven} onChange={e => setFormData({...formData, dateGiven: e.target.value})} required className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Due Date</Label>
                    <Input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Administered By</Label>
                  <Input value={formData.administeredBy} onChange={e => setFormData({...formData, administeredBy: e.target.value})} placeholder="Clinic name or vet" className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createVax.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
          </div>
        ) : !vaccines?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Syringe className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No vaccination records</h3>
            <p className="text-muted-foreground">Keep track of immunizations and boosters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {vaccines.map(vax => {
              const isOverdue = vax.nextDueDate && new Date(vax.nextDueDate) < new Date();
              return (
                <Card key={vax.id} className="p-5 rounded-2xl border-border/50 shadow-sm bg-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className={`h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    <Syringe className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div>
                      <h3 className="font-serif text-lg font-medium">{vax.vaccineName}</h3>
                      <p className="text-sm text-muted-foreground">Given: {new Date(vax.dateGiven).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Due next</p>
                        <p className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {vax.nextDueDate ? new Date(vax.nextDueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center sm:justify-end gap-2">
                      <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {vax.administeredBy && <span>by {vax.administeredBy}</span>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(vax.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PetLayout>
  );
}