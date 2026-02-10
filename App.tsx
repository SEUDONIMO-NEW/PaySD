
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
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const mockLoan: Loan = {
      id: 'l-init',
      clientId: 'cli-1',
      collectorId: 'rec-1',
      routeId: 'r-1',
      principal: 500000,
      totalInterest: 0.20,
      totalAmount: 600000,
      periodicity: Periodicity.DIARIO,
      installmentsCount: 24,
      startDate: new Date().toISOString(),
      status: LoanStatus.ACTIVO
    };
    
    const mockInstallments = generateInstallments(
      mockLoan.id, 
      mockLoan.principal, 
      mockLoan.totalInterest, 
      mockLoan.periodicity, 
      mockLoan.installmentsCount, 
      mockLoan.startDate
    );

    setLoans([mockLoan]);
    setInstallments(mockInstallments);
  }, []);

  const handleLogin = (email: string, password: string, role: Role): boolean => {
    // Normalización de entradas para evitar errores comunes de usuario
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
    }
  };

  const handleUpdateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const handleAddRoute = (newRoute: Route) => {
    setRoutes(prev => [...prev, newRoute]);
  };

  const handleDeleteRoute = (routeId: string) => {
    if (window.confirm('¿Deseas eliminar esta ruta? Se perderá la vinculación con el supervisor.')) {
      setRoutes(prev => prev.filter(r => r.id !== routeId));
    }
  };

  const handleUpdateRoute = (updatedRoute: Route) => {
    setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
  };

  const handleAddLoan = (newLoan: Loan, newInstallments: Installment[]) => {
    setLoans([...loans, newLoan]);
    setInstallments([...installments, ...newInstallments]);
  };

  if (!isAuthenticated || !currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={currentUser} loans={loans} installments={installments} />;
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
        return <Dashboard user={currentUser} loans={loans} installments={installments} />;
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
          <div>
            <h1 className="text-2xl font-bold text-slate-800">PaySD <span className="text-blue-600">GOcash</span></h1>
            <p className="text-slate-500 text-sm">Sesión: <span className="font-bold text-slate-700">{currentUser.role}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
            <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </header>

        {renderModule()}
      </main>
    </div>
  );
};

export default App;
