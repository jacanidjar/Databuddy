"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailForm } from "@/components/settings/email-form";
import { PasswordForm } from "@/components/settings/password-form";
import { TwoFactorForm } from "@/components/settings/two-factor-form";
import { SessionsForm } from "@/components/settings/sessions-form";
import { AccountDeletion } from "@/components/settings/account-deletion";
import { ProfileForm } from "@/components/settings/profile-form";
import { Separator } from "@/components/ui/separator";
import { ShieldOff, User, Shield, Mail, Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 pb-16 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <User className="h-5 w-5 text-slate-400 mr-2" />
                <CardTitle>Profile Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-slate-400 mr-2" />
                <CardTitle>Email Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <EmailForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-slate-400 mr-2" />
                <CardTitle>Password</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>

          <div className="mt-10">
            <div className="flex items-center mb-4">
              <ShieldOff className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-lg font-medium text-red-400">Danger Zone</h2>
            </div>
            <Separator className="mb-6 bg-red-900/20" />
            <AccountDeletion />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-slate-400 mr-2" />
                <CardTitle>Two-Factor Authentication</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <TwoFactorForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 