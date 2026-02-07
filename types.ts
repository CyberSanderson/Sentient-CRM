import { ReactNode } from "react";

export enum LeadStage {
  NEW = 'New',
  CONTACTED = 'Contacted',
  MEETING = 'Meeting Scheduled',
  PROPOSAL = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost'
}

export interface Lead {
  dossier: any;
  role: ReactNode;
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: LeadStage;
  lastContact: string; // ISO Date
  source: string;
  notes: string;
  aiScore?: number; // 0-100
  aiInsight?: string;
}

export interface KPI {
  label: string;
  value: string | number;
  trend: number; // Percentage change
  trendDirection: 'up' | 'down' | 'neutral';
  icon: string;
}

export type View = 'dashboard' | 'pipeline' | 'leads' | 'settings';

export interface AIResponse {
  text: string;
  data?: any;
}