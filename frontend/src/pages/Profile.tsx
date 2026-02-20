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
