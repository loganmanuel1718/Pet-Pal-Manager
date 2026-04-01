import { PetLayout } from "@/components/pet-layout";
import { useGetPetDashboard, getGetPetDashboardQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, Circle, AlertCircle, Clock, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function PetDashboard({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const { data: dashboard, isLoading } = useGetPetDashboard(petId, {
    query: { enabled: !!petId, queryKey: getGetPetDashboardQueryKey(petId) }
  });

  if (isLoading || !dashboard) {
    return (
      <PetLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded-lg w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </PetLayout>
    );
  }

  const { todayChecklist, lowStockSupplies, upcomingEvents, recentNotes } = dashboard;
  const progress = todayChecklist.totalTasks > 0 
    ? Math.round((todayChecklist.totalTasksCompleted / todayChecklist.totalTasks) * 100) 
    : 100;

  return (
    <PetLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        
        <header>
          <h1 className="text-3xl md:text-4xl font-serif mb-2">Today's Overview</h1>
          <p className="text-muted-foreground text-lg">Here's how {dashboard.pet.name} is doing today.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Checklist Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-muted">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>
              
              <div className="flex justify-between items-center mb-6 mt-2">
                <h2 className="text-xl font-serif font-medium">Daily Routine</h2>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {progress}% Complete
                </span>
              </div>

              {todayChecklist.totalTasks === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-primary/30" />
                  <p>Nothing scheduled for today!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Feeding Section */}
                  {todayChecklist.feedingItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Feeding</h3>
                      <div className="space-y-2">
                        {todayChecklist.feedingItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                            {item.completedToday ? <CheckCircle2 className="text-primary h-6 w-6" /> : <Circle className="text-muted-foreground h-6 w-6" />}
                            <div className="flex-1">
                              <p className="font-medium">{item.mealName}</p>
                              <p className="text-sm text-muted-foreground">{item.mealTime} • {item.portionSize}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medication Section */}
                  {todayChecklist.medicationItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Medications</h3>
                      <div className="space-y-2">
                        {todayChecklist.medicationItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                            {item.givenToday ? <CheckCircle2 className="text-primary h-6 w-6" /> : <Circle className="text-muted-foreground h-6 w-6" />}
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.dosage} • {item.timeOfDay}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Recent Notes */}
            {recentNotes.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif font-medium">Recent Notes</h2>
                  <Link href={`/pets/${petId}/notes`} className="text-sm text-primary hover:underline">View all</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {recentNotes.map(note => (
                    <Card key={note.id} className="p-4 rounded-2xl border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{note.category}</span>
                        <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm line-clamp-3">{note.content}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Alerts & Events */}
          <div className="space-y-6">
            
            {lowStockSupplies.length > 0 && (
              <Card className="p-5 rounded-3xl border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-2 text-destructive font-medium mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <h3>Low Supplies</h3>
                </div>
                <ul className="space-y-3">
                  {lowStockSupplies.map(supply => (
                    <li key={supply.id} className="flex justify-between text-sm items-center">
                      <span className="font-medium">{supply.name}</span>
                      <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs">
                        {supply.currentStock} {supply.unit} left
                      </span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-4 rounded-xl border-destructive/20 hover:bg-destructive/10 text-destructive" asChild>
                  <Link href={`/pets/${petId}/supplies`}>Restock Items</Link>
                </Button>
              </Card>
            )}

            <Card className="p-6 rounded-3xl border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-secondary" />
                <h3 className="font-serif text-lg font-medium">Upcoming Events</h3>
              </div>
              
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming events.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className={`p-4 rounded-xl border ${event.urgent ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border/50'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${event.urgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {event.daysUntil === 0 ? 'Today' : `In ${event.daysUntil} days`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{event.type}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        </div>

      </motion.div>
    </PetLayout>
  );
}
