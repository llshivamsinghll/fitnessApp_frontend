import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Dumbbell, Apple, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DietPlan, SavedPlan, WorkoutPlan, getDietDays, getPlanSourceLabel, getWorkoutWeeks } from "@/lib/plan";

const dashboardPreview = "/assets/hero-fitness.jpg";
const nutritionPreview = "/assets/hero2.png";

const AIPlanGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [nutrition, setNutrition] = useState<DietPlan | null>(null);
  const [planMeta, setPlanMeta] = useState<{ duration?: number; version?: number; createdAt?: string } | null>(null);

  const applyPlan = (plan: SavedPlan) => {
    setWorkout(plan.workout || null);
    setNutrition(plan.diet || null);
    setPlanMeta({
      duration: plan.duration,
      version: plan.version,
      createdAt: plan.createdAt
    });
  };

  const generatePlan = async () => {
    setError(null);
    setLoading(true);
    try {
      const { user } = await api.get<{ user: any }>("/api/user/profile");
      const payload = {
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel || "moderate",
        dietPreference: user.dietPreference,
        planDuration: user.planDuration || 8,
        name: user.name,
        medicalConditions: user.medicalConditions,
        location: user.location,
        state: user.state,
        cuisine: user.cuisine
      };

      const res = await api.post<{ success: boolean; plan: SavedPlan }>("/api/ai/generate-and-save", payload);
      applyPlan(res.plan);
    } catch (e: any) {
      setError(e.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const loadLatest = async () => {
    try {
      const res = await api.get<{ success: boolean; plan: SavedPlan }>("/api/ai/latest-plan");
      applyPlan(res.plan);
    } catch {
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  const workoutWeeks = getWorkoutWeeks(workout);
  const dietDays = getDietDays(nutrition);

  return (
    <div id="ai-plan-page-root" className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12 text-center animate-slide-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3 bg-success/10 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">AI</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">Plan</h1>
          <div className="flex items-center justify-center gap-2 mb-3">
            {planMeta?.duration ? <Badge variant="secondary">{planMeta.duration} weeks</Badge> : null}
            {planMeta?.version ? <Badge variant="outline">v{planMeta.version}</Badge> : null}
            {workout?.source ? <Badge variant="outline">{getPlanSourceLabel(workout.source)}</Badge> : null}
            {planMeta?.createdAt ? (
              <Badge variant="secondary">{new Date(planMeta.createdAt).toLocaleDateString()}</Badge>
            ) : null}
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            {loading ? "Generating..." : workout || nutrition ? "Your personalized plan" : "No plan generated yet."}
          </p>

          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-6 max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Insights</span>
            </div>
            <p className="text-foreground font-medium">
              {workout?.weeklyPlan?.frequency ? `Training: ${workout.weeklyPlan.frequency}` : "Insights will appear once a plan is generated."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Workout Plan</h2>
              </div>
              <img src={dashboardPreview} alt="Workout analytics preview" className="w-20 h-12 object-cover rounded-lg opacity-20" />
            </div>

            {workoutWeeks.length === 0 ? (
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground">No workout plan yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Generate your plan to see exercises here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {workoutWeeks.slice(0, 2).map((week) => (
                  <Card key={week.week} className="shadow-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-foreground flex items-center justify-between">
                        Week {week.week}: {week.focus}
                        <Badge variant="secondary">{week.days.length} days</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {week.days.slice(0, 3).map((day) => (
                          <div key={`${week.week}-${day.day}`} className="p-3 rounded-lg bg-muted/30">
                            <div className="font-medium text-foreground mb-2">{day.dayName}: {day.focus}</div>
                            <div className="space-y-1">
                              {day.exercises.slice(0, 3).map((exercise, index) => (
                                <div key={`${exercise.name}-${index}`} className="text-sm text-muted-foreground">
                                  {exercise.name} - {exercise.sets} sets x {exercise.reps}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg mr-3">
                  <Apple className="h-6 w-6 text-success" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Nutrition Plan</h2>
              </div>
              <img src={nutritionPreview} alt="Nutrition preview" className="w-20 h-12 object-cover rounded-lg opacity-20" />
            </div>

            {!nutrition ? (
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground">No nutrition plan yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Generate your plan to see meals here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-foreground">Daily Targets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="text-lg font-semibold text-foreground">{nutrition.dailyTargets.calories}</div>
                        <div className="text-xs text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="text-lg font-semibold text-foreground">{nutrition.dailyTargets.protein}g</div>
                        <div className="text-xs text-muted-foreground">Protein</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {dietDays[0] ? (
                  <Card className="shadow-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-foreground flex items-center justify-between">
                        {dietDays[0].dayName}
                        <Badge variant="secondary">{dietDays[0].meals.length} meals</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dietDays[0].meals.slice(0, 4).map((meal, index) => (
                          <div key={`${meal.mealType}-${index}`} className="p-3 rounded-lg bg-muted/30">
                            <div className="font-medium text-foreground mb-1">{meal.mealType}</div>
                            <div className="text-sm text-muted-foreground mb-2">{meal.name}</div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">{meal.calories} cal</Badge>
                              <Badge variant="outline" className="text-xs">{meal.protein}g protein</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-in-up">
          <Button size="lg" className="px-12 py-6 text-base hover:scale-105 transition-transform" onClick={generatePlan} disabled={loading}>
            <CheckCircle className="h-5 w-5 mr-2" />
            {loading ? "Generating..." : "Start My Plan"}
          </Button>
          <Button variant="outline" size="lg" className="px-12 py-6 text-base hover:scale-105 transition-transform" onClick={generatePlan} disabled={loading}>
            <Sparkles className="h-5 w-5 mr-2" />
            Regenerate Plan
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AIPlanGeneration;
