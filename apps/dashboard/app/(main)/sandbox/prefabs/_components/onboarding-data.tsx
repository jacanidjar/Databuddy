import { ReactIcon, NextjsIcon, VueIcon, SvelteIcon, FramerIcon, WordPressIcon, ShopifyIcon, HtmlIcon } from "@/components/icons/frameworks";

export interface Framework {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    category: string;
    setupMethod: string;
    popular: boolean;
}

export interface InstallationStep {
    title: string;
    code: string;
    language: string;
}

export interface InstallationGuide {
    title: string;
    steps: InstallationStep[];
    tip: string;
}

export const frameworks: Framework[] = [
    {
        id: "nextjs",
        name: "Next.js",
        icon: NextjsIcon,
        description: "React framework with SSR",
        category: "React-based",
        setupMethod: "component",
        popular: true
    },
    {
        id: "react",
        name: "React",
        icon: ReactIcon,
        description: "JavaScript library for UIs",
        category: "React-based",
        setupMethod: "component",
        popular: true
    },
    {
        id: "vue",
        name: "Vue.js",
        icon: VueIcon,
        description: "Progressive JavaScript framework",
        category: "Vue-based",
        setupMethod: "component",
        popular: true
    },
    {
        id: "svelte",
        name: "SvelteKit",
        icon: SvelteIcon,
        description: "Modern web framework",
        category: "Svelte-based",
        setupMethod: "component",
        popular: false
    },
    {
        id: "framer",
        name: "Framer",
        icon: FramerIcon,
        description: "Design and prototyping platform",
        category: "Design Tool",
        setupMethod: "script",
        popular: true
    },
    {
        id: "wordpress",
        name: "WordPress",
        icon: WordPressIcon,
        description: "Content management system",
        category: "CMS",
        setupMethod: "script",
        popular: true
    },
    {
        id: "shopify",
        name: "Shopify",
        icon: ShopifyIcon,
        description: "E-commerce platform",
        category: "E-commerce",
        setupMethod: "script",
        popular: true
    },
    {
        id: "html",
        name: "HTML/JS",
        icon: HtmlIcon,
        description: "Static HTML or vanilla JS",
        category: "Static",
        setupMethod: "script",
        popular: false
    },
    {
        id: "other",
        name: "Other",
        icon: HtmlIcon,
        description: "Custom integration",
        category: "Custom",
        setupMethod: "script",
        popular: false
    },
];

export const getInstallationGuide = (frameworkId: string, websiteId: string): InstallationGuide => {
    switch (frameworkId) {
        case "nextjs":
            return {
                title: "Next.js App Router Setup",
                steps: [
                    {
                        title: "1. Install the package",
                        code: "npm install @databuddy/sdk",
                        language: "bash"
                    },
                    {
                        title: "2. Add to your root layout",
                        code: `// app/layout.tsx
import { Databuddy } from '@databuddy/sdk';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Databuddy 
          clientId="${websiteId}"
          trackScreenViews={true}
          trackHashChanges={true}
          trackAttributes={true}
        />
        {children}
      </body>
    </html>
  );
}`,
                        language: "tsx"
                    }
                ],
                tip: "For best results with the App Router, initialize Databuddy in your root layout.tsx file."
            };

        case "react":
            return {
                title: "React Application Setup",
                steps: [
                    {
                        title: "1. Install the package",
                        code: "npm install @databuddy/sdk",
                        language: "bash"
                    },
                    {
                        title: "2. Add to your main App component",
                        code: `// App.tsx
import { Databuddy } from '@databuddy/sdk';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from '@databuddy/sdk';

function App() {
  const location = useLocation();

  useEffect(() => {
    track('screen_view', {
      screen_name: location.pathname,
      screen_class: 'React'
    });
  }, [location]);

  return (
    <>
      <Databuddy 
        clientId="${websiteId}"
        trackScreenViews={true}
        trackAttributes={true}
      />
      <YourAppContent />
    </>
  );
}`,
                        language: "tsx"
                    }
                ],
                tip: "Use React Router's useLocation hook to track navigation changes automatically."
            };

        case "vue":
            return {
                title: "Vue.js Application Setup",
                steps: [
                    {
                        title: "1. Install the package",
                        code: "npm install @databuddy/sdk",
                        language: "bash"
                    },
                    {
                        title: "2. Add to your main Vue app",
                        code: `<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { track } from '@databuddy/sdk';

export default {
  name: 'App',
  mounted() {
    // Initialize tracking
    const script = document.createElement('script');
    script.src = 'https://cdn.databuddy.cc/databuddy.js';
    script.setAttribute('data-client-id', '${websiteId}');
    script.setAttribute('data-track-screen-views', 'true');
    document.head.appendChild(script);
  },
  watch: {
    $route(to, from) {
      track('screen_view', {
        screen_name: to.path,
        screen_class: 'Vue'
      });
    }
  }
}
</script>`,
                        language: "vue"
                    }
                ],
                tip: "Use Vue Router's watch functionality to track route changes automatically."
            };

        case "framer":
            return {
                title: "Framer Site Integration",
                steps: [
                    {
                        title: "1. Copy your tracking script",
                        code: `<script>
  (function() {
    var script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cdn.databuddy.cc/databuddy.js';
    script.setAttribute("data-client-id", "${websiteId}");
    script.setAttribute("data-track-screen-views", "true");
    script.setAttribute("data-track-attributes", "true");
    script.setAttribute("data-track-errors", "true");
    document.head.appendChild(script);
  })();
<\/script>`,
                        language: "html"
                    },
                    {
                        title: "2. Add to Site Settings",
                        code: `1. Open your Framer project
2. Go to Site Settings > General
3. Scroll down to Custom Code
4. Paste the script into "End of <body> tag"
5. Click Save and publish your changes`,
                        language: "text"
                    }
                ],
                tip: "Pasting the script at the end of the body tag in Framer's site settings ensures all content is loaded before tracking begins."
            };

        case "wordpress":
            return {
                title: "WordPress Integration",
                steps: [
                    {
                        title: "1. Add to your theme's header.php",
                        code: `<!-- Add this before the closing </head> tag -->
<script
  src="https://cdn.databuddy.cc/databuddy.js"
  data-client-id="${websiteId}"
  data-track-screen-views="true"
  data-track-outgoing-links="true"
  async
></script>`,
                        language: "html"
                    },
                    {
                        title: "2. Or use a plugin (recommended)",
                        code: `// functions.php
function add_databuddy_tracking() {
    ?>
    <script
      src="https://cdn.databuddy.cc/databuddy.js"
      data-client-id="<?php echo esc_attr('${websiteId}'); ?>"
      data-track-screen-views="true"
      async
    ></script>
    <?php
}
add_action('wp_head', 'add_databuddy_tracking');`,
                        language: "php"
                    }
                ],
                tip: "Use WordPress hooks to ensure the tracking script loads on all pages."
            };

        case "shopify":
            return {
                title: "Shopify Store Integration",
                steps: [
                    {
                        title: "1. Go to Online Store > Themes",
                        code: "Navigate to your Shopify admin panel",
                        language: "text"
                    },
                    {
                        title: "2. Edit your theme.liquid file",
                        code: `<!-- Add this before the closing </head> tag -->
<script
  src="https://cdn.databuddy.cc/databuddy.js"
  data-client-id="${websiteId}"
  data-track-screen-views="true"
  data-track-outgoing-links="true"
  data-track-interactions="true"
  async
></script>`,
                        language: "html"
                    }
                ],
                tip: "Enable e-commerce tracking to monitor product views and purchases."
            };

        case "html":
            return {
                title: "HTML/JavaScript Setup",
                steps: [
                    {
                        title: "1. Add script to your HTML head",
                        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
    
    <!-- Databuddy Analytics -->
    <script
      src="https://cdn.databuddy.cc/databuddy.js"
      data-client-id="${websiteId}"
      data-track-screen-views="true"
      data-track-interactions="true"
      async
    ></script>
</head>
<body>
    <!-- Your content -->
</body>
</html>`,
                        language: "html"
                    }
                ],
                tip: "The script will automatically track page views and user interactions."
            };

        default:
            return {
                title: "Generic Integration",
                steps: [
                    {
                        title: "1. Add script tag to your application",
                        code: `<script
  src="https://cdn.databuddy.cc/databuddy.js"
  data-client-id="${websiteId}"
  data-track-screen-views="true"
  async
></script>`,
                        language: "html"
                    }
                ],
                tip: "Check our documentation for platform-specific integration guides."
            };
    }
}; 