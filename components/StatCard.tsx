import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  trend, 
  trendDirection, 
  icon: Icon, 
  color = "text-brand-600",
  bgColor = "bg-slate-100" 
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-200 transition-all duration-300 shadow-sm hover:shadow-md group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${bgColor} ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            trendDirection === 'up' ? 'text-emerald-600' : 
            trendDirection === 'down' ? 'text-red-600' : 'text-slate-500'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
            {trendDirection === 'up' && <ArrowUpRight size={16} className="ml-1" />}
            {trendDirection === 'down' && <ArrowDownRight size={16} className="ml-1" />}
            {trendDirection === 'neutral' && <Minus size={16} className="ml-1" />}
          </div>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
};

export default StatCard;