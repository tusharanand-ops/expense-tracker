"use client";

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Settings} from 'lucide-react';
import {useSettings} from '@/context/settings-provider';

export function SettingsDialog() {
  const {theme, setTheme, language, setLanguage, currency, setCurrency, t} =
    useSettings();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t('settings')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings')}</DialogTitle>
          <DialogDescription>{t('customizeYourExperience')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">{t('darkMode')}</Label>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="language">{t('language')}</Label>
            <Select
              value={language}
              onValueChange={value => setLanguage(value as 'en' | 'hi')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="currency">{t('currency')}</Label>
            <Select
              value={currency}
              onValueChange={value => setCurrency(value as 'USD' | 'INR')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
