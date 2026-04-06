'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, SunMoon } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export default function TeacherSettingsPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslation();

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.settingsTitle}</CardTitle>
          <CardDescription>{t.settingsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t.appTheme}</Label>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3"
              >
                <div>
                  <RadioGroupItem value="light" id="light-teacher" className="peer sr-only" />
                  <Label
                    htmlFor="light-teacher"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Sun className="mb-2 h-6 w-6" />
                    {t.light}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="dark-teacher" className="peer sr-only" />
                  <Label
                    htmlFor="dark-teacher"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Moon className="mb-2 h-6 w-6" />
                    {t.dark}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="system-teacher" className="peer sr-only" />
                  <Label
                    htmlFor="system-teacher"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <SunMoon className="mb-2 h-6 w-6" />
                    {t.system}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
