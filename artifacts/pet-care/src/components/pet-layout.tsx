import React from "react";
import { Link, useLocation, useParams } from "wouter";
import { useGetPet, getGetPetQueryKey } from "@workspace/api-client-react";
import { 
  LayoutDashboard, User, Utensils, Pill, Footprints, 
  Scissors, Stethoscope, Syringe, BookOpen, Scale, 
  Package, Image as ImageIcon, BarChart, AlertCircle, ArrowLeft,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/feeding", label: "Feeding", icon: Utensils },
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/walks", label: "Walks", icon: Footprints },
  { href: "/grooming", label: "Grooming", icon: Scissors },
  { href: "/vet", label: "Vet Visits", icon: Stethoscope },
  { href: "/vaccinations", label: "Vaccines", icon: Syringe },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/supplies", label: "Supplies", icon: Package },
  { href: "/photos", label: "Photos", icon: ImageIcon },
  { href: "/insights", label: "Insights", icon: BarChart },
  { href: "/emergency", label: "Emergency", icon: AlertCircle, danger: true },
];

export function PetLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { petId } = useParams();
  const numericId = Number(petId);
  const { data: pet } = useGetPet(numericId, { 
    query: { enabled: !!numericId, queryKey: getGetPetQueryKey(numericId) } 
  });

  const NavContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {pet ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={pet.photoUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {pet.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-serif font-semibold text-lg leading-none">{pet.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">{pet.species} • {pet.breed || "Mixed"}</p>
            </div>
          </div>
        ) : (
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        )}
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const path = `/pets/${petId}${item.href}`;
          const isActive = location === path;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={path}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? item.danger ? "bg-destructive/10 text-destructive font-medium" : "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "opacity-100" : "opacity-70"}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-border/50 bg-card/30 sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Mobile Header & Sheet */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-background border-r-0">
                <NavContent />
              </SheetContent>
            </Sheet>
            {pet && (
              <span className="font-serif font-medium text-lg">{pet.name}</span>
            )}
          </div>
          <Avatar className="h-8 w-8 border border-primary/20">
            <AvatarImage src={pet?.photoUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{pet?.name?.[0]}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
