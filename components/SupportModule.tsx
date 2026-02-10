
import React, { useState } from 'react';
import { User } from '../types';

interface SupportModuleProps {
  user: User;
}

const SupportModule: React.FC<SupportModuleProps> = ({ user }) => {
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [formData, setFormData] = useState({ subject: '', message: '' });

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('sending');
    setTimeout(() => {
      setTicketStatus('sent');
      setFormData({ subject: '', message: '' });
      setTimeout(() => setTicketStatus('idle'), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-600/30">
              <i className="fas fa-headset"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black">Centro de Soporte Técnico</h2>
              <p className="text-slate-400 text-sm">Estamos aquí para resolver tus dudas operativas.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Horario</p>
              <p className="text-sm font-medium">Lun - Sáb: 8am - 6pm</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          <div className="md:col-span-1 space-y-6">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Canales Directos</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:border-blue-200 transition">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">WhatsApp</p>
                  <p className="text-sm font-bold text-slate-700">+57 300 123 4567</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:border-blue-200 transition">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-bold text-slate-700">soporte@paysd.com</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
               <h4 className="font-bold text-blue-800 text-sm mb-2">Preguntas Frecuentes</h4>
               <ul className="space-y-2">
                 <li className="text-xs text-blue-600 hover:underline cursor-pointer">¿Cómo cerrar mi ruta diaria?</li>
                 <li className="text-xs text-blue-600 hover:underline cursor-pointer">Reajuste de intereses en mora</li>
                 <li className="text-xs text-blue-600 hover:underline cursor-pointer">Configuración de pasarela</li>
               </ul>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Abrir un Ticket</h3>
            <form onSubmit={handleSendTicket} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1">Asunto de la consulta</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Problema con reporte de recaudo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1">Detalle del problema</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Describe detalladamente tu situación..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition resize-none"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={ticketStatus !== 'idle'}
                className={`w-full py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-3 ${
                  ticketStatus === 'sent' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {ticketStatus === 'idle' && (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Enviar Solicitud
                  </>
                )}
                {ticketStatus === 'sending' && (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Procesando Ticket...
                  </>
                )}
                {ticketStatus === 'sent' && (
                  <>
                    <i className="fas fa-check"></i>
                    Ticket Enviado con Éxito
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModule;
