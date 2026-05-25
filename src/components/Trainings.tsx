import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  CheckCircle2, 
  HelpCircle, 
  Video, 
  Clock, 
  Tag, 
  Trash2, 
  FileText, 
  Lock 
} from 'lucide-react';
import { TrainingSession, TrainingCategory, UserSession } from '../types';

interface TrainingsProps {
  trainings: TrainingSession[];
  onAddTraining: (session: TrainingSession) => void;
  onUpdateTraining: (session: TrainingSession) => void;
  onDeleteTraining: (id: string) => void;
  activeRole: UserSession;
  autoOpenModal?: boolean;
  onModalOpenFinished?: () => void;
}

export default function Trainings({
  trainings,
  onAddTraining,
  onUpdateTraining,
  onDeleteTraining,
  activeRole,
  autoOpenModal,
  onModalOpenFinished
}: TrainingsProps) {
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>(trainings[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if (autoOpenModal) {
      setIsModalOpen(true);
      if (onModalOpenFinished) {
        onModalOpenFinished();
      }
    }
  }, [autoOpenModal, onModalOpenFinished]);
  const [filterCategory, setFilterCategory] = useState<'ALL' | TrainingCategory>('ALL');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDateTime, setFormDateTime] = useState('');
  const [formCategory, setFormCategory] = useState<TrainingCategory>('Táctico');
  const [formDescription, setFormDescription] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');

  // Who can customize workouts: Coach, Physio/Trainer and Admin. (Doctors, Scouts are Read-Only)
  const canManageWorkouts = ['admin', 'coach', 'physio'].includes(activeRole.role);

  const selectedTraining = trainings.find(t => t.id === selectedTrainingId) || trainings[0];

  const handleToggleComplete = (session: TrainingSession, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting if checking
    if (!canManageWorkouts) return;
    onUpdateTraining({
      ...session,
      completed: !session.completed
    });
  };

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageWorkouts) return;

    const newSession: TrainingSession = {
      id: "t_" + Date.now(),
      title: formTitle.trim(),
      dateTime: formDateTime || new Date().toISOString().slice(0, 16),
      category: formCategory,
      description: formDescription.trim(),
      videoUrl: formVideoUrl.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ', // default placeholder
      completed: false
    };

    onAddTraining(newSession);
    setSelectedTrainingId(newSession.id);
    setIsModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormDateTime('');
    setFormCategory('Táctico');
    setFormDescription('');
    setFormVideoUrl('');
  };

  // Convert typical youtube links to embed links safely
  const getEmbedUrl = (urlStr: string) => {
    if (!urlStr) return '';
    try {
      // If already embed, keep it
      if (urlStr.includes('/embed/')) return urlStr;
      
      let videoId = '';
      if (urlStr.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(urlStr.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } else if (urlStr.includes('youtu.be/')) {
        videoId = urlStr.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // For Vimeo
      if (urlStr.includes('vimeo.com/')) {
        const vId = urlStr.split('vimeo.com/')[1]?.split('?')[0];
        if (vId) return `https://player.vimeo.com/video/${vId}`;
      }
      return urlStr;
    } catch (e) {
      return urlStr;
    }
  };

  const getCategoryColor = (cat: TrainingCategory) => {
    switch (cat) {
      case 'Táctico': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Técnico': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Físico': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Estrategia': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  const filteredTrainings = trainings.filter(t => filterCategory === 'ALL' || t.category === filterCategory);

  return (
    <div className="space-y-6" id="training-management-section">
      
      {/* Upper header action banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div className="text-left">
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-400" />
            <span>Biblioteca de Entrenamientos y Planificación</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Diseña entrenamientos tácticos, técnicos, físicos y preparatorios de estrategia. Adjunta vídeo-ejercicios interactivos de YouTube para el plantel.
          </p>
        </div>

        <div>
          {!canManageWorkouts && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Planes de Solo Lectura ({activeRole.role.toUpperCase()})</span>
            </div>
          )}
        </div>
      </div>

      {/* Main categories / segments directly inside the Workout Library section */}
      <div className="bg-slate-900 border border-slate-850 p-2 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2 px-2 text-slate-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Módulos de la Biblioteca:</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'Táctico', 'Técnico', 'Físico', 'Estrategia'].map((cat) => {
            const isActive = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 text-slate-450 hover:text-white border-slate-850 hover:border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'Todos los Entrenos' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main split work bench grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Sessions Directory */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* List content list view */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2" id="training-sessions-list">
            {filteredTrainings.map((session) => {
              const dateObj = new Date(session.dateTime);
              const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
              const formattedTime = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const isSelected = selectedTrainingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedTrainingId(session.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3 relative text-left group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-slate-900 to-slate-850/40 border-slate-700 shadow-md' 
                      : 'bg-slate-900 hover:bg-slate-850/80 border-slate-850'
                  }`}
                >
                  {/* Status checklist trigger badge */}
                  <button
                    onClick={(e) => handleToggleComplete(session, e)}
                    disabled={!canManageWorkouts}
                    className={`mt-0.5 shrink-0 transition-all ${
                      session.completed 
                        ? 'text-emerald-400 scale-110' 
                        : canManageWorkouts 
                          ? 'text-slate-650 hover:text-emerald-400' 
                          : 'text-slate-700 cursor-not-allowed'
                    }`}
                    title={session.completed ? "Volver a marcar pendiente" : "Marcar entrenamiento completado"}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${session.completed ? 'fill-emerald-500/10' : ''}`} />
                  </button>

                  <div className="min-w-0 w-full">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${getCategoryColor(session.category)}`}>
                        {session.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{formattedDate} • {formattedTime}</span>
                      </div>
                    </div>

                    <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-emerald-400' : 'text-slate-200 group-hover:text-emerald-400'}`}>
                      {session.title}
                    </h4>
                    
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{session.description}</p>
                  </div>

                  {/* Optional Delete Button for Staff with permissions */}
                  {canManageWorkouts && isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar sesión de entreno "${session.title}"?`)) {
                          onDeleteTraining(session.id);
                        }
                      }}
                      className="absolute bottom-2.5 right-2.5 p-1 bg-rose-950/15 border border-rose-900/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded transition-colors"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {filteredTrainings.length === 0 && (
              <p className="text-center text-slate-500 py-12 text-sm bg-slate-900 border border-slate-850 rounded-xl">
                Ninguna sesión programada en esta categoría.
              </p>
            )}
          </div>

        </div>

        {/* Right Side: Material Detail Visualizer */}
        <div className="lg:col-span-7" id="training-media-player-container">
          {selectedTraining ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between h-full min-h-[500px]">
              
              {/* Header Details */}
              <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950/40 select-text text-left">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getCategoryColor(selectedTraining.category)}`}>
                    Sesión {selectedTraining.category}
                  </span>
                  
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(selectedTraining.dateTime).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{selectedTraining.title}</h3>
                
                {selectedTraining.completed && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded">
                    ✓ Sesión Completada
                  </span>
                )}
              </div>

              {/* Embedded video player screen or custom state empty */}
              <div className="bg-black aspect-video relative flex-1 flex items-center justify-center">
                {selectedTraining.videoUrl ? (
                  <iframe
                    className="w-full h-full object-cover"
                    src={getEmbedUrl(selectedTraining.videoUrl)}
                    title={selectedTraining.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center text-slate-600 px-4 py-12 space-y-2">
                    <Play className="w-12 h-12 text-slate-700 mx-auto stroke-1" />
                    <p className="text-sm">Sin recurso multimedia alojado</p>
                  </div>
                )}
              </div>

              {/* Drill description notes details */}
              <div className="p-5 bg-slate-950/60 border-t border-slate-800 text-left space-y-3">
                <h5 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Detalles Ejecutivos y Consignas</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed select-text whitespace-pre-wrap">
                  {selectedTraining.description}
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl h-full flex flex-col items-center justify-center text-center p-12 text-slate-500">
              <HelpCircle className="w-12 h-12 text-slate-750 stroke-1 mb-2" />
              <p>Selecciona una sesión de entrenamiento para reproducir sus detalles tácticos e instrucciones.</p>
            </div>
          )}
        </div>

      </div>

      {/* SCHEDULE MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950/10 text-left flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Planificar Sesión Colectiva</h3>
                <p className="text-xs text-slate-400">Inserta los campos obligatorios del entrenamiento.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-500 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveTraining} className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Nombre o Título de la Sesión</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salidas fluidas o resistencia explosiva ráfagas"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    value={formDateTime}
                    onChange={(e) => setFormDateTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Categoría Pedagógica</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TrainingCategory)}
                  >
                    <option value="Táctico">Táctico</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Físico">Físico</option>
                    <option value="Estrategia">Estrategia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Vídeo URL (YouTube / Vimeo de apoyo)</label>
                <input
                  type="text"
                  placeholder="Ej: https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 placeholder-slate-655"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Foco de Entrenamiento e Instrucciones (Markdown / Texto)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe la secuencia del entrenamiento: rondos iniciales 15min, bloque central de posesión 45min, carrera regenerativa..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 resize-y"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 font-bold text-slate-950 rounded-xl text-xs transition-colors"
                >
                  Confirmar Planificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
