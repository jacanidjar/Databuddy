import {
  GlobeIcon,
  GearIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  ChatCircleIcon,
  HouseIcon,
  RobotIcon,
  TestTubeIcon,
  BugIcon,
  GitBranchIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  LinkIcon,
  RedditLogoIcon,
  CodeIcon,
  PaletteIcon
} from "@phosphor-icons/react";
import type { NavigationSection } from "./types";

// Context types for navigation
export type NavigationContext = 'main' | 'website' | 'sandbox';

// Navigation configuration by context
export const navigationConfig: Record<NavigationContext, NavigationSection[]> = {
  main: [
    {
      title: "Main",
      items: [
        { name: "Websites", icon: GlobeIcon, href: "/websites", rootLevel: true, highlight: true },
        { name: "Domains", icon: LinkIcon, href: "/domains", rootLevel: true, highlight: true },
        { name: "Settings", icon: GearIcon, href: "/settings", rootLevel: true, highlight: true },
        { name: "Sandbox", icon: TestTubeIcon, href: "/sandbox", rootLevel: true, highlight: true, production: false },
      ],
    },
    {
      title: "Early Access",
      items: [
        { name: "Revenue", icon: CurrencyDollarIcon, href: "/revenue", rootLevel: true, highlight: true, alpha: true },
      ],
    },
    {
      title: "Resources",
      items: [
        { name: "Roadmap", icon: MapPinIcon, href: "https://trello.com/b/SOUXD4wE/databuddy", rootLevel: true, external: true, highlight: true },
        { name: "Feedback", icon: ChatCircleIcon, href: "https://databuddy.featurebase.app/", rootLevel: true, external: true, highlight: true },
      ],
    }
  ],

  website: [
    {
      title: "Analytics",
      items: [
        { name: "Overview", icon: HouseIcon, href: "", highlight: true },
        { name: "Sessions", icon: ClockIcon, href: "/sessions", highlight: true },
        { name: "Profiles", icon: UsersIcon, href: "/profiles", highlight: true },
        { name: "Funnels", icon: FunnelIcon, href: "/funnels", highlight: true },
        { name: "Journeys", icon: GitBranchIcon, href: "/journeys", highlight: true },
        { name: "Errors", icon: BugIcon, href: "/errors", highlight: true },
        { name: "Map", icon: MapPinIcon, href: "/map", highlight: true },
        { name: "Test", icon: TestTubeIcon, href: "/test", highlight: true, production: false },
      ],
    },
    {
      title: "Early Access",
      items: [
        { name: "Assistant", icon: RobotIcon, href: "/assistant", highlight: true, alpha: true },
      ],
    }
  ],

  sandbox: [
    {
      title: "Test Pages",
      items: [
        { name: "Overview", icon: HouseIcon, href: "", highlight: true },
        { name: "Reddit Mentions", icon: RedditLogoIcon, href: "/reddit-mentions", highlight: true },
        { name: "API Testing", icon: CodeIcon, href: "/api-testing", highlight: true },
        { name: "UI Components", icon: PaletteIcon, href: "/ui-components", highlight: true },
      ],
    },
  ]
};

export const mainNavigation = navigationConfig.main;
export const websiteNavigation = navigationConfig.website;
export const sandboxNavigation = navigationConfig.sandbox; 