
export enum AgentCategory {
  ADS = 'Ads & Traffic',
  CONTENT = 'Content & Copy',
  STRATEGY = 'Strategy & Funnels',
  COMMUNICATION = 'Email & CRM',
  VIDEO = 'Video & Creative',
  ANALYTICS = 'Data & Optimization'
}

export enum InputType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
}

export interface AgentInput {
  name: string;
  label: string;
  type: InputType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  required?: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  iconName: string;
  inputs: AgentInput[];
  systemInstruction: string;
  promptTemplate: (data: Record<string, string>) => string;
}

// Database Types
export interface GeneratedResult {
  id: string;
  project_id: string;
  agent_id: string;
  user_id: string;
  content: string;
  inputs: any;
  created_at: string; // ISO String
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier?: string;
}

export type View = 'dashboard' | 'projects' | 'analytics' | 'billing' | 'settings';

// UI Types
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
