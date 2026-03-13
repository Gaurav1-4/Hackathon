export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}
