// 1. NAVIGATION VIEWS
// We added pricing and legal pages, so they must be listed here.
export type View = 
  | 'dashboard' 
  | 'pipeline' 
  | 'leads' 
  | 'pricing' 
  | 'settings'
  | 'privacy' 
  | 'terms' 
  | 'refunds';

// 2. LEAD STAGES
// Using a String Union is safer for Firebase than an Enum
export type LeadStage = 
  | 'New' 
  | 'Contacted' 
  | 'Meeting Scheduled' 
  | 'Proposal Sent' 
  | 'Negotiation' 
  | 'Closed Won' 
  | 'Closed Lost';

// 3. AI DOSSIER
// This matches exactly what Gemini returns
export interface Dossier {
  personality: string;
  painPoints: string[];   // 👈 Array of strings
  iceBreakers: string[];  // 👈 Array of strings
  emailDraft: string;
}

// 4. LEAD OBJECT
// The main data structure saved to Firebase
export interface Lead {
  id: string;      // Firebase ID
  userId: string;  // Clerk User ID
  
  // Basic Info
  name: string;
  company: string;
  role: string;
  
  // CRM Status
  stage: LeadStage | string; // Flexible string to allow custom stages later
  value: number;
  
  // The AI Magic
  dossier?: Dossier; 
  
  // Metadata
  createdAt: any; // Can be Date or Firebase Timestamp
  lastContact?: any;
  email?: string;
  website?: string;
}

// 5. USER PROFILE
// For tracking credits and subscriptions
export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number; 
  dossierCount: number;
  lastResetDate: string; 
  // 3. pushing code again
}