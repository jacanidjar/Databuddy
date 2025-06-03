"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { WebsiteDataTabProps } from "../utils/types";
import { 
  Check, 
  Clipboard, 
  Code, 
  ExternalLink, 
  Globe, 
  Info, 
  Laptop, 
  Zap, 
  ChevronRight, 
  AlertCircle, 
  FileCode, 
  BookOpen, 
  Activity,
  Rocket,
  Target,
  BarChart,
  Users,
  MousePointer
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TrackingOptions {
  trackErrors: boolean;
  trackPerformance: boolean;
  trackWebVitals: boolean;
  trackOutgoingLinks: boolean;
  trackScreenViews: boolean;
  trackSessions: boolean;
  trackInteractions: boolean;
  samplingRate: number;
  enableRetries: boolean;
  maxRetries: number;
  initialRetryDelay: number;
}

// Define the library defaults
const LIBRARY_DEFAULTS: TrackingOptions = {
  trackErrors: false,
  trackPerformance: true,
  trackWebVitals: false,
  trackOutgoingLinks: false,
  trackScreenViews: true,
  trackSessions: true,
  trackInteractions: false,
  samplingRate: 1.0,
  enableRetries: true,
  maxRetries: 3,
  initialRetryDelay: 500
};

export function WebsiteTrackingSetupTab({
  websiteId,
  websiteData,
}: WebsiteDataTabProps) {
  const [copied, setCopied] = useState(false);
  const [installMethod, setInstallMethod] = useState<"script" | "npm">("script");
  const [trackingOptions, setTrackingOptions] = useState<TrackingOptions>({...LIBRARY_DEFAULTS});
  
  // Generate tracking code based on selected options
  const generateScriptTag = useCallback(() => {
    const isLocalhost = process.env.NODE_ENV === 'development';
    const scriptUrl = isLocalhost ? "http://localhost:3000/databuddy.js" : "https://app.databuddy.cc/databuddy.js";
    const apiUrl = isLocalhost ? "http://localhost:4000" : "https://basket.databuddy.cc";
    
    // Only include options that differ from defaults
    const options = Object.entries(trackingOptions)
      .filter(([key, value]) => value !== LIBRARY_DEFAULTS[key as keyof TrackingOptions])
      .map(([key, value]) => `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}="${value}"`)
      .join(" ");
    
    return `<script
  src="${scriptUrl}"
  data-client-id="${websiteId}"
  data-api-url="${apiUrl}"
  ${options}
  defer
></script>`;
  }, [trackingOptions, websiteId]);
  
  // Generate NPM init code
  const generateNpmCode = useCallback(() => {
    const propsString = Object.entries(trackingOptions)
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? `  ${key}` : `  ${key}={false}`;
        }
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        }
        return `  ${key}={${value}}`;
      })
      .join("\n");

    return `import { Databuddy } from '@databuddy/sdk';

function AppLayout({ children }) {
  return (
    <>
      {children}
      <Databuddy
        clientId="${websiteId}"
${propsString}
      />
    </>
  );
}`;
  }, [trackingOptions, websiteId]);
  
  const [trackingCode, setTrackingCode] = useState(generateScriptTag());
  const [npmCode, setNpmCode] = useState(generateNpmCode());
  
  // Update code when options change
  useEffect(() => {
    setTrackingCode(generateScriptTag());
    setNpmCode(generateNpmCode());
  }, [generateScriptTag, generateNpmCode]);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Tracking code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (option: keyof TrackingOptions) => {
    setTrackingOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

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
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add this script to the <code>&lt;head&gt;</code> section of your HTML:
                </p>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{trackingCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyCode(trackingCode)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Data will appear within a few minutes after installation.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="npm" className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Install the package:</p>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>npm install @databuddy/sdk</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyCode("npm install @databuddy/sdk")}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Add to your app:</p>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{npmCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyCode(npmCode)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
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
                    onCheckedChange={() => toggleOption('trackScreenViews')}
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
                    onCheckedChange={() => toggleOption('trackSessions')}
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
                    onCheckedChange={() => toggleOption('trackInteractions')}
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
                    onCheckedChange={() => toggleOption('trackPerformance')}
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
                    onCheckedChange={() => toggleOption('trackWebVitals')}
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
                    onCheckedChange={() => toggleOption('trackErrors')}
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