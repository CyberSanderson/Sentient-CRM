// 1. NAVIGATION VIEWS
export type View = 
  | 'dashboard' 
  | 'pipeline' 
  | 'leads' 
  | 'pricing' 
  | 'settings'
  | 'privacy' 
  | 'terms' 
  | 'refunds'
  | 'admin'; // 👈 ADD THIS

// ... rest of your file stays exactly the same ...
export enum LeadStage {
  NEW = 'New',
  CONTACTED = 'Contacted',
  MEETING = 'Meeting Scheduled',
  PROPOSAL = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost'
}

export interface Dossier {
  personality: string;
  painPoints: string[];
  iceBreakers: string[];
  emailDraft: string;
}

export interface Lead {
  id: string;
  userId: string;
  name: string;
  company: string;
  role: string;
  stage: LeadStage | string; 
  value: number;
  dossier?: Dossier; 
  createdAt: any; 
  lastContact?: any;
  email?: string;
  website?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number; 
  dossierCount: number;
  lastResetDate: string; 
}