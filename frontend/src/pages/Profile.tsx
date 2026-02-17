import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/genshin/GlassCard";
import { Trophy, Calendar, Flame, BookOpen, Settings, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
    navigate("/auth");
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12">
        <PageHeader
          title="Profile & Settings"
          subtitle="Manage your account and learning preferences"
          icon={<Settings />}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-slate-800/50 border-slate-700">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Personal Information</h3>
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 bg-gradient-to-br from-cyan-500 to-blue-500">
                      <AvatarFallback className="text-2xl font-bold">AC</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        Change photo
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Full name</Label>
                      <Input
                        id="name"
                        defaultValue="Alex Chen"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="alex@example.com"
                        className="bg-slate-800/50 border-slate-700 text-white"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      defaultValue="Learning Japanese for travel and work"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Learning Tab */}
            <TabsContent value="learning" className="space-y-6">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Learning Preferences</h3>
                <div className="space-y-6">
                  {[
                    {
                      label: "Daily goal",
                      description: "Minutes of study per day",
                      value: "15",
                      options: ["5", "10", "15", "30", "60"],
                    },
                    {
                      label: "Reminder time",
                      description: "Daily practice reminder",
                      value: "19:00",
                      options: ["08:00", "12:00", "17:00", "19:00", "21:00"],
                    },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-6 border-b border-slate-700 last:border-0">
                      <div className="space-y-0.5">
                        <Label className="text-white">{setting.label}</Label>
                        <p className="text-sm text-gray-400">{setting.description}</p>
                      </div>
                      <Select defaultValue={setting.value}>
                        <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  {[
                    { label: "Show romaji", description: "Display pronunciation" },
                    { label: "Show furigana", description: "Display reading hints above kanji" },
                    { label: "Auto-play audio", description: "Automatically play pronunciation" },
                    { label: "Dark mode", description: "Use dark theme" },
                  ].map((toggle, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-6 border-b border-slate-700 last:border-0">
                      <div className="space-y-0.5">
                        <Label className="text-white">{toggle.label}</Label>
                        <p className="text-sm text-gray-400">{toggle.description}</p>
                      </div>
                      <Switch defaultChecked={idx < 3} />
                    </div>
                  ))}

                  <Button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Save Preferences
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Account Security</h3>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Change Password</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="current-pw" className="text-white">Current password</Label>
                        <Input
                          id="current-pw"
                          type="password"
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pw" className="text-white">New password</Label>
                        <Input
                          id="new-pw"
                          type="password"
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-pw" className="text-white">Confirm password</Label>
                        <Input
                          id="confirm-pw"
                          type="password"
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>
                      <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Danger Zone</h4>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Your Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Flame, title: "7-Day Streak", description: "Study for 7 consecutive days", unlocked: true },
                    { icon: Trophy, title: "Quiz Master", description: "Complete 50 quizzes", unlocked: true },
                    { icon: BookOpen, title: "Vocabulary Wizard", description: "Learn 500 words", unlocked: false },
                    { icon: Calendar, title: "Consistent Performer", description: "Complete daily goal for 30 days", unlocked: false },
                  ].map((achievement, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        achievement.unlocked
                          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                          : "bg-slate-800/30 border border-slate-700 opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <achievement.icon className="w-8 h-8 text-white mt-1" />
                        <div>
                          <h4 className="font-semibold text-white">{achievement.title}</h4>
                          <p className="text-sm text-gray-400">{achievement.description}</p>
                          {achievement.unlocked && (
                            <Badge className="mt-2 bg-yellow-500 text-black">Unlocked</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and learning preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">AC</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Change photo</Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" defaultValue="Alex Chen" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="alex@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    placeholder="Tell us a bit about yourself..."
                    defaultValue="Learning Japanese for travel and work"
                  />
                </div>

                <Button>Save changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily goal</Label>
                      <p className="text-sm text-muted-foreground">Minutes of study per day</p>
                    </div>
                    <Select defaultValue="15">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reminder time</Label>
                      <p className="text-sm text-muted-foreground">Daily practice reminder</p>
                    </div>
                    <Select defaultValue="19:00">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show romaji</Label>
                      <p className="text-sm text-muted-foreground">Display romanization by default</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show furigana</Label>
                      <p className="text-sm text-muted-foreground">Display reading hints above kanji</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-play audio</Label>
                      <p className="text-sm text-muted-foreground">Automatically play pronunciation</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Interface language</Label>
                      <p className="text-sm text-muted-foreground">App interface language</p>
                    </div>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button>Save preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your subscription and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Current plan</p>
                      <p className="text-sm text-muted-foreground">Free trial • 5 days remaining</p>
                    </div>
                    <Button>Upgrade</Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Change password</Label>
                    <Button variant="outline" className="w-full">Update password</Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Two-factor authentication</Label>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm">Not enabled</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold text-sm text-destructive mb-2">Danger zone</h3>
                    <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Delete account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg">Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Flame, title: "7-day streak", desc: "Keep it going!", unlocked: true },
                    { icon: BookOpen, title: "100 words learned", desc: "Vocabulary master", unlocked: true },
                    { icon: Calendar, title: "30-day streak", desc: "Dedication pays off", unlocked: false },
                    { icon: Trophy, title: "Completed N5", desc: "First level done", unlocked: false },
                  ].map((achievement, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        achievement.unlocked ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30 opacity-60'
                      }`}
                    >
                      <achievement.icon className={`h-8 w-8 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                      </div>
                      {achievement.unlocked && <Badge variant="secondary">✓</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total study time</span>
                      <span className="font-semibold">12.5 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lessons completed</span>
                      <span className="font-semibold">28 / 45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current streak</span>
                      <span className="font-semibold">12 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Longest streak</span>
                      <span className="font-semibold">18 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Review accuracy</span>
                      <span className="font-semibold">82%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vocabulary mastered</span>
                      <span className="font-semibold">1,240</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
