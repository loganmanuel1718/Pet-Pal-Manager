import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListGroomingSchedules, getListGroomingSchedulesQueryKey, useCreateGroomingSchedule, useCompleteGrooming, useDeleteGroomingSchedule } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2, Circle, Trash2, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PetGrooming({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: schedules, isLoading } = useListGroomingSchedules(petId, {
    query: { enabled: !!petId, queryKey: getListGroomingSchedulesQueryKey(petId) }
  });
  
  const completeGrooming = useCompleteGrooming();
  const deleteSchedule = useDeleteGroomingSchedule();
  const createSchedule = useCreateGroomingSchedule();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ type: "", frequencyDays: "30", notes: "" });

  const handleToggle = (scheduleId: number, completedToday: boolean) => {
    completeGrooming.mutate({ petId, scheduleId, data: { completed: !completedToday } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGroomingSchedulesQueryKey(petId) })
    });
  };

  const handleDelete = (scheduleId: number) => {
    deleteSchedule.mutate({ petId, scheduleId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGroomingSchedulesQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSchedule.mutate({
      petId,
      data: {
        type: formData.type,
        frequencyDays: Number(formData.frequencyDays),
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGroomingSchedulesQueryKey(petId) });
        setOpen(false);
        setFormData({ type: "", frequencyDays: "30", notes: "" });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Grooming</h1>
            <p className="text-muted-foreground">Track baths, brushing, and nails.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Routine</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Grooming Routine</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="e.g. Bath, Nail Trim" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Frequency (Days)</Label>
                  <Input type="number" value={formData.frequencyDays} onChange={e => setFormData({...formData, frequencyDays: e.target.value})} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Use sensitive skin shampoo" className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createSchedule.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
          </div>
        ) : !schedules?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Scissors className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No grooming routines</h3>
            <p className="text-muted-foreground">Keep your pet clean and healthy.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {schedules.map(schedule => (
              <Card key={schedule.id} className={`p-5 rounded-2xl transition-all border-border/50 flex items-center gap-4 ${schedule.completedToday ? 'bg-primary/5' : 'bg-card shadow-sm hover:shadow-md'}`}>
                <button 
                  onClick={() => handleToggle(schedule.id, schedule.completedToday)}
                  className="flex-shrink-0"
                >
                  {schedule.completedToday ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : (
                    <Circle className="w-8 h-8 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-lg font-medium">{schedule.type}</h3>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex gap-3 flex-wrap">
                    <span>Every {schedule.frequencyDays} days</span>
                    {schedule.nextDueAt && (
                      <>
                        <span>•</span>
                        <span className={new Date(schedule.nextDueAt) < new Date() ? "text-destructive font-medium" : ""}>
                          Due: {new Date(schedule.nextDueAt).toLocaleDateString()}
                        </span>
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