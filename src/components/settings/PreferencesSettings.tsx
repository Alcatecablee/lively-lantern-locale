import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Theme = 'light' | 'dark' | 'system';

export const PreferencesSettings: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('system');
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    analysisComplete: true,
    weeklyReport: false
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    // Get current theme from localStorage or default to system
    const savedTheme = typeof window !== "undefined" && typeof window !== "undefined" && typeof window !== "undefined" && localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && document.documentElement;

    if (newTheme === 'system') {
      const systemTheme = typeof window !== "undefined" && typeof window !== "undefined" && typeof window !== "undefined" && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }

    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Theme Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => handleThemeChange('light')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Sun className="h-5 w-5" />
              <span className="text-sm">Light</span>
            </Button>

            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => handleThemeChange('dark')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Moon className="h-5 w-5" />
              <span className="text-sm">Dark</span>
            </Button>

            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => handleThemeChange('system')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Monitor className="h-5 w-5" />
              <span className="text-sm">System</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account
              </p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleNotificationChange('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={() => handleNotificationChange('pushNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Analysis Complete</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when code analysis is finished
              </p>
            </div>
            <Switch
              checked={notifications.analysisComplete}
              onCheckedChange={() => handleNotificationChange('analysisComplete')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Weekly Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly analysis summary reports
              </p>
            </div>
            <Switch
              checked={notifications.weeklyReport}
              onCheckedChange={() => handleNotificationChange('weeklyReport')}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Analysis Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Auto-fix Safe Issues</Label>
              <p className="text-sm text-muted-foreground">
                Automatically fix issues that are considered safe
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Include Performance Analysis</Label>
              <p className="text-sm text-muted-foreground">
                Run performance analysis on uploaded files
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Detailed Security Scan</Label>
              <p className="text-sm text-muted-foreground">
                Perform comprehensive security vulnerability checks
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};