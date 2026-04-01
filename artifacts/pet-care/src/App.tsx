import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import PetDashboard from "@/pages/pet-dashboard";
import PetProfile from "@/pages/pet-profile";
import PetFeeding from "@/pages/pet-feeding";
import PetMedications from "@/pages/pet-medications";
import PetWalks from "@/pages/pet-walks";
import PetGrooming from "@/pages/pet-grooming";
import PetVet from "@/pages/pet-vet";
import PetVaccinations from "@/pages/pet-vaccinations";
import PetNotes from "@/pages/pet-notes";
import PetWeight from "@/pages/pet-weight";
import PetSupplies from "@/pages/pet-supplies";
import PetPhotos from "@/pages/pet-photos";
import PetInsights from "@/pages/pet-insights";
import PetEmergency from "@/pages/pet-emergency";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pets/:petId" component={PetDashboard} />
      <Route path="/pets/:petId/profile" component={PetProfile} />
      <Route path="/pets/:petId/feeding" component={PetFeeding} />
      <Route path="/pets/:petId/medications" component={PetMedications} />
      <Route path="/pets/:petId/walks" component={PetWalks} />
      <Route path="/pets/:petId/grooming" component={PetGrooming} />
      <Route path="/pets/:petId/vet" component={PetVet} />
      <Route path="/pets/:petId/vaccinations" component={PetVaccinations} />
      <Route path="/pets/:petId/notes" component={PetNotes} />
      <Route path="/pets/:petId/weight" component={PetWeight} />
      <Route path="/pets/:petId/supplies" component={PetSupplies} />
      <Route path="/pets/:petId/photos" component={PetPhotos} />
      <Route path="/pets/:petId/insights" component={PetInsights} />
      <Route path="/pets/:petId/emergency" component={PetEmergency} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
