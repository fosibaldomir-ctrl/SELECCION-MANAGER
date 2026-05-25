import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Dumbbell, 
  HeartPulse, 
  ShieldAlert, 
  TrendingUp, 
  Trophy, 
  Map, 
  Video 
} from 'lucide-react';
import { 
  ScoutPlayer, 
  TrainingSession, 
  InjuryReport, 
  CalendarEvent, 
  UserSession,
  UserRole
} from '../types';

interface DashboardOverviewProps {
  players: ScoutPlayer[];
  trainings: TrainingSession[];
  injuries: InjuryReport[];
  events: CalendarEvent[];
  activeRole: UserSession;
  onNavigate: (tab: string) => void;
  onRoleChange: (roleName: string) => void;
  staffUsers: UserSession[];
  onAddStaff?: (newStaff: UserSession) => void;
}

export default function DashboardOverview({
  players,
  trainings,
  injuries,
  events,
  activeRole,
  onNavigate,
  onRoleChange,
  staffUsers,
  onAddStaff
}: DashboardOverviewProps) {
  
  // State for adding staff members
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('coach');
  const [staffEmail, setStaffEmail] = useState('');

  // Computed values
  const totalScouts = players.length;
  const pendingTrainings = trainings.filter(t => !t.completed).length;
  const completedTrainings = trainings.filter(t => t.completed).length;
  const activeInjuries = injuries.filter(i => i.status !== 'Disponible').length;
  
  // Find next match or event
  const now = new Date();
  const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const nextMatch = sortedEvents.find(e => e.type === 'partido' && new Date(e.start) >= now);
  const nextTraining = sortedEvents.find(e => e.type === 'entrenamiento' && new Date(e.start) >= now);

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'coach': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'scout': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'doctor': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'physio': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getRoleNameInSpanish = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'coach': return 'Entrenador Principal';
      case 'scout': return 'Scout / Analista';
      case 'doctor': return 'Médico General';
      case 'physio': return 'Preparador Físico / Fisioterapeuta';
      default: return role;
    }
  };

  const getRandomSportAvatar = (role: string) => {
    const coachAvatars = [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    ];
    const scoutAvatars = [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    ];
    const doctorAvatars = [
      "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80"
    ];
    const physioAvatars = [
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
    ];
    const adminAvatars = [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    ];

    let source = coachAvatars;
    if (role === 'scout') source = scoutAvatars;
    else if (role === 'doctor') source = doctorAvatars;
    else if (role === 'physio') source = physioAvatars;
    else if (role === 'admin') source = adminAvatars;

    return source[Math.floor(Math.random() * source.length)];
  };

  const handleSubmitStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffName.trim() && staffEmail.trim() && onAddStaff) {
      const avatar = getRandomSportAvatar(staffRole);
      onAddStaff({
        name: staffName,
        role: staffRole,
        email: staffEmail,
        avatar
      });
      setStaffName('');
      setStaffEmail('');
      setIsAddingStaff(false);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-overview-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-emerald-950/30 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-white mb-1">
            Cuerpo Técnico
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Bienvenido al centro táctico oficial de la Real Federación de Fútbol del Principado de Asturias (RFFPA). Coordina convocatorias, diseña sistemas, monitorea entrenamientos y supervisa el alta médica de los futbolistas de la selección asturiana.
          </p>
        </div>

        {/* User Identity / Quick Switcher */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              referrerPolicy="no-referrer"
              src={activeRole.avatar} 
              alt={activeRole.name} 
              className="w-10 h-10 rounded-full border border-slate-700 object-cover"
            />
            <div>
              <div className="text-xs font-mono text-slate-400">Perfil staff activo:</div>
              <div className="text-sm font-semibold text-white">{activeRole.name}</div>
              <span className={`inline-block mt-0.5 text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded border ${getRoleBadgeColor(activeRole.role)}`}>
                {getRoleNameInSpanish(activeRole.role)}
              </span>
            </div>
          </div>
          
          <div className="border-l border-slate-800 pl-3">
            <label className="block text-[10px] font-mono text-slate-500 mb-1">Simular Perfil:</label>
            <select
              value={activeRole.email}
              onChange={(e) => {
                onRoleChange(e.target.value);
              }}
              className="bg-slate-950 text-slate-300 border border-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {staffUsers.map(user => (
                <option key={user.email} value={user.email}>
                  {getRoleNameInSpanish(user.role)} ({user.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cuerpo Técnico Staff Grid & Addition Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6" id="cuerpo-tecnico-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Miembros del Cuerpo Técnico (RFFPA)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Personal directivo, entrenadores, scouters y equipo de medicina deportiva autorizados en Asturias. Haz clic en un perfil para activarlo.
            </p>
          </div>
          
          <button
            onClick={() => setIsAddingStaff(!isAddingStaff)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-slate-950 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 w-full sm:w-auto hover:scale-105 active:scale-95 duration-150 cursor-pointer"
          >
            {isAddingStaff ? 'Cancelar Registro' : 'Añadir Miembro al Staff'}
          </button>
        </div>

        {/* Inline form to add staff member */}
        {isAddingStaff && (
          <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-4 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-lg"></div>
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3">Nuevo Perfil de Staff</h3>
            <form onSubmit={handleSubmitStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono text-slate-400 mb-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Marcelo Bielsa"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono text-slate-400 mb-1">Rol / Cargo Especializado</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="coach">Entrenador Principal</option>
                  <option value="scout">Scout / Analista</option>
                  <option value="doctor">Médico General</option>
                  <option value="physio">Preparador Físico / Fisioterapeuta</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-mono text-slate-400 mb-1">Email Oficial (@rffpa.es)</label>
                <input
                  required
                  type="email"
                  placeholder="Ej: marcelo@rffpa.es"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-slate-950 rounded-lg transition-all cursor-pointer"
                >
                  Confirmar Incorporación
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {staffUsers.map((user) => {
            const isActive = activeRole.email === user.email;
            return (
              <div
                key={user.email}
                onClick={() => onRoleChange(user.email)}
                className={`flex flex-col items-center text-center p-4 rounded-xl cursor-pointer select-none transition-all duration-300 relative group border ${
                  isActive
                    ? 'bg-slate-900 border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.03]'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-850 hover:border-slate-700/80'
                }`}
              >
                {isActive && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                
                <img
                  referrerPolicy="no-referrer"
                  src={user.avatar}
                  alt={user.name}
                  className={`w-12 h-12 rounded-full object-cover mb-2 border transition-all duration-300 group-hover:scale-105 ${
                    isActive ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30' : 'border-slate-850'
                  }`}
                />

                <span className="text-xs font-bold text-white block tracking-tight line-clamp-1 group-hover:text-emerald-300 transition-colors leading-tight">
                  {user.name}
                </span>

                <span className="text-[10px] font-mono text-slate-500 block truncate w-full mt-0.5" title={user.email}>
                  {user.email}
                </span>

                <span className={`inline-block mt-2 text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded border leading-none ${getRoleBadgeColor(user.role)}`}>
                  {getRoleNameInSpanish(user.role)}
                </span>
                
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500 rounded-b-xl opacity-0 mt-3 group-hover:opacity-100 transition-all duration-300"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Numerical Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="overview-metrics-grid">
        <div 
          onClick={() => onNavigate('scouting')}
          className="bg-slate-900 hover:bg-slate-800/80 cursor-pointer border border-slate-800 rounded-xl p-4 transition-all duration-200 group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">Scouting Total</span>
            <div className="p-2 bg-slate-950 text-slate-300 rounded-lg group-hover:text-emerald-400 group-hover:bg-slate-900 transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-sans text-white tracking-tight">{totalScouts}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Futbolistas registrados en radar</span>
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div 
          onClick={() => onNavigate('trainings')}
          className="bg-slate-900 hover:bg-slate-800/80 cursor-pointer border border-slate-800 rounded-xl p-4 transition-all duration-200 group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">Entrenamientos</span>
            <div className="p-2 bg-slate-950 text-slate-300 rounded-lg group-hover:text-emerald-400 group-hover:bg-slate-900 transition-colors">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-sans text-white tracking-tight">{pendingTrainings}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Sesiones pendientes. Completados: {completedTrainings}</span>
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div 
          onClick={() => onNavigate('injuries')}
          className="bg-slate-900 hover:bg-slate-800/80 cursor-pointer border border-slate-800 rounded-xl p-4 transition-all duration-200 group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">Parte Médico</span>
            <div className="p-2 bg-slate-950 text-slate-300 rounded-lg group-hover:text-rose-400 group-hover:bg-slate-900 transition-colors">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-sans text-white tracking-tight">{activeInjuries}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            {activeInjuries > 0 ? (
              <>
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                <span className="text-amber-400/90 font-medium">Bajas activas en tratamiento</span>
              </>
            ) : (
              <span>Plantilla totalmente apta</span>
            )}
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div 
          onClick={() => onNavigate('calendar')}
          className="bg-slate-900 hover:bg-slate-800/80 cursor-pointer border border-slate-800 rounded-xl p-4 transition-all duration-200 group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">Agenda Próxima</span>
            <div className="p-2 bg-slate-950 text-slate-300 rounded-lg group-hover:text-emerald-400 group-hover:bg-slate-900 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-sans text-white tracking-tight">
            {events.filter(e => new Date(e.start) >= now).length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Eventos programados esta semana</span>
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Match Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Siguiente Compromiso</span>
            </div>
            
            {nextMatch ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{nextMatch.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{nextMatch.location}</p>
                </div>
                
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-center">
                  <div>
                    <div className="font-bold text-slate-200 text-sm">España</div>
                    <div className="text-[10px] text-slate-500">Selección</div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded font-mono text-emerald-400 text-xs font-bold uppercase">
                    V. Próximo
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{nextMatch.title.split(':').pop()?.split('vs').pop()?.trim() || "Rival"}</div>
                    <div className="text-[10px] text-slate-500">Adversario</div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha:</span>
                    <span className="font-mono text-slate-300">
                      {new Date(nextMatch.start).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hora:</span>
                    <span className="font-mono text-emerald-400">
                      {new Date(nextMatch.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hay partidos internacionales programados.</p>
            )}
          </div>

          <button 
            onClick={() => onNavigate('calendar')}
            className="w-full text-center py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors mt-auto"
          >
            Abrir Calendario General
          </button>
        </div>

        {/* Live Injury Highlights Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Estado Médico Crítico</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                {injuries.filter(i => i.status === 'Lesionado').length} Operativos de Baja
              </span>
            </div>

            <div className="space-y-3">
              {injuries.filter(i => i.status !== 'Disponible').slice(0, 3).map(injury => (
                <div key={injury.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                    injury.severity === 'Alta' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <div className="w-full min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 truncate">{injury.playerName}</span>
                      <span className={`text-[10px] font-mono font-bold uppercase ${
                        injury.severity === 'Alta' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        S. {injury.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{injury.type}</p>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>Banda: {injury.bodyZone.toUpperCase()}</span>
                      <span className="text-rose-400">Recon: {injury.estimatedRecovery}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {injuries.filter(i => i.status !== 'Disponible').length === 0 && (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No hay incidencias médicas registradas. Toda la plantilla se encuentra en plenas condiciones físicas.
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate('injuries')}
            className="w-full text-center py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors mt-4"
          >
            Abrir Panel Médico Interactivo
          </button>
        </div>

        {/* Quick Tactic Preset Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Esquema Táctico de Campaña</span>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-slate-300 space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 py-1 px-2.5 rounded">
                  4-3-3 Ofensivo
                </span>
                <h4 className="text-base font-bold text-white tracking-tight mt-2">Formación Predeterminada</h4>
              </div>

              {/* Pitch Miniature mockup */}
              <div className="h-20 bg-emerald-950/20 border border-emerald-900/40 rounded-lg relative overflow-hidden flex items-center justify-center">
                {/* Grass lines */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-emerald-800/30"></div>
                <div className="absolute w-12 h-12 border border-emerald-800/30 rounded-full"></div>
                
                {/* Dots representing core block */}
                <span className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" style={{ top: '25%', left: '30%' }}></span>
                <span className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" style={{ top: '50%', left: '46%' }}></span>
                <span className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" style={{ top: '25%', left: '66%' }}></span>
                <span className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" style={{ top: '75%', left: '48%' }}></span>
              </div>

              <p className="text-[11px] text-slate-400 text-left italic leading-relaxed">
                "Presión sobre primer pase. Extremos recortando hacia adentro arrastrando marcas, laterales doblando para centro exterior libre."
              </p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('tactics')}
            className="w-full text-center py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors mt-4"
          >
            Abrir Pizarra Táctica Profesional
          </button>
        </div>

      </div>

      {/* Next Up Training Session and Quick Plan Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Siguiente Sesión de Entrenamiento</span>
        </div>

        {nextTraining ? (
          <div className="flex flex-col md:flex-row gap-5 items-start justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-bold text-blue-400 bg-blue-500/10 border-blue-500/20">
                  {trainings.find(t => t.dateTime === nextTraining.start)?.category || "Físico"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(nextTraining.start).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} • {new Date(nextTraining.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <h4 className="text-base font-bold text-white tracking-tight">{nextTraining.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{nextTraining.description}</p>
            </div>

            <button 
              onClick={() => onNavigate('trainings')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-slate-950 rounded-xl transition-all shadow-md shrink-0 w-full md:w-auto justify-center"
            >
              <Video className="w-4 h-4" />
              <span>Ver Sesión & Material Adicional</span>
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hay entrenamientos programados en agenda hoy.</p>
        )}
      </div>

    </div>
  );
}
