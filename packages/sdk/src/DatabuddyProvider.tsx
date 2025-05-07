'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import type { DatabuddyConfig, EventProperties, PageViewProperties } from './types';
import { Databuddy } from './index';

interface DatabuddyContextValue {
  track: (eventName: string, properties?: EventProperties) => void;
  screenView: (properties?: PageViewProperties) => void;
  increment: (name: string, properties?: EventProperties, value?: number) => void;
  decrement: (name: string, properties?: EventProperties, value?: number) => void;
  clear: () => void;
}

const DatabuddyContext = createContext<DatabuddyContextValue | null>(null);

interface DatabuddyProviderProps extends DatabuddyConfig {
  children: React.ReactNode;
}

/**
 * Provider component for Databuddy analytics
 * 
 * @example
 * ```tsx
 * // In your layout.tsx
 * import { DatabuddyProvider } from '@databuddy/sdk';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <DatabuddyProvider
 *           clientId={process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID}
 *           trackScreenViews
 *           trackPerformance
 *         >
 *           {children}
 *         </DatabuddyProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function DatabuddyProvider({ children, ...config }: DatabuddyProviderProps) {
  const databuddyRef = useRef<Databuddy | null>(null);
  const configRef = useRef(config);

  useEffect(() => {
    if (!databuddyRef.current) {
      databuddyRef.current = new Databuddy(configRef.current);
      databuddyRef.current.init();
    }
  }, []);

  const value: DatabuddyContextValue = {
    track: (eventName, properties) => databuddyRef.current?.track(eventName, properties),
    screenView: (properties) => databuddyRef.current?.screenView(properties),
    increment: (name, properties, value = 1) => databuddyRef.current?.increment(name, value, properties),
    decrement: (name, properties, value = 1) => databuddyRef.current?.decrement(name, value, properties),
    clear: () => databuddyRef.current?.clear(),
  };

  return (
    <DatabuddyContext.Provider value={value}>
      {children}
    </DatabuddyContext.Provider>
  );
}

/**
 * Hook to use Databuddy analytics in your components
 * 
 * @example
 * ```tsx
 * import { useDatabuddy } from '@databuddy/sdk';
 * 
 * function MyComponent() {
 *   const databuddy = useDatabuddy();
 *   
 *   const handleClick = () => {
 *     databuddy.track('button_clicked', { buttonId: 'submit' });
 *   };
 *   
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export function useDatabuddy() {
  const context = useContext(DatabuddyContext);
  if (!context) {
    throw new Error('useDatabuddy must be used within a DatabuddyProvider');
  }
  return context;
} 