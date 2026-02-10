
import React, { useState } from 'react';
import { User, Loan, Installment, Payment, Periodicity, Role, LoanStatus } from '../types';
import { formatCurrency, generateInstallments, calculateTotalDebt } from '../utils/finance';

interface CollectorModuleProps {
  user: User;
  users: User[];
  loans: Loan[];
  installments: Installment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>;
  onAddUser: (u: User) => void;
  onAddLoan: (l: Loan, i: Installment[]) => void;
}

const CollectorModule: React.FC<CollectorModuleProps> = ({ 
  user, users, loans, installments, setPayments, setInstallments, onAddUser, onAddLoan 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'route' | 'clients' | 'new_loan'>('route');
  const [showPaymentModal, setShowPaymentModal] = useState<Installment | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  
  const [clientForm, setClientForm] = useState({ name: '', email: '' });
  const [loanForm, setLoanForm] = useState({ clientId: '', amount: '100000', periodicity: Periodicity.DIARIO, installments: '20', rate: '12' });

  const clients = users.filter(u => u.role === Role.CLIENTE && u.parentId === user.id);
  const pendingInst = installments.filter(i => i.status !== 'PAGADO');

  const handleSendNotification = (inst: Installment, clientName: string) => {
    setNotifying(inst.id);
    // Simulación de envío de notificación
    setTimeout(() => {
      alert(`Notificación enviada a ${clientName}: Recuerda pagar tu cuota de ${formatCurrency(inst.amount)} antes del ${new Date(inst.dueDate).toLocaleDateString()}.`);
      setNotifying(null);
    }, 1500);
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Capital Header */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Capital en Calle</p>
          <h2 className="text-3xl font-bold">{formatCurrency(user.assignedCapital || 0)}</h2>
        </div>
        <div className="bg-white/10 p-4 rounded-xl text-right relative z-10 backdrop-blur-sm">
          <p className="text-[10px] uppercase font-bold opacity-60">Meta Diaria</p>
          <p className="text-xl font-bold">92%</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      </div>

      {/* Sub-Nav */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
        {[
          { id: 'route', label: 'Mi Ruta', icon: 'fa-route' },
          { id: 'clients', label: 'Clientes', icon: 'fa-users' },
          { id: 'new_loan', label: 'Nuevo Préstamo', icon: 'fa-hand-holding-dollar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'route' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-4 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cobros Pendientes Hoy</h3>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{pendingInst.length} PENDIENTES</span>
          </div>
          {pendingInst.length > 0 ? pendingInst.map(inst => {
            const client = users.find(u => u.id === loans.find(l => l.id === inst.loanId)?.clientId);
            return (
              <div key={inst.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
                    #{inst.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{client?.name || 'Cliente'}</h4>
                    <p className="text-xs text-slate-400 font-medium">Vence: {new Date(inst.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="mr-4">
                    <p className="font-black text-slate-700 text-sm">{formatCurrency(inst.amount)}</p>
                  </div>
                  
                  {/* Botón de Notificación */}
                  <button 
                    onClick={() => handleSendNotification(inst, client?.name || 'Cliente')}
                    disabled={notifying === inst.id}
                    title="Enviar recordatorio de pago"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition border ${
                      notifying === inst.id 
                      ? 'bg-slate-50 text-slate-300 border-slate-100' 
                      : 'bg-white text-blue-500 border-blue-100 hover:bg-blue-50 active:scale-90'
                    }`}
                  >
                    <i className={`fas ${notifying === inst.id ? 'fa-spinner fa-spin' : 'fa-bell'}`}></i>
                  </button>

                  <button 
                    onClick={() => setShowPaymentModal(inst)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 transition active:scale-90"
                  >
                    <i className="fas fa-dollar-sign"></i>
                  </button>
                </div>
              </div>
            );
          }) : <div className="p-12 text-center text-slate-400 font-medium">No hay cobros pendientes</div>}
        </div>
      )}

      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateClient} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
               <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
               <input 
                placeholder="Nombre del Cliente" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                value={clientForm.name}
                onChange={e => setClientForm({...clientForm, name: e.target.value})}
                required
              />
            </div>
            <div className="flex-1 relative">
               <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
               <input 
                placeholder="Email de contacto" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                value={clientForm.email}
                onChange={e => setClientForm({...clientForm, email: e.target.value})}
                required
              />
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">Registrar</button>
          </form>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clients.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
                <img src={c.avatar} className="w-12 h-12 rounded-full border-2 border-slate-50" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{c.email}</p>
                </div>
                <button 
                  onClick={() => {setLoanForm({...loanForm, clientId: c.id}); setActiveSubTab('new_loan');}} 
                  className="bg-blue-50 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'new_loan' && (
        <form onSubmit={handleCreateLoan} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-50 pb-4 mb-4">
             <h3 className="text-xl font-black text-slate-800">Nueva Operación</h3>
             <p className="text-sm text-slate-400">Define los términos del préstamo para el cliente seleccionado.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Cliente Solicitante</label>
              <select 
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-medium"
                value={loanForm.clientId}
                onChange={e => setLoanForm({...loanForm, clientId: e.target.value})}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Monto a Desembolsar ($)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-bold text-slate-700"
                value={loanForm.amount}
                onChange={e => setLoanForm({...loanForm, amount: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Frecuencia de Cobro</label>
              <select 
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-medium"
                value={loanForm.periodicity}
                onChange={e => setLoanForm({...loanForm, periodicity: e.target.value as Periodicity})}
              >
                {Object.values(Periodicity).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Interés Aplicado (%)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-blue-500 transition text-sm font-bold text-blue-600"
                value={loanForm.rate}
                onChange={e => setLoanForm({...loanForm, rate: e.target.value})}
              />
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition active:scale-[0.98]">
            Generar Préstamo
          </button>
        </form>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center animate-scaleUp shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl border-2 border-emerald-100">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Registrar Pago</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Confirmar recaudo de <span className="font-bold text-slate-900">{formatCurrency(showPaymentModal.amount)}</span> para la cuota #{showPaymentModal.number}.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(null)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition">Cancelar</button>
              <button onClick={() => processPayment(showPaymentModal)} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorModule;
