// 1. NAVIGATION VIEWS
export type View = 
  | 'dashboard' 
  | 'pipeline' 
  | 'leads' 
  | 'pricing' 
  | 'settings'
  | 'privacy' 
  | 'terms' 
  | 'refunds';

// 2. LEAD STAGES (Restored to Enum to fix Pipeline errors)
export enum LeadStage {
  NEW = 'New',
  CONTACTED = 'Contacted',
  MEETING = 'Meeting Scheduled',
  PROPOSAL = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost'
}

// 3. AI DOSSIER (Updated with new fields)
export interface Dossier {
  personality: string;
  painPoints: string[];   // ✅ Required for Dashboard
  iceBreakers: string[];  // ✅ Required for Dashboard
  emailDraft: string;
}

// 4. LEAD OBJECT
export interface Lead {
  id: string;
  userId: string;
  name: string;
  company: string;
  role: string;
  
  // Allow both Enum and String to be safe
  stage: LeadStage | string; 
  value: number;
  
  dossier?: Dossier; 
  
  createdAt: any; 
  lastContact?: any;
  email?: string;
  website?: string;
}

// 5. USER PROFILE
export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number; 
  dossierCount: number;
  lastResetDate: string; 
}