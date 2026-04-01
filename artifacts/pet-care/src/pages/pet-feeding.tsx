import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListFeedingSchedules, getListFeedingSchedulesQueryKey, useCreateFeedingSchedule, useCompleteFeedingSchedule, useDeleteFeedingSchedule } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2, Circle, Trash2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PetFeeding({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: schedules, isLoading } = useListFeedingSchedules(petId, {
    query: { enabled: !!petId, queryKey: getListFeedingSchedulesQueryKey(petId) }
  });
  
  const completeSchedule = useCompleteFeedingSchedule();
  const deleteSchedule = useDeleteFeedingSchedule();
  const createSchedule = useCreateFeedingSchedule();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ mealName: "", mealTime: "", foodType: "", portionSize: "" });

  const handleToggle = (scheduleId: number, completedToday: boolean) => {
    completeSchedule.mutate({ petId, scheduleId, data: { completed: !completedToday } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFeedingSchedulesQueryKey(petId) })
    });
  };

  const handleDelete = (scheduleId: number) => {
    deleteSchedule.mutate({ petId, scheduleId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFeedingSchedulesQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSchedule.mutate({
      petId,
      data: {
        mealName: formData.mealName,
        mealTime: formData.mealTime,
        foodType: formData.foodType || undefined,
        portionSize: formData.portionSize || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFeedingSchedulesQueryKey(petId) });
        setOpen(false);
        setFormData({ mealName: "", mealTime: "", foodType: "", portionSize: "" });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Feeding Schedule</h1>
            <p className="text-muted-foreground">Track meals and portions.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Meal</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Meal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Meal Name</Label>
                  <Input value={formData.mealName} onChange={e => setFormData({...formData, mealName: e.target.value})} placeholder="e.g. Breakfast" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={formData.mealTime} onChange={e => setFormData({...formData, mealTime: e.target.value})} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Food Type</Label>
                  <Input value={formData.foodType} onChange={e => setFormData({...formData, foodType: e.target.value})} placeholder="e.g. Dry Kibble" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Portion Size</Label>
                  <Input value={formData.portionSize} onChange={e => setFormData({...formData, portionSize: e.target.value})} placeholder="e.g. 1 cup" className="rounded-xl" />
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
            <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No meals scheduled</h3>
            <p className="text-muted-foreground">Add meals to create a daily feeding routine.</p>
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
                    <h3 className="font-serif text-lg font-medium">{schedule.mealName}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium bg-muted px-2 py-1 rounded-md">{schedule.mealTime}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                    {schedule.foodType && <span>{schedule.foodType}</span>}
                    {schedule.foodType && schedule.portionSize && <span>•</span>}
                    {schedule.portionSize && <span>{schedule.portionSize}</span>}
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