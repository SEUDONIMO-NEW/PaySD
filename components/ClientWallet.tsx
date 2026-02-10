
import React from 'react';
import { User, Loan, Installment } from '../types';
import { formatCurrency } from '../utils/finance';

interface ClientWalletProps {
  user: User;
  loans: Loan[];
  installments: Installment[];
}

const ClientWallet: React.FC<ClientWalletProps> = ({ user, loans, installments }) => {
  const activeLoan = loans[0]; // Simplified for MVP
  const pending = installments.filter(i => i.status !== 'PAGADO');
  const nextPayment = pending[0];
  const paid = installments.filter(i => i.status === 'PAGADO');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Mi Balance Total</p>
              <h2 className="text-4xl font-bold">
                {activeLoan ? formatCurrency(activeLoan.totalAmount - (paid.length * (activeLoan.totalAmount / activeLoan.installmentsCount))) : '$0'}
              </h2>
            </div>
            <i className="fab fa-cc-visa text-4xl opacity-50"></i>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-blue-200 text-[10px] uppercase font-bold tracking-widest mb-1">Próximo Pago</p>
              <p className="font-semibold text-lg">{nextPayment ? formatCurrency(nextPayment.amount) : 'Sin deuda'}</p>
              <p className="text-xs opacity-70">{nextPayment ? new Date(nextPayment.dueDate).toLocaleDateString() : '-'}</p>
            </div>
            <button 
              className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-blue-50 transition active:scale-95"
              onClick={() => alert("Redirigiendo a Pasarela de Pagos (Wompi/MercadoPago)...")}
            >
              Pagar Ahora
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      {/* Progress Bar */}
      {activeLoan && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-slate-800">Progreso del Préstamo</h3>
            <span className="text-xs font-bold text-blue-600">{Math.round((paid.length / activeLoan.installmentsCount) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${(paid.length / activeLoan.installmentsCount) * 100}%` }}
            ></div>
          </div>
          <p className="mt-4 text-xs text-slate-400 text-center">Cuota {paid.length} de {activeLoan.installmentsCount} pagada</p>
        </div>
      )}

      {/* List of Installments */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">Plan de Pagos</h3>
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
          {installments.map(inst => (
            <div key={inst.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  inst.status === 'PAGADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {inst.number}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(inst.amount)}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(inst.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                inst.status === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {inst.status === 'PAGADO' ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientWallet;
