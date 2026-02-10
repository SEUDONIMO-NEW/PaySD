
import React, { useState } from 'react';
import { Role } from '../types';

interface LoginViewProps {
  onLogin: (email: string, password: string, role: Role) => boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rolesConfig = [
    { role: Role.CEO, label: 'CEO', icon: 'fa-building-shield', desc: 'Control Maestro Corporativo', color: 'bg-slate-900' },
    { role: Role.DUEÑO, label: 'Dueño', icon: 'fa-crown', desc: 'Gestión de Sucursales', color: 'bg-indigo-600' },
    { role: Role.SUPERVISOR, label: 'Supervisor', icon: 'fa-user-tie', desc: 'Control de Equipos', color: 'bg-blue-600' },
    { role: Role.RECAUDADOR, label: 'Recaudador', icon: 'fa-route', desc: 'Operación de Campo', color: 'bg-emerald-600' },
    { role: Role.CLIENTE, label: 'Cliente', icon: 'fa-wallet', desc: 'Consulta de Cartera', color: 'bg-violet-600' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selectedRole && email && password) {
      const success = onLogin(email, password, selectedRole);
      if (!success) {
        setError('Credenciales incorrectas para este rol. Por favor, revisa el usuario y contraseña.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'email' | 'password') => {
    setError(null);
    if (field === 'email') setEmail(e.target.value);
    else setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-scaleUp">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-50 border-r border-slate-100">
          <div>
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
              <i className="fas fa-dollar-sign text-white text-xl"></i>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4 text-balance">PaySD <br/><span className="text-blue-600">GOcash</span></h1>
            <p className="text-slate-500 text-lg leading-relaxed max-w-xs">
              Infraestructura financiera corporativa para el control total de capital y recaudo.
            </p>
          </div>
          <div className="space-y-4">
             <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                 <i className="fas fa-shield-halved"></i>
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">Seguridad</p>
                 <p className="text-sm font-bold text-slate-700">Protocolos CEO-Level</p>
               </div>
             </div>
          </div>
        </div>

        <div className="p-8 lg:p-12 overflow-y-auto max-h-[90vh]">
          {!selectedRole ? (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso al Sistema</h2>
              <p className="text-slate-500 mb-8">Selecciona tu nivel jerárquico</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rolesConfig.map((config) => (
                  <button
                    key={config.role}
                    onClick={() => setSelectedRole(config.role)}
                    className="flex flex-col items-start p-5 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <div className={`${config.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition`}>
                      <i className={`fas ${config.icon}`}></i>
                    </div>
                    <p className="font-bold text-slate-800">{config.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{config.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-slideUp">
              <button 
                onClick={() => {setSelectedRole(null); setPassword(''); setEmail(''); setError(null);}} 
                className="text-slate-400 hover:text-slate-600 text-sm mb-6 flex items-center gap-2 group"
              >
                <i className="fas fa-arrow-left group-hover:-translate-x-1 transition"></i>
                Volver
              </button>
              
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${rolesConfig.find(r => r.role === selectedRole)?.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`}>
                    <i className={`fas ${rolesConfig.find(r => r.role === selectedRole)?.icon}`}></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">Nivel {selectedRole.toLowerCase()}</h2>
                    <p className="text-slate-500 text-sm">Autenticación de seguridad requerida</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
                  <i className="fas fa-circle-exclamation text-red-500"></i>
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1.5">
                    {selectedRole === Role.CEO ? 'Identificador / SEUDONIMO' : 'Usuario / Email'}
                  </label>
                  <div className="relative">
                    <i className="fas fa-user-circle absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text"
                      required
                      placeholder={selectedRole === Role.CEO ? 'SEUDONIMO' : 'Usuario'}
                      value={email}
                      onChange={(e) => handleInputChange(e, 'email')}
                      className={`w-full bg-slate-50 border ${error ? 'border-red-200' : 'border-slate-200'} rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 transition text-slate-700 font-medium`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1.5">Contraseña</label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handleInputChange(e, 'password')}
                      className={`w-full bg-slate-50 border ${error ? 'border-red-200' : 'border-slate-200'} rounded-2xl pl-12 pr-12 py-4 outline-none focus:border-blue-500 transition text-slate-700 font-medium`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-xl transition active:scale-[0.98]">
                    Ingresar
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mt-4">
                  <h4 className="text-[10px] font-black uppercase text-amber-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-key"></i>
                    Credenciales de Acceso
                  </h4>
                  <ul className="text-[10px] text-amber-700 space-y-1 font-medium">
                    <li><span className="font-bold">CEO:</span> SEUDONIMO / JEREMIAS1234..</li>
                    <li><span className="font-bold">Dueño:</span> d123 / 1234</li>
                  </ul>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
