import { useState } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useListNotes, getListNotesQueryKey, useCreateNote, useDeleteNote } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["General", "Health", "Behavior", "Diet", "Training"];

export default function PetNotes({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: notes, isLoading } = useListNotes(petId, {
    query: { enabled: !!petId, queryKey: getListNotesQueryKey(petId) }
  });
  
  const deleteNote = useDeleteNote();
  const createNote = useCreateNote();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ category: "General", content: "", mood: "" });

  const handleDelete = (noteId: number) => {
    deleteNote.mutate({ petId, noteId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(petId) })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNote.mutate({
      petId,
      data: {
        category: formData.category,
        content: formData.content,
        mood: formData.mood || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(petId) });
        setOpen(false);
        setFormData({ category: "General", content: "", mood: "" });
      }
    });
  };

  return (
    <PetLayout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-2">Notes & Log</h1>
            <p className="text-muted-foreground">Track behavior, mood, and symptoms.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Note</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Note</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="What did you observe?" required className="rounded-xl min-h-[120px]" />
                </div>
                <div className="space-y-2">
                  <Label>Mood (Optional)</Label>
                  <Input value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})} placeholder="Happy, Lethargic, Anxious..." className="rounded-xl" />
                </div>
                <Button type="submit" disabled={createNote.isPending} className="w-full rounded-xl">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-3xl" />)}
          </div>
        ) : !notes?.length ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border/50 shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No notes yet</h3>
            <p className="text-muted-foreground">Start keeping a journal of your pet's daily life.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-4 space-y-4">
            {notes.map(note => (
              <Card key={note.id} className="p-5 rounded-3xl border-border/50 bg-card shadow-sm break-inside-avoid">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                      {note.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)} className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{note.content}</p>
                {note.mood && (
                  <div className="mt-4 pt-3 border-t border-border/50 text-sm">
                    <span className="text-muted-foreground">Mood: </span>
                    <span className="font-medium">{note.mood}</span>
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