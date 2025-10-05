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
  Activity, 
  TrendingUp, 
  Calendar,
  Dumbbell,
  Apple,
  RefreshCw,
  Settings,
  Clock,
  CheckCircle,
  ChevronRight,
  Play,
  Info
} from "lucide-react";

// Enhanced component to render nutrition content with proper meal formatting
const FormattedContent = ({ content }: { content: string }) => {
  if (!content) return <p className="text-muted-foreground">No content available.</p>;
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return <NutritionPlanStructured diet={parsed} />;
    }
  } catch (e) {
    // Fall back to text parsing
  }
  
  return <NutritionPlanDisplay content={content} />;
};

// Component for structured JSON nutrition data
const NutritionPlanStructured = ({ diet }: { diet: any }) => {
  if (!diet) return <p className="text-muted-foreground">No nutrition data available.</p>;

  return (
    <div className="space-y-8">
      {/* Daily Targets */}
      {diet.daily_targets && (
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center space-x-2">
            <Target className="h-4 w-4 text-primary" />
            <span>Daily Nutrition Targets</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="p-4 bg-surface/30">
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Calories</div>
                <div className="font-semibold text-lg text-foreground">{diet.daily_targets.calories}</div>
              </div>
            </Card>
            <Card className="p-4 bg-surface/30">
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Protein</div>
                <div className="font-semibold text-lg text-foreground">{diet.daily_targets.protein}g</div>
              </div>
            </Card>
            <Card className="p-4 bg-surface/30">
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Carbs</div>
                <div className="font-semibold text-lg text-foreground">{diet.daily_targets.carbs}g</div>
              </div>
            </Card>
            <Card className="p-4 bg-surface/30">
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Fat</div>
                <div className="font-semibold text-lg text-foreground">{diet.daily_targets.fat}g</div>
              </div>
            </Card>
            <Card className="p-4 bg-surface/30">
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Fiber</div>
                <div className="font-semibold text-lg text-foreground">{diet.daily_targets.fiber}g</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Daily Meals */}
      {diet.meals && Array.isArray(diet.meals) && (
        <div>
          <h4 className="text-sm font-medium mb-6 flex items-center space-x-2">
            <Apple className="h-4 w-4 text-primary" />
            <span>Daily Meal Plan</span>
          </h4>
          <div className="space-y-4">
            {diet.meals.map((meal: any, idx: number) => (
              <Card key={idx} className="p-4 bg-surface/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground flex items-center space-x-2">
                      <Apple className="h-3 w-3 text-primary" />
                      <span>{meal.meal_type}</span>
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{meal.total_calories} kcal</span>
                      <span>{meal.prep_time}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {meal.foods.map((food: any, foodIdx: number) => (
                      <div key={foodIdx} className="flex items-center justify-between p-2 rounded bg-background/50">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{food.name}</span>
                          <span className="text-xs text-muted-foreground">({food.quantity})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>{food.calories} cal</span>
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fat}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {diet.tips && Array.isArray(diet.tips) && (
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center space-x-2">
            <Info className="h-4 w-4 text-primary" />
            <span>Nutrition Tips</span>
          </h4>
          <div className="grid gap-2">
            {diet.tips.map((tip: string, idx: number) => (
              <div key={idx} className="p-3 bg-surface/30 rounded-lg">
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component specifically for displaying nutrition plans with meal structure
const NutritionPlanDisplay = ({ content }: { content: string }) => {
  const parseContent = (text: string) => {
    const sections = [];
    
    // Parse Daily Nutrition Targets
    const targetsMatch = text.match(/\*\*Daily Nutrition Targets:\*\*(.*?)(?=\*\*Sample Daily Meal Plan:|\*\*Week|$)/s);
    if (targetsMatch) {
      const targetLines = targetsMatch[1].trim().split('\n').filter(line => line.trim());
      const targets = [];
      
      for (const line of targetLines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
          const content = trimmed.substring(2);
          const colonIndex = content.indexOf(':');
          if (colonIndex > 0) {
            const label = content.substring(0, colonIndex).trim();
            const rest = content.substring(colonIndex + 1).trim();
            
            // Extract value and description
            const match = rest.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
            if (match) {
              targets.push({
                label,
                value: match[1].trim(),
                description: match[2]
              });
            }
          }
        }
      }
      
      if (targets.length > 0) {
        sections.push({ type: 'targets', data: targets });
      }
    }
    
    // Parse Meal Plan
    const mealPlanMatch = text.match(/(\*\*Sample Daily Meal Plan:\*\*|\*\*Week.*?\*\*)(.*)/s);
    if (mealPlanMatch) {
      const mealText = mealPlanMatch[2].trim();
      const days = [];
      const lines = mealText.split('\n').filter(line => line.trim());
      
      let currentDay = null;
      let currentMeal = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Week headers
        if (trimmed.match(/^\*\*Week\s+\d+.*\*\*$/)) {
          if (currentDay) days.push(currentDay);
          currentDay = { name: trimmed.replace(/\*\*/g, ''), meals: [] };
          currentMeal = null;
          continue;
        }
        
        // Day headers (starting with -)
        if (trimmed.match(/^-\s*\*\*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\*\*$/)) {
          if (currentMeal) currentDay?.meals.push(currentMeal);
          if (currentDay && currentDay.meals.length > 0) days.push(currentDay);
          
          currentDay = { name: trimmed.replace(/^-\s*\*\*|\*\*$/g, ''), meals: [] };
          currentMeal = null;
          continue;
        }
        
        // Meal headers
        if (trimmed.match(/^\*\*(Breakfast|Mid-Morning Snack|Lunch|Pre\/Post Workout Snack|Dinner)/)) {
          if (currentMeal) currentDay?.meals.push(currentMeal);
          
          const mealName = trimmed.replace(/\*\*/g, '').replace(/\s*\([^)]*\).*$/, '');
          currentMeal = { name: mealName, items: [] };
          continue;
        }
        
        // Meal content
        if (currentMeal && trimmed && !trimmed.startsWith('**') && !trimmed.startsWith('-**')) {
          currentMeal.items.push(trimmed);
        }
      }
      
      // Add remaining data
      if (currentMeal) currentDay?.meals.push(currentMeal);
      if (currentDay) days.push(currentDay);
      
      if (days.length > 0) {
        sections.push({ type: 'meals', data: days });
      }
    }
    
    return sections;
  };
  
  const sections = parseContent(content);
  
  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <div key={index}>
          {section.type === 'targets' && (
            <div>
              <h4 className="text-sm font-medium mb-4 flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <span>Daily Nutrition Targets</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.data.map((target: any, idx: number) => (
                  <Card key={idx} className="p-4 bg-surface/30 border">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        {target.label}
                      </div>
                      <div className="font-semibold text-lg text-foreground">
                        {target.value}
                      </div>
                      {target.description && (
                        <div className="text-xs text-muted-foreground">
                          {target.description}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {section.type === 'meals' && (
            <div>
              <h4 className="text-sm font-medium mb-6 flex items-center space-x-2">
                <Apple className="h-4 w-4 text-primary" />
                <span>Weekly Meal Plan</span>
              </h4>
              <div className="space-y-8">
                {section.data.map((day: any, dayIdx: number) => (
                  <div key={dayIdx} className="space-y-4">
                    <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{day.name}</span>
                    </h3>
                    
                    <div className="grid gap-4">
                      {day.meals.map((meal: any, mealIdx: number) => (
                        <Card key={mealIdx} className="p-4 bg-surface/30 border">
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground flex items-center space-x-2">
                              <Apple className="h-3 w-3 text-primary" />
                              <span>{meal.name}</span>
                            </h4>
                            <div className="space-y-2">
                              {meal.items.map((item: string, itemIdx: number) => (
                                <p key={itemIdx} className="text-sm text-muted-foreground leading-relaxed pl-2 border-l-2 border-primary/20">
                                  {item}
                                </p>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {sections.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Unable to parse nutrition plan data.</p>
        </div>
      )}
    </div>
  );
};

// --- Markdown-ish parsers for LLM text ---------------------------------------
type WorkoutExercise = { name: string; meta?: string; notes?: string };
type WorkoutDay = { title: string; exercises: WorkoutExercise[] };

const parseWorkoutText = (md: string): WorkoutDay[] => {
  const lines = md.split(/\r?\n/);
  const days: WorkoutDay[] = [];
  let currentDay: WorkoutDay | null = null;
  let captureNotes = false;
  let lastExercise: WorkoutExercise | null = null;

  const dayHeader = /^\*\*(Day[^*]+)\*\*/i; // **Day 1: Upper Body (Monday)**
  const exerciseLine = /^(\d+)\.\s+\*\*([^*]+)\*\*(?:\s*\(([^\)]+)\))?/; // 1. **Bench Press** (3 sets x 8-12 reps)

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { captureNotes = false; continue; }

    // New day header
    const dayMatch = line.match(dayHeader);
    if (dayMatch) {
      if (currentDay) days.push(currentDay);
      currentDay = { title: dayMatch[1].trim(), exercises: [] };
      lastExercise = null;
      captureNotes = false;
      continue;
    }

    // Exercise numbered item
    const exMatch = line.match(exerciseLine);
    if (exMatch) {
      const name = exMatch[2].trim();
      const meta = exMatch[3]?.trim();
      const ex: WorkoutExercise = { name, meta };
      if (!currentDay) currentDay = { title: "Day", exercises: [] };
      currentDay.exercises.push(ex);
      lastExercise = ex;
      captureNotes = true;
      continue;
    }

    // Notes/description lines following an exercise
    if (captureNotes && lastExercise && !line.startsWith("**")) {
      lastExercise.notes = (lastExercise.notes ? lastExercise.notes + "\n" : "") + raw.trim();
      continue;
    }
  }

  if (currentDay) days.push(currentDay);
  return days;
};

type NutritionTargets = Record<string, string>;
const parseNutritionTargets = (md: string): NutritionTargets => {
  const targets: NutritionTargets = {};
  const headerIdx = md.indexOf("**Daily Nutrition Targets**");
  const altHeaderIdx = headerIdx === -1 ? md.indexOf("**Daily Nutrition Targets:**") : headerIdx;
  if (altHeaderIdx === -1) return targets;

  const after = md.slice(altHeaderIdx).split(/\r?\n/).slice(1); // lines after header
  for (const raw of after) {
    const line = raw.trim();
    if (!line) break; // stop at blank line
    if (!line.startsWith("- ")) break; // stop when list ends
    const m = line.replace(/^-\s*/, "").match(/^([^:]+):\s*(.+)$/);
    if (m) targets[m[1].trim()] = m[2].trim();
  }
  return targets;
};

// Enhanced Weekly Workout Plan Component
const WeeklyWorkoutPlan = ({ workout, duration }: { workout: any; duration: number }) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  
  // Enhanced workout parser that handles both JSON and text formats
  const parseWeeklyWorkout = (workoutData: any) => {
    // Handle JSON structured workout data
    if (typeof workoutData === 'object') {
      // Try to parse raw field if it exists
      if (workoutData.raw) {
        try {
          console.log('Attempting to parse workout raw data:', workoutData.raw.substring(0, 500) + '...');
          
          // Handle case where raw data might be incomplete JSON
          let jsonStr = workoutData.raw;
          
          // Try to extract complete JSON from potentially truncated string
          if (typeof jsonStr === 'string') {
            // Find the last complete object by counting braces
            let braceCount = 0;
            let lastCompleteIndex = -1;
            
            for (let i = 0; i < jsonStr.length; i++) {
              if (jsonStr[i] === '{') braceCount++;
              else if (jsonStr[i] === '}') {
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
          console.log('Successfully parsed workout:', parsedWorkout);
          
          if (parsedWorkout.phases && Array.isArray(parsedWorkout.phases) && parsedWorkout.phases.length > 0) {
            const weeks = [];
            for (const phase of parsedWorkout.phases) {
              if (phase.days && Array.isArray(phase.days)) {
                // Calculate proper week number and title
                const weekNumber = weeks.length + 1;
                const actualWeekRange = phase.weeks || `${weekNumber}`;
                weeks.push({
                  number: weekNumber,
                  title: `${phase.name} (Week ${weekNumber})`,
                  originalPhaseWeeks: phase.weeks,
                  days: phase.days.map((day: any, dayIdx: number) => ({
                    number: dayIdx + 1,
                    title: `${day.name}: ${day.focus}`,
                    dayName: '',
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
              console.log('Generated weeks from raw data:', weeks.length);
              return weeks;
            }
          }
        } catch (e) {
          console.error('Error parsing JSON workout raw field:', e);
          console.log('Raw data that failed to parse:', workoutData.raw?.substring(0, 200));
        }
      }
      
      // Try to use phases directly if raw parsing failed
      if (workoutData.phases && Array.isArray(workoutData.phases)) {
        const weeks = [];
        for (const phase of workoutData.phases) {
          if (phase.days && Array.isArray(phase.days)) {
            const weekNumber = weeks.length + 1;
            weeks.push({
              number: weekNumber,
              title: `${phase.name} (Week ${weekNumber})`,
              originalPhaseWeeks: phase.weeks,
              days: phase.days.map((day: any, dayIdx: number) => ({
                number: dayIdx + 1,
                title: `${day.name}: ${day.focus}`,
                dayName: '',
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
        if (weeks.length > 0) return weeks;
      }
      
      // Create fallback plan if we have some workout info but phases are empty
      if (workoutData.weekly_plan || workoutData.recommendations) {
        console.log('Creating fallback workout plan from available data');
        return [{
          number: 1,
          title: 'Your Personalized Workout Plan',
          days: [
            {
              number: 1,
              title: 'Full Body Workout',
              dayName: 'Day 1',
              bodyPart: 'Full Body',
              exercises: [
                { number: 1, name: 'Workout plan generated', sets: 'See AI recommendations', notes: 'Plan details are being processed' },
                { number: 2, name: 'Check regeneration', sets: 'Generate new plan', notes: 'Try regenerating for complete details' }
              ]
            }
          ],
          recommendations: workoutData.recommendations || [],
          weeklyPlan: workoutData.weekly_plan?.frequency || '3-4 times per week'
        }];
      }
    }
    
    // Fallback to text parsing
    const workoutText = typeof workoutData === 'string' ? workoutData : String(workoutData);
    const weeks = [];
    const lines = workoutText.split(/\r?\n/);
    
    let currentWeek = null;
    let currentDay = null;
    let currentExercises = [];
    let isCapturingExercise = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Week headers (Week 1, Week 2, etc.)
      const weekMatch = line.match(/^\*\*Week\s+(\d+).*?\*\*/i);
      if (weekMatch) {
        // Save previous day and week
        if (currentDay && currentExercises.length > 0) {
          currentDay.exercises = [...currentExercises];
          currentWeek?.days.push(currentDay);
        }
        if (currentWeek) {
          weeks.push(currentWeek);
        }
        
        currentWeek = {
          number: parseInt(weekMatch[1]),
          title: line.replace(/\*\*/g, ''),
          days: []
        };
        currentDay = null;
        currentExercises = [];
        continue;
      }
      
      // Day headers (Day 1: Upper Body (Monday), etc.)
      const dayMatch = line.match(/^\*\*Day\s+(\d+):\s*([^*]+)\*\*/i);
      if (dayMatch) {
        // Save previous day
        if (currentDay && currentExercises.length > 0) {
          currentDay.exercises = [...currentExercises];
          currentWeek?.days.push(currentDay);
        }
        
        const dayInfo = dayMatch[2].trim();
        const dayParts = dayInfo.split('(');
        const bodyPart = dayParts[0].trim();
        const dayName = dayParts[1] ? dayParts[1].replace(')', '').trim() : '';
        
        // Ensure we don't create duplicate days in the same week
        const dayExists = currentWeek?.days.some(d => d.number === parseInt(dayMatch[1]));
        if (!dayExists) {
          currentDay = {
            number: parseInt(dayMatch[1]),
            title: `Day ${dayMatch[1]}: ${bodyPart}`,
            dayName: dayName,
            bodyPart: bodyPart,
            exercises: []
          };
          currentExercises = [];
        }
        continue;
      }
      
      // Exercise items (1. **Exercise Name** (sets x reps))
      const exerciseMatch = line.match(/^(\d+)\.\s*\*\*([^*]+)\*\*(?:\s*\(([^)]+)\))?/);
      if (exerciseMatch) {
        const exercise = {
          number: parseInt(exerciseMatch[1]),
          name: exerciseMatch[2].trim(),
          sets: exerciseMatch[3] || '',
          notes: ''
        };
        currentExercises.push(exercise);
        isCapturingExercise = true;
        continue;
      }
      
      // Capture exercise notes/instructions
      if (isCapturingExercise && currentExercises.length > 0 && !line.startsWith('**') && !line.match(/^\d+\./)) {
        const lastExercise = currentExercises[currentExercises.length - 1];
        lastExercise.notes = lastExercise.notes ? lastExercise.notes + '\n' + line : line;
      } else {
        isCapturingExercise = false;
      }
    }
    
    // Save final day and week
    if (currentDay && currentExercises.length > 0) {
      currentDay.exercises = [...currentExercises];
      currentWeek?.days.push(currentDay);
    }
    if (currentWeek) {
      weeks.push(currentWeek);
    }
    
    // If no weeks were parsed, create a default structure with proper day numbering
    if (weeks.length === 0) {
      // Try text parsing first
      const days = parseWorkoutText(workoutText);
      if (days.length > 0) {
        // Remove duplicates and ensure sequential day numbering
        const uniqueDays = [];
        const seenTitles = new Set();
        
        days.forEach((day, idx) => {
          const normalizedTitle = day.title.toLowerCase().trim();
          if (!seenTitles.has(normalizedTitle)) {
            seenTitles.add(normalizedTitle);
            uniqueDays.push({
              number: uniqueDays.length + 1,
              title: day.title,
              dayName: '',
              bodyPart: day.title.split(':')[1]?.trim() || day.title,
              exercises: day.exercises.map((ex, exIdx) => ({
                number: exIdx + 1,
                name: ex.name,
                sets: ex.meta || '',
                notes: ex.notes || ''
              }))
            });
          }
        });
        
        if (uniqueDays.length > 0) {
          weeks.push({
            number: 1,
            title: 'Week 1',
            days: uniqueDays
          });
        }
      } else {
        // If all parsing fails, create a basic sample structure to show something
        console.log('All parsing failed, creating sample structure');
        weeks.push({
          number: 1,
          title: 'Week 1 - Foundation Phase',
          days: [
            {
              number: 1,
              title: 'Day 1: Upper Body',
              dayName: 'Monday',
              bodyPart: 'Upper Body',
              exercises: [
                {
                  number: 1,
                  name: 'Bench Press',
                  sets: '3 sets × 8-12 reps',
                  notes: 'Rest: 60-90s | Focus on proper form'
                },
                {
                  number: 2,
                  name: 'Incline Dumbbell Press',
                  sets: '3 sets × 8-12 reps', 
                  notes: 'Rest: 60-90s | Focus on upper chest'
                },
                {
                  number: 3,
                  name: 'Pull-ups',
                  sets: '3 sets × 8-12 reps',
                  notes: 'Rest: 60-90s | Assisted if needed'
                }
              ]
            },
            {
              number: 2,
              title: 'Day 2: Lower Body',
              dayName: 'Tuesday',
              bodyPart: 'Lower Body',
              exercises: [
                {
                  number: 1,
                  name: 'Squats',
                  sets: '3 sets × 8-12 reps',
                  notes: 'Rest: 60-90s | Focus on proper form'
                },
                {
                  number: 2,
                  name: 'Leg Press',
                  sets: '3 sets × 8-12 reps',
                  notes: 'Rest: 60-90s | Target quadriceps'
                },
                {
                  number: 3,
                  name: 'Lunges',
                  sets: '3 sets × 8-12 reps',
                  notes: 'Rest: 60-90s | Alternate legs'
                }
              ]
            }
          ]
        });
      }
    }
    
    return weeks;
  };
  
  const weeks = parseWeeklyWorkout(workout);
  const selectedWeek = weeks.find(w => w.number === currentWeek) || weeks[0];
  
  console.log('WeeklyWorkoutPlan - Received workout data:', workout);
  console.log('WeeklyWorkoutPlan - Parsed weeks:', weeks);
  console.log('WeeklyWorkoutPlan - Selected week:', selectedWeek);
  
  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      {weeks.length > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Select Week:</span>
            <div className="flex space-x-1">
              {weeks.map((week) => (
                <Button
                  key={week.number}
                  size="sm"
                  variant={currentWeek === week.number ? 'default' : 'outline'}
                  onClick={() => setCurrentWeek(week.number)}
                  className="px-3"
                >
                  Week {week.number}
                </Button>
              ))}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {duration} weeks total
          </Badge>
        </div>
      )}
      
      {/* Current Week Display */}
      {selectedWeek && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{selectedWeek.title}</h3>
          </div>
          
          {/* Days Accordion */}
          <Accordion type="single" collapsible className="w-full space-y-2">
            {selectedWeek.days.map((day, dayIdx) => (
              <AccordionItem 
                key={`week-${selectedWeek.number}-day-${dayIdx}-${day.number}`} 
                value={`day-${dayIdx}`} 
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="text-left px-4 py-3 hover:bg-muted/30">
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{day.number}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{day.title}</div>
                          {day.dayName && (
                            <div className="text-xs text-muted-foreground">({day.dayName})</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {day.exercises.length} exercises
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 pt-2">
                    {day.exercises.map((exercise, exIdx) => (
                      <Card key={exIdx} className="p-4 bg-surface/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                {exercise.number}
                              </span>
                              <h4 className="font-medium text-foreground">{exercise.name}</h4>
                            </div>
                            {exercise.sets && (
                              <p className="text-sm font-medium text-primary mb-2">{exercise.sets}</p>
                            )}
                            {exercise.notes && (
                              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {exercise.notes}
                              </p>
                            )}
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
      )}
      
      {/* No workout data fallback */}
      {(!weeks || weeks.length === 0) && (
        <div className="text-center py-8">
          <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No Workout Plan Found</h3>
          <p className="text-muted-foreground text-sm">Generate a new plan to see your structured workout schedule.</p>
          <div className="mt-4 p-3 bg-muted/30 rounded text-xs text-muted-foreground text-left">
            <div className="font-medium mb-2">Debug Info:</div>
            <div>Workout data type: {typeof workout}</div>
            <div>Workout keys: {workout && typeof workout === 'object' ? Object.keys(workout).join(', ') : 'N/A'}</div>
            <div>Raw data preview: {JSON.stringify(workout).substring(0, 200)}...</div>
          </div>
        </div>
      )}
    </div>
  );
};

const CurrentPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<{ workout?: any; diet?: any; duration?: number; version?: number; createdAt?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');

  useEffect(() => {
    console.log('CurrentPlan component mounted');
    const load = async () => {
      try {
        console.log('Loading plan data...');
        setLoading(true);
        const res = await api.get<{ success: boolean; plan: { workout: any; diet: any; duration?: number; version?: number; createdAt?: string } }>("/api/ai/latest-plan");
        console.log('CurrentPlan API Response:', res);
        console.log('Plan data:', res.plan);
        setPlan(res.plan);
      } catch (e) {
        console.error('Error loading plan:', e);
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRegeneratePlan = () => {
    navigate("/ai-plan");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation */}
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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Current Plan</h1>
                <p className="text-muted-foreground mt-1">
                  {loading ? "Loading your plan..." : plan ? `Your ${plan.duration || 8}-week ${activeTab === 'workout' ? 'workout' : 'nutrition'} plan` : "No active plan found."}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {plan && (
                  <Button onClick={handleRegeneratePlan} className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Generate New Plan</span>
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-8">
                <div className="flex items-center justify-center h-32">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading your fitness plan...</p>
                  </div>
                </div>
                
                {/* Skeleton cards */}
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                          <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                          <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : !plan ? (
              <Card className="shadow-card">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                      <Calendar className="h-20 w-20 text-primary relative z-10" />
                    </div>
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">No Active Plan</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Ready to start your fitness journey? Generate your personalized AI-powered plan to get started with workouts and nutrition tailored just for you.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleRegeneratePlan} size="lg" className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Generate Your Plan</span>
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate('/profile-setup')} className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Setup Profile</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center justify-center">
                  <div className="flex bg-muted/30 p-1 rounded-lg">
                    <Button
                      variant={activeTab === 'workout' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('workout')}
                      className="flex items-center space-x-2 px-6"
                    >
                      <Dumbbell className="h-4 w-4" />
                      <span>Workout Plan</span>
                    </Button>
                    <Button
                      variant={activeTab === 'nutrition' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('nutrition')}
                      className="flex items-center space-x-2 px-6"
                    >
                      <Apple className="h-4 w-4" />
                      <span>Nutrition Plan</span>
                    </Button>
                  </div>
                </div>

                {/* Tab Content */}
                <Card className="shadow-card">
                  {activeTab === 'workout' ? (
                    <>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <Dumbbell className="h-5 w-5 text-primary" />
                            <span>Workout Plan</span>
                          </CardTitle>
                          <Badge variant="secondary">{plan.duration || 8} weeks</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {plan.workout && (plan.workout.raw || plan.workout.phases || typeof plan.workout === 'string') ? (
                          <WeeklyWorkoutPlan workout={plan.workout} duration={plan.duration || 8} />
                        ) : (
                          <div className="text-center py-12">
                            <div className="relative mb-4">
                              <div className="absolute inset-0 bg-muted/20 rounded-full animate-pulse"></div>
                              <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto relative z-10" />
                            </div>
                            <h3 className="font-medium text-foreground mb-2">No Workout Plan</h3>
                            <p className="text-muted-foreground text-sm">Generate a plan to see your workout schedule and exercises.</p>
                            <div className="mt-4 p-3 bg-muted/30 rounded text-xs text-muted-foreground">
                              Debug: {plan.workout ? `Workout data exists but may be incomplete: ${JSON.stringify(Object.keys(plan.workout))}` : 'No workout data found'}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </>
                  ) : (
                    <>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <Apple className="h-5 w-5 text-primary" />
                            <span>Nutrition Plan</span>
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{plan.duration || 8} weeks</Badge>
                            <Button size="sm" variant="outline" className="h-8">
                              <Info className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {plan.diet ? (
                          <div className="max-h-[600px] overflow-y-auto pr-2">
                            <NutritionPlanStructured diet={plan.diet} />
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="relative mb-4">
                              <div className="absolute inset-0 bg-muted/20 rounded-full animate-pulse"></div>
                              <Apple className="h-16 w-16 text-muted-foreground mx-auto relative z-10" />
                            </div>
                            <h3 className="font-medium text-foreground mb-2">No Nutrition Plan</h3>
                            <p className="text-muted-foreground text-sm">Generate a plan to see your meal guidelines and nutrition targets.</p>
                          </div>
                        )}
                      </CardContent>
                    </>
                  )}
                </Card>

                {/* Plan Progress */}
                <Card className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span>Plan Progress</span>
                      </CardTitle>
                      <Badge variant="outline">Week 1 of {plan.duration || 8}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">12.5% Complete</span>
                      </div>
                      <Progress value={12.5} className="w-full h-2" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 bg-surface/30">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-muted rounded-full">
                            <CheckCircle className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Workouts</p>
                            <p className="text-xs text-muted-foreground">1 of 3 this week</p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-surface/30">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-muted rounded-full">
                            <Apple className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Nutrition</p>
                            <p className="text-xs text-muted-foreground">85% adherence</p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-surface/30">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-muted rounded-full">
                            <Target className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Goals</p>
                            <p className="text-xs text-muted-foreground">2 of 3 weekly</p>
                          </div>
                        </div>
                      </Card>
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
