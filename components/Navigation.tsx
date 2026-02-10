
import React from 'react';
import { Role } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, role, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', roles: [Role.DUEÑO, Role.SUPERVISOR] },
    { id: 'collector', label: 'Operación', icon: 'fa-route', roles: [Role.RECAUDADOR, Role.SUPERVISOR, Role.DUEÑO] },
    { id: 'admin', label: role === Role.DUEÑO ? 'Admin' : 'Mi Equipo', icon: role === Role.DUEÑO ? 'fa-cog' : 'fa-users-cog', roles: [Role.DUEÑO, Role.SUPERVISOR] },
    { id: 'client', label: 'Mi Cartera', icon: 'fa-wallet', roles: [Role.CLIENTE] },
    { id: 'support', label: 'Soporte', icon: 'fa-headset', roles: [Role.SOPORTE, Role.DUEÑO, Role.CLIENTE, Role.RECAUDADOR] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6">
        <div className="mb-10 px-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <i className="fas fa-dollar-sign text-white"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">PaySD</span>
        </div>
        <nav className="flex-1 space-y-2">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 transition"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex justify-around py-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <i className={`fas ${item.icon} text-lg mb-1`}></i>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={onLogout}
          className="flex flex-col items-center p-2 text-slate-400"
        >
          <i className="fas fa-sign-out-alt text-lg mb-1"></i>
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>
    </>
  );
};

export default Navigation;
