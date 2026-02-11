
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Loan, Installment, Payment } from '../types';
import { formatCurrency } from '../utils/finance';
import { getFinancialAdvice } from '../services/gemini';

interface DashboardProps {
  user: User;
  loans: Loan[];
  installments: Installment[];
  payments: Payment[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, loans, installments, payments }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Cálculos consolidados
  const totalPortfolio = loans.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const today = new Date().toISOString().split('T')[0];
  const collectedToday = payments
    .filter(p => p.timestamp.startsWith(today))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const overdue = installments.filter(i => {
    return i.status !== 'PAGADO' && new Date(i.dueDate) < new Date();
  }).reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);

  const efficiency = installments.length > 0 
    ? (installments.filter(i => i.status === 'PAGADO').length / installments.length) * 100 
    : 0;

  useEffect(() => {
    const fetchAiAdvice = async () => {
      if (loans.length === 0) return;
      setLoadingAi(true);
      try {
        const advice = await getFinancialAdvice({
          totalPortfolio,
          collectedToday,
          overdue,
          efficiency: efficiency.toFixed(1)
        });
        setAiInsight(advice);
      } catch (err) {
        setAiInsight("Servicio de análisis temporalmente fuera de línea.");
      } finally {
        setLoadingAi(false);
      }
    };
    fetchAiAdvice();
  }, [loans.length]);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
    const collected = payments
      .filter(p => p.timestamp.startsWith(dayStr))
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: dayName, Recaudo: collected };
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cartera Activa', value: formatCurrency(totalPortfolio), icon: 'fa-wallet', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Recaudo Hoy', value: formatCurrency(collectedToday), icon: 'fa-money-bill-trend-up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Mora Proyectada', value: formatCurrency(overdue), icon: 'fa-circle-exclamation', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Eficiencia', value: `${efficiency.toFixed(1)}%`, icon: 'fa-gauge-high', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="mb-8">
            <h2 className="font-black text-slate-800 text-lg">Histórico de Recaudo</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Últimos 7 días de operación</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="Recaudo" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col shadow-2xl">
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-xs animate-pulse">
                <i className="fas fa-brain"></i>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Gemini Insight</span>
            </div>
            <h3 className="text-lg font-black mb-4 tracking-tight">Análisis Estratégico</h3>
            
            <div className="text-sm text-slate-300 font-medium leading-relaxed italic">
              {loadingAi ? (
                <div className="space-y-2">
                  <div className="h-3 bg-white/5 rounded-full animate-pulse w-full"></div>
                  <div className="h-3 bg-white/5 rounded-full animate-pulse w-4/5"></div>
                  <div className="h-3 bg-white/5 rounded-full animate-pulse w-2/3"></div>
                </div>
              ) : (
                <p className="animate-fadeIn">{aiInsight || "Inicia un préstamo para obtener asesoría."}</p>
              )}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[50px] -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-[40px] -ml-12 -mb-12"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
