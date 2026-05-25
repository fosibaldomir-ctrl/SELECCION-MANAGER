import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Award, 
  Trophy, 
  Activity, 
  Video, 
  Settings, 
  Map, 
  Menu, 
  X, 
  Clock, 
  Target,
  FileText,
  ShieldCheck,
  Tv,
  Database
} from 'lucide-react';

import { 
  getPlayersFromSupabase, 
  savePlayerToSupabase, 
  deletePlayerFromSupabase, 
  isSupabaseConfigured 
} from './lib/supabase';

import { 
  INITIAL_SCOUT_PLAYERS, 
  INITIAL_TRAINING_SESSIONS, 
  INITIAL_TACTICS, 
  INITIAL_INJURIES, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_PDP_PLANS, 
  MOCK_STAFF_PROFILES 
} from './data/mockData';

import { 
  ScoutPlayer, 
  TrainingSession, 
  TacticalSetup, 
  InjuryReport, 
  CalendarEvent, 
  PDPPlayerPlan, 
  UserSession,
  IndividualObjective 
} from './types';

// Importing Tab Modules
import ScoutingHub from './components/ScoutingHub';
import Trainings from './components/Trainings';
import TacticalBoard from './components/TacticalBoard';
import MedicalDesk from './components/MedicalDesk';
import TeamCalendar from './components/TeamCalendar';
import PerformancePlans from './components/PerformancePlans';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('sele_active_tab');
    if (saved && saved !== 'dashboard') return saved;
    return 'scouting';
  });

  // Mobile sidebar drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Supabase connection and status tracking states
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // Staff Profiles state (dynamic, editable)
  const [staffProfiles, setStaffProfiles] = useState<UserSession[]>(() => {
    const saved = localStorage.getItem('sele_staff_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch(e) {}
    }
    return MOCK_STAFF_PROFILES;
  });

  // Active simulated staff member session
  const [activeRole, setActiveRole] = useState<UserSession>(() => {
    const saved = localStorage.getItem('sele_active_role');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    const profiles = localStorage.getItem('sele_staff_profiles');
    if (profiles) {
      try {
        const parsed = JSON.parse(profiles);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch(e) {}
    }
    return MOCK_STAFF_PROFILES[0]; // default Luis de la Fuente (Coach)
  });

  // Core synchronized States
  const [players, setPlayers] = useState<ScoutPlayer[]>(() => {
    const saved = localStorage.getItem('sele_scout_players');
    return saved ? JSON.parse(saved) : INITIAL_SCOUT_PLAYERS;
  });

  const [trainings, setTrainings] = useState<TrainingSession[]>(() => {
    const saved = localStorage.getItem('sele_trainings');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_SESSIONS;
  });

  const [tactics, setTactics] = useState<TacticalSetup[]>(() => {
    const saved = localStorage.getItem('sele_tactics');
    return saved ? JSON.parse(saved) : INITIAL_TACTICS;
  });

  const [injuries, setInjuries] = useState<InjuryReport[]>(() => {
    const saved = localStorage.getItem('sele_injuries');
    return saved ? JSON.parse(saved) : INITIAL_INJURIES;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('sele_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [pdpPlans, setPdpPlans] = useState<PDPPlayerPlan[]>(() => {
    const saved = localStorage.getItem('sele_pdp_plans');
    return saved ? JSON.parse(saved) : INITIAL_PDP_PLANS;
  });

  // Persistent localStorage backups
  useEffect(() => {
    async function initSupabaseSync() {
      if (isSupabaseConfigured) {
        setSupabaseLoading(true);
        try {
          const remotePlayers = await getPlayersFromSupabase();
          if (remotePlayers !== null) {
            if (remotePlayers.length === 0) {
              console.log("Supabase table contains 0 records, automatic seeding starting...");
              for (const player of INITIAL_SCOUT_PLAYERS) {
                await savePlayerToSupabase(player);
              }
              setPlayers(INITIAL_SCOUT_PLAYERS);
            } else {
              setPlayers(remotePlayers);
            }
            setSupabaseConnected(true);
            setSupabaseError(null);
          } else {
            setSupabaseConnected(false);
            setSupabaseError("Fallo al consultar. Asegúrese de haber corrido el script SQL y haber deshabilitado RLS (Row Level Security) en su panel de Supabase.");
          }
        } catch (err: any) {
          setSupabaseConnected(false);
          setSupabaseError(err.message || "Error al conectar con Supabase");
        } finally {
          setSupabaseLoading(false);
        }
      }
    }
    initSupabaseSync();
  }, []);

  const handleUploadAllToSupabase = async () => {
    if (!isSupabaseConfigured) {
      alert("Aún no ha configurado las variables de Supabase.");
      return;
    }
    setSupabaseLoading(true);
    setSupabaseError(null);
    try {
      let successCount = 0;
      for (const player of players) {
        const ok = await savePlayerToSupabase(player);
        if (ok) successCount++;
      }
      alert(`¡Sincronización completa! Se subieron ${successCount} de ${players.length} jugadores a Supabase con éxito.`);
      setSupabaseConnected(true);
    } catch (err: any) {
      setSupabaseError(err.message || "Error al subir datos");
      alert("Error al subir los datos: " + (err.message || err));
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleDownloadFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    setSupabaseLoading(true);
    setSupabaseError(null);
    try {
      const remotePlayers = await getPlayersFromSupabase();
      if (remotePlayers !== null) {
        setPlayers(remotePlayers);
        setSupabaseConnected(true);
        alert(`¡Completado! Se descargaron ${remotePlayers.length} jugadores desde Supabase.`);
      } else {
        setSupabaseError("Fallo al descargar datos. Revise su tabla y RLS.");
        alert("Fallo al descargar. Revise que la tabla exista y no esté bloqueada por políticas RLS.");
      }
    } catch (err: any) {
      setSupabaseError(err.message || "Error al descargar");
      alert("Error en la descarga: " + (err.message || err));
    } finally {
      setSupabaseLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('sele_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('sele_active_role', JSON.stringify(activeRole));
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('sele_staff_profiles', JSON.stringify(staffProfiles));
  }, [staffProfiles]);

  useEffect(() => {
    localStorage.setItem('sele_scout_players', JSON.stringify(players));
    // When scouting players list updates, keep PDP names aligned in sync
    setPdpPlans(prev => prev.map(plan => {
      const match = players.find(p => p.id === plan.playerId);
      if (match) {
        return {
          ...plan,
          playerName: `${match.firstName} ${match.lastName}`,
          photo: match.photo,
          position: match.position
        };
      }
      return plan;
    }));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('sele_trainings', JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem('sele_tactics', JSON.stringify(tactics));
  }, [tactics]);

  useEffect(() => {
    localStorage.setItem('sele_injuries', JSON.stringify(injuries));
  }, [injuries]);

  useEffect(() => {
    localStorage.setItem('sele_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('sele_pdp_plans', JSON.stringify(pdpPlans));
  }, [pdpPlans]);

  // Sync state mutation triggers across tabs:
  
  // Scouting Handlers
  const handleAddPlayer = async (newPlayer: ScoutPlayer) => {
    setPlayers(prev => [newPlayer, ...prev]);
    if (isSupabaseConfigured) {
      await savePlayerToSupabase(newPlayer);
    }
    
    // Auto-create blank matching PDP plan for consistency
    const newPDP: PDPPlayerPlan = {
      id: "pdp_" + newPlayer.id,
      playerId: newPlayer.id,
      playerName: `${newPlayer.firstName} ${newPlayer.lastName}`,
      position: newPlayer.position,
      photo: newPlayer.photo,
      objectives: [
        {
          id: "ob_init_" + Date.now(),
          name: "Adaptación táctica grupal",
          progress: 30,
          exercise: "Ejercicios de rondos de aclimatación y posicionamiento.",
          videoUrl: "https://www.youtube.com/embed/jZ_vVq4t4Yg"
        }
      ],
      metrics: { tecnica: 80, fisica: 80, tactica: 80, mentalidad: 80 },
      metricsHistory: [
        { date: new Date().toISOString().split('T')[0], tecnica: 80, fisica: 80, tactica: 80, mentalidad: 80 }
      ]
    };
    setPdpPlans(prev => [newPDP, ...prev]);
  };

  const handleUpdatePlayer = async (updatedPlayer: ScoutPlayer) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    if (isSupabaseConfigured) {
      await savePlayerToSupabase(updatedPlayer);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (isSupabaseConfigured) {
      await deletePlayerFromSupabase(playerId);
    }
    // remove matching PDP for sanity
    setPdpPlans(prev => prev.filter(plan => plan.playerId !== playerId));
  };

  // Trainings Handlers
  const handleAddTraining = (newSession: TrainingSession) => {
    setTrainings(prev => [newSession, ...prev]);
    
    // Auto-schedule an item inside the general Calendar as well!
    const hourStart = newSession.dateTime;
    const dateObj = new Date(hourStart);
    dateObj.setHours(dateObj.getHours() + 2); // default 2 hours duration
    const hourEnd = dateObj.toISOString().slice(0, 16);

    const newCalendarEvent: CalendarEvent = {
      id: "ev_sync_" + newSession.id,
      title: `Entrenamiento: ${newSession.title}`,
      type: 'entrenamiento',
      start: hourStart,
      end: hourEnd,
      description: `Sincronizado de entrenamientos. ${newSession.description}`,
      location: "Campo 1 - Ciudad del Fútbol, Las Rozas"
    };
    setCalendarEvents(prev => [newCalendarEvent, ...prev]);
  };

  const handleUpdateTraining = (updatedSession: TrainingSession) => {
    setTrainings(prev => prev.map(t => t.id === updatedSession.id ? updatedSession : t));
  };

  const handleDeleteTraining = (id: string) => {
    setTrainings(prev => prev.filter(t => t.id !== id));
    setCalendarEvents(prev => prev.filter(e => e.id !== "ev_sync_" + id));
  };

  // Tactic Pizarra Handlers
  const handleAddTactic = (newTac: TacticalSetup) => {
    setTactics(prev => [...prev, newTac]);
  };

  const handleUpdateTactic = (updatedTac: TacticalSetup) => {
    setTactics(prev => prev.map(t => t.id === updatedTac.id ? updatedTac : t));
  };

  // Injuries Medical report Handlers
  const handleAddInjury = (newReport: InjuryReport) => {
    setInjuries(prev => [newReport, ...prev]);
    
    // Auto sync an incident into the general team calendar so coaches can foresee missing slots
    const matchEvent: CalendarEvent = {
      id: "ev_med_sync_" + newReport.id,
      title: `Baja Médica: ${newReport.playerName}`,
      type: 'reunión',
      start: `${newReport.date}T09:00`,
      end: `${newReport.date}T10:00`,
      description: `Sincronización médica automática. El jugador ha sido registrado de baja por: ${newReport.type}. Tiempo aproximado: ${newReport.estimatedRecovery}.`,
      location: "Gimnasio Clínico RFFPA"
    };
    setCalendarEvents(prev => [matchEvent, ...prev]);
  };

  const handleUpdateInjury = (updatedReport: InjuryReport) => {
    setInjuries(prev => prev.map(i => i.id === updatedReport.id ? updatedReport : i));
  };

  // Calendar Event manual Handlers
  const handleAddEvent = (newEvent: CalendarEvent) => {
    setCalendarEvents(prev => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  // PDP Handlers
  const handleAddObjective = (playerId: string, obj: IndividualObjective) => {
    setPdpPlans(prev => prev.map(plan => {
      if (plan.playerId === playerId) {
        return {
          ...plan,
          objectives: [...plan.objectives, obj]
        };
      }
      return plan;
    }));
  };

  const handleUpdateObjectiveProgress = (playerId: string, objectiveId: string, progress: number) => {
    setPdpPlans(prev => prev.map(plan => {
      if (plan.playerId === playerId) {
        return {
          ...plan,
          objectives: plan.objectives.map(o => o.id === objectiveId ? { ...o, progress } : o)
        };
      }
      return plan;
    }));
  };

  const handleUpdateMetrics = (playerId: string, metrics: { tecnica: number, fisica: number, tactica: number, mentalidad: number }) => {
    setPdpPlans(prev => prev.map(plan => {
      if (plan.playerId === playerId) {
        const history = [...plan.metricsHistory];
        history.push({
          date: new Date().toISOString().split('T')[0],
          ...metrics
        });
        return {
          ...plan,
          metrics,
          metricsHistory: history
        };
      }
      return plan;
    }));
  };

  // Toggles role instantly from any screen
  const handleRoleChange = (roleOrUser: string | UserSession) => {
    if (typeof roleOrUser === 'string') {
      const found = staffProfiles.find(u => u.role === roleOrUser || u.email === roleOrUser);
      if (found) {
        setActiveRole(found);
      }
    } else {
      setActiveRole(roleOrUser);
    }
  };

  const handleAddStaffMember = (newStaff: UserSession) => {
    setStaffProfiles(prev => {
      const updated = [...prev, newStaff];
      return updated;
    });
  };

  const renderActiveTabContent = () => {
    switch(activeTab) {
      case 'scouting':
        return (
          <ScoutingHub 
            players={players}
            onAddPlayer={handleAddPlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onDeletePlayer={handleDeletePlayer}
            activeRole={activeRole}
          />
        );
      case 'trainings':
        return (
          <Trainings 
            trainings={trainings}
            onAddTraining={handleAddTraining}
            onUpdateTraining={handleUpdateTraining}
            onDeleteTraining={handleDeleteTraining}
            activeRole={activeRole}
          />
        );
      case 'tactics':
        return (
          <TacticalBoard 
            tactics={tactics}
            onAddTactic={handleAddTactic}
            onUpdateTactic={handleUpdateTactic}
            activeRole={activeRole}
          />
        );
      case 'injuries':
        return (
          <MedicalDesk 
            injuries={injuries}
            players={players}
            onAddInjury={handleAddInjury}
            onUpdateInjury={handleUpdateInjury}
            activeRole={activeRole}
          />
        );
      case 'calendar':
        return (
          <TeamCalendar 
            events={calendarEvents}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            activeRole={activeRole}
          />
        );
      case 'performance':
        return (
          <PerformancePlans 
            pdpPlans={pdpPlans}
            onAddObjective={handleAddObjective}
            onUpdateObjectiveProgress={handleUpdateObjectiveProgress}
            onUpdateMetrics={handleUpdateMetrics}
            activeRole={activeRole}
          />
        );
      default:
        return <div className="p-8 text-white">Sección en construcción o inaccesible.</div>;
    }
  };

  // Sidebar link items
  const menuItems = [
    { id: 'scouting', label: 'Scouting', icon: <Award className="w-5 h-5" /> },
    { id: 'trainings', label: 'Entrenamientos', icon: <Video className="w-5 h-5" /> },
    { id: 'tactics', label: 'Pizarra Táctica', icon: <Map className="w-5 h-5" /> },
    { id: 'injuries', label: 'Estado Médico', icon: <Activity className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendario y Agenda', icon: <Calendar className="w-5 h-5" /> },
    { id: 'performance', label: 'Desarrollo Individual (PDP)', icon: <Target className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans select-none" id="applet-main-container">
      
      {/* 1. SIDEBAR LAUNCHER WRAPPER FOR DESKTOP */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-slate-900 border-r border-slate-850 p-5 shrink-0 select-none">
        
        <div className="space-y-6">
          {/* Brand header panel with football shields logo mockup */}
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            
            <div className="text-left">
              <span className="text-sm font-extrabold text-white tracking-wider block">SELECCIÓN PRO</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase" title="Real Federación de Fútbol del Principado de Asturias">Federación RFFPA</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-left">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Identity / Global Role Status */}
        <div className="border-t border-slate-850 pt-4 mt-6">
          <div className="flex items-center gap-3 text-left">
            <img 
              referrerPolicy="no-referrer"
              src={activeRole.avatar} 
              alt={activeRole.name} 
              className="w-9 h-9 rounded-full object-cover border border-slate-800 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">{activeRole.name}</span>
              <span className="text-[9px] font-mono text-emerald-400/80 block uppercase tracking-wilder leading-tight truncate">
                {activeRole.role.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 mt-3 text-[10px] flex items-center gap-1.5 text-slate-500 text-center font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistema Blindado SSL</span>
          </div>

          {/* Supabase status display card */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 mt-2 text-[10px] space-y-2.5 font-mono text-left">
            <div className="flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1.5">
                <Database className={`w-3.5 h-3.5 ${supabaseConnected ? 'text-emerald-400' : 'text-amber-500'}`} />
                <span className="font-bold text-slate-200">Supabase SQL Sync</span>
              </div>
              {supabaseLoading ? (
                <span className="text-[9px] text-emerald-400 animate-pulse">(Conectando...)</span>
              ) : (
                <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${
                  supabaseConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {supabaseConnected ? 'En la nube' : 'Local / Offline'}
                </span>
              )}
            </div>

            {/* Manual Sync Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleUploadAllToSupabase}
                disabled={supabaseLoading}
                className="py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/35 rounded-lg font-bold text-[8px] tracking-wide cursor-pointer flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <span>⬆️ Subir Locales</span>
              </button>
              <button
                onClick={handleDownloadFromSupabase}
                disabled={supabaseLoading}
                className="py-1.5 px-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/35 rounded-lg font-bold text-[8px] tracking-wide cursor-pointer flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <span>⬇️ Bajar Nube</span>
              </button>
            </div>

            {supabaseError && (
              <div className="text-[9px] text-rose-400 bg-rose-500/5 p-2 rounded-lg border border-rose-500/15 leading-relaxed">
                <span className="font-bold block mb-0.5">⚠️ Error en la base de datos:</span>
                {supabaseError}
              </div>
            )}

            {/* Collapsible SQL Setup Guide */}
            <div className="pt-1.5 border-t border-slate-850">
              <button
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="w-full text-slate-400 hover:text-white flex items-center justify-between font-bold text-[9px] py-1 cursor-pointer transition-colors"
              >
                <span>🛠️ VER SCRIPT SQL / FIX RLS</span>
                <span>{showSqlGuide ? '▲ Ocultar' : '▼ Mostrar'}</span>
              </button>

              {showSqlGuide && (
                <div className="mt-2 space-y-2 text-[9px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-850 leading-relaxed font-sans max-h-48 overflow-y-auto">
                  <p className="text-amber-400 font-bold mb-1">💡 ¿Por qué no se ven los registros?</p>
                  <p className="mb-2">
                    En Supabase, debes crear la tabla con el esquema exacto y **deshabilitar RLS** (Row Level Security) o añadir una política pública para poder leer/escribir usando la clave anónima.
                  </p>
                  
                  <p className="text-white font-bold text-[8px] uppercase tracking-wider mt-1.5">Instrucciones:</p>
                  <ol className="list-decimal pl-4.5 space-y-1 text-slate-300">
                    <li>Abre el **SQL Editor** en tu panel de Supabase.</li>
                    <li>Pega el código SQL de abajo y presiona **Run**.</li>
                    <li>¡Listo! Luego haz clic en el botón <strong className="text-emerald-400 text-[8px]">⬆️ Subir Locales</strong> arriba para poblar la base de datos de inmediato.</li>
                  </ol>

                  <div className="mt-3 relative">
                    <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">Instrucción SQL a Ejecutar:</span>
                    <pre className="text-[7.5px] font-mono select-all bg-slate-900 text-slate-300 p-2 rounded border border-slate-800 overflow-x-auto whitespace-pre leading-normal">
{`-- 1. Crear Tabla
CREATE TABLE IF NOT EXISTS scout_players (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  birth_date TEXT,
  selectable_category TEXT,
  position TEXT,
  position_full TEXT,
  current_club TEXT,
  nationality TEXT,
  preferred_foot TEXT,
  rating NUMERIC,
  photo TEXT,
  notes TEXT,
  stats JSONB,
  attributes JSONB,
  follow_up_history JSONB DEFAULT '[]'::jsonb,
  match_history JSONB DEFAULT '[]'::jsonb,
  injury_history JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  club_crest_url TEXT,
  scouting_status TEXT,
  scout_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DESHABILITAR RLS SI ESTÁ BLOQUEADO (¡CRÍTICO!)
ALTER TABLE scout_players DISABLE ROW LEVEL SECURITY;`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </aside>

      {/* 2. MOBILE HEADER BAR PANEL */}
      <header className="md:hidden bg-slate-900 border-b border-slate-850 p-4 px-5 flex items-center justify-between shrink-0 select-none">
        
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-extrabold text-white tracking-widest uppercase">SELECCIÓN PRO</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </header>

      {/* 3. MOBILE SYSTEM SLIDE OUT DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between p-6 select-none animate-slide-in">
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <span className="text-[10px] font-black tracking-widest text-emerald-400 font-mono">MENÚ TÁCTICO</span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <nav className="space-y-2 text-left">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User badge mobile */}
          <div className="border-t border-slate-850 pt-4 flex items-center gap-3 text-left">
            <img 
              referrerPolicy="no-referrer"
              src={activeRole.avatar} 
              alt={activeRole.name} 
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div>
              <div className="text-sm font-bold text-white">{activeRole.name}</div>
              <div className="text-xs font-mono text-slate-500 uppercase">{activeRole.role}</div>
            </div>
          </div>

        </div>
      )}

      {/* 4. MAIN CENTRAL CONTENT BODY WRAPPER */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" id="applet-viewport-workbench">
        
        {/* Top visual navigation path indicators / Clock ribbon */}
        <div className="hidden sm:flex items-center justify-between mb-6 pointer-events-none select-none text-left">
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span>RFFPA</span>
            <span>/</span>
            <span className="text-slate-400 capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-slate-500 text-xs text-right">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Zona Horaria Oficial: Madrid UTC+1</span>
          </div>

        </div>

        {/* Active rendered module */}
        <div className="relative z-10" id="rendered-view-card">
          {renderActiveTabContent()}
        </div>

      </main>

    </div>
  );
}
