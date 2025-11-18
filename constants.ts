import { Lead, LeadStage } from './types';
import { LayoutDashboard, Trello, Users, Settings, Briefcase, DollarSign, TrendingUp, Activity, Check, Star, Mail, MessageSquare, Video, Calendar } from 'lucide-react';

export const APP_NAME = "Sentient CRM";

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    company: 'Skynet Cyberdyne',
    email: 's.connor@techfuture.com',
    phone: '+1 (555) 010-2233',
    value: 45000,
    stage: LeadStage.NEGOTIATION,
    lastContact: '2023-10-24T10:00:00Z',
    source: 'LinkedIn',
    notes: 'Interested in the enterprise security package. Concerned about AI integration timelines.',
    aiScore: 85,
  },
  {
    id: '2',
    name: 'John Anderson',
    company: 'MetaCortex',
    email: 'neo@metacortex.com',
    phone: '+1 (555) 019-4455',
    value: 12000,
    stage: LeadStage.NEW,
    lastContact: '2023-10-26T09:30:00Z',
    source: 'Web Form',
    notes: 'Looking for software development services.',
  },
  {
    id: '3',
    name: 'Eldon Tyrell',
    company: 'Tyrell Corp',
    email: 'ceo@tyrell.com',
    phone: '+1 (555) 012-3456',
    value: 150000,
    stage: LeadStage.PROPOSAL,
    lastContact: '2023-10-20T14:15:00Z',
    source: 'Referral',
    notes: 'Needs high-end bio-engineering consultation.',
    aiScore: 92,
  },
  {
    id: '4',
    name: 'Roy Batty',
    company: 'Off-World Colonies',
    email: 'roy@nexus6.com',
    phone: '+1 (555) 999-8888',
    value: 8500,
    stage: LeadStage.CLOSED_LOST,
    lastContact: '2023-09-15T11:00:00Z',
    source: 'Cold Call',
    notes: 'Budget constraints. Not a good fit right now.',
  },
  {
    id: '5',
    name: 'Rick Deckard',
    company: 'LAPD Contractors',
    email: 'deckard@bladerunner.org',
    phone: '+1 (555) 222-1111',
    value: 25000,
    stage: LeadStage.CLOSED_WON,
    lastContact: '2023-10-01T16:45:00Z',
    source: 'Networking Event',
    notes: 'Signed for the investigative tools suite.',
  },
  {
    id: '6',
    name: 'Ellen Ripley',
    company: 'Weyland-Yutani',
    email: 'ripley@nostromo.com',
    phone: '+1 (555) 444-5555',
    value: 75000,
    stage: LeadStage.MEETING,
    lastContact: '2023-10-25T13:20:00Z',
    source: 'Inbound',
    notes: 'Urgent need for hazard management systems.',
  }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: Trello },
  { id: 'leads', label: 'Leads Database', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Light Mode Friendly Colors
export const STAGE_COLORS: Record<LeadStage, string> = {
  [LeadStage.NEW]: 'bg-blue-50 text-blue-700 border-blue-200',
  [LeadStage.CONTACTED]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [LeadStage.MEETING]: 'bg-purple-50 text-purple-700 border-purple-200',
  [LeadStage.PROPOSAL]: 'bg-amber-50 text-amber-700 border-amber-200', 
  [LeadStage.NEGOTIATION]: 'bg-orange-50 text-orange-700 border-orange-200',
  [LeadStage.CLOSED_WON]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [LeadStage.CLOSED_LOST]: 'bg-red-50 text-red-700 border-red-200',
};

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Elena Fisher",
    role: "VP of Sales, TechGlobe",
    content: "Sentient CRM's AI scoring predicted our Q4 whale client before we even had a meeting. It's not just a tool; it's a crystal ball.",
    stars: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: 2,
    name: "Marcus Holloway",
    role: "Account Executive, DedSec Systems",
    content: "The automated email drafting saves me about 2 hours every single morning. The personalization is scary good.",
    stars: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: 3,
    name: "Tifa Lockhart",
    role: "Founder, 7th Heaven Analytics",
    content: "Finally, a CRM that works as hard as I do. The mobile experience is flawless for closing deals on the go.",
    stars: 4,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
  }
];

export const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for solo consultants and freelancers.",
    features: ["Up to 100 Leads", "Basic Pipeline Board", "Mobile App Access", "Email Support"],
    recommended: false,
    cta: "Start for Free"
  },
  {
    name: "Growth",
    price: "$49",
    period: "/mo",
    description: "Power up your small team with AI intelligence.",
    features: ["Unlimited Leads", "AI Lead Scoring (500/mo)", "AI Email Drafting", "Advanced Analytics"],
    recommended: true,
    cta: "Start 14-Day Trial"
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    description: "Maximum performance for scaling organizations.",
    features: ["Unlimited AI Credits", "Custom Integrations", "Dedicated Account Manager", "API Access"],
    recommended: false,
    cta: "Contact Sales"
  }
];

export const TRUSTED_COMPANIES = [
  "Nexus Corp", "Cyberdyne Systems", "Massive Dynamic", "Hooli", "Initech", "Soylent Corp"
];

export const INTEGRATIONS = [
  { name: "Gmail", icon: Mail, desc: "Auto-sync emails & contacts" },
  { name: "Slack", icon: MessageSquare, desc: "Real-time deal alerts" },
  { name: "Zoom", icon: Video, desc: "Meeting transcription" },
  { name: "Calendar", icon: Calendar, desc: "Smart scheduling" }
];