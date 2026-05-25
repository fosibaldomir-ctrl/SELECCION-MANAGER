import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  MapPin, 
  Save, 
  RefreshCw, 
  Download, 
  Palette, 
  Paintbrush, 
  Eraser, 
  CheckCircle, 
  Lock, 
  FileText 
} from 'lucide-react';
import { TacticalSetup, TacticalFormation, TacticalPlayer, UserSession } from '../types';
import { PRESETS_FORMATIONS } from '../data/mockData';
import { exportTacticsToPDF } from '../utils/pdfGenerator';

interface TacticalBoardProps {
  tactics: TacticalSetup[];
  onAddTactic: (tactic: TacticalSetup) => void;
  onUpdateTactic: (tactic: TacticalSetup) => void;
  activeRole: UserSession;
}

export default function TacticalBoard({
  tactics,
  onAddTactic,
  onUpdateTactic,
  activeRole
}: TacticalBoardProps) {
  const [selectedTacticId, setSelectedTacticId] = useState<string>(tactics[0]?.id || '');
  const activeTactic = tactics.find(t => t.id === selectedTacticId) || tactics[0];

  // Tactical layout state variables
  const [tacticalPlayers, setTacticalPlayers] = useState<TacticalPlayer[]>(activeTactic?.players || []);
  const [tacticName, setTacticName] = useState(activeTactic?.name || '');
  const [selectedFormation, setSelectedFormation] = useState<TacticalFormation>(activeTactic?.formation || '4-3-3');
  const [teamColor, setTeamColor] = useState(activeTactic?.teamColor || '#10B981'); // Emerald
  const [opponentColor, setOpponentColor] = useState(activeTactic?.opponentColor || '#EF4444'); // Red
  const [tacticNotes, setTacticNotes] = useState(activeTactic?.notes || '');
  
  // Custom display options
  const [showLabels, setShowLabels] = useState<'name' | 'number'>('name');
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);

  // Canvas drawing reference states
  const [drawMode, setDrawMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#EAB308'); // Yellow
  const [brushWidth, setBrushWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);

  const pitchRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canSaveTactics = ['admin', 'coach'].includes(activeRole.role);

  // Synchronize on tactic change
  useEffect(() => {
    if (activeTactic) {
      setTacticalPlayers(activeTactic.players);
      setTacticName(activeTactic.name);
      setSelectedFormation(activeTactic.formation);
      setTeamColor(activeTactic.teamColor);
      setOpponentColor(activeTactic.opponentColor);
      setTacticNotes(activeTactic.notes || '');
      clearCanvas();
    }
  }, [selectedTacticId]);

  // Handle Resize for drawing canvas overlay alignment
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const pitch = pitchRef.current;
      if (canvas && pitch) {
        // preserve drawings by cloning canvas before resizing if helpful, or simply resizing
        canvas.width = pitch.clientWidth;
        canvas.height = pitch.clientHeight;
      }
    };
    
    // Add brief timeout to wait for grid layouts
    const timer = setTimeout(handleResize, 150);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [drawMode]);

  // Loading classic presets
  const handleFormationPresetChange = (formation: TacticalFormation) => {
    setSelectedFormation(formation);
    const presets = PRESETS_FORMATIONS[formation] || PRESETS_FORMATIONS["4-3-3"];
    
    // Smooth transition simulation. We overwrite coordinate array
    setTacticalPlayers(presets.map(p => ({
      ...p,
      // preserve names but assign correct coordinates
    })));
  };

  // Drag and Drop relative to pitch dimensions
  const handlePitchMouseMove = (e: React.MouseEvent) => {
    if (!draggingPlayerId || !pitchRef.current) return;
    
    const pitchRect = pitchRef.current.getBoundingClientRect();
    
    // Calculate relative percentage
    let relativeX = ((e.clientX - pitchRect.left) / pitchRect.width) * 100;
    let relativeY = ((e.clientY - pitchRect.top) / pitchRect.height) * 100;
    
    // clamp between boundaries
    relativeX = Math.max(2, Math.min(98, relativeX));
    relativeY = Math.max(2, Math.min(98, relativeY));

    setTacticalPlayers(prev => prev.map(p => {
      if (p.id === draggingPlayerId) {
        return { ...p, x: relativeX, y: relativeY };
      }
      return p;
    }));
  };

  const handlePitchMouseUp = () => {
    setDraggingPlayerId(null);
  };

  // SAVE CORE COORD SETUPS
  const handleSaveTactic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSaveTactics) return;

    const modifiedTactic: TacticalSetup = {
      ...activeTactic,
      name: tacticName.trim() || "Esquema táctico sin título",
      formation: selectedFormation,
      teamColor,
      opponentColor,
      players: tacticalPlayers,
      notes: tacticNotes.trim()
    };

    onUpdateTactic(modifiedTactic);
    alert("¡Estrategia táctica guardada con éxito en la pizarra!");
  };

  // CANVASES PAINT HANDLERS
  const startDrawing = (e: React.MouseEvent) => {
    if (!drawMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !drawMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Export tactics board as a high-fidelity PDF report
  const handleExportPDF = async () => {
    setIsPdfGenerating(true);
    try {
      await exportTacticsToPDF({
        ...activeTactic,
        name: tacticName.trim() || activeTactic?.name || "Esquema táctico sin título",
        formation: selectedFormation,
        teamColor,
        opponentColor,
        players: tacticalPlayers,
        notes: tacticNotes.trim()
      });
    } catch (err) {
      console.error("Error generating tactics PDF:", err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="tactical-whiteboard-section">
      
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400 animate-spin-slow" />
            <span>Pizarra Táctica y Sistemas de Campaña</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Arrastra jugadores sobre el campo de juego para delinear coberturas. Activa la pizarra dinámica para trazar flechas, líneas de pase o zonas de presión sobrepuestas.
          </p>
        </div>

        {/* Tactic selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-500">Seleccionar Pizarra:</label>
          <select
            value={selectedTacticId}
            onChange={(e) => setSelectedTacticId(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-800 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-bold"
          >
            {tactics.map(tac => (
              <option key={tac.id} value={tac.id}>{tac.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main interaction workspace grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left grid: Control Dashboard pane */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          <form onSubmit={handleSaveTactic} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-left flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Ajustes del Esquema</span>
              </div>

              {/* Tactic Name */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Nombre de la Pizarra</label>
                <input
                  type="text"
                  required
                  disabled={!canSaveTactics}
                  value={tacticName}
                  onChange={(e) => setTacticName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  placeholder="Ej: Bloque alto agresivo o Presión Alemana"
                />
              </div>

              {/* Layout Formations */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5">Sistemas Tácticos Predefinidos</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', 'Personalizado'] as TacticalFormation[]).map((form) => (
                    <button
                      key={form}
                      type="button"
                      onClick={() => handleFormationPresetChange(form)}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        selectedFormation === form
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {form}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kit customization colors */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Color Equipación</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
                    <input
                      type="color"
                      value={teamColor}
                      onChange={(e) => setTeamColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <span className="text-[10px] font-mono text-slate-400">{teamColor.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Color Adversario</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
                    <input
                      type="color"
                      value={opponentColor}
                      onChange={(e) => setOpponentColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <span className="text-[10px] font-mono text-slate-400">{opponentColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Labels switcher */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-bold">Rotulado de Jugadores</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-850 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setShowLabels('name')}
                    className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      showLabels === 'name' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Nombre Corto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLabels('number')}
                    className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      showLabels === 'number' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Dorsal / Pos
                  </button>
                </div>
              </div>

              {/* Tactical Notes textarea */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5">Consignas e Instrucciones del Staff</label>
                <textarea
                  rows={4}
                  disabled={!canSaveTactics}
                  value={tacticNotes}
                  onChange={(e) => setTacticNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50 resize-y leading-relaxed"
                  placeholder="Inserta aquí los focos de cobertura, zonas ciegas de presión y transiciones laterales ofensivas..."
                />
              </div>
            </div>

            {/* Footer triggers */}
            <div className="border-t border-slate-850 pt-4 mt-4 space-y-2">
              {!canSaveTactics && (
                <div className="bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 text-[10px] p-2 rounded-lg flex items-center gap-2 mb-2 font-mono">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Tu rol actual tiene bloqueado guardar tácticas de forma permanente.</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isPdfGenerating}
                  className="w-1/2 flex items-center justify-center gap-1.5 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-semibold font-mono disabled:opacity-55 cursor-pointer"
                  title="Exportar a PDF oficial de tácticas"
                >
                  <Download className={`w-3.5 h-3.5 ${isPdfGenerating ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{isPdfGenerating ? 'Generando...' : 'Exportar PDF'}</span>
                </button>
                
                {canSaveTactics ? (
                  <button
                    type="submit"
                    className="w-1/2 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl text-xs transition-colors shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Pizarra</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-1/2 flex items-center justify-center gap-1.5 py-2 bg-slate-800 text-slate-500 rounded-xl text-xs cursor-not-allowed border border-slate-850 font-bold"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Guardado Bloq.</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right grid: Interactive tactical pitch board */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Top drawing utility toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 px-4 flex items-center justify-between flex-wrap gap-2 text-left">
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawMode(!drawMode)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                  drawMode 
                    ? 'bg-amber-500 text-slate-950 border-amber-400' 
                    : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-white'
                }`}
              >
                <Paintbrush className="w-4 h-4" />
                <span>Modo Dibujo Pizarra ({drawMode ? 'Activo' : 'Inactivo'})</span>
              </button>
              
              {drawMode && (
                <div className="flex items-center gap-2 border-l border-slate-850 pl-2">
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-mono">Lap:</span>
                    {['#EAB308', '#3B82F6', '#EF4444', '#FFFFFF'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setBrushColor(col)}
                        className={`w-3.5 h-3.5 rounded-full border border-slate-700 ${
                          brushColor === col ? 'scale-125 border-emerald-400 shadow-sm' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors font-mono text-[10px]"
                    title="Borrar lienzo táctico"
                  >
                    Limpiar Trazos
                  </button>
                </div>
              )}
            </div>

            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
              {drawMode ? "⚠️ Pizarra activa: Dibuja flechas con arrastre continuo." : "💡 Arrastra los jugadores a cualquier parte del campo."}
            </span>
          </div>

          {/* Core field board container with transparent drawing overlay canvas */}
          <div 
            ref={pitchRef}
            onMouseMove={handlePitchMouseMove}
            onMouseUp={handlePitchMouseUp}
            onMouseLeave={handlePitchMouseUp}
            className="flex-1 min-h-[500px] border border-slate-850 bg-gradient-to-b from-emerald-950/20 via-emerald-900/10 to-slate-950 rounded-2xl relative overflow-hidden shadow-2xl select-none"
            style={{ touchAction: 'none' }}
          >
            
            {/* Field markers (Goal areas, circles, penalty nodes) */}
            <svg 
              className="absolute inset-0 w-full h-full stroke-emerald-800/40 fill-none stroke-2 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ minHeight: '100%', minWidth: '100%' }}
            >
              {/* Outer boundary padding lines */}
              <rect x="2%" y="2%" width="96%" height="96%" rx="6" />
              
              {/* Mid-field separator */}
              <line x1="2%" y1="50%" x2="98%" y2="50%" />
              
              {/* Center Circle & Spot */}
              <circle cx="50%" cy="50%" r="10%" />
              <circle cx="50%" cy="50%" r="3" className="fill-emerald-800/40" />

              {/* Penalty Boxes & Goals (Top end) */}
              <rect x="25%" y="2%" width="50%" height="16%" /> {/* Big Box */}
              <rect x="38%" y="2%" width="24%" height="6%" /> {/* Short Box */}
              <path d="M 40% 18% Q 50% 23% 60% 18%" /> {/* Penalty Arc */}
              <circle cx="50%" cy="12%" r="2" className="fill-emerald-800/40" /> {/* Spot */}
              <rect x="44%" y="0.5%" width="12%" height="1.5%" style={{ stroke: 'rgba(255,255,255,0.1)' }} /> {/* Goal Net */}

              {/* Penalty Boxes & Goals (Bottom end) */}
              <rect x="25%" y="82%" width="50%" height="16%" /> {/* Big Box */}
              <rect x="38%" y="94%" width="24%" height="6%" /> {/* Short Box */}
              <path d="M 40% 82% Q 50% 77% 60% 82%" /> {/* Penalty Arc */}
              <circle cx="50%" cy="88%" r="2" className="fill-emerald-800/40" /> {/* Spot */}
              <rect x="44%" y="98%" width="12%" height="1.5%" style={{ stroke: 'rgba(255,255,255,0.1)' }} /> {/* Goal Net */}

              {/* Corner Arcs */}
              <path d="M 2% 4% Q 3.5% 3.5% 4% 2%" />
              <path d="M 98% 4% Q 96.5% 3.5% 96% 2%" />
              <path d="M 2% 96% Q 3.5% 96.5% 4% 98%" />
              <path d="M 98% 96% Q 96.5% 96.5% 96% 98%" />
            </svg>

            {/* Drawing canvas layer overlay */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className={`absolute inset-0 w-full h-full ${
                drawMode ? 'pointer-events-auto cursor-crosshair z-20' : 'pointer-events-none z-0'
              }`}
            />

            {/* Players layer */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {tacticalPlayers.map((player) => {
                const isSelectedForDrag = draggingPlayerId === player.id;
                
                return (
                  <div
                    key={player.id}
                    onMouseDown={(e) => {
                      if (drawMode) return; // ignore if painting
                      e.stopPropagation();
                      setDraggingPlayerId(player.id);
                    }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none cursor-grab active:cursor-grabbing pointer-events-auto transition-all ${
                      isSelectedForDrag ? 'scale-125 z-40' : 'hover:scale-105 z-30'
                    }`}
                    style={{ 
                      left: `${player.x}%`, 
                      top: `${player.y}%`,
                      // Apply transition strictly when NOT dragging for smooth preset change sliding
                      transition: isSelectedForDrag ? 'none' : 'left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    
                    {/* Jersey Tag Circle containing jersey colors or numbers */}
                    <div 
                      className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-bold font-sans text-white text-sm shadow-xl relative"
                      style={{ 
                        backgroundColor: player.isOpponent ? opponentColor : teamColor,
                        boxShadow: isSelectedForDrag ? `0 10px 15px -3px rgba(0,0,0,0.4)` : `0 4px 6px -1px rgba(0,0,0,0.3)`
                      }}
                    >
                      {/* Star indicator if captain or key */}
                      <span className="text-white text-xs">{player.number}</span>
                      
                      {/* Absolute indicator for keeper */}
                      {player.roleName?.includes('POR') && (
                        <span className="absolute -top-1.5 -right-1 bg-yellow-400 text-slate-900 border border-slate-950 rounded text-[8px] font-black px-1 py-0.2">
                          GK
                        </span>
                      )}
                    </div>

                    {/* Popover/Text identifier label below player marker */}
                    <div className="bg-slate-950/90 border border-slate-800 text-white rounded-md p-1 px-2.5 mt-1 border-slate-700/80 shadow-md flex flex-col items-center">
                      <span className="text-[10px] whitespace-nowrap font-semibold tracking-tight leading-none leading-snug">
                        {showLabels === 'name' ? player.name : player.roleName?.split('/')[0].trim() || player.number}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Simple Watermark brand */}
            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-emerald-800/30 uppercase tracking-widest pointer-events-none">
              Pizarra Oficial RFFPA
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
