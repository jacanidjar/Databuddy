import {
  Globe,
  BarChart,
  Settings,
  CreditCard,
  Clock,
  Users,
  Link as LinkIcon,
  Map as MapIcon,
  MessageCircle,
  Home,
  Bot,
  TestTube,
  Bug,
  GitBranch
} from "lucide-react";
import type { NavigationSection } from "./types";

export const mainNavigation: NavigationSection[] = [
  {
    title: "Main",
    items: [
      { name: "Websites", icon: Globe, href: "/websites", rootLevel: true, highlight: true },
      { name: "Domains", icon: LinkIcon, href: "/domains", rootLevel: true, highlight: true },
      { name: "Settings", icon: Settings, href: "/settings", rootLevel: true, highlight: true },
      { name: "Billing", icon: CreditCard, href: "/billing", rootLevel: true, highlight: true },
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "Roadmap", icon: MapIcon, href: "https://trello.com/b/SOUXD4wE/databuddy", rootLevel: true, external: true, highlight: true },
      { name: "Feedback", icon: MessageCircle, href: "https://databuddy.featurebase.app/", rootLevel: true, external: true, highlight: true },
    ],
  }
];

export const websiteNavigation: NavigationSection[] = [
  {
    title: "Analytics",
    items: [
      { name: "Overview", icon: Home, href: "", highlight: true },
      { name: "Sessions", icon: Clock, href: "/sessions", highlight: true },
      { name: "Profiles", icon: Users, href: "/profiles", highlight: true },
      { name: "Journeys", icon: GitBranch, href: "/journeys", highlight: true },
      { name: "Errors", icon: Bug, href: "/errors", highlight: true },
      { name: "Map", icon: MapIcon, href: "/map", highlight: true },
      { name: "Test", icon: TestTube, href: "/test", highlight: true, production: false },
    ],
  },
  {
    title: "Early Access",
    items: [
      { name: "Assistant", icon: Bot, href: "/assistant", highlight: true, alpha: true },
    ],
  }
]; 