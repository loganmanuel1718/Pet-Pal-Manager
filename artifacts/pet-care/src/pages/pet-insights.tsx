import { PetLayout } from "@/components/pet-layout";
import { useGetPetInsights, getGetPetInsightsQueryKey } from "@workspace/api-client-react";
import { BarChart as BarChartIcon, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function PetInsights({ params }: { params: { petId: string } }) {
  const petId = Number(params.petId);
  const { data: insights, isLoading } = useGetPetInsights(petId, {
    query: { enabled: !!petId, queryKey: getGetPetInsightsQueryKey(petId) }
  });

  if (isLoading || !insights) {
    return (
      <PetLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-lg w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-3xl" />)}
          </div>
          <div className="h-80 bg-muted rounded-3xl mt-8" />
        </div>
      </PetLayout>
    );
  }

  const completionData = [
    { name: 'Feeding', rate: insights.feedingCompletionRate },
    { name: 'Grooming', rate: insights.groomingCompletionRate },
  ];

  return (
    <PetLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-serif mb-2">Routine Insights</h1>
          <p className="text-muted-foreground">Trends and habits over the last 30 days.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl bg-card border-border/50 shadow-sm flex flex-col justify-center">
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Average Walks</h3>
            <div className="text-4xl font-light font-serif tracking-tight">{insights.averageWalksPerWeek}<span className="text-lg text-muted-foreground font-sans ml-1">/week</span></div>
            <div className="mt-4 text-sm text-primary flex items-center gap-1 bg-primary/5 w-fit px-2 py-1 rounded-md">
              <TrendingUp className="w-4 h-4" /> Total {insights.totalWalkDistanceKm} km
            </div>
          </Card>

          <Card className="p-6 rounded-3xl bg-card border-border/50 shadow-sm flex flex-col justify-center">
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Weight Trend</h3>
            <div className="text-2xl font-medium capitalize mt-1 mb-4">{insights.weightTrend || 'Stable'}</div>
          </Card>

          <Card className={`p-6 rounded-3xl border-border/50 shadow-sm flex flex-col justify-center ${insights.missedMedicationsThisMonth > 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-card'}`}>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Missed Medications</h3>
            <div className={`text-4xl font-light font-serif tracking-tight ${insights.missedMedicationsThisMonth > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {insights.missedMedicationsThisMonth}
            </div>
            {insights.missedMedicationsThisMonth > 0 && (
              <div className="mt-4 text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> This month
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 rounded-3xl bg-card border-border/50 shadow-sm">
          <h3 className="font-serif text-xl mb-6">Task Completion Rates</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  formatter={(value: number) => [`${value}%`, 'Completion']}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
      </div>
    </PetLayout>
  );
}