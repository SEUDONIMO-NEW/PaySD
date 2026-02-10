
import React, { useState, useEffect } from 'react';
import { User, Loan, Installment, Payment, Periodicity, Role, LoanStatus } from '../types';
import { formatCurrency, generateInstallments, calculateTotalDebt } from '../utils/finance';
import { DEFAULT_LOAN_CONFIGS } from '../constants';

interface CollectorModuleProps {
  user: User;
  users: User[];
  loans: Loan[];
  installments: Installment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>;
  onAddUser: (u: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddLoan: (l: Loan, i: Installment[]) => void;
}

const CollectorModule: React.FC<CollectorModuleProps> = ({ 
  user, users, loans, installments, setPayments, setInstallments, onAddUser, onDeleteUser, onAddLoan 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'route' | 'clients' | 'new_loan'>('route');
  const [showPaymentModal, setShowPaymentModal] = useState<Installment | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  
  const [clientForm, setClientForm] = useState({ name: '', email: '' });
  const [loanForm, setLoanForm] = useState({ 
    clientId: '', 
    amount: '100000', 
    periodicity: Periodicity.DIARIO, 
    installments: '20', 
    rate: '12' 
  });

  const clients = users.filter(u => u.role === Role.CLIENTE && u.parentId === user.id);
  
  // Auto-update loan parameters based on periodicity
  useEffect(() => {
    const config = DEFAULT_LOAN_CONFIGS[loanForm.periodicity];
    if (config) {
      setLoanForm(prev => ({
        ...prev,
        installments: config.installments.toString(),
        rate: (config.rate * 100).toString()
      }));
    }
  }, [loanForm.periodicity]);

  const pendingInst = installments.filter(i => {
    const loan = loans.find(l => l.id === i.loanId);
    return i.status !== 'PAGADO' && loan?.collectorId === user.id;
  });

  const handleSendNotification = (inst: Installment, clientName: string) => {
    setNotifying(inst.id);
    setTimeout(() => {
      alert(`Recordatorio enviado a ${clientName} por valor de ${formatCurrency(inst.amount)}`);
      setNotifying(null);
    }, 1200);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `cli-${Date.now()}`,
      name: clientForm.name,
      email: clientForm.email,
      role: Role.CLIENTE,
      parentId: user.id,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${clientForm.name}`
    };
    onAddUser(newUser);
    setClientForm({ name: '', email: '' });
    setActiveSubTab('clients');
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.clientId) return alert("Seleccione un cliente");

    const principal = parseInt(loanForm.amount);
    const rate = parseInt(loanForm.rate) / 100;
    const count = parseInt(loanForm.installments);
    const loanId = `l-${Date.now()}`;
    
    const newLoan: Loan = {
      id: loanId,
      clientId: loanForm.clientId,
      collectorId: user.id,
      routeId: 'r-manual',
      principal,
      totalInterest: rate,
      totalAmount: calculateTotalDebt(principal, rate),
      periodicity: loanForm.periodicity,
      installmentsCount: count,
      startDate: new Date().toISOString(),
      status: LoanStatus.ACTIVO
    };

    const newInst = generateInstallments(loanId, principal, rate, loanForm.periodicity, count, newLoan.startDate);
    onAddLoan(newLoan, newInst);
    alert("Préstamo generado correctamente.");
    setActiveSubTab('route');
  };

  const processPayment = (inst: Installment) => {
    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      installmentId: inst.id,
      amount: inst.amount,
      method: 'MANUAL',
      timestamp: new Date().toISOString(),
      collectorId: user.id
    };
    
    setPayments(prev => [...prev, newPayment]);
    setInstallments(prev => prev.map(i => i.id === inst.id ? { ...i, status: 'PAGADO', paidAmount: inst.amount } : i));
    setShowPaymentModal(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Capital Header */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
        <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-400 mb-2">Capital Asignado</p>
          <h2 className="text-4xl font-black tracking-tight">{formatCurrency(user.assignedCapital || 0)}</h2>
        </div>
        <div className="bg-white/5 p-6 rounded-3xl text-center md:text-right relative z-10 backdrop-blur-xl border border-white/10 group-hover:bg-white/10 transition">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-200 mb-2">Estado de Recaudo</p>
          <p className="text-2xl font-black text-emerald-400">OPERATIVO</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      </div>

      {/* Sub-Nav */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-40 backdrop-blur-md">
        {[
          { id: 'route', label: 'Mi Ruta', icon: 'fa-route' },
          { id: 'clients', label: 'Clientes', icon: 'fa-users' },
          { id: 'new_loan', label: 'Nuevo Crédito', icon: 'fa-hand-holding-dollar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              activeSubTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'route' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Cobros Pendientes</h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase">{pendingInst.length} HOY</span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingInst.length > 0 ? pendingInst.map(inst => {
              const client = users.find(u => u.id === loans.find(l => l.id === inst.loanId)?.clientId);
              return (
                <div key={inst.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                      #{inst.number}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm tracking-tight">{client?.name || 'Cliente'}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Vence: {new Date(inst.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-slate-800 text-base mr-4">{formatCurrency(inst.amount)}</p>
                    
                    <button 
                      onClick={() => handleSendNotification(inst, client?.name || 'Cliente')}
                      disabled={notifying === inst.id}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition border ${
                        notifying === inst.id ? 'bg-slate-50 text-slate-300' : 'bg-white text-blue-500 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-90 shadow-sm'
                      }`}
                    >
                      <i className={`fas ${notifying === inst.id ? 'fa-spinner fa-spin' : 'fa-bell'}`}></i>
                    </button>

                    <button 
                      onClick={() => setShowPaymentModal(inst)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition active:scale-90"
                    >
                      <i className="fas fa-dollar-sign"></i>
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-20 text-center text-slate-400 font-bold flex flex-col items-center">
                <i className="fas fa-check-circle text-4xl mb-4 text-emerald-100"></i>
                Ruta finalizada por hoy
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'clients' && (
        <div className="space-y-4 animate-fadeIn">
          <form onSubmit={handleCreateClient} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
               <input 
                placeholder="Nombre del Cliente" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500 transition font-bold"
                value={clientForm.name}
                onChange={e => setClientForm({...clientForm, name: e.target.value})}
                required
              />
            </div>
            <div className="flex-1 w-full space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de contacto</label>
               <input 
                placeholder="ejemplo@correo.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500 transition font-bold"
                value={clientForm.email}
                onChange={e => setClientForm({...clientForm, email: e.target.value})}
                required
              />
            </div>
            <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 active:scale-95">Registrar</button>
          </form>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clients.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:border-blue-100 transition group relative overflow-hidden">
                <img src={c.avatar} className="w-14 h-14 rounded-2xl border-2 border-slate-50 shadow-sm group-hover:scale-105 transition" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-sm tracking-tight truncate">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{c.email}</p>
                </div>
                <div className="flex gap-2 relative z-10">
                  <button 
                    onClick={() => onDeleteUser(c.id)}
                    className="bg-red-50 text-red-500 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                  <button 
                    onClick={() => {setLoanForm({...loanForm, clientId: c.id}); setActiveSubTab('new_loan');}} 
                    className="bg-blue-50 text-blue-600 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition active:scale-90"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'new_loan' && (
        <form onSubmit={handleCreateLoan} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-fadeIn relative overflow-hidden">
          <div className="border-b border-slate-50 pb-6 mb-4 relative z-10">
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">Estructurar Préstamo</h3>
             <p className="text-sm text-slate-400 font-medium mt-1">Configure los parámetros del nuevo desembolso.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente Beneficiario</label>
              <select 
                className="w-full bg-slate-50 rounded-2xl px-5 py-4 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-black text-slate-700 appearance-none"
                value={loanForm.clientId}
                onChange={e => setLoanForm({...loanForm, clientId: e.target.value})}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto a Desembolsar</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                <input 
                  type="number"
                  className="w-full bg-slate-50 rounded-2xl pl-10 pr-5 py-4 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-black text-slate-700"
                  value={loanForm.amount}
                  onChange={e => setLoanForm({...loanForm, amount: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodicidad de Cobro</label>
              <select 
                className="w-full bg-slate-50 rounded-2xl px-5 py-4 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-black text-slate-700 appearance-none"
                value={loanForm.periodicity}
                onChange={e => setLoanForm({...loanForm, periodicity: e.target.value as Periodicity})}
              >
                {Object.values(Periodicity).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cuotas</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 rounded-2xl px-5 py-4 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-black text-slate-700"
                  value={loanForm.installments}
                  onChange={e => setLoanForm({...loanForm, installments: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interés %</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 rounded-2xl px-5 py-4 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-black text-blue-600"
                  value={loanForm.rate}
                  onChange={e => setLoanForm({...loanForm, rate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total a Recaudar</p>
              <p className="text-2xl font-black text-blue-700">
                {formatCurrency(calculateTotalDebt(parseInt(loanForm.amount || '0'), parseInt(loanForm.rate || '0') / 100))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Valor Cuota</p>
              <p className="text-lg font-black text-blue-700">
                {formatCurrency(Math.ceil(calculateTotalDebt(parseInt(loanForm.amount || '0'), parseInt(loanForm.rate || '0') / 100) / parseInt(loanForm.installments || '1')))}
              </p>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/40 hover:bg-blue-700 transition active:scale-[0.98] relative z-10">
            Autorizar y Generar
          </button>
          
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-[80px] -mr-24 -mt-24"></div>
        </form>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 text-center animate-scaleUp shadow-2xl relative overflow-hidden">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl border border-emerald-100 shadow-inner">
              <i className="fas fa-receipt"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Registrar Recaudo</h3>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
              Confirmar pago de <span className="font-black text-slate-900">{formatCurrency(showPaymentModal.amount)}</span> para la cuota #{showPaymentModal.number}.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowPaymentModal(null)} className="flex-1 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl transition">Cerrar</button>
              <button onClick={() => processPayment(showPaymentModal)} className="flex-1 bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition active:scale-95">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorModule;
