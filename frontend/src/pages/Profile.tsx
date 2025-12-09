import Navigation from "@/components/Navigation";
import WinterNightBackground from "@/components/WinterNightBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Flame, BookOpen } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <WinterNightBackground snowCount={40} sparkleCount={15} intensity="light" />
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
