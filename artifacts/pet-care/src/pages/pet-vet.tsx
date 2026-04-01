import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListVetAppointments, getListVetAppointmentsQueryKey, useCreateVetAppointment, useDeleteVetAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Stethoscope, CalendarDays, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function PetVet({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: appointments, isLoading } = useListVetAppointments(petId, {
    query: { enabled: !!petId, queryKey: getListVetAppointmentsQueryKey(petId) }
  });
  
  const deleteAppt = useDeleteVetAppointment();
  const createAppt = useCreateVetAppointment();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    appointmentType: "Checkup", 
    scheduledAt: "", 
    vetName: "",
    vetClinic: "",
    notes: "",
    completed: false
  });

  const handleDelete = (apptId: number) => {
    deleteAppt.mutate({ petId, appointmentId: apptId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListVetAppointmentsQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppt.mutate({
      petId,
      data: {
        title: formData.title,
        appointmentType: formData.appointmentType,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : new Date().toISOString(),
        vetName: formData.vetName || undefined,
        vetClinic: formData.vetClinic || undefined,
        notes: formData.notes || undefined,
        completed: formData.completed
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVetAppointmentsQueryKey(petId) });
        setOpen(false);
        setFormData({ title: "", appointmentType: "Checkup", scheduledAt: "", vetName: "", vetClinic: "", notes: "", completed: false });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Vet Visits</h1>
            <p className="text-muted-foreground">Past and upcoming appointments.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Visit</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Vet Visit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Annual Checkup" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData({...formData, scheduledAt: e.target.value})} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={formData.appointmentType} onChange={e => setFormData({...formData, appointmentType: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Vet Name</Label>
                  <Input value={formData.vetName} onChange={e => setFormData({...formData, vetName: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Clinic</Label>
                  <Input value={formData.vetClinic} onChange={e => setFormData({...formData, vetClinic: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="rounded-xl" />
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="completed" checked={formData.completed} onCheckedChange={(c) => setFormData({...formData, completed: !!c})} />
                  <Label htmlFor="completed">Mark as completed</Label>
                </div>
                <Button type="submit" disabled={createAppt.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
          </div>
        ) : !appointments?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No vet visits logged</h3>
            <p className="text-muted-foreground">Keep a record of all medical appointments.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map(appt => (
              <Card key={appt.id} className={`p-5 rounded-2xl border-border/50 shadow-sm ${appt.completed ? 'bg-muted/30' : 'bg-card'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${appt.completed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-serif text-lg font-medium ${appt.completed ? 'text-muted-foreground' : ''}`}>{appt.title}</h3>
                        {appt.completed && <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Completed</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{appt.appointmentType}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(appt.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    <span className={!appt.completed && new Date(appt.scheduledAt) < new Date() ? "text-destructive font-medium" : ""}>
                      {new Date(appt.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  
                  {(appt.vetClinic || appt.vetName) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{appt.vetName ? `${appt.vetName} ` : ''}{appt.vetClinic ? `@ ${appt.vetClinic}` : ''}</span>
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