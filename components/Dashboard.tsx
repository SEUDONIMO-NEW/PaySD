
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Loan, Installment, Payment } from '../types';
import { formatCurrency } from '../utils/finance';

interface DashboardProps {
  user: User;
  loans: Loan[];
  installments: Installment[];
  payments: Payment[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, loans, installments, payments }) => {
  // Real calculations based on state
  const totalPortfolio = loans.reduce((acc, curr) => acc + curr.totalAmount, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const collectedToday = payments
    .filter(p => p.timestamp.startsWith(today))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const overdue = installments.filter(i => {
    return i.status !== 'PAGADO' && new Date(i.dueDate) < new Date();
  }).reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);

  const totalInstallments = installments.length;
  const paidInstallments = installments.filter(i => i.status === 'PAGADO').length;
  const efficiency = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  // Real chart data generation
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
    const collected = payments
      .filter(p => p.timestamp.startsWith(dayStr))
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    return { name: dayName, Recaudo: collected, Meta: 500000 };
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cartera Total', value: formatCurrency(totalPortfolio), icon: 'fa-briefcase', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Recaudado Hoy', value: formatCurrency(collectedToday), icon: 'fa-hand-holding-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'En Mora Total', value: formatCurrency(overdue), icon: 'fa-clock', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Eficiencia Global', value: `${efficiency.toFixed(1)}%`, icon: 'fa-chart-line', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <i className={`fas ${stat.icon} text-lg`}></i>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">En tiempo real</span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className="text-xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h2 className="font-black text-slate-800 text-xl tracking-tight">Rendimiento Operativo</h2>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Comparativa de ingresos (últimos 7 días)</p>
            </div>
          </div>
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorRecaudo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  labelStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="Recaudo" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRecaudo)" />
                <Area type="monotone" dataKey="Meta" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="8 4" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mb-32"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
