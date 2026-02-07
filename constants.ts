import { Mail, Calendar, Trello, Slack } from 'lucide-react';

export const APP_NAME = 'Sentient';

// --- CRM Constants (Fixes your build error) ---
export const STAGE_COLORS: Record<string, string> = {
  'New': 'bg-blue-500 text-white',
  'Contacted': 'bg-indigo-500 text-white',
  'Meeting Scheduled': 'bg-purple-500 text-white',
  'Proposal Sent': 'bg-amber-500 text-white',
  'Negotiation': 'bg-orange-500 text-white',
  'Closed Won': 'bg-emerald-500 text-white',
  'Closed Lost': 'bg-slate-500 text-white'
};

// --- Landing Page Constants ---
export const TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "VP of Sales, TechStart",
    content: "Sentient cut my research time by 90%. I used to spend hours on LinkedIn; now I just click a button and get the perfect opening line.",
    stars: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    role: "Account Executive, CloudScale",
    content: "The psychological profiling is scary good. It told me a prospect was 'risk-averse,' so I changed my pitch to focus on security. Closed the deal in a week.",
    stars: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: 3,
    name: "Marcus Chen",
    role: "Founder, GrowthBox",
    content: "Finally, a CRM that actually helps me sell instead of just forcing me to do data entry. The AI integration is seamless.",
    stars: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
  }
];

export const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    description: "Perfect for trying out the AI capabilities.",
    features: [
      "5 AI Dossiers per month",
      "Basic Lead Management",
      "Email Support",
      "1 User Account"
    ],
    cta: "Start for Free",
    recommended: false
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "For sales professionals who mean business.",
    features: [
      "Unlimited AI Dossiers",
      "Advanced Psychology Insights",
      "Email & LinkedIn Drafts",
      "Priority Support",
      "Up to 5 User Accounts"
    ],
    cta: "Start 14-Day Trial",
    recommended: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Custom solutions for large sales teams.",
    features: [
      "Custom AI Model Training",
      "API Access",
      "Dedicated Success Manager",
      "SSO & Advanced Security",
      "Unlimited Users"
    ],
    cta: "Contact Sales",
    recommended: false
  }
];

export const TRUSTED_COMPANIES = [
  "Acme Corp", "GlobalTech", "Nebula", "Trio", "FoxRun"
];

export const INTEGRATIONS = [
  {
    name: "Gmail",
    desc: "Sync emails automatically.",
    icon: Mail
  },
  {
    name: "Slack",
    desc: "Get alerts on new leads.",
    icon: Slack
  },
  {
    name: "Google Calendar",
    desc: "Schedule meetings instantly.",
    icon: Calendar
  },
  {
    name: "Trello",
    desc: "Sync your pipeline board.",
    icon: Trello
  }
];