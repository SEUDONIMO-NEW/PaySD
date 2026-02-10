
import React, { useState, useEffect } from 'react';
import { Role, User, Loan, Installment, Payment, Periodicity, LoanStatus, Route } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CollectorModule from './components/CollectorModule';
import AdminModule from './components/AdminModule';
import SupportModule from './components/SupportModule';
import ClientWallet from './components/ClientWallet';
import LoginView from './components/LoginView';
import { generateInstallments } from './utils/finance';

const INITIAL_USERS: User[] = [
  { id: 'ceo-1', name: 'Director Ejecutivo', email: 'SEUDONIMO', password: 'JEREMIAS1234..', role: Role.CEO, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO' },
  { id: 'admin-1', name: 'Dueño de Empresa', email: 'd123', password: '1234', role: Role.DUEÑO, parentId: 'ceo-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
  { id: 'sup-1', name: 'Roberto Supervisor', email: 'sup@paysd.com', password: 'sup123', role: Role.SUPERVISOR, parentId: 'admin-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sup' },
  { id: 'rec-1', name: 'Juan Recaudador', email: 'juan@paysd.com', password: 'rec123', role: Role.RECAUDADOR, parentId: 'sup-1', assignedCapital: 5000000, profitMargin: 10, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan' },
  { id: 'cli-1', name: 'Maria Cliente', email: 'maria@gmail.com', password: 'cli123', role: Role.CLIENTE, parentId: 'rec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' }
];

const INITIAL_ROUTES: Route[] = [
  { id: 'r-1', name: 'Ruta Norte Central', ownerId: 'admin-1', supervisorId: 'sup-1', description: 'Zona comercial centro' }
];

const App: React.FC = () => {
  // Persistence Loading
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('paysd_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [routes, setRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem('paysd_routes');
    return saved ? JSON.parse(saved) : INITIAL_ROUTES;
  });
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('paysd_loans');
    return saved ? JSON.parse(saved) : [];
  });
  const [installments, setInstallments] = useState<Installment[]>(() => {
    const saved = localStorage.getItem('paysd_installments');
    return saved ? JSON.parse(saved) : [];
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('paysd_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Persistence Saving
  useEffect(() => {
    localStorage.setItem('paysd_users', JSON.stringify(users));
    localStorage.setItem('paysd_routes', JSON.stringify(routes));
    localStorage.setItem('paysd_loans', JSON.stringify(loans));
    localStorage.setItem('paysd_installments', JSON.stringify(installments));
    localStorage.setItem('paysd_payments', JSON.stringify(payments));
  }, [users, routes, loans, installments, payments]);

  const handleLogin = (email: string, password: string, role: Role): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const user = users.find(u => 
      u.email.toLowerCase() === normalizedEmail && 
      u.password === normalizedPassword && 
      u.role === role
    );

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (role === Role.RECAUDADOR) setActiveTab('collector');
      else if (role === Role.CLIENTE) setActiveTab('client');
      else setActiveTab('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setRoutes(prev => prev.map(r => r.supervisorId === userId ? { ...r, supervisorId: undefined } : r));
      // Also cleanup loans related if needed
    }
  };

  const handleUpdateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const handleAddRoute = (newRoute: Route) => {
    setRoutes(prev => [...prev, newRoute]);
  };

  const handleDeleteRoute = (routeId: string) => {
    if (window.confirm('¿Deseas eliminar esta ruta?')) {
      setRoutes(prev => prev.filter(r => r.id !== routeId));
    }
  };

  const handleUpdateRoute = (updatedRoute: Route) => {
    setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
  };

  const handleAddLoan = (newLoan: Loan, newInstallments: Installment[]) => {
    setLoans(prev => [...prev, newLoan]);
    setInstallments(prev => [...prev, ...newInstallments]);
  };

  const handleUpdateInstallments = (updated: Installment[]) => {
    setInstallments(prev => {
      const map = new Map(prev.map(i => [i.id, i]));
      updated.forEach(u => map.set(u.id, u));
      return Array.from(map.values());
    });
  };

  if (!isAuthenticated || !currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={currentUser} loans={loans} installments={installments} payments={payments} />;
      case 'collector':
        return <CollectorModule 
          user={currentUser} 
          users={users}
          loans={loans} 
          installments={installments} 
          setPayments={setPayments} 
          setInstallments={setInstallments}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onAddLoan={handleAddLoan}
        />;
      case 'admin':
        return <AdminModule 
          user={currentUser} 
          users={users} 
          routes={routes}
          loans={loans}
          installments={installments}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onUpdateUser={handleUpdateUser}
          onAddRoute={handleAddRoute}
          onDeleteRoute={handleDeleteRoute}
          onUpdateRoute={handleUpdateRoute}
        />;
      case 'client':
        return <ClientWallet user={currentUser} loans={loans} installments={installments} />;
      case 'support':
        return <SupportModule user={currentUser} />;
      default:
        return <Dashboard user={currentUser} loans={loans} installments={installments} payments={payments} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={currentUser.role} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <header className="mb-8 flex justify-between items-center">
          <div className="animate-slideDown">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">PaySD <span className="text-blue-600">GOcash</span></h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sesión {currentUser.role}
            </p>
          </div>
          <div className="flex items-center gap-4 animate-fadeIn">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">ID: {currentUser.id.split('-')[0]}</p>
            </div>
            <div className="relative group">
              <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-white shadow-md cursor-pointer group-hover:scale-105 transition" />
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 p-2 hidden group-hover:block z-50 min-w-[120px]">
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded transition">Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </header>

        {renderModule()}
      </main>
    </div>
  );
};

export default App;
