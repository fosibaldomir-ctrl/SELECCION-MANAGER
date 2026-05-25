import React, { useState } from 'react';
import { 
  HeartPulse, 
  Plus, 
  Activity, 
  HelpCircle, 
  Calendar, 
  ShieldAlert, 
  Briefcase, 
  Info, 
  Lock, 
  RotateCw 
} from 'lucide-react';
import { InjuryReport, HumanBodyZone, InjurySeverity, InjuryStatus, UserSession, ScoutPlayer } from '../types';

interface MedicalDeskProps {
  injuries: InjuryReport[];
  players: ScoutPlayer[];
  onAddInjury: (report: InjuryReport) => void;
  onUpdateInjury: (report: InjuryReport) => void;
  activeRole: UserSession;
}

export default function MedicalDesk({
  injuries,
  players,
  onAddInjury,
  onUpdateInjury,
  activeRole
}: MedicalDeskProps) {
  // Front / Back Body View
  const [viewBodySide, setViewBodySide] = useState<'front' | 'back'>('front');
  const [selectedZone, setSelectedZone] = useState<HumanBodyZone | null>(null);

  // Form registration states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formPlayerId, setFormPlayerId] = useState('');
  const [formType, setFormType] = useState('');
  const [formSeverity, setFormSeverity] = useState<InjurySeverity>('Media');
  const [formRecovery, setFormRecovery] = useState('2 semanas');
  const [formStatus, setFormStatus] = useState<InjuryStatus>('Lesionado');
  const [formZone, setFormZone] = useState<HumanBodyZone>('rodilla-izq');

  // Permissions gate: Doctors, Physios, and Admins can record reports (Coaches, Scouts read-only)
  const canManageMedical = ['admin', 'doctor', 'physio'].includes(activeRole.role);

  // Filtered injuries based on clicked zone
  const activeZoneInjuries = selectedZone 
    ? injuries.filter(i => i.bodyZone === selectedZone) 
    : injuries;

  // Compute stat counts
  const totalCases = injuries.length;
  const criticalCount = injuries.filter(i => i.severity === 'Alta' && i.status !== 'Disponible').length;
  const rehabCount = injuries.filter(i => i.status === 'Recuperación').length;
  const availableCount = players.length - injuries.filter(i => i.status === 'Lesionado' || i.status === 'Recuperación').length;

  // Handles adding injury incident
  const handleSaveInjury = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageMedical) return;

    const matchedPlayer = players.find(p => p.id === formPlayerId);
    if (!matchedPlayer) {
      alert("Selecciona un jugador válido");
      return;
    }

    const newReport: InjuryReport = {
      id: "inj_" + Date.now(),
      playerId: formPlayerId,
      playerName: `${matchedPlayer.firstName} ${matchedPlayer.lastName}`,
      bodyZone: formZone,
      type: formType.trim(),
      severity: formSeverity,
      date: new Date().toISOString().split('T')[0],
      estimatedRecovery: formRecovery.trim(),
      status: formStatus,
      history: [
        `${new Date().toISOString().split('T')[0]}: Parte médico inicializado por ${activeRole.name}.`
      ]
    };

    onAddInjury(newReport);
    setIsFormOpen(false);
    
    // reset
    setFormType('');
    setFormRecovery('2 semanas');
  };

  const handleUpdateStatus = (report: InjuryReport, newStatus: InjuryStatus) => {
    if (!canManageMedical) return;
    
    const updatedHistory = [...(report.history || [])];
    updatedHistory.push(
      `${new Date().toISOString().split('T')[0]}: Estado clínico modificado a [${newStatus}] por ${activeRole.name}.`
    );

    onUpdateInjury({
      ...report,
      status: newStatus,
      history: updatedHistory
    });
  };

  const getSeverityBadgeColor = (severity: InjurySeverity) => {
    switch (severity) {
      case 'Alta': return 'bg-red-500/10 text-red-400 border-red-500/25';
      case 'Media': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'Baja': return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/15';
    }
  };

  const getStatusBadgeColor = (status: InjuryStatus) => {
    switch (status) {
      case 'Lesionado': return 'bg-red-500 text-slate-950 font-bold';
      case 'Recuperación': return 'bg-blue-500 text-slate-950 font-bold';
      case 'Disponible': return 'bg-emerald-500 text-slate-950 font-bold';
    }
  };

  // Human body zones for quick listing click
  const FRONT_ZONES: Array<{ id: HumanBodyZone; label: string }> = [
    { id: 'cabeza', label: 'Cabeza / Cráneo' },
    { id: 'hombro-izq', label: 'Hombro Izquierdo' },
    { id: 'hombro-der', label: 'Hombro Derecho' },
    { id: 'pecho', label: 'Pectoral / Torso' },
    { id: 'brazo-izq', label: 'Biceps / Antebrazo Izq' },
    { id: 'brazo-der', label: 'Biceps / Antebrazo Der' },
    { id: 'abdomen', label: 'Abdominales / Core' },
    { id: 'cuadriceps-izq', label: 'Cuádriceps Izquierdo' },
    { id: 'cuadriceps-der', label: 'Cuádriceps Derecho' },
    { id: 'rodilla-izq', label: 'Rodilla Izquierda' },
    { id: 'rodilla-der', label: 'Rodilla Derecha' },
    { id: 'tobillo-izq', label: 'Tobillo Izquierdo' },
    { id: 'tobillo-der', label: 'Tobillo Derecho' }
  ];

  const BACK_ZONES: Array<{ id: HumanBodyZone; label: string }> = [
    { id: 'cabeza', label: 'Cervicales / Cabeza' },
    { id: 'espalda-alta', label: 'Dorsales / Espalda Alta' },
    { id: 'lumbar', label: 'Lumbar / Espalda Baja' },
    { id: 'isquios-izq', label: 'Isquiotibiales Izq' },
    { id: 'isquios-der', label: 'Isquiotibiales Der' },
    { id: 'rodilla-izq', label: 'Corva Izquierda knee' },
    { id: 'rodilla-der', label: 'Corva Derecha knee' },
    { id: 'tobillo-izq', label: 'Tendón Aquiles Izq' },
    { id: 'tobillo-der', label: 'Tendón Aquiles Der' }
  ];

  const activeSideZones = viewBodySide === 'front' ? FRONT_ZONES : BACK_ZONES;

  // Checks if a zone has active injuries to show red pulsing overlay
  const getZoneInjuryState = (zone: HumanBodyZone) => {
    const activeZoneOnes = injuries.filter(i => i.bodyZone === zone && i.status !== 'Disponible');
    if (activeZoneOnes.length === 0) return { active: false, color: '' };
    const hasHigh = activeZoneOnes.some(i => i.severity === 'Alta');
    return {
      active: true,
      color: hasHigh ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
    };
  };

  return (
    <div className="space-y-6 animate-fade-in" id="medical-desk-section">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span>Centro Clínico de Gestión de Lesiones</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervisa el estado médico del plantel. Haz clic sobre cualquier parte anatómica del cuerpo para filtrar incidentes agrietados o rellenar un alta médica.
          </p>
        </div>

        <div>
          {canManageMedical ? (
            <button
              onClick={() => {
                setFormZone(selectedZone || 'rodilla-izq');
                setFormPlayerId(players[0]?.id || '');
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 font-bold text-slate-950 text-xs rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Lesión</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Parte Médico Solo Lectura ({activeRole.role.toUpperCase()})</span>
            </div>
          )}
        </div>
      </div>

      {/* Mini medical stats tracker grids */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="medical-stats-ribbon">
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left">
          <div className="text-xs font-mono text-slate-400 uppercase">Aptos en Plantilla</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{availableCount} <span className="text-xs font-normal text-slate-500">/ {players.length}</span></div>
          <p className="text-[10px] text-slate-500 mt-1">Disponibles para juego inmediato</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left">
          <div className="text-xs font-mono text-slate-400 uppercase">Lesionados Críticos</div>
          <div className="text-2xl font-black text-rose-500 mt-1">{criticalCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Con diagnóstico de gravedad alta</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left">
          <div className="text-xs font-mono text-slate-400 uppercase">En Rehabilitación</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{rehabCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Realizando trabajos diferenciados</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left">
          <div className="text-xs font-mono text-slate-400 uppercase">Zonas en Alerta</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {new Set(injuries.filter(i => i.status !== 'Disponible').map(i => i.bodyZone)).size}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Regiones corporales con historial activo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: Anatomical interactive model frame */}
        <div className="lg:col-span-4 bg-slate-905 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between text-center relative bg-slate-900">
          
          <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Silueta Anatómica</span>
            
            {/* Front/Back toggle button */}
            <button
              onClick={() => {
                setViewBodySide(viewBodySide === 'front' ? 'back' : 'front');
                setSelectedZone(null); // reset selected
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 font-mono text-[10px] font-bold border border-slate-800 rounded-lg transition-all"
            >
              <RotateCw className="w-3 h-3 text-slate-400" />
              <span>Vista {viewBodySide === 'front' ? 'TRASERA' : 'FRONTAL'}</span>
            </button>
          </div>

          {/* Interactive BODY canvas illustration mapped with cute buttons */}
          <div className="relative w-full max-w-[200px] h-[360px] bg-slate-950/40 rounded-2xl border border-slate-850 flex items-center justify-center p-4">
            
            {/* SVG of stylized human figure silhouette */}
            <svg 
              className="w-full h-full fill-none stroke-slate-700/60 stroke-2 pointer-events-none"
              viewBox="0 0 100 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="50" cy="20" rx="9" ry="11" /> {/* Head */}
              <line x1="50" y1="31" x2="50" y2="39" /> {/* Neck */}
              
              <path d="M 28 42 L 72 42 L 67 95 L 33 95 Z" /> {/* Torso */}
              
              <path d="M 27 42 L 18 85 L 14 110" /> {/* Left Arm */}
              <path d="M 73 42 L 82 85 L 86 110" /> {/* Right Arm */}

              <path d="M 36 95 L 34 140 L 32 185 L 26 190" /> {/* Left Leg */}
              <path d="M 64 95 L 66 140 L 68 185 L 74 190" /> {/* Right Leg */}

              {/* Knees and Joint circles */}
              <circle cx="34" cy="140" r="4" stroke="rgba(255,255,255,0.1)" />
              <circle cx="66" cy="140" r="4" stroke="rgba(255,255,255,0.1)" />

              {/* Ankles */}
              <circle cx="32" cy="182" r="3" stroke="rgba(255,255,255,0.1)" />
              <circle cx="68" cy="182" r="3" stroke="rgba(255,255,255,0.1)" />
            </svg>

            {/* Clickable Absolute Overlays mapping to HumanBodyZone */}
            {activeSideZones.map((z) => {
              const activeState = getZoneInjuryState(z.id);
              const isSelected = selectedZone === z.id;
              
              // Place buttons absolute positions depending on view
              const getPositionStyles = (zoneId: HumanBodyZone) => {
                switch(zoneId) {
                  case 'cabeza': return { top: '6%', left: '50%' };
                  
                  // Front
                  case 'pecho': return { top: '23%', left: '50%' };
                  case 'abdomen': return { top: '38%', left: '50%' };
                  case 'hombro-izq': return { top: '21%', left: '26%' };
                  case 'hombro-der': return { top: '21%', left: '74%' };
                  case 'brazo-izq': return { top: '39%', left: '20%' };
                  case 'brazo-der': return { top: '39%', left: '80%' };
                  case 'cuadriceps-izq': return { top: '56%', left: '35%' };
                  case 'cuadriceps-der': return { top: '56%', left: '65%' };
                  case 'rodilla-izq': return { top: '70%', left: '34%' };
                  case 'rodilla-der': return { top: '70%', left: '66%' };
                  case 'tobillo-izq': return { top: '91%', left: '32%' };
                  case 'tobillo-der': return { top: '91%', left: '68%' };

                  // Back Only
                  case 'espalda-alta': return { top: '25%', left: '50%' };
                  case 'lumbar': return { top: '40%', left: '50%' };
                  case 'isquios-izq': return { top: '56%', left: '35%' };
                  case 'isquios-der': return { top: '56%', left: '65%' };
                  default: return { top: '50%', left: '50%' };
                }
              };

              const stylePos = getPositionStyles(z.id);

              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white/60 text-[9px] font-bold z-30 transition-all ${
                    isSelected 
                      ? 'bg-emerald-400 scale-150 border-emerald-300 ring-2 ring-emerald-500/40' 
                      : activeState.active 
                        ? activeState.color 
                        : 'bg-slate-800 hover:bg-slate-500'
                  }`}
                  title={`${z.label} ${activeState.active ? '(Lesión activa)' : ''}`}
                  style={stylePos}
                />
              );
            })}

          </div>

          <div className="w-full text-center mt-3 pt-3 border-t border-slate-850">
            {selectedZone ? (
              <div className="text-left bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Filtró por:</span>
                <span className="font-bold text-white block capitalize">{selectedZone.replace('-', ' ')}</span>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-amber-400 hover:underline text-[10px] block mt-1 font-mono"
                >
                  ✕ Quitar Filtro de Zona
                </button>
              </div>
            ) : (
              <p className="text-[11.5px] text-slate-400 leading-snug">
                Haz clic sobre las uniones corporales para filtrar las bajas médicas específicas.
              </p>
            )}
          </div>

        </div>

        {/* Right column: Incidents panel listing active issues and diaries logs */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4" id="medical-cases-directory">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between flex-1">
            
            <div className="space-y-4 select-text">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Historial Clínico Registrado</span>
                </div>
                
                <span className="text-[10px] font-mono text-slate-500">
                  Total de casos mostrados: {activeZoneInjuries.length}
                </span>
              </div>

              {/* Incidents listed */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {activeZoneInjuries.map((injury) => (
                  <div key={injury.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 text-left">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div>
                        <span className="text-sm font-bold text-white block leading-snug">{injury.playerName}</span>
                        <div className="flex gap-1.5 items-center mt-1">
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${getSeverityBadgeColor(injury.severity)}`}>
                            Severidad: {injury.severity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Zona: {injury.bodyZone.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Manual medical buttons to transition state if doctor/physio */}
                      <div className="flex gap-1">
                        {canManageMedical ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(injury, 'Disponible')}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                injury.status === 'Disponible' 
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              Disponible
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(injury, 'Recuperación')}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                injury.status === 'Recuperación' 
                                  ? 'bg-blue-500 text-slate-950 border-blue-400' 
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              Rehab
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(injury, 'Lesionado')}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                injury.status === 'Lesionado' 
                                  ? 'bg-red-500 text-slate-950 border-red-400' 
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              Baja
                            </button>
                          </>
                        ) : (
                          <span className={`inline-block text-[10px] font-mono font-bold uppercase rounded p-1 px-2.5 ${
                            injury.status === 'Disponible' 
                              ? 'bg-emerald-500/15 text-emerald-400' 
                              : injury.status === 'Recuperación' 
                                ? 'bg-blue-500/15 text-blue-400' 
                                : 'bg-red-500/15 text-red-400'
                          }`}>
                            Estado: {injury.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Diagnosis details */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-1 text-xs">
                      <div className="font-bold text-slate-200">Diagnóstico Oficial:</div>
                      <p className="text-slate-400 leading-relaxed italic">"{injury.type}"</p>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
                        <span>F. Ingreso: {injury.date}</span>
                        <span className="text-rose-400 font-semibold">T. estimado recuperación: {injury.estimatedRecovery}</span>
                      </div>
                    </div>

                    {/* Timeline Log details list */}
                    {injury.history && injury.history.length > 0 && (
                      <div className="space-y-1.5 pt-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Bitácora Médica Seguimiento</span>
                        <div className="bg-slate-900/40 rounded-lg p-2 text-[11px] text-slate-400 space-y-1 leading-snug">
                          {injury.history.map((log, idx) => (
                            <div key={idx} className="border-b border-slate-800/40 last:border-0 pb-1 last:pb-0">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {activeZoneInjuries.length === 0 && (
                  <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2 bg-slate-950 rounded-xl">
                    <Activity className="w-10 h-10 text-slate-800 animate-pulse stroke-1" />
                    <p className="text-sm">Ninguna baja médica activa sincronizada con esta zona anatomía.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left pt-4 border-t border-slate-850 mt-4">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Solo el Staff Médico Oficial ({activeRole.role === 'doctor' || activeRole.role === 'physio' ? 'AUTORIZADO' : 'LECTURA'}) puede ingresar reclamos clínicos.</span>
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* DETAILED DIAGNOSIS RECORD FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-rose-950/20 text-left flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Añadir Incidente de Lesión</h3>
                <p className="text-xs text-slate-400">Introduce el diagnóstico de baja o fisioterapia.</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-500 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveInjury} className="p-5 space-y-4 text-left select-none">
              
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Futbolista Afectado</label>
                <select
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500 font-bold"
                  value={formPlayerId}
                  onChange={(e) => setFormPlayerId(e.target.value)}
                >
                  <option value="" disabled>Selecciona jugador...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} • {p.currentClub}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Zona Anatómica</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value as HumanBodyZone)}
                  >
                    <option value="cabeza">Cabeza / Cervicales</option>
                    <option value="hombro-izq">Hombro Izquierdo</option>
                    <option value="hombro-der">Hombro Derecho</option>
                    <option value="pecho">Pectoral</option>
                    <option value="abdomen">Abdomen</option>
                    <option value="brazo-izq">Brazo Izquierdo</option>
                    <option value="brazo-der">Brazo Derecho</option>
                    <option value="cuadriceps-izq">Cuádriceps Izquierdo</option>
                    <option value="cuadriceps-der">Cuádriceps Derecho</option>
                    <option value="isquios-izq">Isquiotibiales Izq</option>
                    <option value="isquios-der">Isquiotibiales Der</option>
                    <option value="rodilla-izq">Rodilla Izquierda</option>
                    <option value="rodilla-der">Rodilla Derecha</option>
                    <option value="tobillo-izq">Tobillo Izquierdo</option>
                    <option value="tobillo-der">Tobillo Derecho</option>
                    <option value="espalda-alta">Espalda Alta</option>
                    <option value="lumbar">Lumbar / Espalda Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Severidad Quirúrgica</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500 font-semibold"
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as InjurySeverity)}
                  >
                    <option value="Baja">Baja (Molestia menor - 1 a 3 días)</option>
                    <option value="Media">Media (Fisioterapia clínica - 1 a 3 semanas)</option>
                    <option value="Alta">Alta (Rotura ligamentaria/ósea - 1 a 6 meses)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Diagnóstico / Tipo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Esguince grado I, Contractura"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Tiempo de Baja Estimado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 10 días, 3 semanas"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500 font-mono"
                    value={formRecovery}
                    onChange={(e) => setFormRecovery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Estado de Partida Inicial</label>
                <select
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as InjuryStatus)}
                >
                  <option value="Lesionado">Lesionado (Inactivo inmediato)</option>
                  <option value="Recuperación">Recuperación (Gimnasio diferenciado)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 font-bold text-slate-950 rounded-xl text-xs transition-colors"
                >
                  Registrar Parte Clínico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
