// Define the stages for the Kanban board
export enum LeadStage {
  NEW = 'New',
  CONTACTED = 'Contacted',
  MEETING = 'Meeting Scheduled',
  PROPOSAL = 'Proposal Sent',
  CLOSED = 'Closed Won'
}

// 🟢 NEW: This is the missing definition causing your error
export interface Dossier {
  personality: string;
  painPoints: string[];
  iceBreakers: string[];
  emailDraft: string;
}

// The main Lead object saved in Firebase
export interface Lead {
  id: string;
  userId: string;
  name: string;
  company: string;
  role: string;
  status: string;
  stage: LeadStage | string;
  value: number;
  
  // Dates can be Firebase Timestamps or JS Dates, so we keep it flexible
  createdAt: Date | any; 
  lastContact?: Date;
  
  aiScore?: number;
  
  // 🟢 Link the Dossier here
  dossier?: Dossier; 
  
  // Optional fields
  contactName?: string; 
  email?: string;
  website?: string;
}
// Existing code...

// 🟢 NEW: User Profile for Limits & Plans
export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number; // How many dossiers they have left
  dossiersGenerated: number; // Total lifetime usage
  lastResetDate: string; // To reset credits daily
  createdAt: any;
}
// Navigation views
export type View = 'dashboard' | 'pipeline' | 'leads' | 'settings';