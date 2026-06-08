import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  User,
  Target,
  TrendingUp,
  Calendar,
  Dumbbell,
  Apple,
  RefreshCw,
  Settings,
  CheckCircle,
  Info
} from "lucide-react";
import { SavedPlan, getDietDays, getPlanSourceLabel, getWorkoutWeeks } from "@/lib/plan";

const NutritionPlanStructured = ({ diet }: { diet: NonNullable<SavedPlan["diet"]> }) => {
  const days = getDietDays(diet);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium mb-4 flex items-center space-x-2">
          <Target className="h-4 w-4 text-primary" />
          <span>Daily Nutrition Targets</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            ["Calories", diet.dailyTargets.calories],
            ["Protein", `${diet.dailyTargets.protein}g`],
            ["Carbs", `${diet.dailyTargets.carbs}g`],
            ["Fat", `${diet.dailyTargets.fat}g`],
            ["Fiber", `${diet.dailyTargets.fiber}g`]
          ].map(([label, value]) => (
            <Card key={label} className="p-4 bg-surface/30">
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
                <div className="font-semibold text-lg text-foreground">{value}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Accordion type="single" collapsible defaultValue="day-1" className="space-y-3">
        {days.map((day) => (
          <AccordionItem key={day.day} value={`day-${day.day}`} className="border rounded-lg bg-card">
            <AccordionTrigger className="text-left px-4 py-3 hover:bg-muted/30">
              <div className="flex items-center justify-between w-full pr-2">
                <span className="font-medium">{day.dayName}</span>
                <Badge variant="outline">{day.meals.length} meals</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                {day.meals.map((meal, index) => (
                  <Card key={`${day.day}-${meal.mealType}-${index}`} className="p-4 bg-surface/30">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-foreground">{meal.mealType}: {meal.name}</h4>
                        {meal.recipeNotes ? <p className="text-sm text-muted-foreground mt-1">{meal.recipeNotes}</p> : null}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 text-xs">
                        <Badge variant="outline">{meal.calories} cal</Badge>
                        <Badge variant="outline">{meal.protein}g protein</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {diet.tips?.length ? (
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center space-x-2">
            <Info className="h-4 w-4 text-primary" />
            <span>Nutrition Tips</span>
          </h4>
          <div className="grid gap-2">
            {diet.tips.map((tip, index) => (
              <div key={index} className="p-3 bg-surface/30 rounded-lg">
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const WeeklyWorkoutPlan = ({ workout }: { workout: NonNullable<SavedPlan["workout"]> }) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const weeks = getWorkoutWeeks(workout);
  const selectedWeek = weeks.find((week) => week.week === currentWeek) || weeks[0];

  if (!selectedWeek) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-2">No Workout Plan Found</h3>
        <p className="text-muted-foreground text-sm">Generate a new plan to see your structured workout schedule.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {weeks.map((week) => (
          <Button
            key={week.week}
            size="sm"
            variant={currentWeek === week.week ? "default" : "outline"}
            onClick={() => setCurrentWeek(week.week)}
          >
            Week {week.week}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Week {selectedWeek.week}: {selectedWeek.focus}</h3>
          <p className="text-sm text-muted-foreground">{workout.weeklyPlan?.frequency || "Training frequency set by plan"}</p>
        </div>
        <Badge variant="outline">{selectedWeek.days.length} days</Badge>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {selectedWeek.days.map((day) => (
          <AccordionItem key={`${selectedWeek.week}-${day.day}`} value={`day-${day.day}`} className="border rounded-lg bg-card">
            <AccordionTrigger className="text-left px-4 py-3 hover:bg-muted/30">
              <div className="flex items-center justify-between w-full pr-2">
                <div>
                  <div className="font-medium">{day.dayName}: {day.focus}</div>
                  <div className="text-xs text-muted-foreground">{day.exercises.length} exercises</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                {day.exercises.map((exercise, index) => (
                  <Card key={`${day.day}-${exercise.name}-${index}`} className="p-4 bg-surface/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h4 className="font-medium text-foreground">{exercise.name}</h4>
                        </div>
                        <p className="text-sm font-medium text-primary mb-2">
                          {exercise.sets} sets x {exercise.reps}
                          {exercise.restSeconds ? ` | Rest ${exercise.restSeconds}s` : ""}
                        </p>
                        {exercise.notes ? (
                          <p className="text-sm text-muted-foreground leading-relaxed">{exercise.notes}</p>
                        ) : null}
                      </div>
                      <Button size="sm" variant="ghost" className="shrink-0">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const CurrentPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"workout" | "nutrition">("workout");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; plan: SavedPlan }>("/api/ai/latest-plan");
        setPlan(res.plan);
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const duration = plan?.duration || plan?.workout?.durationWeeks || plan?.diet?.durationWeeks || 8;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 bg-surface border-r border-border h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">FitAI</span>
            </div>

            <nav className="space-y-2">
              <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Target className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/profile-setup" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link to="/current-plan" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-accent text-accent-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Current Plan</span>
              </Link>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Current Plan</h1>
                <p className="text-muted-foreground mt-1">
                  {loading ? "Loading your plan..." : plan ? `Your ${duration}-week ${activeTab === "workout" ? "workout" : "nutrition"} plan` : "No active plan found."}
                </p>
              </div>
              {plan ? (
                <Button onClick={() => navigate("/ai-plan")} className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Generate New Plan</span>
                </Button>
              ) : null}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading your fitness plan...</p>
                </div>
              </div>
            ) : !plan ? (
              <Card className="shadow-card">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <Calendar className="h-20 w-20 text-primary" />
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">No Active Plan</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">Generate your personalized AI-powered plan to get started.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => navigate("/ai-plan")} size="lg" className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Generate Your Plan</span>
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate("/profile-setup")} className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Setup Profile</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="flex bg-muted/30 p-1 rounded-lg">
                    <Button variant={activeTab === "workout" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("workout")} className="flex items-center space-x-2 px-6">
                      <Dumbbell className="h-4 w-4" />
                      <span>Workout Plan</span>
                    </Button>
                    <Button variant={activeTab === "nutrition" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("nutrition")} className="flex items-center space-x-2 px-6">
                      <Apple className="h-4 w-4" />
                      <span>Nutrition Plan</span>
                    </Button>
                  </div>
                </div>

                <Card className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {activeTab === "workout" ? <Dumbbell className="h-5 w-5 text-primary" /> : <Apple className="h-5 w-5 text-primary" />}
                        <span>{activeTab === "workout" ? "Workout Plan" : "Nutrition Plan"}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{duration} weeks</Badge>
                        {plan.workout?.source || plan.diet?.source ? (
                          <Badge variant="outline">{getPlanSourceLabel(plan.workout?.source || plan.diet?.source)}</Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {activeTab === "workout" && plan.workout ? (
                      <WeeklyWorkoutPlan workout={plan.workout} />
                    ) : activeTab === "nutrition" && plan.diet ? (
                      <NutritionPlanStructured diet={plan.diet} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-sm">Generate a plan to see this section.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span>Plan Progress</span>
                      </CardTitle>
                      <Badge variant="outline">Week 1 of {duration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">0% Complete</span>
                      </div>
                      <Progress value={0} className="w-full h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CurrentPlan;
