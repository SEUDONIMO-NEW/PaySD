
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Loan, Installment } from '../types';
import { MOCK_CHART_DATA } from '../constants';
import { formatCurrency } from '../utils/finance';

interface DashboardProps {
  user: User;
  loans: Loan[];
  installments: Installment[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, loans, installments }) => {
  const totalPortfolio = loans.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const collected = installments.filter(i => i.status === 'PAGADO').reduce((acc, curr) => acc + curr.amount, 0);
  const overdue = installments.filter(i => {
    return i.status === 'PENDIENTE' && new Date(i.dueDate) < new Date();
  }).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cartera Total', value: formatCurrency(totalPortfolio), icon: 'fa-briefcase', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Recaudado Hoy', value: formatCurrency(collected * 0.05), icon: 'fa-hand-holding-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'En Mora', value: formatCurrency(overdue), icon: 'fa-clock', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Eficiencia', value: '84.2%', icon: 'fa-chart-line', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <i className={`fas ${stat.icon} text-lg`}></i>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">+2.5%</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Desempeño de Recaudo Semanal</h2>
              <p className="text-slate-400 text-xs">Comparativa de ingresos reales vs metas proyectadas</p>
            </div>
            <select className="text-sm border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 outline-none">
              <option>Esta Semana</option>
              <option>Semana Pasada</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorRecaudo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="Recaudo" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRecaudo)" />
                <Area type="monotone" dataKey="Meta" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
