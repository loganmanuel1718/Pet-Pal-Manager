import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListMedications, getListMedicationsQueryKey, useCreateMedication, useMarkMedicationGiven, useDeleteMedication } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2, Circle, Trash2, Pill } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PetMedications({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: medications, isLoading } = useListMedications(petId, {
    query: { enabled: !!petId, queryKey: getListMedicationsQueryKey(petId) }
  });
  
  const markGiven = useMarkMedicationGiven();
  const deleteMed = useDeleteMedication();
  const createMed = useCreateMedication();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", dosage: "", frequency: "", timeOfDay: "" });

  const handleToggle = (medId: number, givenToday: boolean) => {
    markGiven.mutate({ petId, medId, data: { completed: !givenToday } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey(petId) })
    });
  };

  const handleDelete = (medId: number) => {
    deleteMed.mutate({ petId, medId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMed.mutate({
      petId,
      data: {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        timeOfDay: formData.timeOfDay || undefined,
        active: true
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey(petId) });
        setOpen(false);
        setFormData({ name: "", dosage: "", frequency: "", timeOfDay: "" });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Medications</h1>
            <p className="text-muted-foreground">Log doses and manage prescriptions.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Medication</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Heartworm preventative" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="e.g. 1 tablet (10mg)" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} placeholder="e.g. Daily, Monthly" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Time of Day</Label>
                  <Input value={formData.timeOfDay} onChange={e => setFormData({...formData, timeOfDay: e.target.value})} placeholder="e.g. Morning, With food" className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createMed.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
          </div>
        ) : !medications?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Pill className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No medications</h3>
            <p className="text-muted-foreground">Keep track of prescriptions and daily vitamins.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {medications.map(med => (
              <Card key={med.id} className={`p-5 rounded-2xl transition-all border-border/50 flex items-center gap-4 ${med.givenToday ? 'bg-primary/5' : 'bg-card shadow-sm hover:shadow-md'}`}>
                <button 
                  onClick={() => handleToggle(med.id, med.givenToday)}
                  className="flex-shrink-0"
                >
                  {med.givenToday ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : (
                    <Circle className="w-8 h-8 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-lg font-medium">{med.name}</h3>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(med.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="font-medium text-foreground">{med.dosage}</span>
                    <span>•</span>
                    <span>{med.frequency}</span>
                    {med.timeOfDay && (
                      <>
                        <span>•</span>
                        <span>{med.timeOfDay}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PetLayout>
  );
}