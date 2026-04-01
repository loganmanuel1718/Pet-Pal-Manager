import { useState } from "react";
import { Link } from "wouter";
import { useListPets, getListPetsQueryKey, useCreatePet } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Heart, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function Home() {
  const { data: pets, isLoading } = useListPets();
  const queryClient = useQueryClient();
  const createPet = useCreatePet();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPet.mutate({
      data: {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        age: formData.age ? Number(formData.age) : undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPetsQueryKey() });
        setOpen(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Heart className="h-8 w-8 text-primary/40" />
          <p className="text-muted-foreground">Loading your family...</p>
        </div>
      </div>
    );
  }

  const hasPets = pets && pets.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Good morning.</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Welcome to PawKeeper. Your personal, quiet space to care for the animals you love.
            </p>
          </div>
          {hasPets && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full shadow-sm" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add a pet
                </Button>
              </DialogTrigger>
              <AddPetDialog formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isPending={createPet.isPending} />
            </Dialog>
          )}
        </header>

        {!hasPets ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-card border border-border/50 rounded-3xl p-8 md:p-16 text-center shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40" />
            <div className="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-serif font-medium mb-4">No pets added yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
              Start by adding your first pet to build their profile, track their health, and keep their memories safe.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-6 w-6 mr-2" />
                  Add your first pet
                </Button>
              </DialogTrigger>
              <AddPetDialog formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isPending={createPet.isPending} />
            </Dialog>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/pets/${pet.id}`}>
                  <Card className="group cursor-pointer border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md overflow-hidden rounded-2xl h-full flex flex-col">
                    <div className="h-32 bg-muted relative">
                      {pet.photoUrl ? (
                        <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Heart className="h-8 w-8 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-serif font-medium group-hover:text-primary transition-colors">{pet.name}</h3>
                          <p className="text-muted-foreground text-sm">{pet.species} {pet.breed ? `• ${pet.breed}` : ""}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                      <div className="mt-auto pt-4 flex items-center gap-4 text-sm text-muted-foreground border-t border-border/50">
                        {pet.age != null && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{pet.age} {pet.age === 1 ? 'year' : 'years'} old</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddPetDialog({ formData, setFormData, onSubmit, isPending }: any) {
  return (
    <DialogContent className="sm:max-w-md rounded-3xl">
      <DialogHeader className="pb-4">
        <DialogTitle className="font-serif text-2xl">Add a new pet</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            placeholder="e.g. Luna" 
            className="h-12 rounded-xl"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="species">Species</Label>
            <Select 
              value={formData.species} 
              onValueChange={v => setFormData({...formData, species: v})}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
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
            <Label htmlFor="age">Age (Years)</Label>
            <Input 
              id="age" 
              type="number" 
              min="0"
              placeholder="e.g. 3" 
              className="h-12 rounded-xl"
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed">Breed (Optional)</Label>
          <Input 
            id="breed" 
            placeholder="e.g. Golden Retriever" 
            className="h-12 rounded-xl"
            value={formData.breed}
            onChange={e => setFormData({...formData, breed: e.target.value})}
          />
        </div>
        <Button type="submit" className="w-full h-12 rounded-xl mt-4" disabled={isPending || !formData.name}>
          {isPending ? "Adding..." : "Add Pet"}
        </Button>
      </form>
    </DialogContent>
  );
}
