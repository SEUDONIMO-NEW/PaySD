
import React, { useState } from 'react';
import { User, Role, Loan, Installment, Route } from '../types';
import { formatCurrency } from '../utils/finance';

interface AdminModuleProps {
  user: User;
  users: User[];
  routes: Route[];
  loans: Loan[];
  installments: Installment[];
  onAddUser: (u: User) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (u: User) => void;
  onAddRoute: (r: Route) => void;
  onDeleteRoute: (routeId: string) => void;
  onUpdateRoute: (r: Route) => void;
}

const AdminModule: React.FC<AdminModuleProps> = ({ 
  user, users, routes, loans, installments, 
  onAddUser, onDeleteUser, onUpdateUser, 
  onAddRoute, onDeleteRoute, onUpdateRoute 
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'routes'>('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  
  const [userFormData, setUserFormData] = useState({ name: '', email: '', capital: '1000000', margin: '10', password: '' });
  const [routeFormData, setRouteFormData] = useState({ name: '', supervisorId: '', description: '' });

  const targetRole = user.role === Role.CEO ? Role.DUEÑO 
                    : user.role === Role.DUEÑO ? Role.SUPERVISOR 
                    : Role.RECAUDADOR;

  const managedUsers = users.filter(u => u.role === targetRole && u.parentId === user.id);
  const myRoutes = routes.filter(r => r.ownerId === user.id);

  const getCollectorStats = (userId: string) => {
    const relevantLoans = loans.filter(l => l.collectorId === userId || l.routeId === userId);
    const relevantInstallments = installments.filter(i => relevantLoans.some(l => l.id === i.loanId));
    
    const totalToCollect = relevantInstallments.reduce((acc, curr) => acc + curr.amount, 0);
    const collected = relevantInstallments.filter(i => i.status === 'PAGADO').reduce((acc, curr) => acc + curr.amount, 0);
    const overdue = relevantInstallments.filter(i => {
      return i.status === 'PENDIENTE' && new Date(i.dueDate) < new Date();
    }).reduce((acc, curr) => acc + curr.amount, 0);

    return { totalToCollect, collected, overdue };
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: userFormData.name,
      email: userFormData.email,
      password: userFormData.password || '123456',
      role: targetRole,
      parentId: user.id,
      assignedCapital: parseInt(userFormData.capital),
      profitMargin: parseInt(userFormData.margin),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userFormData.name}`
    };
    onAddUser(newUser);
    setShowUserModal(false);
    setUserFormData({ name: '', email: '', capital: '1000000', margin: '10', password: '' });
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute: Route = {
      id: `r-${Date.now()}`,
      name: routeFormData.name,
      ownerId: user.id,
      supervisorId: routeFormData.supervisorId || undefined,
      description: routeFormData.description
    };
    onAddRoute(newRoute);
    setShowRouteModal(false);
    setRouteFormData({ name: '', supervisorId: '', description: '' });
  };

  const handleAssignSupervisor = (routeId: string, supId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      onUpdateRoute({ ...route, supervisorId: supId });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Admin */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {user.role === Role.CEO ? 'Control Maestro' : user.role === Role.DUEÑO ? 'Gestión de Empresa' : 'Control de Equipo'}
          </h2>
          <p className="text-sm text-slate-500">Administra recursos, personal y rutas operativas.</p>
        </div>
        
        {user.role === Role.DUEÑO && (
          <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveAdminTab('users')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              SUPERVISORES
            </button>
            <button 
              onClick={() => setActiveAdminTab('routes')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'routes' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              RUTAS
            </button>
          </div>
        )}

        <button 
          onClick={() => activeAdminTab === 'users' ? setShowUserModal(true) : setShowRouteModal(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <i className="fas fa-plus"></i>
          Registrar {activeAdminTab === 'users' ? targetRole : 'Ruta'}
        </button>
      </div>

      {activeAdminTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {managedUsers.length > 0 ? managedUsers.map(u => {
            const stats = getCollectorStats(u.id);
            const assignedRoute = routes.find(r => r.supervisorId === u.id);

            return (
              <div key={u.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row relative group">
                <button 
                  onClick={() => onDeleteUser(u.id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>

                <div className="p-6 bg-slate-50 sm:w-48 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100">
                  <img src={u.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow-sm mb-3" />
                  <h3 className="font-bold text-slate-800 text-center text-sm">{u.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">{u.role}</p>
                  
                  {user.role === Role.DUEÑO && (
                    <div className="mt-4 w-full">
                       <span className={`block text-center text-[9px] font-black py-1 px-2 rounded-full border ${assignedRoute ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                         {assignedRoute ? assignedRoute.name : 'SIN RUTA'}
                       </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50/50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-blue-500 uppercase">Capital</p>
                      <p className="text-xs font-black text-blue-700">{formatCurrency(u.assignedCapital || 0)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Margen</p>
                      <p className="text-xs font-black text-slate-700">{u.profitMargin}%</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Recaudo Total</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.collected)}</p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
              No hay {targetRole.toLowerCase()}s registrados.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRoutes.length > 0 ? myRoutes.map(r => {
            const supervisor = users.find(u => u.id === r.supervisorId);
            return (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                <button 
                  onClick={() => onDeleteRoute(r.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                    <i className="fas fa-map-marked-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{r.name}</h4>
                    <p className="text-xs text-slate-400 truncate max-w-[150px]">{r.description || 'Sin descripción'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Supervisor Asignado</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                      value={r.supervisorId || ''}
                      onChange={(e) => handleAssignSupervisor(r.id, e.target.value)}
                    >
                      <option value="">No asignado</option>
                      {managedUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-4 uppercase">
                    <span>Estado:</span>
                    <span className={r.supervisorId ? 'text-emerald-500' : 'text-amber-500'}>
                      {r.supervisorId ? 'Activa' : 'Pendiente Asignación'}
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
              No has creado rutas operativas todavía.
            </div>
          )}
        </div>
      )}

      {/* Modal Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scaleUp">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Nuevo {targetRole}</h3>
            <div className="space-y-4">
              <input 
                placeholder="Nombre completo" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                value={userFormData.name}
                onChange={e => setUserFormData({...userFormData, name: e.target.value})}
              />
              <input 
                placeholder="Email / Usuario" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                value={userFormData.email}
                onChange={e => setUserFormData({...userFormData, email: e.target.value})}
              />
              <input 
                type="password" placeholder="Contraseña segura" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                value={userFormData.password}
                onChange={e => setUserFormData({...userFormData, password: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" placeholder="Capital Asignado" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                  value={userFormData.capital}
                  onChange={e => setUserFormData({...userFormData, capital: e.target.value})}
                />
                <input 
                  type="number" placeholder="Margen %" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                  value={userFormData.margin}
                  onChange={e => setUserFormData({...userFormData, margin: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition">Cerrar</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 font-bold rounded-2xl shadow-lg">Registrar</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Ruta */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreateRoute} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scaleUp">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Nueva Ruta de Cobro</h3>
            <div className="space-y-4">
              <input 
                placeholder="Nombre de la Ruta (Ej: Centro-Norte)" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                value={routeFormData.name}
                onChange={e => setRouteFormData({...routeFormData, name: e.target.value})}
              />
              <textarea 
                placeholder="Descripción o límites de la ruta..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                value={routeFormData.description}
                onChange={e => setRouteFormData({...routeFormData, description: e.target.value})}
              />
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                value={routeFormData.supervisorId}
                onChange={e => setRouteFormData({...routeFormData, supervisorId: e.target.value})}
              >
                <option value="">Asignar supervisor (Opcional)</option>
                {managedUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setShowRouteModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition">Cerrar</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 font-bold rounded-2xl shadow-lg">Crear Ruta</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminModule;
