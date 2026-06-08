import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SavedPlan, getTodayMeals, getTodayWorkout } from "@/lib/plan";
import { 
  User, 
  Target, 
  Activity, 
  TrendingUp, 
  Calendar,
  Dumbbell,
  RefreshCw,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle,
  Info,
  AlertCircle,
  Eye,
  Clock,
  Zap,
  Trophy,
  ArrowRight,
  Apple
} from "lucide-react";

const parseWorkoutData = (workoutData: any) => {
  const today = getTodayWorkout(workoutData);
  if (!today) return [];

  return [{
    number: 1,
    title: "Week 1",
    days: [{
      number: today.day,
      title: `${today.dayName}: ${today.focus}`,
      bodyPart: today.focus,
      exercises: today.exercises.map((exercise, index) => ({
        id: exercise.id || index + 1,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        restTime: exercise.restSeconds || 60,
        difficulty: 'Intermediate',
        muscleGroups: [today.focus],
        instructions: [exercise.notes || 'Perform exercise with proper form'],
        tips: ['Focus on proper form', 'Control the movement'],
        safetyNotes: ['Stop if you feel sharp pain']
      }))
    }]
  }];
};

const parseNutritionData = (nutritionData: any) => {
  return nutritionData;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<number | null>(null);
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [currentSet, setCurrentSet] = useState<{[key: number]: number}>({});
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState(false);
  const [completedMeals, setCompletedMeals] = useState<Set<number>>(new Set());

  // Parse AI-generated workout and nutrition data
  const parsedWorkout = plan?.workout ? parseWorkoutData(plan.workout) : [];
  const parsedNutrition = plan?.diet ? parseNutritionData(plan.diet) : null;
  
  const todayWorkout = parsedWorkout.length > 0 && parsedWorkout[0]?.days?.length > 0 
    ? parsedWorkout[0].days[0].exercises 
    : [
      // Fallback sample workout data
      {
        id: 1,
        name: "Bench Press",
        sets: 3,
        reps: "8-12",
        restTime: 90,
        difficulty: "Intermediate",
        muscleGroups: ["Chest", "Triceps", "Shoulders"],
        instructions: [
          "Lie flat on the bench with your feet firmly planted on the ground",
          "Grip the barbell with hands slightly wider than shoulder-width apart",
          "Lower the bar slowly to your chest, keeping your elbows at 45 degrees",
          "Press the bar up explosively, fully extending your arms",
          "Maintain control throughout the entire movement"
        ],
        tips: [
          "Keep your core tight throughout the movement",
          "Don't bounce the bar off your chest",
          "Breathe in on the way down, out on the way up"
        ],
        safetyNotes: [
          "Always use a spotter when lifting heavy",
          "Keep your feet on the ground for stability",
          "Don't arch your back excessively"
        ]
      }
    ];
  
  // Get daily calorie target from AI nutrition data
  const todayMeals = parsedNutrition ? getTodayMeals(parsedNutrition) : [];
  const dailyCalories = parsedNutrition?.dailyTargets?.calories || 2400;

  // Helper functions
  const toggleMealCompletion = (mealIndex: number) => {
    setCompletedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealIndex)) {
        newSet.delete(mealIndex);
      } else {
        newSet.add(mealIndex);
      }
      return newSet;
    });
  };



  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; plan: SavedPlan }>("/api/ai/latest-plan");
        setPlan(res.plan);
      } catch (e) {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = (exerciseId: number) => {
    setActiveWorkout(exerciseId);
    setIsTimerRunning(true);
    if (!currentSet[exerciseId]) {
      setCurrentSet(prev => ({ ...prev, [exerciseId]: 1 }));
    }
  };

  const completeSet = (exerciseId: number) => {
    const exercise = todayWorkout.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const currentSetNum = currentSet[exerciseId] || 1;
    
    if (currentSetNum < exercise.sets) {
      // Start rest timer
      setRestTimer(exercise.restTime);
      setIsResting(true);
      setCurrentSet(prev => ({ ...prev, [exerciseId]: currentSetNum + 1 }));
    } else {
      // Exercise completed
      setCompletedExercises(prev => new Set([...prev, exerciseId]));
      setActiveWorkout(null);
      setCurrentSet(prev => ({ ...prev, [exerciseId]: 1 }));
    }
  };

  const resetExercise = (exerciseId: number) => {
    setCurrentSet(prev => ({ ...prev, [exerciseId]: 1 }));
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(exerciseId);
      return newSet;
    });
    setActiveWorkout(null);
    setIsResting(false);
    setRestTimer(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    return 'bg-muted text-muted-foreground border-muted';
  };

  const handleRegeneratePlan = () => {
    navigate("/ai-plan");
  };

  const handleUpdateProfile = () => {
    navigate("/profile-setup");
  };

  const completedToday = completedExercises.size;
  const totalExercises = todayWorkout.length;
  const workoutProgress = (completedToday / totalExercises) * 100;

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
              <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-accent text-accent-foreground relative overflow-hidden group">
                <Target className="h-4 w-4 relative z-10" />
                <span className="font-medium relative z-10">Dashboard</span>
              </Link>
              <Link to="/profile-setup" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link to="/current-plan" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Current Plan</span>
              </Link>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Welcome Back!</h1>
                <p className="text-muted-foreground mt-1">
                  {loading ? "Loading your latest plan..." : plan ? `Your ${plan.duration || 8}-week plan is active` : "Ready to start your fitness journey?"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {isTimerRunning && (
                  <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg">
                    <Timer className="h-4 w-4 text-foreground" />
                    <span className="font-mono text-sm text-foreground">{formatTime(workoutTimer)}</span>
                  </div>
                )}
                <Button className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Sync Data</span>
                </Button>
              </div>
            </div>



            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{Math.round(workoutProgress)}%</div>
                  <Progress value={workoutProgress} className="h-3 mt-2 transition-all duration-1000" />
                  <p className="text-xs text-muted-foreground mt-2">{completedToday}/{totalExercises} exercises completed</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Workout Time</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground font-mono">{formatTime(workoutTimer)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active session time</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Calories Target</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{dailyCalories.toLocaleString()}</div>
                  <Progress value={65} className="h-3 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {parsedNutrition ? "AI-personalized target" : "Daily nutrition goal"}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Streak</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">5 days</div>
                  <p className="text-xs text-muted-foreground mt-1">Consistent training</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Workout and Meals - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Workout */}
              <Card className="shadow-card h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <span>
                      {parsedWorkout.length > 0 && parsedWorkout[0]?.days?.length > 0 
                        ? `Today's Workout - ${parsedWorkout[0].days[0].title}`
                        : "Today's Workout - Upper Body Strength"
                      }
                    </span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {totalExercises} exercises
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className=""
                    >
                      {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isTimerRunning ? 'Pause' : 'Start'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {todayWorkout.map((exercise, index) => {
                  const isActive = activeWorkout === exercise.id;
                  const isCompleted = completedExercises.has(exercise.id);
                  const currentSetNum = currentSet[exercise.id] || 1;
                  
                  return (
                    <Card 
                      key={exercise.id} 
                      className={`${
                        isActive ? 'ring-2 ring-primary bg-muted/30' : 
                        isCompleted ? 'bg-muted/50 border-muted' : 
                        ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Exercise Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCompleted ? 'bg-muted text-foreground' : 
                                isActive ? 'bg-primary text-primary-foreground' : 
                                'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{exercise.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                  <span>Rest: {exercise.restTime}s</span>
                                  <Badge className={getDifficultyColor(exercise.difficulty)} variant="outline">
                                    {exercise.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isActive && (
                                <Badge variant="default">
                                  Set {currentSetNum}/{exercise.sets}
                                </Badge>
                              )}
                              {!isCompleted && !isActive && (
                                <Button 
                                  size="sm" 
                                  onClick={() => startWorkout(exercise.id)}
                                  className=""
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                              {isActive && (
                                <Button 
                                  size="sm" 
                                  onClick={() => completeSet(exercise.id)}
                                  variant="default"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete Set
                                </Button>
                              )}
                              {isCompleted && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => resetExercise(exercise.id)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Reset
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Muscle Groups */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-muted-foreground">Target:</span>
                            {exercise.muscleGroups.map((muscle, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                          </div>

                          {/* Instructions - Show when active */}
                          {isActive && (
                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg animate-in slide-in-from-top duration-300">
                              <div className="grid md:grid-cols-2 gap-4">
                                {/* Instructions */}
                                <div>
                                  <h4 className="font-medium text-sm text-foreground mb-2 flex items-center">
                                    <Info className="h-4 w-4 mr-1" />
                                    Step-by-step Instructions
                                  </h4>
                                  <ol className="space-y-1 text-sm text-muted-foreground">
                                    {exercise.instructions.map((instruction, i) => (
                                      <li key={i} className="flex items-start space-x-2">
                                        <span className="flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                          {i + 1}
                                        </span>
                                        <span>{instruction}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>

                                {/* Tips & Safety */}
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-medium text-sm text-foreground mb-2 flex items-center">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Pro Tips
                                    </h4>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                      {exercise.tips.map((tip, i) => (
                                        <li key={i} className="flex items-start space-x-2">
                                          <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm text-foreground mb-2 flex items-center">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Safety Notes
                                    </h4>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                      {exercise.safetyNotes.map((note, i) => (
                                        <li key={i} className="flex items-start space-x-2">
                                          <AlertCircle className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                                          <span>{note}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Workout Summary */}
                <div className="mt-6 p-4 bg-muted/20 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Workout Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        Progress: {completedToday}/{totalExercises} exercises • Time: {formatTime(workoutTimer)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={() => navigate("/current-plan")}>
                        View Full Plan
                      </Button>
                      {completedToday === totalExercises && (
                        <Button>
                          <Trophy className="h-4 w-4 mr-1" />
                          Workout Complete!
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <Card className="shadow-card h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Apple className="h-5 w-5 text-muted-foreground" />
                    <span>Today's Meals</span>
                  </CardTitle>
                  <Badge variant="secondary">
                    {todayMeals.length || 4} meals
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {todayMeals.length > 0 ? (
                  todayMeals.map((meal: any, index: number) => {
                    const isCompleted = completedMeals.has(index);
                    return (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isCompleted ? 'bg-muted/50 opacity-60' : 'bg-muted/30 hover:bg-muted/40'
                      }`}>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-primary border-2 border-border rounded focus:ring-primary"
                          id={`meal-${index}`}
                          checked={isCompleted}
                          onChange={() => toggleMealCompletion(index)}
                        />
                        <div className="flex-1">
                          <label htmlFor={`meal-${index}`} className="cursor-pointer">
                            <div className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {meal.mealType}
                            </div>
                            <div className={`text-sm ${isCompleted ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'}`}>
                              {meal.name}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{meal.calories} cal</Badge>
                              <Badge variant="outline" className="text-xs">{meal.protein}g protein</Badge>
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Fallback meals if no AI nutrition data
                  [
                    { mealType: "Breakfast", name: "Oatmeal with Berries", calories: 350, protein: 12 },
                    { mealType: "Lunch", name: "Grilled Chicken Salad", calories: 450, protein: 35 },
                    { mealType: "Snack", name: "Greek Yogurt", calories: 150, protein: 20 },
                    { mealType: "Dinner", name: "Salmon with Vegetables", calories: 500, protein: 40 }
                  ].map((meal, index) => {
                    const isCompleted = completedMeals.has(index);
                    return (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isCompleted ? 'bg-muted/50 opacity-60' : 'bg-muted/30 hover:bg-muted/40'
                      }`}>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-primary border-2 border-border rounded focus:ring-primary"
                          id={`meal-${index}`}
                          checked={isCompleted}
                          onChange={() => toggleMealCompletion(index)}
                        />
                        <div className="flex-1">
                          <label htmlFor={`meal-${index}`} className="cursor-pointer">
                            <div className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {meal.mealType}
                            </div>
                            <div className={`text-sm ${isCompleted ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'}`}>
                              {meal.name}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{meal.calories} cal</Badge>
                              <Badge variant="outline" className="text-xs">{meal.protein}g protein</Badge>
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Meals Summary */}
                <div className="mt-4 p-3 bg-muted/20 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Daily Nutrition</h4>
                      <p className="text-sm text-muted-foreground">
                        Progress: {completedMeals.size}/{todayMeals.length || 4} meals - Target: {dailyCalories} cal
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Plan
                    </Button>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={handleRegeneratePlan}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate Plan</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={handleUpdateProfile}
              >
                <User className="h-4 w-4" />
                <span>Update Profile</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => navigate("/current-plan")}
              >
                <Calendar className="h-4 w-4" />
                <span>View Current Plan</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
