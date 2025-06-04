"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { WebsiteDataTabProps, TrackingOptions } from "../utils/types";
import { 
  Check, 
  Clipboard, 
  Code, 
  ExternalLink, 
  Info, 
  AlertCircle, 
  FileCode, 
  BookOpen, 
  Activity,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';



// Import utilities and types
import { RECOMMENDED_DEFAULTS } from "../utils/tracking-defaults";
import { 
  generateScriptTag, 
  generateNpmCode, 
  generateNpmComponentCode 
} from "../utils/code-generators";
import { 
  toggleTrackingOption
} from "../utils/tracking-helpers";

export function WebsiteTrackingSetupTab({
  websiteId,
  websiteData,
}: WebsiteDataTabProps) {
  const [copied, setCopied] = useState(false);
  const [installMethod, setInstallMethod] = useState<"script" | "npm">("script");
  const [trackingOptions, setTrackingOptions] = useState<TrackingOptions>(RECOMMENDED_DEFAULTS);
  
  const trackingCode = generateScriptTag(websiteId, trackingOptions);
  const npmCode = generateNpmCode(websiteId, trackingOptions);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Tracking code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleOption = (option: keyof TrackingOptions) => {
    setTrackingOptions(prev => toggleTrackingOption(prev, option));
  };

  // Determine language based on code content
  const getLanguage = (code: string) => {
    if (code.includes('npm install') || code.includes('yarn add') || code.includes('pnpm add') || code.includes('bun add')) return 'bash';
    if (code.includes('<script')) return 'html';
    if (code.includes('import') && code.includes('from')) return 'jsx';
    return 'javascript';
  };

  const CodeBlock = ({ code, description, onCopy }: { code: string; description?: string; onCopy: () => void }) => (
    <div className="space-y-2">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="relative">
        <div className="rounded-md overflow-hidden border">
          <SyntaxHighlighter
            language={getLanguage(code)}
            style={oneDark}
            customStyle={{
              margin: 0,
              fontSize: '12px',
              lineHeight: '1.5',
              padding: '12px',
            }}
            showLineNumbers={false}
          >
            {code}
          </SyntaxHighlighter>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={onCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Clipboard className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Quick Setup Alert */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Tracking Not Setup
          </CardTitle>
          <CardDescription>
            Install the tracking script to start collecting analytics data for your website.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="w-5 h-5" />
            Installation
          </CardTitle>
          <CardDescription>
            Choose your preferred installation method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={installMethod} onValueChange={(value) => setInstallMethod(value as "script" | "npm")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="script" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                HTML Script Tag
              </TabsTrigger>
              <TabsTrigger value="npm" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                NPM Package
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="script" className="space-y-4">
              <CodeBlock 
                code={trackingCode}
                description="Add this script to the <head> section of your HTML:"
                onCopy={() => handleCopyCode(trackingCode)}
              />
              <p className="text-xs text-muted-foreground">
                Data will appear within a few minutes after installation.
              </p>
            </TabsContent>
            
            <TabsContent value="npm" className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Install the DataBuddy package using your preferred package manager:
                </p>
                
                <Tabs defaultValue="npm" className="w-full">
                  <TabsList className="mb-2 grid grid-cols-4 h-8">
                    <TabsTrigger value="npm" className="text-xs">npm</TabsTrigger>
                    <TabsTrigger value="yarn" className="text-xs">yarn</TabsTrigger>
                    <TabsTrigger value="pnpm" className="text-xs">pnpm</TabsTrigger>
                    <TabsTrigger value="bun" className="text-xs">bun</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="npm" className="mt-0">
                    <CodeBlock 
                      code="npm install @databuddy/sdk"
                      description=""
                      onCopy={() => handleCopyCode("npm install @databuddy/sdk")}
                    />
                  </TabsContent>
                  
                  <TabsContent value="yarn" className="mt-0">
                    <CodeBlock 
                      code="yarn add @databuddy/sdk"
                      description=""
                      onCopy={() => handleCopyCode("yarn add @databuddy/sdk")}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pnpm" className="mt-0">
                    <CodeBlock 
                      code="pnpm add @databuddy/sdk"
                      description=""
                      onCopy={() => handleCopyCode("pnpm add @databuddy/sdk")}
                    />
                  </TabsContent>
                  
                  <TabsContent value="bun" className="mt-0">
                    <CodeBlock 
                      code="bun add @databuddy/sdk"
                      description=""
                      onCopy={() => handleCopyCode("bun add @databuddy/sdk")}
                    />
                  </TabsContent>
                </Tabs>
                
                <CodeBlock 
                  code={npmCode}
                  description="Then initialize the tracker in your code:"
                  onCopy={() => handleCopyCode(generateNpmComponentCode(websiteId, trackingOptions))}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tracking Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Customize tracking options (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Core Tracking</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="trackScreenViews" className="text-sm">Page Views</Label>
                    <div className="text-xs text-muted-foreground">Track page visits</div>
                  </div>
                  <Switch
                    id="trackScreenViews"
                    checked={trackingOptions.trackScreenViews}
                    onCheckedChange={() => handleToggleOption('trackScreenViews')}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="trackSessions" className="text-sm">Sessions</Label>
                    <div className="text-xs text-muted-foreground">Track session duration</div>
                  </div>
                  <Switch
                    id="trackSessions"
                    checked={trackingOptions.trackSessions}
                    onCheckedChange={() => handleToggleOption('trackSessions')}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="trackInteractions" className="text-sm">Interactions</Label>
                    <div className="text-xs text-muted-foreground">Track clicks and forms</div>
                  </div>
                  <Switch
                    id="trackInteractions"
                    checked={trackingOptions.trackInteractions}
                    onCheckedChange={() => handleToggleOption('trackInteractions')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="trackPerformance" className="text-sm">Load Times</Label>
                    <div className="text-xs text-muted-foreground">Track page performance</div>
                  </div>
                  <Switch
                    id="trackPerformance"
                    checked={trackingOptions.trackPerformance}
                    onCheckedChange={() => handleToggleOption('trackPerformance')}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="trackWebVitals" className="text-sm">Web Vitals</Label>
                    <div className="text-xs text-muted-foreground">Track Core Web Vitals</div>
                  </div>
                  <Switch
                    id="trackWebVitals"
                    checked={trackingOptions.trackWebVitals}
                    onCheckedChange={() => handleToggleOption('trackWebVitals')}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="trackErrors" className="text-sm">Errors</Label>
                    <div className="text-xs text-muted-foreground">Track JS errors</div>
                  </div>
                  <Switch
                    id="trackErrors"
                    checked={trackingOptions.trackErrors}
                    onCheckedChange={() => handleToggleOption('trackErrors')}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Links */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" asChild>
          <a href="https://docs.databuddy.cc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Documentation
            <ExternalLink className="w-3 h-3 ml-auto" />
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="mailto:support@databuddy.cc" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Get Support
          </a>
        </Button>
      </div>
    </div>
  );
} 