import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Dumbbell, Apple, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Use the actual images that exist in your public/assets folder
const dashboardPreview = "/assets/hero-fitness.jpg";
const nutritionPreview = "/assets/hero2.png";

// Enhanced JSON parsing with multiple fallback strategies
const parseWorkoutData = (workoutData: any) => {
  if (!workoutData) return [];
  
  // Try raw field first (enhanced JSON parsing with fallbacks)
  if (workoutData.raw) {
    try {
      let jsonStr = workoutData.raw;
      if (typeof jsonStr !== 'string') {
        jsonStr = JSON.stringify(jsonStr);
      }
      
      // Clean up common JSON issues
      jsonStr = jsonStr.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
      }
      
      // Try to find complete JSON object if truncated
      if (!jsonStr.endsWith('}') && !jsonStr.endsWith(']')) {
        let braceCount = 0;
        let lastCompleteIndex = -1;
        for (let i = 0; i < jsonStr.length; i++) {
          if (jsonStr[i] === '{') {
            braceCount++;
          } else if (jsonStr[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastCompleteIndex = i;
            }
          }
        }
        if (lastCompleteIndex > 0) {
          jsonStr = jsonStr.substring(0, lastCompleteIndex + 1);
        }
      }
      
      const parsedWorkout = JSON.parse(jsonStr);
      
      if (parsedWorkout.phases && Array.isArray(parsedWorkout.phases) && parsedWorkout.phases.length > 0) {
        const weeks = [];
        for (const phase of parsedWorkout.phases) {
          if (phase.days && Array.isArray(phase.days)) {
            const weekNumber = weeks.length + 1;
            weeks.push({
              number: weekNumber,
              title: `${phase.name} (Week ${weekNumber})`,
              days: phase.days.map((day: any, dayIdx: number) => ({
                number: dayIdx + 1,
                title: `${day.name}: ${day.focus}`,
                bodyPart: day.focus,
                exercises: day.exercises ? day.exercises.map((ex: any, exIdx: number) => ({
                  number: exIdx + 1,
                  name: ex.name || 'Unknown Exercise',
                  sets: `${ex.sets || 0} sets × ${ex.reps || '0'}`,
                  notes: `Rest: ${ex.rest || 'N/A'}${ex.notes ? ` | ${ex.notes}` : ''}`
                })) : []
              }))
            });
          }
        }
        if (weeks.length > 0) {
          return weeks;
        }
      }
    } catch (e) {
      console.error('Error parsing workout raw field:', e);
    }
  }
  
  // Fallback to direct phases if available
  if (workoutData.phases && Array.isArray(workoutData.phases)) {
    return workoutData.phases.map((phase: any, idx: number) => ({
      number: idx + 1,
      title: phase.name || `Phase ${idx + 1}`,
      days: phase.days ? phase.days.map((day: any, dayIdx: number) => ({
        number: dayIdx + 1,
        title: `${day.name}: ${day.focus}`,
        bodyPart: day.focus,
        exercises: day.exercises ? day.exercises.map((ex: any, exIdx: number) => ({
          number: exIdx + 1,
          name: ex.name || 'Unknown Exercise',
          sets: `${ex.sets || 0} sets × ${ex.reps || '0'}`,
          notes: `Rest: ${ex.rest || 'N/A'}${ex.notes ? ` | ${ex.notes}` : ''}`
        })) : []
      })) : []
    }));
  }
  
  return [];
};

const parseNutritionData = (nutritionData: any) => {
  if (!nutritionData) return null;
  
  // Try to parse as JSON first
  if (nutritionData.raw) {
    try {
      let jsonStr = nutritionData.raw;
      if (typeof jsonStr !== 'string') {
        jsonStr = JSON.stringify(jsonStr);
      }
      
      jsonStr = jsonStr.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
      }
      
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing nutrition data:', e);
    }
  }
  
  // Return the data as-is if parsing fails
  return nutritionData;
};

// No demo data. Render neutral empty states until real data is provided.

const AIPlanGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<any | null>(null);
  const [nutrition, setNutrition] = useState<any | null>(null);
  const [planMeta, setPlanMeta] = useState<{ duration?: number; version?: number; createdAt?: string } | null>(null);

  const generatePlan = async () => {
    setError(null);
    setLoading(true);
    try {
      // 1) fetch profile to collect required fields
      const { user } = await api.get<{ user: any }>("/api/user/profile");

      // Map complete profile to AI payloads
      const payload = {
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel || "moderate",
        dietPreference: user.dietPreference,
        planDuration: user.planDuration || 8,
        name: user.name
      };

      // New endpoint generates and saves
  const res = await api.post<{ success: boolean; plan: { workout: any; diet: any; duration?: number; version?: number; createdAt?: string } }>("/api/ai/generate-and-save", payload);

  setWorkout(res.plan.workout);
  setNutrition(res.plan.diet);
  setPlanMeta({ duration: res.plan.duration, version: res.plan.version, createdAt: res.plan.createdAt });
    } catch (e: any) {
      setError(e.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const loadLatest = async () => {
    try {
      const res = await api.get<{ success: boolean; plan: { workout: any; diet: any; duration?: number; version?: number; createdAt?: string } }>("/api/ai/latest-plan");
      setWorkout(res.plan.workout);
      setNutrition(res.plan.diet);
      setPlanMeta({ duration: res.plan.duration, version: res.plan.version, createdAt: res.plan.createdAt });
    } catch {}
  };

  useEffect(() => {
    loadLatest();
    // Defensive: remove any stale/injected UI like "Refresh Profile" button or "Profile Status" panel
    // This only targets elements within this page container to avoid side effects.
    const root = document.getElementById("ai-plan-page-root");
    if (root) {
      // Remove a button with text "Refresh Profile"
      root.querySelectorAll("button").forEach((btn) => {
        const text = (btn.textContent || "").trim().toLowerCase();
        if (text.includes("refresh profile")) {
          btn.remove();
        }
      });
      // Remove any block that labels itself as "Profile Status"
      root.querySelectorAll("*").forEach((el) => {
        const text = (el.textContent || "").toLowerCase();
        if (text.includes("profile status")) {
          // try to remove a nearby container (card/banner)
          const container = (el.closest(".border") as HTMLElement) || (el.parentElement as HTMLElement) || undefined;
          (container || (el as HTMLElement)).remove();
        }
      });
    }
  }, []);

  return (
  <div id="ai-plan-page-root" className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with AI Badge */}
        <div className="mb-12 text-center animate-slide-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3 bg-success/10 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">AI</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Plan
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3">
            {planMeta?.duration ? (
              <Badge variant="secondary">{planMeta.duration} weeks</Badge>
            ) : null}
            {planMeta?.version ? (
              <Badge variant="outline">v{planMeta.version}</Badge>
            ) : null}
            {planMeta?.createdAt ? (
              <Badge variant="secondary">{new Date(planMeta.createdAt).toLocaleDateString()}</Badge>
            ) : null}
          </div>
          <p className="text-lg text-muted-foreground mb-8">{loading ? "Generating..." : workout || nutrition ? "Your personalized plan" : "No plan generated yet."}</p>
          
          {/* AI Insights Banner */}
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-6 max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Insights</span>
            </div>
            <p className="text-foreground font-medium">
              {workout?.weekly_plan?.frequency ? `Training: ${workout.weekly_plan.frequency}` : "Insights will appear once a plan is generated."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Workout Plan */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Workout Plan</h2>
              </div>
              <div className="relative">
                <img 
                  src={dashboardPreview} 
                  alt="Workout analytics preview" 
                  className="w-20 h-12 object-cover rounded-lg opacity-20"
                />
              </div>
            </div>
            
            {!workout ? (
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground">No workout plan yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Generate your plan to see exercises here.</p>
                </CardContent>
              </Card>
            ) : (() => {
              const parsedWeeks = parseWorkoutData(workout);
              return parsedWeeks.length > 0 ? (
                <div className="space-y-4">
                  {parsedWeeks.slice(0, 2).map((week: any) => (
                    <Card key={week.number} className="shadow-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-foreground flex items-center justify-between">
                          {week.title}
                          <Badge variant="secondary">{week.days?.length || 0} days</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(week.days || []).slice(0, 3).map((day: any, dayIdx: number) => (
                            <div key={dayIdx} className="p-3 rounded-lg bg-muted/30">
                              <div className="font-medium text-foreground mb-2">{day.title}</div>
                              <div className="space-y-1">
                                {(day.exercises || []).slice(0, 3).map((ex: any, exIdx: number) => (
                                  <div key={exIdx} className="text-sm text-muted-foreground">
                                    {ex.name} - {ex.sets}
                                  </div>
                                ))}
                                {day.exercises?.length > 3 && (
                                  <div className="text-xs text-muted-foreground">+{day.exercises.length - 3} more exercises</div>
                                )}
                              </div>
                            </div>
                          ))}
                          {week.days?.length > 3 && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              +{week.days.length - 3} more days
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {parsedWeeks.length > 2 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">+{parsedWeeks.length - 2} more weeks available in full plan</p>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-foreground">Workout Generated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Your personalized workout plan has been generated. View the full plan in your dashboard.</p>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {/* Diet Plan */}
          <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg mr-3">
                  <Apple className="h-6 w-6 text-success" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Nutrition Plan</h2>
              </div>
              <div className="relative">
                <img 
                  src={nutritionPreview} 
                  alt="Nutrition preview" 
                  className="w-20 h-12 object-cover rounded-lg opacity-20"
                />
              </div>
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
            ) : (() => {
              const parsedNutrition = parseNutritionData(nutrition);
              return parsedNutrition ? (
                <div className="space-y-4">
                  {/* Daily Targets */}
                  {parsedNutrition.daily_targets && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-foreground">Daily Targets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-lg font-semibold text-foreground">{parsedNutrition.daily_targets.calories}</div>
                            <div className="text-xs text-muted-foreground">Calories</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-lg font-semibold text-foreground">{parsedNutrition.daily_targets.protein}g</div>
                            <div className="text-xs text-muted-foreground">Protein</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Sample Day */}
                  {parsedNutrition.weekly_plan && parsedNutrition.weekly_plan[0] && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-foreground flex items-center justify-between">
                          Sample Day - {parsedNutrition.weekly_plan[0].day}
                          <Badge variant="secondary">{parsedNutrition.weekly_plan[0].meals?.length || 0} meals</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(parsedNutrition.weekly_plan[0].meals || []).slice(0, 4).map((meal: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg bg-muted/30">
                              <div className="font-medium text-foreground mb-1">{meal.meal_type}</div>
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
                  )}
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-foreground">Nutrition Generated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Your personalized nutrition plan has been generated. View the full plan in your dashboard.</p>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>

        {/* Action Buttons */}
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