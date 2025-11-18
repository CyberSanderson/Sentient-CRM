import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { DollarSign, Users, Activity, Zap, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import AIModal from '../components/AIModal';
import { Lead, LeadStage } from '../types';
import { generateDailyBriefing } from '../services/geminiService';

interface DashboardViewProps {
  leads: Lead[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState('');

  // Calculated Metrics
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const activeLeads = leads.filter(l => l.stage !== LeadStage.CLOSED_LOST && l.stage !== LeadStage.CLOSED_WON).length;
  const wonLeads = leads.filter(l => l.stage === LeadStage.CLOSED_WON).length;
  const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : 0;

  // Chart Data Preparation
  const leadsByStage = Object.values(LeadStage).map(stage => ({
    name: stage.split(' ')[0], // Shorten name
    count: leads.filter(l => l.stage === stage).length
  }));

  // Mock Trend Data for Area Chart
  const trendData = [
    { month: 'Jan', value: 12000 },
    { month: 'Feb', value: 19000 },
    { month: 'Mar', value: 15000 },
    { month: 'Apr', value: 22000 },
    { month: 'May', value: 28000 },
    { month: 'Jun', value: 35000 },
  ];

  const handleGenerateBriefing = async () => {
    setModalOpen(true);
    setIsGenerating(true);
    setAiContent('');
    
    const result = await generateDailyBriefing(leads);
    setAiContent(result);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time insights into your sales performance.</p>
        </div>
        <button 
          onClick={handleGenerateBriefing}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles size={18} className="group-hover:animate-spin-slow" />
          <span>AI Daily Briefing</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Pipeline Value" 
          value={`$${totalValue.toLocaleString()}`} 
          icon={DollarSign} 
          trend={12.5} 
          trendDirection="up"
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard 
          label="Active Leads" 
          value={activeLeads} 
          icon={Users} 
          trend={5.2} 
          trendDirection="up"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard 
          label="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon={Activity} 
          trend={2.1} 
          trendDirection="down"
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard 
          label="Avg Deal Size" 
          value={`$${(totalValue / (leads.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
          icon={Zap} 
          trend={0} 
          trendDirection="neutral"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Leads by Stage Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-brand-500 rounded-full"></div>
            Lead Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }}
                  itemStyle={{ color: '#4f46e5' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
            Revenue Projection
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <AIModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="AI Daily Briefing" 
        content={aiContent} 
        isLoading={isGenerating} 
      />
    </div>
  );
};

export default DashboardView;