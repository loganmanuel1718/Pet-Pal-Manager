import { PetLayout } from "@/components/pet-layout";
import { useGetPetEmergencyInfo, getGetPetEmergencyInfoQueryKey } from "@workspace/api-client-react";
import { AlertCircle, Phone, Stethoscope, Shield, Pill, Syringe } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PetEmergency({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const { data: info, isLoading } = useGetPetEmergencyInfo(petId, {
    query: { enabled: !!petId, queryKey: getGetPetEmergencyInfoQueryKey(petId) }
  });

  if (isLoading || !info) {
    return (
      <PetLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-lg w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded-3xl" />
            <div className="h-48 bg-muted rounded-3xl" />
            <div className="h-48 bg-muted rounded-3xl" />
            <div className="h-48 bg-muted rounded-3xl" />
          </div>
        </div>
      </PetLayout>
    );
  }

  const { pet, activeMedications, vaccinations } = info;

  return (
    <PetLayout>
      <div className="space-y-8 max-w-4xl">
        <header className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif text-destructive">Emergency Info</h1>
            <p className="text-muted-foreground">Quick access to critical medical details for {pet.name}.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="p-6 rounded-3xl border-destructive/20 shadow-sm bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
            <div className="flex items-center gap-2 text-foreground font-medium mb-4">
              <Stethoscope className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif">Veterinary Contacts</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Primary Vet</p>
                <p className="font-medium text-lg">{pet.vetName || 'Not specified'}</p>
                {pet.vetPhone && (
                  <div className="flex items-center gap-2 mt-1 text-primary">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${pet.vetPhone}`} className="hover:underline">{pet.vetPhone}</a>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-semibold text-destructive uppercase tracking-wider mb-1">Emergency Vet</p>
                <p className="font-medium text-lg">{pet.emergencyVetName || 'Not specified'}</p>
                {pet.emergencyVetPhone && (
                  <div className="flex items-center gap-2 mt-1 text-destructive">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${pet.emergencyVetPhone}`} className="hover:underline">{pet.emergencyVetPhone}</a>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border/50 shadow-sm bg-card">
            <div className="flex items-center gap-2 text-foreground font-medium mb-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif">Insurance & ID</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Provider</p>
                <p className="font-medium text-lg">{pet.insuranceProvider || 'None'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Policy Number</p>
                <p className="font-medium font-mono bg-muted/50 p-2 rounded-lg w-fit">{pet.insurancePolicyNumber || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border/50 shadow-sm bg-card md:col-span-2">
            <div className="flex items-center gap-2 text-foreground font-medium mb-4">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif">Allergies & Medical Notes</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-destructive uppercase tracking-wider mb-1">Known Allergies</p>
                {pet.allergies ? (
                  <p className="font-medium text-destructive">{pet.allergies}</p>
                ) : (
                  <p className="text-muted-foreground italic">No known allergies</p>
                )}
              </div>
              {pet.medicalNotes && (
                <div className="pt-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key Medical Notes</p>
                  <p className="whitespace-pre-wrap">{pet.medicalNotes}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border/50 shadow-sm bg-card">
            <div className="flex items-center gap-2 text-foreground font-medium mb-4">
              <Pill className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif">Active Medications</h2>
            </div>
            {activeMedications.length === 0 ? (
              <p className="text-muted-foreground italic">No active medications.</p>
            ) : (
              <ul className="space-y-3 border-l-2 border-primary/20 pl-4">
                {activeMedications.map(med => (
                  <li key={med.id}>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6 rounded-3xl border-border/50 shadow-sm bg-card">
            <div className="flex items-center gap-2 text-foreground font-medium mb-4">
              <Syringe className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif">Recent Vaccinations</h2>
            </div>
            {vaccinations.length === 0 ? (
              <p className="text-muted-foreground italic">No vaccination records.</p>
            ) : (
              <ul className="space-y-3 border-l-2 border-primary/20 pl-4">
                {vaccinations.slice(0, 3).map(vax => (
                  <li key={vax.id}>
                    <p className="font-medium">{vax.vaccineName}</p>
                    <p className="text-sm text-muted-foreground">Given: {new Date(vax.dateGiven).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

        </div>
      </div>
    </PetLayout>
  );
}