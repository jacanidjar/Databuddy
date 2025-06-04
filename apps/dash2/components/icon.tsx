"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// Define available browser icons based on the public directory
const BROWSER_ICONS = [
  "Chrome", "Firefox", "Safari", "Edge", "Opera", "OperaGX", "SamsungInternet",
  "UCBrowser", "Yandex", "Baidu", "QQ", "WeChat", "Instagram", "Facebook",
  "IE", "Chromium", "DuckDuckGo", "Avast", "AVG", "Android", "Huawei",
  "Miui", "Vivo", "Sogou", "CocCoc", "Whale", "WebKit", "Wolvic",
  "Sleipnir", "Silk", "Quark", "PaleMoon", "Oculus", "Naver", "Line",
  "Lenovo", "KAKAOTALK", "Iron", "HeyTap", "360"
] as const;

// Define available OS icons based on the public directory  
const OS_ICONS = [
  "Windows", "macOS", "Android", "Ubuntu", "Tux", "Apple", "Chrome",
  "HarmonyOS", "OpenHarmony", "Playstation", "Tizen"
] as const;

export type BrowserIconName = typeof BROWSER_ICONS[number];
export type OSIconName = typeof OS_ICONS[number];
export type IconType = "browser" | "os";

interface PublicIconProps {
  type: IconType;
  name: string;
  size?: "sm" | "md" | "lg" | number;
  className?: string;
  fallback?: React.ReactNode;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function PublicIcon({ 
  type, 
  name, 
  size = "md", 
  className, 
  fallback 
}: PublicIconProps) {
  const iconSize = typeof size === "number" ? size : sizeMap[size];
  
  // Normalize the name to match file names
  const normalizedName = name.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
  
  // Determine the folder and check if icon exists
  const folder = type === "browser" ? "browsers" : "operating-systems";
  const availableIcons = type === "browser" ? BROWSER_ICONS : OS_ICONS;
  
  // Check if we have this icon (case-insensitive)
  const exactMatch = availableIcons.find(icon => 
    icon.toLowerCase() === normalizedName.toLowerCase()
  );
  
  // If no exact match, try partial matching
  const partialMatch = availableIcons.find(icon => 
    icon.toLowerCase().includes(normalizedName.toLowerCase()) ||
    normalizedName.toLowerCase().includes(icon.toLowerCase())
  );
  
  const iconName = exactMatch || partialMatch;
  
  if (!iconName) {
    // Return fallback if provided, otherwise a default icon
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div 
        className={cn(
          "rounded bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium",
          className
        )}
        style={{ width: iconSize, height: iconSize }}
      >
        {normalizedName.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Try different file extensions
  const extensions = ['svg', 'png', 'webp'];
  
  return (
    <div className={cn("relative flex-shrink-0", className)} style={{ width: iconSize, height: iconSize }}>
      {extensions.map((ext, index) => (
        <Image
          key={`${iconName}-${ext}`}
          src={`/${folder}/${iconName}.${ext}`}
          alt={name}
          width={iconSize}
          height={iconSize}
          className={cn(
            "object-contain",
            index > 0 ? "absolute inset-0" : ""
          )}
          style={{
            display: index === 0 ? 'block' : 'none'
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const nextImg = img.nextElementSibling as HTMLImageElement;
            if (nextImg) {
              nextImg.style.display = 'block';
            }
          }}
          onLoad={(e) => {
            // Hide subsequent images when one loads successfully
            const img = e.target as HTMLImageElement;
            const siblings = img.parentElement?.querySelectorAll('img');
            siblings?.forEach((sibling, i) => {
              if (i > index) {
                (sibling as HTMLImageElement).style.display = 'none';
              }
            });
          }}
        />
      ))}
    </div>
  );
}

// Convenience components for specific types
export function BrowserIcon({ 
  name, 
  size = "md", 
  className, 
  fallback 
}: Omit<PublicIconProps, "type">) {
  return (
    <PublicIcon 
      type="browser" 
      name={name} 
      size={size} 
      className={className} 
      fallback={fallback} 
    />
  );
}

export function OSIcon({ 
  name, 
  size = "md", 
  className, 
  fallback 
}: Omit<PublicIconProps, "type">) {
  return (
    <PublicIcon 
      type="os" 
      name={name} 
      size={size} 
      className={className} 
      fallback={fallback} 
    />
  );
} 