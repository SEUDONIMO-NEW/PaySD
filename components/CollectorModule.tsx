
import React, { useState, useEffect } from 'react';
import { User, Loan, Installment, Payment, Periodicity, Role, LoanStatus } from '../types';
import { formatCurrency, generateInstallments, calculateTotalDebt } from '../utils/finance';
import { DEFAULT_LOAN_CONFIGS } from '../constants';

interface CollectorModuleProps {
  user: User;
  users: User[];
  loans: Loan[];
  installments: Installment[];
  onAddUser: (u: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddLoan: (l: Loan, i: Installment[]) => void;
  onProcessPayment: (p: Payment, ui: Installment) => void;
}

const CollectorModule: React.FC<CollectorModuleProps> = ({ 
  user, users, loans, installments, onAddUser, onDeleteUser, onAddLoan, onProcessPayment 
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

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email) return;
    
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
    setActiveSubTab('route');
  };

  const confirmPayment = (inst: Installment) => {
    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      installmentId: inst.id,
      amount: inst.amount,
      method: 'MANUAL',
      timestamp: new Date().toISOString(),
      collectorId: user.id
    };
    
    const updatedInst: Installment = {
      ...inst,
      status: 'PAGADO',
      paidAmount: inst.amount
    };

    onProcessPayment(newPayment, updatedInst);
    setShowPaymentModal(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Wallet Summary */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="relative z-10 text-center md:text-left">
          <p className="text-[10px] uppercase font-black tracking-widest text-blue-400 mb-2">Capital en Operación</p>
          <h2 className="text-4xl font-black tracking-tight">{formatCurrency(user.assignedCapital || 0)}</h2>
        </div>
        <div className="mt-6 md:mt-0 px-6 py-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mb-1">Estado</p>
          <p className="text-lg font-black">EN RUTA</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
      </div>

      {/* Navigation */}
      <nav className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm sticky top-16 md:top-0 z-20 backdrop-blur-md">
        {[
          { id: 'route', label: 'Ruta Hoy', icon: 'fa-route' },
          { id: 'clients', label: 'Mis Clientes', icon: 'fa-users' },
          { id: 'new_loan', label: 'Nuevo Crédito', icon: 'fa-hand-holding-dollar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeSubTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content Areas */}
      {activeSubTab === 'route' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Cobros del Día</h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black">{pendingInst.length} PENDIENTES</span>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingInst.length > 0 ? pendingInst.map(inst => {
              const client = users.find(u => u.id === loans.find(l => l.id === inst.loanId)?.clientId);
              return (
                <div key={inst.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                      #{inst.number}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-none">{client?.name || 'Cliente'}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Vencimiento: {new Date(inst.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black text-slate-800">{formatCurrency(inst.amount)}</p>
                    <button 
                      onClick={() => setShowPaymentModal(inst)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center text-slate-300">
                <i className="fas fa-calendar-check text-4xl mb-4 opacity-20"></i>
                <p className="font-bold uppercase text-xs tracking-widest">No hay cobros para hoy</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateClient} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
            <input 
              placeholder="Nombre completo" required
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-blue-500 transition"
              value={clientForm.name}
              onChange={e => setClientForm({...clientForm, name: e.target.value})}
            />
            <input 
              placeholder="Email / Usuario" required
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-blue-500 transition"
              value={clientForm.email}
              onChange={e => setClientForm({...clientForm, email: e.target.value})}
            />
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition">Registrar</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clients.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group">
                <img src={c.avatar} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{c.email}</p>
                </div>
                <button 
                  onClick={() => {setLoanForm({...loanForm, clientId: c.id}); setActiveSubTab('new_loan');}}
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition active:scale-95"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'new_loan' && (
        <form onSubmit={handleCreateLoan} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-fadeIn relative overflow-hidden">
          <div className="relative z-10 border-b border-slate-50 pb-6">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Desembolso</h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Configure los términos del crédito solicitado.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition appearance-none"
                value={loanForm.clientId}
                onChange={e => setLoanForm({...loanForm, clientId: e.target.value})}
              >
                <option value="">Seleccione un cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto (COP)</label>
              <input 
                type="number" required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition"
                value={loanForm.amount}
                onChange={e => setLoanForm({...loanForm, amount: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodicidad</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition appearance-none"
                value={loanForm.periodicity}
                onChange={e => setLoanForm({...loanForm, periodicity: e.target.value as Periodicity})}
              >
                {Object.values(Periodicity).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">N° Cuotas</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition"
                  value={loanForm.installments}
                  onChange={e => setLoanForm({...loanForm, installments: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interés %</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-blue-600 outline-none focus:border-blue-500 transition"
                  value={loanForm.rate}
                  onChange={e => setLoanForm({...loanForm, rate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition active:scale-[0.98] relative z-10">
            Autorizar Desembolso
          </button>
          
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mb-32"></div>
        </form>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center animate-scaleUp">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 border border-emerald-100">
              <i className="fas fa-money-bill-transfer"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Recibir Pago</h3>
            <p className="text-slate-500 text-sm mb-10">Confirmar recaudo por <strong>{formatCurrency(showPaymentModal.amount)}</strong> para la cuota #{showPaymentModal.number}.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowPaymentModal(null)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition">Cerrar</button>
              <button onClick={() => confirmPayment(showPaymentModal)} className="flex-1 bg-emerald-500 text-white py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30 rounded-2xl active:scale-95 transition">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorModule;
