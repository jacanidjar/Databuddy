export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasVisualization?: boolean;
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'stacked_bar' | 'multi_line';
  data?: any[];
  thinkingSteps?: string[];
  debugInfo?: Record<string, any>;
} 