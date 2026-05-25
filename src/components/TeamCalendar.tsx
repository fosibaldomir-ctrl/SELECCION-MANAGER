import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Plus, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Lock, 
  Trash2, 
  Map 
} from 'lucide-react';
import { CalendarEvent, CalendarEventType, UserSession } from '../types';

interface TeamCalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  activeRole: UserSession;
}

export default function TeamCalendar({
  events,
  onAddEvent,
  onDeleteEvent,
  activeRole
}: TeamCalendarProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Set default calendar focus on May 2026 (as per prompt clock May 21, 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(4); // 0-indexed (4 is May)

  const [selectedDay, setSelectedDay] = useState<number | null>(21); // active focus May 21
  const [activeEventDetails, setActiveEventDetails] = useState<CalendarEvent | null>(events[0] || null);
  
  // Create event form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEventType>('entrenamiento');
  const [formStartDate, setFormStartDate] = useState('2026-05-21T10:00');
  const [formEndDate, setFormEndDate] = useState('2026-05-21T12:00');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('Ciudad del Fútbol, Las Rozas');

  const canEditCalendar = ['admin', 'coach', 'physio'].includes(activeRole.role);

  // May 2026 grid configuration helper
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Days in May 2026: 31 days. May 1st, 2026 starts on a Friday (5).
  // Offset of starting day: 5 empty cells
  const daysInMonth = 31;
  const startOffset = 5;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const getEventBadgeClass = (type: CalendarEventType) => {
    switch (type) {
      case 'partido': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'entrenamiento': return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'reunión': return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
      case 'viaje': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    }
  };

  const getEventDotColor = (type: CalendarEventType) => {
    switch (type) {
      case 'partido': return 'bg-amber-400';
      case 'entrenamiento': return 'bg-blue-400';
      case 'reunión': return 'bg-purple-400';
      case 'viaje': return 'bg-emerald-300';
    }
  };

  // Filter events of specific day
  const getDayEvents = (dayNum: number) => {
    // Format target date: "2026-05-XX"
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const matchPrefix = `${currentYear}-${monthStr}-${dayStr}`;
    
    return events.filter(e => e.start.startsWith(matchPrefix));
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCalendar) return;

    const newEvent: CalendarEvent = {
      id: "ev_" + Date.now(),
      title: formTitle.trim(),
      type: formType,
      start: formStartDate,
      end: formEndDate,
      description: formDescription.trim(),
      location: formLocation.trim() || undefined
    };

    onAddEvent(newEvent);
    setActiveEventDetails(newEvent);
    setIsModalOpen(false);

    // reset
    setFormTitle('');
    setFormDescription('');
  };

  const selectedDayEvents = selectedDay ? getDayEvents(selectedDay) : [];

  return (
    <div className="space-y-6 animate-fade-in" id="team-calendar-section">
      
      {/* Top Banner and triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <span>Calendario del Equipo y Logística</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Revisa convocatorias, partidos amistosos, sesiones tácticas de entrenamiento y traslados de la expedición.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEditCalendar ? (
            <button
              onClick={() => {
                const dayPrefix = selectedDay ? String(selectedDay).padStart(2, '0') : '21';
                setFormStartDate(`2026-05-${dayPrefix}T10:00`);
                setFormEndDate(`2026-05-${dayPrefix}T12:00`);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-600 font-bold text-slate-950 text-xs rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Evento</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Agenda Solo Lectura ({activeRole.role.toUpperCase()})</span>
            </div>
          )}
        </div>
      </div>

      {/* Split main layout details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left pane: Calendar core Grid board */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900 border border-slate-850 rounded-2xl p-4">
          
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between pointer-events-auto mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 px-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <h3 className="text-sm font-bold font-mono text-white tracking-widest uppercase">
                {monthNames[currentMonth]} {currentYear}
              </h3>

              <button
                onClick={handleNextMonth}
                className="p-1 px-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View selectors */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[10px] font-mono leading-none font-bold">
              {[
                { id: 'month', label: 'Mensual' },
                { id: 'week', label: 'Semanal' },
                { id: 'day', label: 'Diario' }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all uppercase ${
                    viewMode === v.id ? 'bg-slate-805 bg-slate-800 text-emerald-400 font-black' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'month' && (
            /* Standard Grid Month Cell view */
            <div className="space-y-1">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] uppercase font-bold text-slate-500 tracking-wider pb-1">
                {dayNames.map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Grid block days */}
              <div className="grid grid-cols-7 gap-1.5" id="monthly-days-grid">
                
                {/* Pad preceding empty days */}
                {Array.from({ length: startOffset }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="bg-slate-950/20 aspect-square border border-transparent rounded-lg"></div>
                ))}

                {/* Draw month calendar days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayEvents = getDayEvents(dayNum);
                  const isDaySelected = selectedDay === dayNum;
                  
                  // Today marker (Highlight May 21, 2026)
                  const isToday = dayNum === 21 && currentMonth === 4 && currentYear === 2026;

                  return (
                    <div
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`aspect-square border rounded-xl p-1.5 flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-850 h-16 relative ${
                        isDaySelected 
                          ? 'border-purple-500/80 bg-slate-850/40 shadow-inner' 
                          : isToday 
                            ? 'border-emerald-500/80 bg-emerald-950/10' 
                            : 'border-slate-850 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      {/* Top ribbon of cell */}
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-mono font-bold ${
                          isToday ? 'text-emerald-400 bg-emerald-500/10 rounded-full px-1.5' : isDaySelected ? 'text-purple-400 font-extrabold' : 'text-slate-400'
                        }`}>
                          {dayNum}
                        </span>

                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Hoy"></span>
                        )}
                      </div>

                      {/* Cell events badge indicator list */}
                      <div className="flex gap-1 overflow-x-hidden pt-1 max-w-full justify-start items-center">
                        {dayEvents.slice(0, 3).map((e, evIdx) => (
                          <span
                            key={e.id}
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              setSelectedDay(dayNum);
                              setActiveEventDetails(e);
                            }}
                            className={`w-2 h-2 rounded-full shrink-0 ${getEventDotColor(e.type)} hover:scale-125 transition-transform`}
                            title={e.title}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[8px] font-bold text-slate-500 leading-none">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {viewMode === 'week' && (
            /* Granular Week Time Blocks simulation */
            <div className="bg-slate-950/30 rounded-xl p-4 text-left border border-slate-850 space-y-4">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Agenda de la semana (21 Jue al 27 Mié Mayo)</span>
              
              <div className="space-y-2.5">
                {[21, 22, 23, 24, 25, 26, 27].map((dayNum) => {
                  const dayEvents = getDayEvents(dayNum);
                  
                  return (
                    <div key={dayNum} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start gap-4">
                      <div className="text-center shrink-0 w-11 border-r border-slate-800 pr-3">
                        <div className="text-xs font-mono text-slate-500">
                          {dayNum === 21 ? 'Jue' : dayNum === 22 ? 'Vie' : dayNum === 23 ? 'Sáb' : dayNum === 24 ? 'Dom' : dayNum === 25 ? 'Lun' : dayNum === 26 ? 'Mar' : 'Mié'}
                        </div>
                        <div className="text-base font-bold text-slate-200 mt-0.5">{dayNum}</div>
                      </div>

                      <div className="flex-1 space-y-2">
                        {dayEvents.map(e => (
                          <div
                            key={e.id}
                            onClick={() => {
                              setSelectedDay(dayNum);
                              setActiveEventDetails(e);
                            }}
                            className={`p-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-500/40 text-xs flex items-center justify-between gap-3 ${getEventBadgeClass(e.type)}`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate leading-snug">{e.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{e.location || "Sede Principal RFFPA"}</span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-mono font-bold block">
                                {new Date(e.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}

                        {dayEvents.length === 0 && (
                          <span className="text-[11px] text-slate-500 italic block py-1">Sin compromisos deportivos programados para esta jornada.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            /* General day timeline events */
            <div className="bg-slate-950/35 rounded-xl p-4 text-left border border-slate-850 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">CRONOGRAMA DE HOY - MAYO {selectedDay || 21}</span>
              
              <div className="divide-y divide-slate-850/80">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map(e => (
                    <div 
                      key={e.id}
                      onClick={() => setActiveEventDetails(e)}
                      className="py-3.5 first:pt-0 last:pb-0 cursor-pointer group flex items-start gap-4"
                    >
                      <div className="text-sm font-mono text-emerald-400 font-bold shrink-0 w-16">
                        {new Date(e.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`inline-block text-[9px] uppercase font-mono px-2 py-0.5 rounded border mb-1 ${getEventBadgeClass(e.type)}`}>
                          {e.type}
                        </span>
                        
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 truncate leading-snug">{e.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">{e.description}</p>
                        
                        {e.location && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{e.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-12 text-sm italic">Sin eventos agendados para este día. Utiliza el creador de arriba para programar uno.</p>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-850 mt-3 text-left">
            <span className="text-[11px] text-slate-500">
              * Agenda coordinada con el sistema de planificación táctica. Las sesiones tácticas se sincronizan automáticamente en el listado de videos.
            </span>
          </div>
        </div>

        {/* Right pane: Focus detailed Event Cards with delete option */}
        <div className="lg:col-span-4" id="event-details-focus-pane">
          {activeEventDetails ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getEventBadgeClass(activeEventDetails.type)}`}>
                    Foco: {activeEventDetails.type}
                  </span>
                  
                  {canEditCalendar && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar evento "${activeEventDetails.title}" del calendario general?`)) {
                          onDeleteEvent(activeEventDetails.id);
                          setActiveEventDetails(events.find(e => e.id !== activeEventDetails.id) || null);
                        }
                      }}
                      className="p-1 px-2.5 bg-rose-950/15 border border-rose-900/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-mono"
                      title="Eliminar evento"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">{activeEventDetails.title}</h3>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {new Date(activeEventDetails.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} a 
                      {new Date(activeEventDetails.end).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}  
                    </span>
                  </div>
                </div>

                {activeEventDetails.location && (
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-white font-mono uppercase text-[9px] text-slate-500 mb-0.5">Emplazamiento</span>
                      {activeEventDetails.location}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Descripción o Programa</span>
                  <p className="text-xs text-slate-400 bg-slate-950/45 border border-slate-850 rounded-xl p-3.5 whitespace-pre-wrap leading-relaxed italic select-text">
                    "{activeEventDetails.description}"
                  </p>
                </div>
              </div>

              {/* Manual Rescheduling Simulation Slider (Pro feature for calendar interaction) */}
              {canEditCalendar && (
                <div className="pt-4 mt-6 border-t border-slate-850 space-y-2 select-none">
                  <h6 className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Herramientas de Planificación</span>
                  </h6>
                  <p className="text-[11px] text-slate-500">¿Re-agendar evento a otro día de Mayo?</p>
                  
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={selectedDay || 21}
                      onChange={(changeEv) => {
                        const newDay = Number(changeEv.target.value);
                        setSelectedDay(newDay);
                        
                        // Reschedule simulation
                        const dayStr = String(newDay).padStart(2, '0');
                        onDeleteEvent(activeEventDetails.id);
                        const rescheduled = {
                          ...activeEventDetails,
                          id: activeEventDetails.id,
                          start: `2026-05-${dayStr}T10:00`,
                          end: `2026-05-${dayStr}T12:00`,
                        };
                        onAddEvent(rescheduled);
                        setActiveEventDetails(rescheduled);
                      }}
                      className="bg-slate-950 border border-slate-850 text-emerald-400 font-bold font-mono px-2 py-1.5 text-xs rounded-xl focus:outline-none w-20 text-center"
                    />
                    <div className="text-[10px] text-slate-400 flex items-center">
                      Modificar día (Mayo) y reubicación automática.
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-10 text-center text-slate-500 h-full flex flex-col justify-center items-center">
              <CalendarIcon className="w-12 h-12 text-slate-800 stroke-1 mb-2" />
              <p className="text-xs">Usa el calendario mensual de la izquierda para desplegar los detalles y ubicaciones de los eventos.</p>
            </div>
          )}
        </div>

      </div>

      {/* CREATE EVENT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-purple-950/20 text-left flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Planificar Nuevo Compromiso</h3>
                <p className="text-xs text-slate-400">Inserta los campos obligatorios para agendar en el calendario.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-500 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-4 text-left select-none">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Título del Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Amistoso vs Italia o sesión regenerativa piscina"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Categoría de Compromiso</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 font-semibold"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as CalendarEventType)}
                  >
                    <option value="entrenamiento">Entrenamiento (Técnico/Colectivo)</option>
                    <option value="partido">Partido (Amistoso/Oficial)</option>
                    <option value="reunión">Reunión (Análisis de vídeo/Pizarra)</option>
                    <option value="viaje">Viaje (Traslados y Concentraciones)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Ubicación / Campo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Campo 1 Las Rozas o Hotel Berlín"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Inicio (Fecha y Hora)</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Fin (Fecha y Hora)</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Detalles, Taxis o Tácticas Clave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escribe el itinerario detallado, jugadores convocados..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 resize-y"
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
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 font-bold text-slate-950 rounded-xl text-xs transition-colors"
                >
                  Agendar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
