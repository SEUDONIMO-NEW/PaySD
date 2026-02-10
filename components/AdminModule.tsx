
import React, { useState } from 'react';
import { User, Role, Loan, Installment } from '../types';
import { formatCurrency } from '../utils/finance';

interface AdminModuleProps {
  user: User;
  users: User[];
  loans: Loan[];
  installments: Installment[];
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
}

const AdminModule: React.FC<AdminModuleProps> = ({ user, users, loans, installments, onAddUser, onUpdateUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', capital: '1000000', margin: '10', password: '' });

  const targetRole = user.role === Role.DUEÑO ? Role.SUPERVISOR : Role.RECAUDADOR;
  const managedUsers = users.filter(u => u.role === targetRole && u.parentId === user.id);

  const getCollectorStats = (collectorId: string) => {
    const collectorLoans = loans.filter(l => l.collectorId === collectorId);
    const collectorInstallments = installments.filter(i => collectorLoans.some(l => l.id === i.loanId));
    
    const totalToCollect = collectorInstallments.reduce((acc, curr) => acc + curr.amount, 0);
    const collected = collectorInstallments.filter(i => i.status === 'PAGADO').reduce((acc, curr) => acc + curr.amount, 0);
    const overdue = collectorInstallments.filter(i => {
      return i.status === 'PENDIENTE' && new Date(i.dueDate) < new Date();
    }).reduce((acc, curr) => acc + curr.amount, 0);

    const efficiency = totalToCollect > 0 ? (collected / totalToCollect) * 100 : 0;

    return { totalToCollect, collected, overdue, efficiency };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      password: formData.password || '123456',
      role: targetRole,
      parentId: user.id,
      assignedCapital: parseInt(formData.capital),
      profitMargin: parseInt(formData.margin),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
    };
    onAddUser(newUser);
    setShowModal(false);
    setFormData({ name: '', email: '', capital: '1000000', margin: '10', password: '' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {user.role === Role.DUEÑO ? 'Control de Supervisores' : 'Balance de Estadísticas por Recaudador'}
          </h2>
          <p className="text-sm text-slate-500">
            {user.role === Role.DUEÑO 
              ? 'Crea y supervisa a los encargados de zona.' 
              : 'Monitorea el desempeño financiero y el cumplimiento de metas de tu equipo.'}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
        >
          <i className="fas fa-user-plus"></i>
          Crear {targetRole}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {managedUsers.length > 0 ? managedUsers.map(u => {
          const stats = getCollectorStats(u.id);
          return (
            <div key={u.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
              {/* Profile Section */}
              <div className="p-6 bg-slate-50 sm:w-48 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100">
                <div className="relative mb-4">
                  <img src={u.avatar} className="w-20 h-20 rounded-full border-4 border-white shadow-sm" />
                  <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${stats.efficiency > 80 ? 'bg-emerald-500' : stats.efficiency > 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                </div>
                <h3 className="font-bold text-slate-800 text-center text-sm">{u.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-1">Recaudador</p>
                
                <div className="mt-6 w-full space-y-2">
                   <button className="w-full py-2 bg-white text-blue-600 text-[10px] font-bold uppercase rounded-lg border border-blue-100 hover:bg-blue-50 transition">
                     Ver Detalle
                   </button>
                   <button className="w-full py-2 bg-white text-slate-500 text-[10px] font-bold uppercase rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                     Editar Perfil
                   </button>
                </div>
              </div>

              {/* Stats Section */}
              <div className="flex-1 p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Total Recaudado</p>
                    <p className="text-lg font-black text-emerald-700">{formatCurrency(stats.collected)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Mora / Vencido</p>
                    <p className="text-lg font-black text-red-700">{formatCurrency(stats.overdue)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Eficiencia de Cobro</span>
                      <span className={`text-sm font-black ${stats.efficiency > 80 ? 'text-emerald-600' : stats.efficiency > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {stats.efficiency.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${stats.efficiency > 80 ? 'bg-emerald-500' : stats.efficiency > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${stats.efficiency}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Capital Asignado</p>
                      <p className="text-sm font-bold text-slate-700">{formatCurrency(u.assignedCapital || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Comisión Pactada</p>
                      <p className="text-sm font-bold text-blue-600">{u.profitMargin}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <i className="fas fa-users text-4xl mb-4 opacity-20"></i>
            <p className="font-medium">No hay personal a cargo bajo tu supervisión.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 font-bold text-sm hover:underline">
              Dar de alta nuevo recaudador
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scaleUp border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Nuevo {targetRole}</h3>
                <p className="text-sm text-slate-500">Completa los datos del perfil y credenciales.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                  <input 
                    placeholder="Ej. Carlos Mendez" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition text-sm font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Correo Electrónico</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                  <input 
                    type="email" 
                    placeholder="recaudador@paysd.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition text-sm font-medium"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contraseña de Acceso</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                  <input 
                    type="password" 
                    placeholder="Min. 6 caracteres" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition text-sm font-medium"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              {targetRole === Role.RECAUDADOR && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block">Capital Diario ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3.5 outline-none focus:border-blue-500 transition text-sm font-bold text-slate-700"
                        value={formData.capital}
                        onChange={e => setFormData({...formData, capital: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block">% Comisión</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">%</span>
                      <input 
                        type="number" 
                        max="100"
                        className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 transition text-sm font-bold text-emerald-700"
                        value={formData.margin}
                        onChange={e => setFormData({...formData, margin: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 mt-10">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition"
              >
                Crear Perfil
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminModule;
