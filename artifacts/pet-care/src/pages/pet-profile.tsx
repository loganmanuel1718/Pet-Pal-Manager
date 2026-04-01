import { useState, useEffect } from "react";
import { PetLayout } from "@/components/pet-layout";
import { useGetPet, getGetPetQueryKey, useUpdatePet } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PetProfile({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const queryClient = useQueryClient();
  const { data: pet, isLoading } = useGetPet(petId, {
    query: { enabled: !!petId, queryKey: getGetPetQueryKey(petId) }
  });
  const updatePet = useUpdatePet();

  const [formData, setFormData] = useState({
    name: "", species: "", breed: "", age: "", weight: "", sex: "",
    birthday: "", medicalNotes: "", allergies: "", photoUrl: ""
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        age: pet.age?.toString() || "",
        weight: pet.weight?.toString() || "",
        sex: pet.sex || "",
        birthday: pet.birthday || "",
        medicalNotes: pet.medicalNotes || "",
        allergies: pet.allergies || "",
        photoUrl: pet.photoUrl || ""
      });
    }
  }, [pet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePet.mutate({
      petId,
      data: {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        sex: formData.sex || undefined,
        birthday: formData.birthday || undefined,
        medicalNotes: formData.medicalNotes || undefined,
        allergies: formData.allergies || undefined,
        photoUrl: formData.photoUrl || undefined
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPetQueryKey(petId) });
      }
    });
  };

  if (isLoading || !pet) {
    return <PetLayout><div className="animate-pulse h-96 bg-muted rounded-3xl" /></PetLayout>;
  }

  return (
    <PetLayout>
      <div className="space-y-8 max-w-3xl">
        <header>
          <h1 className="text-3xl font-serif mb-2">Pet Profile</h1>
          <p className="text-muted-foreground">Manage {pet.name}'s details and medical info.</p>
        </header>

        <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label>Species</Label>
                <Select value={formData.species} onValueChange={v => setFormData({...formData, species: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Bird">Bird</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Breed</Label>
                <Input value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={formData.sex} onValueChange={v => setFormData({...formData, sex: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select sex" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Age (Years)</Label>
                <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Birthday</Label>
                <Input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Photo URL</Label>
                <Input type="url" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="rounded-xl" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label>Medical Notes</Label>
                <Textarea value={formData.medicalNotes} onChange={e => setFormData({...formData, medicalNotes: e.target.value})} className="rounded-xl min-h-[100px]" placeholder="Any important medical history..." />
              </div>
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="rounded-xl min-h-[100px]" placeholder="Food or environmental allergies..." />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updatePet.isPending} className="rounded-xl w-full sm:w-auto px-8">
                {updatePet.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PetLayout>
  );
}