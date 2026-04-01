import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListWalks, getListWalksQueryKey, useCreateWalk, useDeleteWalk } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Footprints, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PetWalks({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: walks, isLoading } = useListWalks(petId, {
    query: { enabled: !!petId, queryKey: getListWalksQueryKey(petId) }
  });
  
  const deleteWalk = useDeleteWalk();
  const createWalk = useCreateWalk();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    type: "Walk", 
    durationMinutes: "", 
    distanceKm: "",
    notes: "" 
  });

  const handleDelete = (walkId: number) => {
    deleteWalk.mutate({ petId, walkId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListWalksQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWalk.mutate({
      petId,
      data: {
        type: formData.type,
        startedAt: new Date().toISOString(),
        durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : undefined,
        distanceKm: formData.distanceKm ? Number(formData.distanceKm) : undefined,
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWalksQueryKey(petId) });
        setOpen(false);
        setFormData({ type: "Walk", durationMinutes: "", distanceKm: "", notes: "" });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Walks & Exercise</h1>
            <p className="text-muted-foreground">Log activities and track distance.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Log Activity</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Log Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Activity Type</Label>
                  <Input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="Walk, Run, Park visit..." required className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (mins)</Label>
                    <Input type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input type="number" step="0.1" value={formData.distanceKm} onChange={e => setFormData({...formData, distanceKm: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="How was it?" className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createWalk.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
          </div>
        ) : !walks?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <Footprints className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No activities logged</h3>
            <p className="text-muted-foreground">Start tracking walks and play time.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {walks.map(walk => (
              <Card key={walk.id} className="p-5 rounded-2xl bg-card border-border/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Footprints className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-medium">{walk.type}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(walk.startedAt).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(walk.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {(walk.durationMinutes || walk.distanceKm || walk.notes) && (
                  <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-4 text-sm">
                    {walk.durationMinutes && (
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{walk.durationMinutes} mins</span>
                      </div>
                    )}
                    {walk.distanceKm && (
                      <div className="flex items-center gap-1.5 text-foreground">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{walk.distanceKm} km</span>
                      </div>
                    )}
                    {walk.notes && (
                      <div className="text-muted-foreground ml-auto">
                        "{walk.notes}"
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </PetLayout>
  );
}