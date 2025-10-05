import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Camera, User, Target, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ProfileSetup = () => {
  const [setupMethod, setSetupMethod] = useState("manual");
  const [profileData, setProfileData] = useState({
    name: "",
    height: "",
    weight: "",
    age: "",
    gender: "",
    fitnessGoal: "",
    dietPreference: "",
    activityLevel: "",
    planDuration: "8",
    medicalConditions: ""
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    (async () => {
      setDataLoading(true);
      try {
        const res = await api.get<{ user: { name?: string; height?: number; weight?: number; age?: number; gender?: string; fitnessGoal?: string; dietPreference?: string; activityLevel?: string; planDuration?: number; medicalConditions?: string } }>("/api/user/profile");
        const u = res.user;
        setProfileData(prev => ({
          ...prev,
          name: u.name || "",
          height: u.height ? String(u.height) : prev.height,
          weight: u.weight ? String(u.weight) : prev.weight,
          age: u.age ? String(u.age) : prev.age,
          gender: u.gender || prev.gender,
          fitnessGoal: u.fitnessGoal || prev.fitnessGoal,
          dietPreference: u.dietPreference || prev.dietPreference,
          activityLevel: u.activityLevel || prev.activityLevel,
          planDuration: u.planDuration ? String(u.planDuration) : prev.planDuration,
          medicalConditions: u.medicalConditions || prev.medicalConditions,
        }));
      } catch (e) {
        // ignore if no profile yet
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.put("/api/user/profile", profileData);
      navigate("/ai-plan");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center animate-slide-in-up">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-3">Tell us about you</h1>
          <p className="text-lg text-muted-foreground">Help us create your personalized AI fitness plan</p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mt-8 space-x-2">
            <div className="w-8 h-2 bg-primary rounded-full"></div>
            <div className="w-8 h-2 bg-muted rounded-full"></div>
            <div className="w-8 h-2 bg-muted rounded-full"></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Step 1 of 3</p>
        </div>

        <Card className="shadow-elevated animate-fade-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl flex items-center justify-center space-x-2">
              <Target className="h-6 w-6 text-primary" />
              <span>Profile Setup</span>
            </CardTitle>
            {dataLoading && (
              <p className="text-sm text-muted-foreground mt-2">Loading your profile data...</p>
            )}
          </CardHeader>
          <CardContent className="p-8">
            <Tabs value={setupMethod} onValueChange={setSetupMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="manual" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Manual Entry</span>
                </TabsTrigger>
                <TabsTrigger value="scan" className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>AI Body Scan</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-8 mt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      Basic Information
                    </h3>
                    <div className="form-group">
                      <Label htmlFor="name" className="text-base font-medium">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your name"
                        required
                        disabled
                        readOnly
                        className="mt-2 h-12 bg-muted cursor-not-allowed"
                        title="Name cannot be edited"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Name cannot be changed after account creation</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="form-group">
                        <Label htmlFor="height" className="text-base font-medium">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={profileData.height}
                          onChange={(e) => handleInputChange("height", e.target.value)}
                          placeholder="170"
                          required
                          className="mt-2 h-12"
                        />
                      </div>
                      
                      <div className="form-group">
                        <Label htmlFor="weight" className="text-base font-medium">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={profileData.weight}
                          onChange={(e) => handleInputChange("weight", e.target.value)}
                          placeholder="70"
                          required
                          className="mt-2 h-12"
                        />
                      </div>

                      <div className="form-group">
                        <Label htmlFor="age" className="text-base font-medium">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profileData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          placeholder="25"
                          required
                          className="mt-2 h-12"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <Label className="text-base font-medium">Gender (Optional)</Label>
                      <Select value={profileData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="mt-2 h-12">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Goals Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      Fitness Goals
                    </h3>

                    <div className="form-group">
                      <Label className="text-base font-medium mb-4 block">What's your primary fitness goal?</Label>
                      <RadioGroup 
                        value={profileData.fitnessGoal} 
                        onValueChange={(value) => handleInputChange("fitnessGoal", value)}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <RadioGroupItem value="fat-loss" id="fat-loss" />
                          <Label htmlFor="fat-loss" className="cursor-pointer flex-1">
                            <div className="font-medium text-foreground">Fat Loss</div>
                            <div className="text-sm text-muted-foreground">Lose weight and body fat</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <RadioGroupItem value="muscle-gain" id="muscle-gain" />
                          <Label htmlFor="muscle-gain" className="cursor-pointer flex-1">
                            <div className="font-medium text-foreground">Muscle Gain</div>
                            <div className="text-sm text-muted-foreground">Build lean muscle mass</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <RadioGroupItem value="maintenance" id="maintenance" />
                          <Label htmlFor="maintenance" className="cursor-pointer flex-1">
                            <div className="font-medium text-foreground">Maintenance</div>
                            <div className="text-sm text-muted-foreground">Stay in great shape</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Preferences Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      Preferences
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <Label className="text-base font-medium">Diet Preference</Label>
                        <Select value={profileData.dietPreference} onValueChange={(value) => handleInputChange("dietPreference", value)}>
                          <SelectTrigger className="mt-2 h-12">
                            <SelectValue placeholder="Select diet preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="form-group">
                        <Label className="text-base font-medium">Plan Duration</Label>
                        <Select value={profileData.planDuration} onValueChange={(value) => handleInputChange("planDuration", value)}>
                          <SelectTrigger className="mt-2 h-12">
                            <SelectValue placeholder="Select plan duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 Weeks</SelectItem>
                            <SelectItem value="8">8 Weeks</SelectItem>
                            <SelectItem value="12">12 Weeks</SelectItem>
                            <SelectItem value="16">16 Weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="form-group">
                      <Label className="text-base font-medium mb-4 block">Activity Level</Label>
                        <RadioGroup 
                          value={profileData.activityLevel} 
                          onValueChange={(value) => handleInputChange("activityLevel", value)}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                            <RadioGroupItem value="sedentary" id="sedentary" />
                            <Label htmlFor="sedentary" className="cursor-pointer flex-1">
                              <div className="font-medium text-foreground">Sedentary</div>
                              <div className="text-sm text-muted-foreground">Little to no exercise</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                            <RadioGroupItem value="moderate" id="moderate" />
                            <Label htmlFor="moderate" className="cursor-pointer flex-1">
                              <div className="font-medium text-foreground">Moderate</div>
                              <div className="text-sm text-muted-foreground">Light exercise 2-3 times/week</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                            <RadioGroupItem value="active" id="active" />
                            <Label htmlFor="active" className="cursor-pointer flex-1">
                              <div className="font-medium text-foreground">Active</div>
                              <div className="text-sm text-muted-foreground">Regular exercise 4+ times/week</div>
                            </Label>
                          </div>
                        </RadioGroup>
                    </div>
                  </div>

                  {/* Health Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-primary">4</span>
                      </div>
                      Health Information (Optional)
                    </h3>

                    <div className="form-group">
                      <Label htmlFor="medicalConditions" className="text-base font-medium">
                        Medical Conditions or Injuries
                      </Label>
                      <Input
                        id="medicalConditions"
                        type="text"
                        value={profileData.medicalConditions}
                        onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                        placeholder="e.g., Lower back pain, knee injury, diabetes (leave blank if none)"
                        className="mt-2 h-12"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This helps us create safer, more personalized workout and nutrition plans
                      </p>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full h-14 text-base hover:scale-[1.02] transition-transform" disabled={loading || dataLoading}>
                    <Activity className="h-5 w-5 mr-2" />
                    {loading ? "Saving..." : dataLoading ? "Loading..." : "Generate My AI Plan"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="scan" className="space-y-8 mt-8">
                <div className="text-center space-y-6">
                  <div className="max-w-2xl mx-auto">
                    <p className="text-lg text-muted-foreground mb-8">
                      Upload photos for AI body analysis and automated measurements. 
                      Our advanced AI will analyze your body composition and create personalized plans.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { view: "Front View", icon: "👤", description: "Stand facing camera" },
                      { view: "Side View", icon: "🔄", description: "Turn to your side" },
                      { view: "Back View", icon: "👤", description: "Turn your back to camera" }
                    ].map((item, index) => (
                      <div key={item.view} className="group">
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group-hover:scale-105">
                          <div className="text-4xl mb-4">{item.icon}</div>
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
                          <p className="text-base font-semibold text-foreground mb-1">{item.view}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">Drop image or click to upload</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6">
                    <Button size="lg" className="w-full md:w-auto px-12 h-14 text-base hover:scale-105 transition-transform">
                      <Camera className="h-5 w-5 mr-2" />
                      Analyze Photos & Generate Plan
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;