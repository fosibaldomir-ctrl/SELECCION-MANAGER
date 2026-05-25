import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Dumbbell, 
  Play, 
  Target, 
  Brain, 
  Sparkles, 
  RotateCcw, 
  Lock, 
  Video, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { PDPPlayerPlan, IndividualObjective, UserSession, PlayerPosition } from '../types';

interface PerformancePlansProps {
  pdpPlans: PDPPlayerPlan[];
  onAddObjective: (playerId: string, obj: IndividualObjective) => void;
  onUpdateObjectiveProgress: (playerId: string, objectiveId: string, progress: number) => void;
  onUpdateMetrics: (playerId: string, metrics: { tecnica: number, fisica: number, tactica: number, mentalidad: number }) => void;
  activeRole: UserSession;
}

export default function PerformancePlans({
  pdpPlans,
  onAddObjective,
  onUpdateObjectiveProgress,
  onUpdateMetrics,
  activeRole
}: PerformancePlansProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(pdpPlans[0]?.id || '');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(pdpPlans[0]?.objectives[0]?.videoUrl || null);

  // New Goal Input form states
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalExercise, setNewGoalExercise] = useState('');
  const [newGoalVideo, setNewGoalVideo] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const canManagePlans = ['admin', 'coach', 'physio'].includes(activeRole.role);

  const activePlan = pdpPlans.find(p => p.id === selectedPlanId) || pdpPlans[0];

  const handleUpdateMetricValue = (key: 'tecnica' | 'fisica' | 'tactica' | 'mentalidad', value: number) => {
    if (!canManagePlans) return;
    const newMetrics = {
      ...activePlan.metrics,
      [key]: value
    };
    onUpdateMetrics(activePlan.playerId, newMetrics);
  };

  const handleSaveNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePlans || !newGoalName.trim()) return;

    const newObj: IndividualObjective = {
      id: "obj_" + Date.now(),
      name: newGoalName.trim(),
      progress: 0,
      exercise: newGoalExercise.trim() || "Ejercicios técnicos específicos pautados.",
      videoUrl: newGoalVideo.trim() || "https://www.youtube.com/embed/dQw4w9WgXcQ"
    };

    onAddObjective(activePlan.playerId, newObj);
    setIsAddingGoal(false);

    // reset
    setNewGoalName('');
    setNewGoalExercise('');
    setNewGoalVideo('');
  };

  // Safe YouTube embedding standard
  const getEmbedUrl = (urlStr: string) => {
    if (!urlStr) return '';
    try {
      if (urlStr.includes('/embed/')) return urlStr;
      let videoId = '';
      if (urlStr.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(urlStr.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } else if (urlStr.includes('youtu.be/')) {
        videoId = urlStr.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      return urlStr;
    } catch(e) {
      return urlStr;
    }
  };

  // RADAR GEOMETRY DRAWING HELPERS (Concentric diamond coordinates centered at 110, 110 with radius 80)
  const cx = 110;
  const cy = 110;
  const maxRadius = 75;

  // Let's draw player metrics
  // points layout coordinates scaled by factor out of 100
  const t_y = cy - (activePlan.metrics.tecnica / 100) * maxRadius; // Up
  const f_x = cx + (activePlan.metrics.fisica / 100) * maxRadius;  // Right
  const ta_y = cy + (activePlan.metrics.tactica / 100) * maxRadius; // Down
  const m_x = cx - (activePlan.metrics.mentalidad / 100) * maxRadius; // Left

  const playerPointsPath = `110,${t_y} ${f_x},110 110,${ta_y} ${m_x},110`;

  // Compare squad averages (fixed baseline of 83 on all levels)
  const avg_t_y = cy - 0.83 * maxRadius;
  const avg_f_x = cx + 0.83 * maxRadius;
  const avg_ta_y = cy + 0.83 * maxRadius;
  const avg_m_x = cx - 0.83 * maxRadius;

  const squadAveragePointsPath = `110,${avg_t_y} ${avg_f_x},110 110,${avg_ta_y} ${avg_m_x},110`;

  const getPositionAbbreviation = (pos: PlayerPosition) => {
    switch (pos) {
      case 'DEL': return 'Delantero';
      case 'MED': return 'Centrocampista';
      case 'DEF': return 'Defensor';
      case 'POR': return 'Portero';
    }
  };

  return (
    <div className="space-y-6" id="player-pdp-improvements-section">
      
      {/* Upper header action banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>Plan de Rendimiento y Desarrollo Individual (PDP)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Revisa la evolución de las cualidades psicofiológicas de cada jugador. Modifica métricas en directo, reajusta sliders de objetivos de mejora y revisa guías multimedia.
          </p>
        </div>

        {/* Selected Player profile badge directory switch */}
        <div className="flex items-center gap-2 font-mono">
          <label className="text-xs text-slate-500 font-bold uppercase">Evaluar Jugador:</label>
          <select
            value={selectedPlanId}
            onChange={(e) => {
              setSelectedPlanId(e.target.value);
              const found = pdpPlans.find(p => p.id === e.target.value);
              if (found && found.objectives[0]) {
                setActiveVideoUrl(found.objectives[0].videoUrl || null);
              }
            }}
            className="bg-slate-900 text-slate-200 border border-slate-800 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-bold"
          >
            {pdpPlans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.playerName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left pane: Selected athlete overview stats & high-tech radar diamond */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between" id="player-radar-card">
          
          <div className="space-y-5">
            {/* Athlete profile metadata */}
            <div className="flex items-center gap-4 text-left">
              <img
                referrerPolicy="no-referrer"
                src={activePlan.photo}
                alt={activePlan.playerName}
                className="w-14 h-14 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{activePlan.playerName}</h3>
                <span className="text-xs text-emerald-400 uppercase font-mono font-bold tracking-wider">
                  {getPositionAbbreviation(activePlan.position)} ({activePlan.position})
                </span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Expediente de Alto Rendimiento RFFPA</p>
              </div>
            </div>

            {/* HIGH TECH VECTOR SVG RADAR PLOT CARD */}
            <div className="flex justify-center items-center py-4 bg-slate-950/40 border border-slate-850 rounded-2xl relative select-none">
              
              <svg width="220" height="220" className="overflow-visible select-none">
                {/* Concentric baseline polygons (Concentric Diamonds representing 25%, 50%, 75%, 100%) */}
                {[0.25, 0.50, 0.75, 1.0].map((level, levelIdx) => {
                  const r = maxRadius * level;
                  const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
                  return (
                    <polygon
                      key={levelIdx}
                      points={pts}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1.2"
                      strokeDasharray={level === 1 ? '0' : '2'}
                    />
                  );
                })}

                {/* Polar axis crossing guidelines */}
                <line x1={cx - maxRadius} y1={cy} x2={cx + maxRadius} y2={cy} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1={cx} y1={cy - maxRadius} x2={cx} y2={cy + maxRadius} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Concentric baseline circles metrics indicators */}
                <circle cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.2)" />

                {/* Axis Labels */}
                <text x={cx} y={cy - maxRadius - 6} textAnchor="middle" fill="#94A3B8" className="font-mono font-bold text-[9px] uppercase tracking-wider">Técnica</text>
                <text x={cx + maxRadius + 14} y={cy + 3} textAnchor="start" fill="#94A3B8" className="font-mono font-bold text-[9px] uppercase tracking-wider">Física</text>
                <text x={cx} y={cy + maxRadius + 14} textAnchor="middle" fill="#94A3B8" className="font-mono font-bold text-[9px] uppercase tracking-wider">Táctica</text>
                <text x={cx - maxRadius - 14} y={cy + 3} textAnchor="end" fill="#94A3B8" className="font-mono font-bold text-[9px] uppercase tracking-wider">Mental</text>

                {/* Draw Squad Baseline Average Polygon (Comparison feature) */}
                <polygon
                  points={squadAveragePointsPath}
                  fill="rgba(59, 130, 246, 0.04)"
                  stroke="rgba(59, 130, 246, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="3"
                />

                {/* Draw Actual Selected Athlete Performance Polygon (Glow emerald gradient poly) */}
                <polygon
                  points={playerPointsPath}
                  fill="rgba(16, 185, 129, 0.18)"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  className="transition-all duration-300 filter drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                />

                {/* Point nodes markers */}
                <circle cx={cx} cy={t_y} r="3" fill="#10B981" border="1px solid white" />
                <circle cx={f_x} cy={cy} r="3" fill="#10B981" border="1px solid white" />
                <circle cx={cx} cy={ta_y} r="3" fill="#10B981" border="1px solid white" />
                <circle cx={m_x} cy={cy} r="3" fill="#10B981" border="1px solid white" />
              </svg>

              {/* Legend labels layered absolute */}
              <div className="absolute bottom-2 left-3 flex flex-col gap-1 text-[10px] font-mono text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#10B981] inline-block rounded"></span>
                  <span className="text-slate-300">Rendimiento Actual</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="w-2.5 h-1 border-b border-dashed border-blue-400 inline-block"></span>
                  <span className="text-blue-400">Promedio Selección (83)</span>
                </div>
              </div>

              <div className="absolute top-3 right-4 bg-slate-900 border border-slate-800 p-2 rounded-lg text-right">
                <div className="text-[9px] font-mono text-slate-500 uppercase leading-none">Scoring Prom.</div>
                <div className="text-sm font-black text-emerald-400 mt-1">
                  {((activePlan.metrics.tecnica + activePlan.metrics.fisica + activePlan.metrics.tactica + activePlan.metrics.mentalidad) / 4).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* INTERACTIVE METRIC SLIDERS TO RESCALE SVG ON ACTION */}
            <div className="space-y-3 pt-2 text-left">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-widest border-b border-slate-800 pb-1.5">
                Calibración de Potencial y Fortalezas
              </span>
              
              {!canManagePlans && (
                <div className="bg-purple-950/15 border border-purple-950/20 p-2 rounded-lg flex items-center gap-2 mb-1.5 text-[10px] text-purple-400 font-mono">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Tu rol no permite alterar sliders de métricas fisiológicas.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {([
                  { key: 'tecnica', label: 'Técnica Individual', icon: <Target className="w-3.5 h-3.5 text-slate-400" /> },
                  { key: 'fisica', label: 'Despliegue Físico', icon: <Dumbbell className="w-3.5 h-3.5 text-slate-400" /> },
                  { key: 'tactica', label: 'Comprensión Táctica', icon: <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> },
                  { key: 'mentalidad', label: 'Fortaleza Mental', icon: <Brain className="w-3.5 h-3.5 text-slate-400" /> }
                ] as const).map((met) => (
                  <div key={met.key} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 truncate font-medium">{met.label}</span>
                      <span className="font-mono font-bold text-emerald-400">{(activePlan.metrics as any)[met.key]}%</span>
                    </div>
                    
                    <input
                      type="range"
                      min="10"
                      max="100"
                      disabled={!canManagePlans}
                      value={(activePlan.metrics as any)[met.key]}
                      onChange={(e) => handleUpdateMetricValue(met.key, Number(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-3.5 border-t border-slate-850 text-slate-500 text-[10.5px] text-left leading-relaxed">
            * Mueve los sliders para configurar los objetivos. Las evaluaciones deben calibrarse periódicamente basándose en pautas GPS e informes tácticos.
          </div>
        </div>

        {/* Right pane: Action Objectives with inline progress sliders and media helpers */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6" id="player-goals-pdp-pane">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between flex-1 select-text">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Objetivos de Mejora Individual</span>
                </div>

                {canManagePlans ? (
                  <button
                    onClick={() => setIsAddingGoal(!isAddingGoal)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-[10px] rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Asignar Tarea</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">Lectura PDP Activa</span>
                )}
              </div>

              {/* Form append target if toggled */}
              {isAddingGoal && (
                <form onSubmit={handleSaveNewGoal} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3.5 text-left select-none">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Nombre Corto del Objetivo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Intercepción de líneas o remate cabeza perfil zurdo"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Guía / Vídeo Url de Apoyo</label>
                      <input
                        type="text"
                        placeholder="Ej: https://www.youtube.com/..."
                        value={newGoalVideo}
                        onChange={(e) => setNewGoalVideo(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Ejercicio Técnico sugerido</label>
                      <input
                        type="text"
                        placeholder="Ej. Series de 15 pases filtrados..."
                        value={newGoalExercise}
                        onChange={(e) => setNewGoalExercise(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-1 text-right">
                    <button
                      type="button"
                      onClick={() => setIsAddingGoal(false)}
                      className="px-3 py-1 bg-slate-905 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 rounded font-mono text-[10px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded text-[10px]"
                    >
                      Añadir Objetivo
                    </button>
                  </div>
                </form>
              )}

              {/* Objectives directory listing */}
              <div className="space-y-4">
                {activePlan.objectives.map((obj) => (
                  <div key={obj.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 text-left">
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-white block leading-snug">{obj.name}</span>
                        <p className="text-xs text-slate-400 mt-1 italic">"{obj.exercise}"</p>
                      </div>

                      {/* Display / Play trigger tag if YouTube link present */}
                      {obj.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setActiveVideoUrl(obj.videoUrl || null)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all ${
                            activeVideoUrl === obj.videoUrl 
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm' 
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Guía Deporte</span>
                        </button>
                      )}
                    </div>

                    {/* Progress tracking bar & sliders input to alter values */}
                    <div className="space-y-1.5 bg-slate-900/60 border border-slate-850 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex-1 space-y-1 select-none">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>Seguimiento de cumplimiento:</span>
                          <span className="font-bold text-emerald-400">{obj.progress}%</span>
                        </div>
                        
                        {canManagePlans ? (
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={obj.progress}
                            onChange={(e) => onUpdateObjectiveProgress(activePlan.playerId, obj.id, Number(e.target.value))}
                            className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                          />
                        ) : (
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${obj.progress}%` }}></div>
                          </div>
                        )}
                      </div>

                      {/* Completed Badge Indicator */}
                      <div className="shrink-0 flex items-center justify-end">
                        {obj.progress === 100 ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                            ✓ Superado
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">En progreso</span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}

                {activePlan.objectives.length === 0 && (
                  <p className="text-center text-slate-500 py-12 text-sm italic bg-slate-950 rounded-xl">Sin tareas asignadas aún para este futbolista.</p>
                )}
              </div>
            </div>

            {/* Embed video tutorial pane layered dynamically depending on selected video trigger! */}
            {activeVideoUrl && (
              <div className="pt-4 mt-6 border-t border-slate-850 space-y-2 select-none">
                <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-widest font-bold">
                  Multimedia: Demostración Técnica Incorporada
                </span>
                
                <div className="bg-black aspect-video rounded-xl overflow-hidden relative border border-slate-850 h-56 w-full mx-auto">
                  <iframe
                    className="w-full h-full"
                    src={getEmbedUrl(activeVideoUrl)}
                    title="Guía técnica deportista"
                    allowFullScreen
                  />
                  
                  <button
                    onClick={() => setActiveVideoUrl(null)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/80 border border-slate-800 text-xs text-slate-400 hover:text-white rounded-lg"
                    title="Cerrar reproductor"
                  >
                    Cerrar Vídeo
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
