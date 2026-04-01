import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListPhotos, getListPhotosQueryKey, useCreatePhoto, useDeletePhoto } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PetPhotos({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: photos, isLoading } = useListPhotos(petId, {
    query: { enabled: !!petId, queryKey: getListPhotosQueryKey(petId) }
  });
  
  const deletePhoto = useDeletePhoto();
  const createPhoto = useCreatePhoto();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ photoUrl: "", caption: "", milestone: "", takenAt: new Date().toISOString().split('T')[0] });

  const handleDelete = (photoId: number) => {
    deletePhoto.mutate({ petId, photoId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPhoto.mutate({
      petId,
      data: {
        photoUrl: formData.photoUrl,
        caption: formData.caption || undefined,
        milestone: formData.milestone || undefined,
        takenAt: new Date(formData.takenAt).toISOString()
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey(petId) });
        setOpen(false);
        setFormData({ photoUrl: "", caption: "", milestone: "", takenAt: new Date().toISOString().split('T')[0] });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Memories</h1>
            <p className="text-muted-foreground">A timeline of beautiful moments.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Photo</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Memory</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input type="url" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} placeholder="https://..." required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Caption</Label>
                  <Input value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} placeholder="What's happening in this photo?" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Milestone (Optional)</Label>
                  <Input value={formData.milestone} onChange={e => setFormData({...formData, milestone: e.target.value})} placeholder="e.g. First Birthday, Adoption Day" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Date Taken</Label>
                  <Input type="date" value={formData.takenAt} onChange={e => setFormData({...formData, takenAt: e.target.value})} required className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createPhoto.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className={`bg-muted rounded-3xl ${i % 2 === 0 ? 'h-64' : 'h-48'}`} />)}
          </div>
        ) : !photos?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No photos yet</h3>
            <p className="text-muted-foreground">Start building a visual timeline of your pet's life.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[...photos].sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()).map(photo => (
              <div key={photo.id} className="break-inside-avoid relative group rounded-3xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                <img src={photo.photoUrl} alt={photo.caption || "Pet memory"} className="w-full object-cover" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(photo.id)} className="h-8 w-8 text-white hover:text-destructive hover:bg-white/20 rounded-full backdrop-blur-sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-white drop-shadow-md">
                    {photo.milestone && (
                      <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium mb-1 border border-white/30">
                        {photo.milestone}
                      </span>
                    )}
                    {photo.caption && <p className="text-sm font-medium leading-snug mb-1">{photo.caption}</p>}
                    <p className="text-xs text-white/80">{new Date(photo.takenAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PetLayout>
  );
}