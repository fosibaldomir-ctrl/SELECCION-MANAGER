import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Grid, 
  List, 
  Star, 
  Award, 
  Footprints, 
  BookOpen, 
  Calendar, 
  UserPlus, 
  Lock,
  Activity,
  Trophy,
  HeartPulse,
  Zap,
  Shield,
  PlusCircle,
  Download,
  Upload,
  Maximize2,
  Sparkles,
  Eye,
  Camera
} from 'lucide-react';
import { ScoutPlayer, PlayerPosition, UserSession, MatchHistoryEntry, PlayerInjuryHistoryEntry, InjurySeverity, InjuryStatus } from '../types';
import { exportPlayerToPDF } from '../utils/pdfGenerator';
import { isSupabaseConfigured, uploadPlayerPhoto, uploadClubCrest, uploadScoutPhoto } from '../lib/supabase';

import scoutBaldomirImg from '../assets/images/scout_baldomir_1779720969384.png';
import scoutJulioImg from '../assets/images/scout_julio_1779720992111.png';
import scoutMariaImg from '../assets/images/scout_maria_1779721014551.png';
import scoutParraImg from '../assets/images/scout_parra_1779721034141.png';
import scoutMarianoImg from '../assets/images/scout_mariano_1779721054037.png';

const DEFAULT_AI_STUDIO_SCOUT_PHOTOS: Record<string, string> = {
  baldomir: scoutBaldomirImg,
  julio: scoutJulioImg,
  maria: scoutMariaImg,
  parra: scoutParraImg,
  mariano: scoutMarianoImg
};

interface FormationPosition {
  id: string;
  name: string;
  top: string;
  left: string;
}

const FORMATIONS_SLOTS: Record<string, FormationPosition[]> = {
  '4-3-3': [
    { id: 'POR', name: 'Portero', top: '91%', left: '50%' },
    { id: 'LD', name: 'Lat. Derecho', top: '64%', left: '88%' },
    { id: 'DFC1', name: 'Central Der.', top: '72%', left: '62%' },
    { id: 'DFC2', name: 'Central Izq.', top: '72%', left: '38%' },
    { id: 'LI', name: 'Lat. Izquierdo', top: '64%', left: '12%' },
    { id: 'MCD', name: 'Pivote', top: '51%', left: '50%' },
    { id: 'MC1', name: 'Interior Der.', top: '35%', left: '71%' },
    { id: 'MC2', name: 'Interior Izq.', top: '35%', left: '29%' },
    { id: 'ED', name: 'Extremo Der.', top: '18%', left: '84%' },
    { id: 'EI', name: 'Extremo Izq.', top: '18%', left: '16%' },
    { id: 'DC', name: 'Delantero Centro', top: '12%', left: '50%' }
  ],
  '4-4-2': [
    { id: 'POR', name: 'Portero', top: '91%', left: '50%' },
    { id: 'LD', name: 'Lat. Derecho', top: '64%', left: '88%' },
    { id: 'DFC1', name: 'Central Der.', top: '72%', left: '62%' },
    { id: 'DFC2', name: 'Central Izq.', top: '72%', left: '38%' },
    { id: 'LI', name: 'Lat. Izquierdo', top: '64%', left: '12%' },
    { id: 'MD', name: 'Ext. Derecho', top: '43%', left: '88%' },
    { id: 'MC1', name: 'Medio Der.', top: '48%', left: '62%' },
    { id: 'MC2', name: 'Medio Izq.', top: '48%', left: '38%' },
    { id: 'MI', name: 'Ext. Izquierdo', top: '43%', left: '12%' },
    { id: 'DC1', name: 'Delantero Der.', top: '14%', left: '65%' },
    { id: 'DC2', name: 'Delantero Izq.', top: '14%', left: '35%' }
  ],
  '3-5-2': [
    { id: 'POR', name: 'Portero', top: '91%', left: '50%' },
    { id: 'DFC1', name: 'Central Der.', top: '72%', left: '74%' },
    { id: 'DFC2', name: 'Central C.', top: '73%', left: '50%' },
    { id: 'DFC3', name: 'Central Izq.', top: '72%', left: '26%' },
    { id: 'MD', name: 'Carrilero D.', top: '42%', left: '88%' },
    { id: 'MCD1', name: 'Pivote Der.', top: '50%', left: '62%' },
    { id: 'MCD2', name: 'Pivote Izq.', top: '50%', left: '38%' },
    { id: 'MI', name: 'Carrilero I.', top: '42%', left: '12%' },
    { id: 'MCO', name: 'Mediapunta', top: '30%', left: '50%' },
    { id: 'DC1', name: 'Delantero Der.', top: '13%', left: '65%' },
    { id: 'DC2', name: 'Delantero Izq.', top: '13%', left: '35%' }
  ],
  '4-2-3-1': [
    { id: 'POR', name: 'Portero', top: '91%', left: '50%' },
    { id: 'LD', name: 'Lat. Derecho', top: '64%', left: '88%' },
    { id: 'DFC1', name: 'Central Der.', top: '72%', left: '62%' },
    { id: 'DFC2', name: 'Central Izq.', top: '72%', left: '38%' },
    { id: 'LI', name: 'Lat. Izquierdo', top: '64%', left: '12%' },
    { id: 'MCD1', name: 'Pivote Der.', top: '51%', left: '62%' },
    { id: 'MCD2', name: 'Pivote Izq.', top: '51%', left: '38%' },
    { id: 'ED', name: 'Extremo Der.', top: '22%', left: '84%' },
    { id: 'MCO', name: 'Mediapunta', top: '31%', left: '50%' },
    { id: 'EI', name: 'Extremo Izq.', top: '22%', left: '16%' },
    { id: 'DC', name: 'Delantero Centro', top: '12%', left: '50%' }
  ]
};

const FALLBACK_PLAYER_PHOTO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="%230f172a"/><circle cx="50" cy="40" r="18" fill="%234b5563"/><path d="M20 82c0-14 12-24 30-24s30 10 30 24z" fill="%234b5563"/></svg>`;
const FALLBACK_CLUB_CREST = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><polygon points="50,10 82,25 82,60 50,90 18,60 18,25" fill="%230f172a" stroke="%2310b981" stroke-width="4"/><path d="M40 32h20L50 64z" fill="%2310b981"/></svg>`;

const DEFAULT_CLUB_CRESTS: Record<string, string> = {};

interface ScoutingHubProps {
  players: ScoutPlayer[];
  onAddPlayer: (player: ScoutPlayer) => void;
  onUpdatePlayer: (player: ScoutPlayer) => void;
  onDeletePlayer: (id: string) => void;
  activeRole: UserSession;
}

export default function ScoutingHub({
  players,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  activeRole
}: ScoutingHubProps) {
  // Views
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | PlayerPosition>('ALL');
  const [footFilter, setFootFilter] = useState<'ALL' | 'Diestro' | 'Zurdo' | 'Ambidiestro'>('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<ScoutPlayer | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'attributes' | 'stats' | 'matches' | 'injuries'>('info');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<ScoutPlayer | null>(null);
  const [expandedTab, setExpandedTab] = useState<'info' | 'stats' | 'matches' | 'history' | 'medical'>('info');
  
  // New/Edit active form state
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formAge, setFormAge] = useState(20);
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formSelectableCategory, setFormSelectableCategory] = useState<'Sub-12' | 'Sub-14' | 'Sub-16' | ''>('');
  const [formPosition, setFormPosition] = useState<PlayerPosition>('MED');
  const [formPositionFull, setFormPositionFull] = useState('');
  const [formClub, setFormClub] = useState('');
  const [formNationality, setFormNationality] = useState('Española');
  const [formFoot, setFormFoot] = useState<'Diestro' | 'Zurdo' | 'Ambidiestro'>('Diestro');
  const [formRating, setFormRating] = useState(8.0);
  const [formNotes, setFormNotes] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formMatchObserved, setFormMatchObserved] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formClubCrestUrl, setFormClubCrestUrl] = useState('');
  const [formScoutingStatus, setFormScoutingStatus] = useState<'Selección' | 'Interesante' | 'Seguir' | 'Descartar'>('Seguir');
  const [formScoutName, setFormScoutName] = useState<string>('baldomir');

  // Custom Scout Photos state persisted locally
  const [scoutPhotos, setScoutPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('scouting_scout_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isUploadingScoutPhoto, setIsUploadingScoutPhoto] = useState(false);
  const [syncingScoutPhotos, setSyncingScoutPhotos] = useState<Record<string, boolean>>({});

  // Sincronización automática de fotos de AI Studio con el storage de Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const autoSyncPhotos = async () => {
      let updated = false;
      const merged = { ...scoutPhotos };

      for (const scout of ['baldomir', 'julio', 'maria', 'parra', 'mariano']) {
        const currentPhoto = scoutPhotos[scout];
        // Si ya existe subida en Supabase, omitimos
        if (currentPhoto && currentPhoto.startsWith('http') && currentPhoto.includes('supabase.co')) {
          continue;
        }

        const localSrc = DEFAULT_AI_STUDIO_SCOUT_PHOTOS[scout];
        if (localSrc) {
          try {
            setSyncingScoutPhotos(prev => ({ ...prev, [scout]: true }));
            const response = await fetch(localSrc);
            const blob = await response.blob();
            const file = new File([blob], `scout_ai_${scout}.png`, { type: 'image/png' });
            
            // Subimos usando la función exportada que intenta subir a los buckets de Supabase
            const publicUrl = await uploadScoutPhoto(file);
            merged[scout] = publicUrl;
            updated = true;
          } catch (error) {
            console.error(`[AI Studio Supabase-Storage Connect] No se pudo subir foto de ${scout}:`, error);
          } finally {
            setSyncingScoutPhotos(prev => ({ ...prev, [scout]: false }));
          }
        }
      }

      if (updated) {
        setScoutPhotos(merged);
        localStorage.setItem('scouting_scout_photos', JSON.stringify(merged));
      }
    };

    autoSyncPhotos();
  }, [isSupabaseConfigured]);

  const getScoutPhotoUrl = (scoutName: string) => {
    if (!scoutName) return null;
    const key = scoutName.toLowerCase().trim();
    return scoutPhotos[scoutName] || scoutPhotos[key] || DEFAULT_AI_STUDIO_SCOUT_PHOTOS[key] || null;
  };

  const getScoutColor = (name: string) => {
    const key = name ? name.toLowerCase() : '';
    const defaultColors: Record<string, string> = {
      baldomir: 'bg-emerald-600/30 text-emerald-400 border-emerald-500/20',
      julio: 'bg-blue-600/30 text-blue-400 border-blue-500/20',
      maria: 'bg-purple-600/30 text-purple-400 border-purple-500/20',
      parra: 'bg-orange-600/30 text-orange-455 border-orange-500/20',
      mariano: 'bg-teal-600/30 text-teal-400 border-teal-500/20'
    };
    return defaultColors[key] || 'bg-slate-700 text-slate-300 border-slate-600';
  };

  const getScoutInitials = (name: string) => {
    if (!name) return '??';
    return name.trim().slice(0, 2).toUpperCase();
  };

  // Custom Clubs state persisted locally
  const [customClubs, setCustomClubs] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('scouting_custom_clubs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isAddingNewClub, setIsAddingNewClub] = useState(false);
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [isUploadingCrest, setIsUploadingCrest] = useState(false);
  const [crestUploadError, setCrestUploadError] = useState<string | null>(null);
  const [isDraggingCrest, setIsDraggingCrest] = useState(false);

  // Dynamic helper to merge default, persisted, and player props clubs & crests
  const getAvailableClubs = () => {
    const clubs: Record<string, string> = { ...DEFAULT_CLUB_CRESTS, ...customClubs };
    players.forEach(p => {
      if (p.currentClub && p.currentClub !== 'Agente Libre' && p.clubCrestUrl) {
        clubs[p.currentClub] = p.clubCrestUrl;
      }
    });
    return clubs;
  };

  // Sliders for attributes
  const [attrSpeed, setAttrSpeed] = useState(80);
  const [attrAgility, setAttrAgility] = useState(80);
  const [attrShooting, setAttrShooting] = useState(80);
  const [attrDefending, setAttrDefending] = useState(80);
  const [attrPhysical, setAttrPhysical] = useState(80);
  const [attrPassing, setAttrPassing] = useState(80);

  // Performance stats
  const [statGoals, setStatGoals] = useState(0);
  const [statAssists, setStatAssists] = useState(0);
  const [statPasses, setStatPasses] = useState(0);
  const [statPassesAccuracy, setStatPassesAccuracy] = useState(80);
  const [statTackles, setStatTackles] = useState(0);
  const [statMinutesPlayed, setStatMinutesPlayed] = useState(0);
  const [statCardsYellow, setStatCardsYellow] = useState(0);
  const [statCardsRed, setStatCardsRed] = useState(0);

  // Match / Injury history lists within the active player
  const [matchList, setMatchList] = useState<MatchHistoryEntry[]>([]);
  const [injuryList, setInjuryList] = useState<PlayerInjuryHistoryEntry[]>([]);
  const [followUpList, setFollowUpList] = useState<{ date: string; author: string; note: string; }[]>([]);
  const [followUpAuthor, setFollowUpAuthor] = useState('baldomir');

  // Sub-forms for creating new match history or injuries
  const [newMatchOpponent, setNewMatchOpponent] = useState('');
  const [newMatchComp, setNewMatchComp] = useState('Amistosos Internacionales');
  const [newMatchRating, setNewMatchRating] = useState(7.5);
  const [newMatchGoals, setNewMatchGoals] = useState(0);
  const [newMatchAssists, setNewMatchAssists] = useState(0);
  const [newMatchMinutes, setNewMatchMinutes] = useState(90);
  const [newMatchNotes, setNewMatchNotes] = useState('');
  const [newMatchDate, setNewMatchDate] = useState('2026-05-18');

  const [newInjuryType, setNewInjuryType] = useState('');
  const [newInjuryDuration, setNewInjuryDuration] = useState('2 semanas');
  const [newInjurySeverity, setNewInjurySeverity] = useState<InjurySeverity>('Media');
  const [newInjuryStatus, setNewInjuryStatus] = useState<InjuryStatus>('Recuperación');
  const [newInjuryDate, setNewInjuryDate] = useState('2026-05-15');

  // Multi-Category Active Tab State
  const [scoutingCategory, setScoutingCategory] = useState<'ALL' | 'SUB12' | 'SUB14' | 'SUB16'>('ALL');

  // Helper helper to verify if player is in the active category
  const isPlayerInScoutingCategory = (player: ScoutPlayer, cat: 'ALL' | 'SUB12' | 'SUB14' | 'SUB16') => {
    if (cat === 'ALL') return true;
    const pCat = (player.category || '').toLowerCase();
    
    if (cat === 'SUB12') {
      return pCat.includes('sub-12') || pCat.includes('sub12') || player.age <= 12;
    }
    if (cat === 'SUB14') {
      return pCat.includes('sub-14') || pCat.includes('sub14') || (player.age > 12 && player.age <= 14);
    }
    if (cat === 'SUB16') {
      return pCat.includes('sub-16') || pCat.includes('sub16') || (player.age > 14 && player.age <= 16);
    }
    return true;
  };

  // Tactical Hub Lineup State (3 players per position) split by Category
  const [isLineupPanelExpanded, setIsLineupPanelExpanded] = useState<boolean>(true);

  const [lineupFormations, setLineupFormations] = useState<Record<'ALL' | 'SUB12' | 'SUB14' | 'SUB16', '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1'>>(() => {
    const saved = localStorage.getItem('scouting_lineup_formations_map');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.ALL) return parsed;
      } catch (e) {}
    }
    const legacy = localStorage.getItem('scouting_lineup_formation');
    return {
      ALL: (legacy as any) || '4-3-3',
      SUB12: '4-3-3',
      SUB14: '4-3-3',
      SUB16: '4-3-3',
    };
  });

  const [lineupSlotsGroup, setLineupSlotsGroup] = useState<Record<'ALL' | 'SUB12' | 'SUB14' | 'SUB16', Record<string, string[]>>>(() => {
    const saved = localStorage.getItem('scouting_lineup_slots_map');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.ALL) return parsed;
      } catch (e) {}
    }
    const legacy = localStorage.getItem('scouting_lineup_slots');
    let legacySlots = {};
    if (legacy) {
      try { legacySlots = JSON.parse(legacy); } catch (e) {}
    }
    return {
      ALL: legacySlots,
      SUB12: {},
      SUB14: {},
      SUB16: {},
    };
  });

  const lineupFormation = lineupFormations[scoutingCategory] || '4-3-3';
  const setLineupFormation = (newFormation: '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1') => {
    setLineupFormations(prev => ({
      ...prev,
      [scoutingCategory]: newFormation
    }));
  };

  const lineupSlots = lineupSlotsGroup[scoutingCategory] || {};
  const setLineupSlots = (newSlotsOrUpdater: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => {
    setLineupSlotsGroup(prevGroup => {
      const currentSlots = prevGroup[scoutingCategory] || {};
      const newSlots = typeof newSlotsOrUpdater === 'function' 
        ? newSlotsOrUpdater(currentSlots) 
        : newSlotsOrUpdater;
      return {
        ...prevGroup,
        [scoutingCategory]: newSlots
      };
    });
  };

  const [poolSearchQuery, setPoolSearchQuery] = useState('');
  const [poolPositionFilter, setPoolPositionFilter] = useState<'ALL' | PlayerPosition>('ALL');

  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ posId: string; slotIdx: number } | null>(null);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('scouting_lineup_formations_map', JSON.stringify(lineupFormations));
  }, [lineupFormations]);

  useEffect(() => {
    localStorage.setItem('scouting_lineup_slots_map', JSON.stringify(lineupSlotsGroup));
  }, [lineupSlotsGroup]);

  const updatePlayerInLineup = (positionId: string, slotIndex: number, playerId: string) => {
    setLineupSlots(prev => {
      const current = prev[positionId] ? [...prev[positionId]] : ['', '', ''];
      current[slotIndex] = playerId;
      return {
        ...prev,
        [positionId]: current
      };
    });
  };

  const clearSlot = (positionId: string, slotIndex: number) => {
    setLineupSlots(prev => {
      const current = prev[positionId] ? [...prev[positionId]] : ['', '', ''];
      current[slotIndex] = '';
      return {
        ...prev,
        [positionId]: current
      };
    });
  };

  // Follow-up notes
  const [newFollowUpNote, setNewFollowUpNote] = useState('');

  // Checks if active role can modify scout data (Scouts, Coaches, Admins have scout-add rights. Physios & Doctors are read-only)
  const canEditScouting = ['admin', 'coach', 'scout'].includes(activeRole.role);

  // Filters
  const filteredPlayers = players.filter(player => {
    const matchesSearch = `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          player.currentClub.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.positionFull.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    const matchesFoot = footFilter === 'ALL' || player.preferredFoot === footFilter;
    const matchesCategory = isPlayerInScoutingCategory(player, scoutingCategory);
    return matchesSearch && matchesPosition && matchesFoot && matchesCategory;
  });

  const handlePhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un formato de imagen válido (PNG, JPG, JPEG, WebP).');
      return;
    }

    setUploadError(null);
    setIsUploadingPhoto(true);

    if (isSupabaseConfigured) {
      try {
        const publicUrl = await uploadPlayerPhoto(file);
        setFormPhoto(publicUrl);
      } catch (err: any) {
        console.error("Error al subir a Supabase Storage:", err);
        const errMsg = err?.message || 'Error desconocido';
        setUploadError(errMsg);
        
        // Fallback to local base64 so the app still works if there's a temporary issue
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setFormPhoto(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingPhoto(false);
      }
    } else {
      // Offline / Local fallback: Use standard base64 reader
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormPhoto(reader.result as string);
        }
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const [newClubLogo, setNewClubLogo] = useState('');

  const handleCrestFile = async (file: File, isForAddNewClub: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un formato de imagen válido (PNG, JPG, JPEG, WebP).');
      return;
    }

    setCrestUploadError(null);
    setIsUploadingCrest(true);

    if (isSupabaseConfigured) {
      try {
        const publicUrl = await uploadClubCrest(file);
        if (isForAddNewClub) {
          setNewClubLogo(publicUrl);
        } else {
          setFormClubCrestUrl(publicUrl);
          if (formClub && formClub !== 'Agente Libre') {
            setCustomClubs(prev => {
              const updated = { ...prev, [formClub]: publicUrl };
              localStorage.setItem('scouting_custom_clubs', JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch (err: any) {
        console.error("Error al subir escudo:", err);
        const errMsg = err?.message || 'Error desconocido';
        setCrestUploadError(errMsg);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const b64 = reader.result as string;
            if (isForAddNewClub) {
              setNewClubLogo(b64);
            } else {
              setFormClubCrestUrl(b64);
              if (formClub && formClub !== 'Agente Libre') {
                setCustomClubs(prev => {
                  const updated = { ...prev, [formClub]: b64 };
                  localStorage.setItem('scouting_custom_clubs', JSON.stringify(updated));
                  return updated;
                });
              }
            }
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingCrest(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const b64 = reader.result as string;
          if (isForAddNewClub) {
            setNewClubLogo(b64);
          } else {
            setFormClubCrestUrl(b64);
            if (formClub && formClub !== 'Agente Libre') {
              setCustomClubs(prev => {
                const updated = { ...prev, [formClub]: b64 };
                localStorage.setItem('scouting_custom_clubs', JSON.stringify(updated));
                return updated;
              });
            }
          }
        }
        setIsUploadingCrest(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScoutPhotoFile = async (file: File, scout: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un formato de imagen válido (PNG, JPG, JPEG, WebP).');
      return;
    }

    setIsUploadingScoutPhoto(true);

    if (isSupabaseConfigured) {
      try {
        const publicUrl = await uploadScoutPhoto(file);
        setScoutPhotos(prev => {
          const updated = { ...prev, [scout]: publicUrl };
          localStorage.setItem('scouting_scout_photos', JSON.stringify(updated));
          return updated;
        });
      } catch (err: any) {
        console.error("Error al subir foto de scout:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const b64 = reader.result as string;
            setScoutPhotos(prev => {
              const updated = { ...prev, [scout]: b64 };
              localStorage.setItem('scouting_scout_photos', JSON.stringify(updated));
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingScoutPhoto(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const b64 = reader.result as string;
          setScoutPhotos(prev => {
            const updated = { ...prev, [scout]: b64 };
            localStorage.setItem('scouting_scout_photos', JSON.stringify(updated));
            return updated;
          });
        }
        setIsUploadingScoutPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    if (!canEditScouting) return;
    setEditingPlayer(null);
    setFormFirstName('');
    setFormLastName('');
    
    // Set age and category defaults based on active category tab
    let defaultAge = 21;
    let defaultCategory = '';
    let defaultBirthDate = '';
    let defaultSelectableCategory: 'Sub-12' | 'Sub-14' | 'Sub-16' | '' = '';
    if (scoutingCategory === 'SUB12') {
      defaultAge = 11;
      defaultCategory = 'Sub-12';
      defaultBirthDate = '2015-01-01';
      defaultSelectableCategory = 'Sub-12';
    } else if (scoutingCategory === 'SUB14') {
      defaultAge = 13;
      defaultCategory = 'Sub-14';
      defaultBirthDate = '2013-01-01';
      defaultSelectableCategory = 'Sub-14';
    } else if (scoutingCategory === 'SUB16') {
      defaultAge = 15;
      defaultCategory = 'Sub-16';
      defaultBirthDate = '2011-01-01';
      defaultSelectableCategory = 'Sub-16';
    }

    setFormAge(defaultAge);
    setFormBirthDate(defaultBirthDate);
    setFormSelectableCategory(defaultSelectableCategory);
    setFormPosition('MED');
    setFormPositionFull('MC');
    setFormClub('');
    setFormNationality('Española');
    setFormFoot('Diestro');
    setFormRating(8.0);
    setFormNotes('');
    setFormPhoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80');
    setNewFollowUpNote('');
    setFormMatchObserved('');
    setFormCategory(defaultCategory);
    setFormClubCrestUrl('');
    setFormScoutingStatus('Seguir');
    setFormScoutName('baldomir');

    // Default Attributes
    setAttrSpeed(75);
    setAttrAgility(75);
    setAttrShooting(65);
    setAttrDefending(65);
    setAttrPhysical(70);
    setAttrPassing(70);

    // Default stats
    setStatGoals(0);
    setStatAssists(0);
    setStatPasses(0);
    setStatPassesAccuracy(82);
    setStatTackles(0);
    setStatMinutesPlayed(0);
    setStatCardsYellow(0);
    setStatCardsRed(0);

    // Default lists
    setMatchList([]);
    setInjuryList([]);

    setModalTab('info');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (player: ScoutPlayer) => {
    setEditingPlayer(player);
    setFormFirstName(player.firstName);
    setFormLastName(player.lastName);
    setFormAge(player.age);
    setFormBirthDate(player.birthDate ?? '');
    setFormSelectableCategory(player.selectableCategory ?? '');
    setFormPosition(player.position);
    setFormPositionFull(player.positionFull);
    setFormClub(player.currentClub);
    setFormNationality(player.nationality);
    setFormFoot(player.preferredFoot);
    setFormRating(player.rating);
    setFormNotes(player.notes);
    setFormPhoto(player.photo);
    setNewFollowUpNote('');
    setFormMatchObserved(player.matchObserved ?? '');
    setFormCategory(player.category ?? '');
    setFormClubCrestUrl(player.clubCrestUrl ?? '');
    setFormScoutingStatus(player.scoutingStatus ?? 'Seguir');
    setFormScoutName(player.scoutName ?? 'baldomir');

    // Load custom attributes or assign defaults based on position if none exist
    const defaultSpeed = player.position === 'DEL' ? 92 : player.position === 'MED' ? 82 : 74;
    const defaultShooting = player.position === 'DEL' ? 88 : player.position === 'MED' ? 74 : 45;
    const defaultDefending = player.position === 'DEF' ? 88 : player.position === 'MED' ? 76 : 24;
    const defaultPassing = player.position === 'MED' ? 90 : player.position === 'DEL' ? 82 : 72;

    setAttrSpeed(player.attributes?.speed ?? defaultSpeed);
    setAttrAgility(player.attributes?.agility ?? 80);
    setAttrShooting(player.attributes?.shooting ?? defaultShooting);
    setAttrDefending(player.attributes?.defending ?? defaultDefending);
    setAttrPhysical(player.attributes?.physical ?? 78);
    setAttrPassing(player.attributes?.passing ?? defaultPassing);

    // Stats
    setStatGoals(player.stats?.goals ?? 0);
    setStatAssists(player.stats?.assists ?? 0);
    setStatPasses(player.stats?.passes ?? 0);
    setStatPassesAccuracy(player.stats?.passesAccuracy ?? 84);
    setStatTackles(player.stats?.tackles ?? 0);
    setStatMinutesPlayed(player.stats?.minutesPlayed ?? 0);
    setStatCardsYellow(player.stats?.cardsYellow ?? 0);
    setStatCardsRed(player.stats?.cardsRed ?? 0);

    // Deep copy match & injury history lists
    setMatchList(player.matchHistory ? [...player.matchHistory] : []);
    setInjuryList(player.injuryHistory ? [...player.injuryHistory] : []);

    setModalTab('info');
    setIsModalOpen(true);
  };

  const calculateGlobalRatingFromAttributes = () => {
    // Computes average of attributes and maps to a 1.0 - 10.0 scale, e.g. average of 85 maps to 8.5 rating
    const sum = attrSpeed + attrAgility + attrShooting + attrDefending + attrPhysical + attrPassing;
    const avg = sum / 6;
    const roundedRating = Math.round(avg * 10) / 100; // Average divided by 10 rounded to 1 decimal place
    setFormRating(roundedRating);
  };

  const handleDownloadPdf = async () => {
    if (!editingPlayer) return;
    setIsPdfGenerating(true);
    try {
      await exportPlayerToPDF({
        ...editingPlayer,
        firstName: formFirstName,
        lastName: formLastName,
        age: formAge,
        position: formPosition,
        positionFull: formPositionFull,
        currentClub: formClub,
        nationality: formNationality,
        preferredFoot: formFoot,
        rating: formRating,
        notes: formNotes,
        photo: formPhoto,
        attributes: {
          speed: attrSpeed,
          agility: attrAgility,
          shooting: attrShooting,
          defending: attrDefending,
          physical: attrPhysical,
          passing: attrPassing,
        },
        stats: {
          goals: statGoals,
          assists: statAssists,
          passes: statPasses,
          passesAccuracy: statPassesAccuracy,
          tackles: statTackles,
          minutesPlayed: statMinutesPlayed,
          cardsYellow: statCardsYellow,
          cardsRed: statCardsRed,
        },
        matchHistory: matchList,
        injuryHistory: injuryList,
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleAddMatchEntry = () => {
    if (!newMatchOpponent.trim()) return;
    const entry: MatchHistoryEntry = {
      id: "m_" + Date.now(),
      date: newMatchDate,
      opponent: newMatchOpponent.trim(),
      competition: newMatchComp,
      rating: Number(newMatchRating),
      goals: Number(newMatchGoals),
      assists: Number(newMatchAssists),
      minutes: Number(newMatchMinutes),
      notes: newMatchNotes.trim()
    };
    
    // Add to match list
    setMatchList([entry, ...matchList]);

    // Proactively integrate with statistics screen to save manually updating multiple screens!
    setStatMinutesPlayed(prev => prev + Number(newMatchMinutes));
    setStatGoals(prev => prev + Number(newMatchGoals));
    setStatAssists(prev => prev + Number(newMatchAssists));

    // Reset sub-form
    setNewMatchOpponent('');
    setNewMatchGoals(0);
    setNewMatchAssists(0);
    setNewMatchMinutes(90);
    setNewMatchRating(7.5);
    setNewMatchNotes('');
  };

  const handleDeleteMatchEntry = (id: string) => {
    const deletedMatch = matchList.find(m => m.id === id);
    setMatchList(matchList.filter(m => m.id !== id));
    
    // Proactively back out these values from statistics screen
    if (deletedMatch) {
      setStatMinutesPlayed(prev => Math.max(0, prev - deletedMatch.minutes));
      setStatGoals(prev => Math.max(0, prev - deletedMatch.goals));
      setStatAssists(prev => Math.max(0, prev - deletedMatch.assists));
    }
  };

  const handleAddInjuryEntry = () => {
    if (!newInjuryType.trim()) return;
    const entry: PlayerInjuryHistoryEntry = {
      id: "ih_" + Date.now(),
      date: newInjuryDate,
      type: newInjuryType.trim(),
      duration: newInjuryDuration,
      severity: newInjurySeverity,
      status: newInjuryStatus
    };

    setInjuryList([entry, ...injuryList]);

    // Reset sub-form
    setNewInjuryType('');
    setNewInjuryDuration('2 semanas');
  };

  const handleDeleteInjuryEntry = (id: string) => {
    setInjuryList(injuryList.filter(ih => ih.id !== id));
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditScouting) return;

    const basePlayer = {
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      age: Number(formAge),
      birthDate: formBirthDate,
      selectableCategory: formSelectableCategory,
      position: formPosition,
      positionFull: formPositionFull.trim() || formPosition,
      currentClub: formClub.trim() || "Agente Libre",
      nationality: formNationality.trim(),
      preferredFoot: formFoot,
      rating: Number(formRating),
      notes: formNotes.trim(),
      photo: formPhoto.trim() || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
      stats: {
        goals: Number(statGoals),
        assists: Number(statAssists),
        passes: Number(statPasses),
        passesAccuracy: Number(statPassesAccuracy),
        tackles: Number(statTackles),
        minutesPlayed: Number(statMinutesPlayed),
        cardsYellow: Number(statCardsYellow),
        cardsRed: Number(statCardsRed)
      },
      attributes: {
        speed: Number(attrSpeed),
        agility: Number(attrAgility),
        shooting: Number(attrShooting),
        defending: Number(attrDefending),
        physical: Number(attrPhysical),
        passing: Number(attrPassing)
      },
      matchHistory: matchList,
      injuryHistory: injuryList,
      matchObserved: formMatchObserved.trim(),
      category: formCategory.trim(),
      clubCrestUrl: formClubCrestUrl.trim(),
      scoutingStatus: formScoutingStatus,
      scoutName: formScoutName
    };

    if (editingPlayer) {
      // Update
      const updatedFollowUp = [...editingPlayer.followUpHistory];
      if (newFollowUpNote.trim()) {
        updatedFollowUp.push({
          date: new Date().toISOString().split('T')[0],
          author: activeRole.name,
          note: newFollowUpNote.trim()
        });
      }

      onUpdatePlayer({
        ...editingPlayer,
        ...basePlayer,
        followUpHistory: updatedFollowUp
      });
    } else {
      // Add new
      const initialFollowUp = [];
      if (newFollowUpNote.trim()) {
        initialFollowUp.push({
          date: new Date().toISOString().split('T')[0],
          author: activeRole.name,
          note: newFollowUpNote.trim()
        });
      } else {
        initialFollowUp.push({
          date: new Date().toISOString().split('T')[0],
          author: activeRole.name,
          note: "Jugador ingresado en el sistema de scouting."
        });
      }

      onAddPlayer({
        id: "p_" + Date.now(),
        ...basePlayer,
        followUpHistory: initialFollowUp
      });
    }

    setIsModalOpen(false);
  };

  // Helper to color borders and text based on scouting rating
  const getRatingStyle = (rating: number) => {
    if (rating >= 9.0) {
      return {
        bg: 'from-amber-600/20 to-yellow-500/10 border-amber-500/40 text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        glow: 'shadow-[0_0_15px_-3px_rgba(234,179,8,0.15)]',
        medal: 'Oro elite'
      };
    } else if (rating >= 8.0) {
      return {
        bg: 'from-slate-800 to-slate-850 border-emerald-500/30 text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35',
        glow: '',
        medal: 'Clase mundial'
      };
    } else {
      return {
        bg: 'from-slate-900 via-slate-900 to-slate-950 border-slate-800 text-slate-300',
        badge: 'bg-slate-800 text-slate-300 border-slate-700',
        glow: '',
        medal: 'Seguimiento'
      };
    }
  };

  // Helper to resolve scouting status and stars based on status importance
  const getScoutingValuationData = (player: ScoutPlayer) => {
    const status = player.scoutingStatus || (
      player.rating >= 9.0 ? 'Selección' :
      player.rating >= 8.0 ? 'Interesante' :
      player.rating >= 7.0 ? 'Seguir' : 'Descartar'
    );

    let stars = 3;
    let statusColor = 'text-blue-400';
    let starColor = 'fill-blue-400 text-blue-400';

    if (status === 'Selección') {
      stars = 5;
      statusColor = 'text-yellow-400';
      starColor = 'fill-yellow-400 text-yellow-400';
    } else if (status === 'Interesante') {
      stars = 4;
      statusColor = 'text-emerald-400';
      starColor = 'fill-emerald-400 text-emerald-400';
    } else if (status === 'Seguir') {
      stars = 3;
      statusColor = 'text-sky-400';
      starColor = 'fill-sky-400 text-sky-400';
    } else if (status === 'Descartar') {
      stars = 1;
      statusColor = 'text-rose-400';
      starColor = 'fill-rose-400 text-rose-400';
    }

    return { status, stars, statusColor, starColor };
  };

  // Helper to colors thresholds of visual attribute progress bars
  const getAttributeColor = (score: number) => {
    if (score >= 90) return 'from-amber-500 to-yellow-400';
    if (score >= 80) return 'from-emerald-500 to-emerald-400';
    if (score >= 70) return 'from-teal-500 to-cyan-400';
    return 'from-slate-500 to-slate-400';
  };

  return (
    <div className="space-y-6" id="scouting-hub-section">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <span>Scouting</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza valoraciones detalladas de los futbolistas de la preselección nacional, añade jugadores, edita estadísticas avanzadas y registra convocatorias.
          </p>
        </div>

        {/* Action button locked if not high enough role */}
        <div className="flex items-center gap-2">
          {canEditScouting ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Jugador</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Scouting de Solo Lectura ({activeRole.role.toUpperCase()})</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs (Sub-12, Sub-14, Sub-16) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-1" id="scouting-category-tabs">
        {[
          { id: 'ALL', label: 'Preselección RFFPA', sub: 'Todas las edades', count: players.length, activeBg: 'border-slate-700/80 shadow-[0_0_15px_rgba(100,116,139,0.1)]' },
          { id: 'SUB12', label: 'Categoría Sub-12', sub: 'Jugadoras hasta 12 años', count: players.filter(p => isPlayerInScoutingCategory(p, 'SUB12')).length, activeBg: 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
          { id: 'SUB14', label: 'Categoría Sub-14', sub: 'Jugadoras hasta 14 años', count: players.filter(p => isPlayerInScoutingCategory(p, 'SUB14')).length, activeBg: 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
          { id: 'SUB16', label: 'Categoría Sub-16', sub: 'Jugadoras hasta 16 años', count: players.filter(p => isPlayerInScoutingCategory(p, 'SUB16')).length, activeBg: 'border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]' }
        ].map((cat) => {
          const isActive = scoutingCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setScoutingCategory(cat.id as any)}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? `bg-slate-900 ${cat.activeBg} ring-1 ring-white/5`
                  : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 hover:border-slate-750'
              }`}
            >
              {isActive && (
                <div className="absolute top-2.5 right-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 font-sans"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 font-sans"></span>
                </div>
              )}
              
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">
                {cat.sub}
              </span>
              
              <div className="flex items-center justify-between w-full mt-0.5 min-w-0 gap-2">
                <span className={`text-xs font-bold tracking-tight truncate transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-emerald-400'}`}>
                  {cat.label}
                </span>
                
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  isActive
                    ? 'bg-slate-950/80 border-slate-700/80 text-white'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {cat.count}
                </span>
              </div>
              
              <div className={`absolute inset-x-0 bottom-0 h-1 rounded-b-2xl transition-all duration-300 ${
                isActive ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-slate-700'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por jugador, club, lateralidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-2 justify-center w-full md:w-auto">
          {/* Pos Filter */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 px-1">Pos:</span>
            {['ALL', 'DEL', 'MED', 'DEF', 'POR'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  positionFilter === pos
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {pos === 'ALL' ? 'Todos' : pos}
              </button>
            ))}
          </div>

          {/* Foot Filter */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 px-1">Pie:</span>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'Diestro', label: 'Der' },
              { id: 'Zurdo', label: 'Izq' },
              { id: 'Ambidiestro', label: 'Ambi' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFootFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  footFilter === f.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Toggle Grid vs List (Ver Tarjetas / Ver Tabla) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-slate-850 text-emerald-400 border border-slate-750/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
              title="Vista Tarjetas FIFA"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Ver Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-slate-850 text-emerald-400 border border-slate-750/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
              title="Vista de Tabla"
            >
              <List className="w-3.5 h-3.5" />
              <span>Ver Tabla</span>
            </button>
          </div>
        </div>

      </div>

      {/* Roster Grid / List */}
      {filteredPlayers.length > 0 ? (
        viewMode === 'cards' ? (
          /* FIFA STYLE CARDS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" id="scouting-cards-grid">
            {filteredPlayers.map((player) => {
              const rStyle = getRatingStyle(player.rating);
              const { status: valStatus, stars: valStars, statusColor: valStatusColor, starColor: valStarColor } = getScoutingValuationData(player);
              return (
                <div
                  key={player.id}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', player.id);
                  }}
                  className={`bg-gradient-to-b ${rStyle.bg} border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 flex flex-col justify-between group cursor-grab active:cursor-grabbing ${rStyle.glow}`}
                >
                  <div className="p-4 relative">
                    
                    {/* Position Label Tag & Rating Emblem */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-center">
                        <div className="font-mono font-black text-2.5xl text-white tracking-widest leading-none">
                          {player.rating.toFixed(1)}
                        </div>
                        <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border font-mono ${rStyle.badge}`}>
                          {player.position}
                        </span>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${valStatusColor}`}>{valStatus}</span>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < valStars 
                                  ? `${valStarColor}` 
                                  : 'text-slate-700'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Image and Information core layout */}
                    <div className="flex items-center gap-4 py-2">
                      <div className="relative shrink-0">
                        <img
                          referrerPolicy="no-referrer"
                          src={player.photo || FALLBACK_PLAYER_PHOTO}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="w-16 h-16 rounded-full border border-slate-700 object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_PLAYER_PHOTO;
                          }}
                        />
                        {(player.clubCrestUrl || DEFAULT_CLUB_CRESTS[player.currentClub]) && (
                          <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full p-0.5 w-6 h-6 flex items-center justify-center shadow-lg">
                            <img
                              referrerPolicy="no-referrer"
                              src={player.clubCrestUrl || DEFAULT_CLUB_CRESTS[player.currentClub]}
                              alt=""
                              className="w-4.5 h-4.5 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_CLUB_CREST;
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {player.firstName} {player.lastName}
                        </h4>
                        <p className="text-xs text-emerald-400/90 font-medium truncate">{player.positionFull}</p>
                        <div className="flex items-center gap-1 mt-0.5 truncate">
                          {(player.clubCrestUrl || DEFAULT_CLUB_CRESTS[player.currentClub]) && (
                            <img
                              referrerPolicy="no-referrer"
                              src={player.clubCrestUrl || DEFAULT_CLUB_CRESTS[player.currentClub]}
                              alt=""
                              className="w-3.5 h-3.5 object-contain shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_CLUB_CREST;
                              }}
                            />
                          )}
                          <p className="text-[11px] text-slate-500 truncate">{player.currentClub}</p>
                        </div>
                      </div>
                    </div>

                    {/* Key Attributes Visual Panel overlay (Speed, Agility, Shooting, Defending) */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 py-1.5 px-2 bg-slate-950/40 border border-slate-850/60 rounded-xl text-[10px] font-mono my-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">⚡ VEL:</span>
                        <span className="text-slate-200 font-bold">{player.attributes?.speed ?? 75}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">👟 AGI:</span>
                        <span className="text-slate-200 font-bold">{player.attributes?.agility ?? 75}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">🎯 DIS:</span>
                        <span className="text-slate-200 font-bold">{player.attributes?.shooting ?? 70}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">🛡️ DEF:</span>
                        <span className="text-slate-200 font-bold">{player.attributes?.defending ?? 65}</span>
                      </div>
                    </div>

                    {/* Metadata Specs (Age, foot, nationality) */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 text-center text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-slate-600 uppercase">Edad</div>
                        <div className="font-bold text-slate-300">{player.age}a</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-600 uppercase">Lateral</div>
                        <div className="font-bold text-slate-200 flex items-center justify-center gap-0.5">
                          <Footprints className="w-2.5 h-2.5 text-slate-500" />
                          <span>{player.preferredFoot === 'Ambidiestro' ? 'Ambi' : player.preferredFoot}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-600 uppercase">Partidos</div>
                        <div className="font-bold text-slate-350">{player.matchHistory?.length ?? 1} reg</div>
                      </div>
                    </div>

                    {/* Scouting Observation details (Match, Category, Valuation status badge, Scout name) */}
                    {(player.matchObserved || player.category || player.scoutingStatus || player.scoutName) && (
                      <div className="mt-2 text-left space-y-1 bg-slate-955/90 border border-slate-800/80 rounded-xl p-2 text-[11px] leading-snug">
                        {player.scoutName && (
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500 uppercase">Scout:</span>
                            <div className="flex items-center gap-1">
                              {getScoutPhotoUrl(player.scoutName) ? (
                                <img
                                  referrerPolicy="no-referrer"
                                  src={getScoutPhotoUrl(player.scoutName) || ''}
                                  alt=""
                                  className="w-3.5 h-3.5 rounded-full object-cover"
                                />
                              ) : (
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[6px] ${getScoutColor(player.scoutName)}`}>
                                  {getScoutInitials(player.scoutName)}
                                </div>
                              )}
                              <span className="text-emerald-400 font-bold capitalize">{player.scoutName}</span>
                            </div>
                          </div>
                        )}
                        {player.scoutingStatus && (
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500 uppercase">Seguimiento:</span>
                            <span className={`font-bold px-1 rounded text-[9px] ${
                              player.scoutingStatus === 'Selección' ? 'bg-amber-500/20 text-yellow-400 border border-amber-500/30' :
                              player.scoutingStatus === 'Interesante' ? 'bg-emerald-500/20 text-emerald-455 border border-emerald-500/30' :
                              player.scoutingStatus === 'Seguir' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-rose-500/20 text-rose-455 border border-rose-500/30'
                            }`}>
                              {player.scoutingStatus}
                            </span>
                          </div>
                        )}
                        {player.category && (
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500 uppercase">Categoría:</span>
                            <span className="text-slate-300 font-bold">{player.category}</span>
                          </div>
                        )}
                        {player.birthDate && (
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500 uppercase">Nacimiento:</span>
                            <span className="text-slate-300 font-bold">{player.birthDate}</span>
                          </div>
                        )}
                        {player.selectableCategory && (
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500 uppercase">Seleccionable:</span>
                            <span className="text-emerald-450 font-bold bg-emerald-500/10 px-1 rounded border border-emerald-500/20">{player.selectableCategory}</span>
                          </div>
                        )}
                        {player.matchObserved && (
                          <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-850/60 text-[10px]">
                            <span className="text-slate-500 uppercase font-mono">Partido Observado:</span>
                            <span className="text-slate-350 italic line-clamp-1">"{player.matchObserved}"</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Stats Banner (Goals, Assists, Tackles) */}
                    <div className="flex justify-around items-center bg-slate-900/50 border border-slate-800/60 rounded-xl px-2 py-1.5 text-center text-xs font-mono mt-2 text-slate-300">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-sans">Goles</span>
                        <span className="font-bold text-amber-400">{player.stats?.goals ?? 0}</span>
                      </div>
                      <div className="border-l border-slate-800/60 h-6"></div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-sans">Asists</span>
                        <span className="font-bold text-emerald-400">{player.stats?.assists ?? 0}</span>
                      </div>
                      <div className="border-l border-slate-800/60 h-6"></div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-sans">Entradas</span>
                        <span className="font-bold text-blue-400">{player.stats?.tackles ?? 0}</span>
                      </div>
                    </div>

                    {/* Notes preview */}
                    <div className="mt-3 pt-3 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-450" />
                        <span>Notas del Scout / Informe</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                        "{player.notes}"
                      </p>
                    </div>

                  </div>

                  {/* Actions / Timeline logs block */}
                  <div className="bg-slate-950 p-3 border-t border-slate-800 mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      Lesiones: {player.injuryHistory?.filter(i => i.status === 'Lesionado').length ?? 0} act
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { setExpandedPlayer(player); setExpandedTab('info'); }}
                        className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Ver tarjeta ampliada de jugador"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span className="text-[10px]">Ampliar</span>
                      </button>

                      {canEditScouting ? (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(player)}
                            className="p-1 px-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-emerald-400 hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                            title="Editar jugador e informes"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Abrir Ficha</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar de scouting a ${player.firstName} ${player.lastName}?`)) {
                                onDeletePlayer(player.id);
                              }
                            }}
                            className="p-1.5 bg-rose-950/10 border border-rose-900/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                            title="Descartar seguimiento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenEditModal(player)}
                          className="p-1 px-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-mono flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3 text-slate-500" />
                          <span>Ver Ficha</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TRADITIONAL TABLE VIEW */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="scouting-table-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 font-mono text-slate-400 text-xs">
                    <th className="py-3 px-4">Jugador</th>
                    <th className="py-3 px-4">Posición</th>
                    <th className="py-3 px-4">G / A</th>
                    <th className="py-3 px-4">Minutos</th>
                    <th className="py-3 px-4 text-center">Valoración</th>
                    <th className="py-3 px-4 text-center">Atributos Clave (V/D/P)</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  {filteredPlayers.map((player) => (
                    <tr
                      key={player.id}
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', player.id);
                      }}
                      className="hover:bg-slate-850/60 transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          referrerPolicy="no-referrer"
                          src={player.photo || FALLBACK_PLAYER_PHOTO}
                          alt={player.firstName}
                          className="w-8 h-8 rounded-full border border-slate-750 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_PLAYER_PHOTO;
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white block">{player.firstName} {player.lastName}</span>
                            {player.selectableCategory && (
                              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono border border-emerald-500/20">★ {player.selectableCategory}</span>
                            )}
                            {player.scoutName && (
                              <div className="inline-flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[9px] font-mono capitalize">
                                {getScoutPhotoUrl(player.scoutName) ? (
                                  <img
                                    referrerPolicy="no-referrer"
                                    src={getScoutPhotoUrl(player.scoutName) || ''}
                                    alt={`Scout: ${player.scoutName}`}
                                    className="w-3.5 h-3.5 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[6px] ${getScoutColor(player.scoutName)}`}>
                                    {getScoutInitials(player.scoutName)}
                                  </div>
                                )}
                                <span className="text-slate-400">Scout:</span>
                                <span className="font-bold text-emerald-400">{player.scoutName}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {player.nationality} | {player.currentClub}
                            {player.birthDate && ` | 🎂 ${player.birthDate}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-emerald-400">
                          {player.position}
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">{player.positionFull}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <span className="text-amber-400 font-bold">{player.stats?.goals ?? 0}</span> G / <span className="text-emerald-450 font-bold">{player.stats?.assists ?? 0}</span> A
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{player.stats?.minutesPlayed ?? 0} min</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-bold text-sm px-2 py-0.5 rounded border ${
                          player.rating >= 9.0 
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {player.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-450 text-[11px]">
                        Vel: <strong className="text-slate-200">{player.attributes?.speed ?? 75}</strong> | Def: <strong className="text-slate-200">{player.attributes?.defending ?? 65}</strong> | Pas: <strong className="text-slate-200">{player.attributes?.passing ?? 70}</strong>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => { setExpandedPlayer(player); setExpandedTab('info'); }}
                            className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all"
                            title="Ver tarjeta ampliada de jugador"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Tarjeta Ampliada</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(player)}
                            className="p-1 px-3 bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg font-semibold transition-colors"
                          >
                            Ver / Editar
                          </button>
                          {canEditScouting && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar de scouting a ${player.firstName} ${player.lastName}?`)) {
                                  onDeletePlayer(player.id);
                                }
                              }}
                              className="p-1.5 bg-rose-950/10 border border-rose-900/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          Ningún jugador coincide con los filtros especificados. Modifica la búsqueda de scouting.
        </div>
      )}

      {/* 🟢 SECCIÓN DE PIZARRA DE CONVOCATORIAS TÁCTICAS (NUEVA MEJORA) - Excluido de la página principal 'ALL' */}
      {scoutingCategory !== 'ALL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-8" id="convocatorias-tacticas-section">
        {/* Header de la Pizarra - Título y Descripción arriba */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Campograma
              </h3>
              <p className="text-[11px] text-slate-400">
                Diseña el esquema táctico y preselecciona hasta 3 jugadores por posición (titular y reservas). Arrastra los candidatos o usa el selector ágil.
              </p>
            </div>
          </div>

          {/* Seleccionador de Sistemas y Opción de Ocultar Pizarra Abajo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Esquema:</span>
              {(['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'] as const).map((form) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => setLineupFormation(form)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                    lineupFormation === form
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {form}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsLineupPanelExpanded(!isLineupPanelExpanded)}
              className="px-3 py-1 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-[10px] font-mono text-slate-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              {isLineupPanelExpanded ? '▼ Ocultar Pizarra' : '▲ Mostrar Pizarra'}
            </button>
          </div>
        </div>

        {isLineupPanelExpanded && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Campo de fútbol (Pista gráfica) */}
            <div className="w-full lg:col-span-2 relative bg-gradient-to-b from-[#072d15] via-[#0d4722] to-[#072d15] border-2 border-emerald-500/40 rounded-3xl overflow-hidden p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] select-none" style={{ minHeight: '600px' }}>
              {/* Grass Striped Background */}
              <div className="absolute inset-0 flex flex-col pointer-events-none opacity-25">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 ${i % 2 === 0 ? 'bg-emerald-500/10' : 'bg-transparent'}`}
                  />
                ))}
              </div>

              {/* Soccer Pitch Graphic markings */}
              <div className="absolute inset-4 border border-white/30 rounded-lg pointer-events-none">
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full" />
                {/* Center line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-white/30" />
                
                {/* Penalty Area Left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-44 border-y border-r border-white/20" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-20 border-y border-r border-white/20" />
                <div className="absolute left-14 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/35 rounded-full" />

                {/* Penalty Area Right */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-44 border-y border-l border-white/20" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-20 border-y border-l border-white/20" />
                <div className="absolute right-14 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/35 rounded-full" />
              </div>

              {/* Dynamic Position widgets with absolute layouts */}
              {FORMATIONS_SLOTS[lineupFormation].map((pos) => {
                return (
                  <div
                    key={pos.id}
                    className="absolute bg-slate-950/95 backdrop-blur-md border border-slate-800/80 hover:border-emerald-500/50 rounded-xl p-1 w-[100px] sm:w-[115px] shadow-2xl transition-all duration-300 hover:scale-[1.03] z-10"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Position Label Title */}
                    <div className="flex items-center justify-between mb-0.5 px-0.5 border-b border-slate-800/60 pb-0.5">
                      <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-wider">
                        {pos.id}
                      </span>
                      <span className="text-[8px] font-sans text-slate-500 truncate max-w-[48px] sm:max-w-[55px]" title={pos.name}>
                        {pos.name}
                      </span>
                    </div>

                    {/* Three player depth rows */}
                    {[0, 1, 2].map((slotIdx) => {
                      const pId = lineupSlots[pos.id]?.[slotIdx];
                      const player = players.find(p => p.id === pId);
                      const labels = ['⭐', '🥈', '🥉'];
                      const labelsTitle = ['Titular (1ª Opción)', 'Suplente (2ª Opción)', 'Reserva (3ª Opción)'];

                      const isHovered = dragOverSlot && dragOverSlot.posId === pos.id && dragOverSlot.slotIdx === slotIdx;

                      return (
                        <div
                          key={slotIdx}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (!dragOverSlot || dragOverSlot.posId !== pos.id || dragOverSlot.slotIdx !== slotIdx) {
                              setDragOverSlot({ posId: pos.id, slotIdx });
                            }
                          }}
                          onDragLeave={() => {
                            setDragOverSlot(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverSlot(null);
                            const draggedPlayerId = e.dataTransfer.getData('text/plain');
                            if (draggedPlayerId) {
                               updatePlayerInLineup(pos.id, slotIdx, draggedPlayerId);
                            }
                          }}
                          className={`flex items-center gap-1 text-[9.5px] p-0.5 my-0.5 rounded transition-all duration-300 ${
                            isHovered
                              ? 'bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 ring-4 ring-emerald-500/30 scale-105 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                              : player
                              ? 'bg-slate-900 border border-emerald-500/15 hover:border-emerald-500/40 text-slate-100'
                              : 'bg-slate-950/60 border border-dashed border-slate-850 text-slate-500'
                          } h-6 relative group/row`}
                        >
                          {/* Slot Icon Medal */}
                          <span className="text-[9px] select-none flex-shrink-0" title={labelsTitle[slotIdx]}>
                            {labels[slotIdx]}
                          </span>

                          {player ? (
                            <div className="flex items-center justify-between w-full min-w-0">
                              <span className="truncate font-semibold text-slate-200 select-none text-[9.5px]" title={`${player.firstName} ${player.lastName}`}>
                                {player.lastName}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-[8px] bg-slate-950 text-emerald-400 px-0.5 rounded font-bold font-mono">
                                  {player.rating.toFixed(1)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => clearSlot(pos.id, slotIdx)}
                                  className="text-slate-500 hover:text-rose-400 text-[10px] leading-none font-bold select-none cursor-pointer border-none bg-transparent"
                                  title="Retirar jugador de este slot"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  updatePlayerInLineup(pos.id, slotIdx, e.target.value);
                                }
                              }}
                              className="bg-transparent text-slate-500 text-[8.5px] hover:text-slate-450 w-full outline-none py-0.5 select-none cursor-pointer"
                            >
                              <option value="" disabled className="bg-slate-950 text-slate-500 text-[8.5px] font-sans">+ Vacío</option>
                              {players.map((p) => (
                                <option key={p.id} value={p.id} className="bg-slate-950 text-slate-200 text-xs text-left">
                                  {p.lastName} {p.firstName.charAt(0)}. ({p.position}) - {p.rating.toFixed(1)}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Sidebar de Candidato Pool */}
            <div className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between" style={{ minHeight: '600px', maxHeight: '600px' }}>
              <div className="flex flex-col min-h-0 h-full overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-850 mb-3 shrink-0">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-emerald-400" />
                    <span>Pool de Candidatos</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {players.length} Total
                  </span>
                </div>

                {/* Search Pool candidates */}
                <div className="space-y-2 mb-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Filtrar candidatos por apellido o club..."
                    value={poolSearchQuery}
                    onChange={(e) => setPoolSearchQuery(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
                  />

                  {/* Pool Filter Buttons */}
                  <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
                    {(['ALL', 'DEL', 'MED', 'DEF', 'POR'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPoolPositionFilter(pos)}
                        className={`text-[9px] px-2 py-0.5 rounded-lg border font-mono font-bold transition-all shrink-0 ${
                          poolPositionFilter === pos
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {pos === 'ALL' ? 'Todos' : pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candidate List Container */}
                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0" id="pool-candidate-scrollable-container">
                  {players
                    .filter(player => {
                      const matchesPos = poolPositionFilter === 'ALL' || player.position === poolPositionFilter;
                      const matchesSearch = `${player.firstName} ${player.lastName}`.toLowerCase().includes(poolSearchQuery.toLowerCase()) ||
                                            player.currentClub.toLowerCase().includes(poolSearchQuery.toLowerCase());
                      const matchesCategory = isPlayerInScoutingCategory(player, scoutingCategory);
                      return matchesPos && matchesSearch && matchesCategory;
                    })
                    .map((player) => {
                      return (
                        <div
                          key={player.id}
                          draggable="true"
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', player.id);
                            setDraggingPlayerId(player.id);
                          }}
                          onDragEnd={() => {
                            setDraggingPlayerId(null);
                            setDragOverSlot(null);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 cursor-grab active:cursor-grabbing group ${
                            draggingPlayerId === player.id && dragOverSlot !== null
                              ? 'bg-emerald-900/40 border-2 border-emerald-400 animate-pulse ring-4 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-[1.03] text-white'
                              : draggingPlayerId === player.id
                              ? 'bg-slate-900/50 opacity-60 border border-dashed border-slate-700'
                              : 'bg-slate-900 hover:bg-slate-850 border border-slate-800/85 hover:border-emerald-500/20'
                          }`}
                          title="Arrastra este jugador a un slot de la pizarra táctica"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              referrerPolicy="no-referrer"
                              src={player.photo || FALLBACK_PLAYER_PHOTO}
                              alt={player.lastName}
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_PLAYER_PHOTO;
                              }}
                            />
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                                {player.firstName} {player.lastName}
                              </span>
                              <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tight block truncate">
                                {player.positionFull} ({player.position}) • {player.currentClub}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-500/10 px-1 py-0.5 rounded">
                              {player.rating.toFixed(1)}
                            </span>
                            {/* Drag handle dots */}
                            <div className="flex flex-col gap-0.5 pl-1.5 shrink-0">
                              <span className="w-1 h-1 bg-slate-550 rounded-full"></span>
                              <span className="w-1 h-1 bg-slate-550 rounded-full"></span>
                              <span className="w-1 h-1 bg-slate-550 rounded-full"></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Reset layout or tutorial tips */}
              <div className="mt-3 pt-2 border-t border-slate-850 text-center shrink-0">
                <p className="text-[9px] text-slate-500 leading-normal mb-1 bg-slate-900/40 p-1.5 rounded-lg border border-slate-850">
                  💡 <strong>Consejo:</strong> Pincha y arrastra a cualquier jugador de esta lista o usa los selectores directamente sobre el campo. ¡Puedes asignar hasta 3 por puesto!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Vaciar por completo todos los puestos asignados a la pizarra de preselección?')) {
                      setLineupSlots({});
                    }
                  }}
                  className="text-[9.5px] font-mono hover:text-rose-400 text-slate-500 tracking-tight transition-colors border-none bg-transparent cursor-pointer"
                >
                  ✕ Restablecer toda la Pizarra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* DETAILED PLAYER / FORM MODAL (Expanded for full rich player profiles data integration) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Responsive Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center text-left bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/20 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  referrerPolicy="no-referrer"
                  src={formPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                  alt={formFirstName}
                  className="w-11 h-11 rounded-full border border-emerald-500/20 object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {editingPlayer ? `Ficha Nacional: ${formFirstName} ${formLastName}` : "Agregar Jugador al Radar"}
                  </h3>
                  <p className="text-xs text-emerald-400/90 font-mono mt-0.5">
                    {formPositionFull} | Club: {formClub || 'Sin club'} | Valoración: {formRating.toFixed(1)}/10
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingPlayer && (
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isPdfGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/30 rounded-xl font-mono text-xs font-semibold transition-all disabled:opacity-55 cursor-pointer"
                    title="Exportar ficha técnica individual a PDF"
                  >
                    <Download className={`w-3.5 h-3.5 ${isPdfGenerating ? "animate-spin text-emerald-300" : "animate-pulse"}`} />
                    <span>{isPdfGenerating ? "Generando..." : "Descargar PDF"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-mono text-sm transition-colors cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex flex-wrap border-b border-slate-800/80 p-2 bg-slate-950/50 gap-1 shrink-0">
              {[
                { id: 'info', label: 'Datos Generales', icon: BookOpen },
                { id: 'attributes', label: 'Atributos & Ratings', icon: Zap },
                { id: 'stats', label: 'Estadísticas de Rendimiento', icon: Activity },
                { id: 'matches', label: 'Historial de Partidos', icon: Trophy },
                { id: 'injuries', label: 'Historial de Lesiones', icon: HeartPulse }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      modalTab === tab.id
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-900 text-left">
              
              {/* Form lock cover warnings for doctors and physios just in case */}
              {!canEditScouting && (
                <div className="bg-purple-950/15 border border-purple-500/20 text-purple-400 text-xs p-3 rounded-xl flex items-center gap-3 mb-4">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Tu rol activo de <strong>{activeRole.name}</strong> es de lectura para scouting. Solo puedes revisar el expediente.</span>
                </div>
              )}

              {/* TAB 1: GENERAL INFO */}
              {modalTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditScouting}
                        value={formFirstName}
                        onChange={(e) => setFormFirstName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Apellidos</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditScouting}
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Edad</label>
                      <input
                        type="number"
                        min="5"
                        max="45"
                        required
                        disabled={!canEditScouting}
                        value={formAge}
                        onChange={(e) => setFormAge(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Bloque Posicional</label>
                      <select
                        disabled={!canEditScouting}
                        value={formPosition}
                        onChange={(e) => {
                          const val = e.target.value as PlayerPosition;
                          setFormPosition(val);
                          if (val === 'POR') {
                            setFormPositionFull('POR');
                          } else if (val === 'DEF') {
                            setFormPositionFull('CENTRAL');
                          } else if (val === 'MED') {
                            setFormPositionFull('MC');
                          } else if (val === 'DEL') {
                            setFormPositionFull('DC');
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="POR">POR (Portero)</option>
                        <option value="DEF">DEF (Defensa)</option>
                        <option value="MED">MED (Medio)</option>
                        <option value="DEL">DEL (Delantero)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Letalidad / Pie</label>
                      <select
                        disabled={!canEditScouting}
                        value={formFoot}
                        onChange={(e) => setFormFoot(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="Diestro">Diestro</option>
                        <option value="Zurdo">Zurdo</option>
                        <option value="Ambidiestro">Ambidiestro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        disabled={!canEditScouting}
                        value={formBirthDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormBirthDate(val);
                          if (val) {
                            const birthYear = new Date(val).getFullYear();
                            const currentYear = new Date().getFullYear();
                            if (!isNaN(birthYear) && birthYear > 1900) {
                              setFormAge(currentYear - birthYear);
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-853 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Categoría Seleccionable</label>
                      <select
                        disabled={!canEditScouting}
                        value={formSelectableCategory}
                        onChange={(e) => setFormSelectableCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-853 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="">Ninguna / No aplica</option>
                        <option value="Sub-12">Sub-12</option>
                        <option value="Sub-14">Sub-14</option>
                        <option value="Sub-16">Sub-16</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Posición Real Específica</label>
                      <select
                        disabled={!canEditScouting}
                        value={formPositionFull}
                        onChange={(e) => setFormPositionFull(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        {formPosition === 'POR' && (
                          <>
                            <option value="POR">POR</option>
                            <option value="Portero">Portero</option>
                            {formPositionFull !== 'POR' && formPositionFull !== 'Portero' && formPositionFull !== '' && (
                              <option value={formPositionFull}>{formPositionFull}</option>
                            )}
                          </>
                        )}
                        {formPosition === 'DEF' && (
                          <>
                            <option value="LAT">LAT</option>
                            <option value="CENTRAL">CENTRAL</option>
                            {formPositionFull !== 'LAT' && formPositionFull !== 'CENTRAL' && formPositionFull !== '' && (
                              <option value={formPositionFull}>{formPositionFull}</option>
                            )}
                          </>
                        )}
                        {formPosition === 'MED' && (
                          <>
                            <option value="MC">MC</option>
                            <option value="MO">MO</option>
                            <option value="MCD">MCD</option>
                            {formPositionFull !== 'MC' && formPositionFull !== 'MO' && formPositionFull !== 'MCD' && formPositionFull !== '' && (
                              <option value={formPositionFull}>{formPositionFull}</option>
                            )}
                          </>
                        )}
                        {formPosition === 'DEL' && (
                          <>
                            <option value="EXT">EXT</option>
                            <option value="DC">DC</option>
                            {formPositionFull !== 'EXT' && formPositionFull !== 'DC' && formPositionFull !== '' && (
                              <option value={formPositionFull}>{formPositionFull}</option>
                            )}
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">Club Actual</label>
                        {canEditScouting && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewClub(!isAddingNewClub);
                              setNewClubName('');
                              setNewClubLogo('');
                            }}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            {isAddingNewClub ? '✕ Cancelar' : '+ Añadir Club'}
                          </button>
                        )}
                      </div>

                      {isAddingNewClub ? (
                        <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2.5">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5">Nombre del Club Nuevo</label>
                            <input
                              type="text"
                              placeholder="Ej. Real Sociedad, Sevilla FC..."
                              value={newClubName}
                              onChange={(e) => setNewClubName(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5">Subir Escudo / Logo del Club</label>
                            
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingCrest(true);
                              }}
                              onDragLeave={() => setIsDraggingCrest(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingCrest(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleCrestFile(file, true);
                              }}
                              className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all ${
                                isDraggingCrest 
                                  ? 'border-emerald-500 bg-emerald-500/5' 
                                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                              } ${isUploadingCrest ? 'opacity-75 pointer-events-none' : ''}`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                id="new-club-crest-upload"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleCrestFile(file, true);
                                }}
                              />

                              {isUploadingCrest ? (
                                <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  {newClubLogo ? (
                                    <img
                                      referrerPolicy="no-referrer"
                                      src={newClubLogo}
                                      alt="Escudo nuevo"
                                      className="w-7 h-7 object-contain"
                                    />
                                  ) : (
                                    <Upload className="w-4 h-4 text-slate-500" />
                                  )}
                                  <span className="text-[10px] text-slate-300 font-medium">
                                    {newClubLogo ? '¡Escudo subido!' : 'Arrastra o haz clic para subir escudo'}
                                  </span>
                                </div>
                              )}
                              
                              {!newClubLogo && !isUploadingCrest && (
                                <label
                                  htmlFor="new-club-crest-upload"
                                  className="px-2 py-0.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded text-[9px] font-mono uppercase font-bold cursor-pointer transition-all"
                                >
                                  Elegir Escudo
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingNewClub(false);
                                setNewClubName('');
                                setNewClubLogo('');
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={!newClubName.trim()}
                              onClick={() => {
                                const finalName = newClubName.trim();
                                if (finalName) {
                                  const finalLogo = newClubLogo || FALLBACK_CLUB_CREST;
                                  setCustomClubs(prev => {
                                    const updated = { ...prev, [finalName]: finalLogo };
                                    localStorage.setItem('scouting_custom_clubs', JSON.stringify(updated));
                                    return updated;
                                  });
                                  setFormClub(finalName);
                                  setFormClubCrestUrl(finalLogo);
                                }
                                setIsAddingNewClub(false);
                                setNewClubName('');
                                setNewClubLogo('');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-[10px] disabled:opacity-50 cursor-pointer"
                            >
                              Registrar Club
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 relative">
                          {/* Selector de Club Personalizado */}
                          <button
                            type="button"
                            disabled={!canEditScouting}
                            onClick={() => setIsClubDropdownOpen(!isClubDropdownOpen)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50 flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                referrerPolicy="no-referrer"
                                src={formClubCrestUrl || FALLBACK_CLUB_CREST}
                                className="w-4 h-4 object-contain rounded bg-slate-900/80 p-0.5 border border-slate-800"
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = FALLBACK_CLUB_CREST;
                                }}
                              />
                              <span className="font-medium text-slate-200">{formClub || 'Agente Libre'}</span>
                            </div>
                            <span className="text-slate-500 text-[9px]">▼</span>
                          </button>

                          {/* Capturador de clics externo para cerrar dropdown */}
                          {isClubDropdownOpen && (
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setIsClubDropdownOpen(false)}
                            />
                          )}

                          {/* Panel de Dropdown Personalizado */}
                          {isClubDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1 z-50 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-[190px] overflow-y-auto p-1.5 space-y-0.5">
                              {/* Opción: Agente Libre */}
                              <div
                                onClick={() => {
                                  setFormClub('Agente Libre');
                                  setFormClubCrestUrl('');
                                  setIsClubDropdownOpen(false);
                                }}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer gap-2 transition-all ${
                                  formClub === 'Agente Libre' || !formClub
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    referrerPolicy="no-referrer"
                                    src={FALLBACK_CLUB_CREST}
                                    className="w-4 h-4 object-contain opacity-40"
                                    alt=""
                                  />
                                  <span>Agente Libre (Sin club)</span>
                                </div>
                              </div>

                              {/* Resto de Clubes Disponibles */}
                              {Object.entries(getAvailableClubs()).map(([name, logo]) => {
                                const isSelected = formClub === name;
                                const isCustom = !!customClubs[name];
                                return (
                                  <div
                                    key={name}
                                    onClick={() => {
                                      setFormClub(name);
                                      setFormClubCrestUrl(logo);
                                      setIsClubDropdownOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer gap-2 transition-all group ${
                                      isSelected
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <img
                                        referrerPolicy="no-referrer"
                                        src={logo || FALLBACK_CLUB_CREST}
                                        className="w-4 h-4 object-contain rounded bg-slate-900/80 p-0.5 border border-slate-800"
                                        alt=""
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = FALLBACK_CLUB_CREST;
                                        }}
                                      />
                                      <span className="truncate">{name}</span>
                                      {isCustom && (
                                        <span className="text-[8px] px-1 bg-emerald-500/10 text-emerald-400 rounded uppercase font-mono tracking-wider font-semibold">
                                          Perso
                                        </span>
                                      )}
                                    </div>

                                    {/* Botón rápido para eliminar en el propio desplegable */}
                                    {isCustom && (
                                      <button
                                        type="button"
                                        disabled={!canEditScouting}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          
                                          setCustomClubs(prev => {
                                            const updated = { ...prev };
                                            delete updated[name];
                                            localStorage.setItem('scouting_custom_clubs', JSON.stringify(updated));
                                            return updated;
                                          });
                                          
                                          if (formClub === name) {
                                            setFormClub('Agente Libre');
                                            setFormClubCrestUrl('');
                                          }
                                        }}
                                        className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shrink-0"
                                        title="Eliminar Club"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Listado de Clubes Personalizados (Para gestión e información rápida) */}
                          {Object.keys(customClubs).length > 0 && (
                            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-2.5 mt-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Clubes Personalizados</span>
                              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {Object.entries(customClubs).map(([name, logo]) => (
                                  <div key={name} className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-850 text-slate-200 px-2 py-1.5 rounded-lg text-[10px] font-medium font-mono">
                                    <div className="flex items-center gap-2 truncate">
                                      <img
                                        referrerPolicy="no-referrer"
                                        src={logo || FALLBACK_CLUB_CREST}
                                        className="w-4 h-4 object-contain rounded bg-slate-950/80 p-0.5 border border-slate-800"
                                        alt=""
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = FALLBACK_CLUB_CREST;
                                        }}
                                      />
                                      <span className="truncate text-slate-300 font-bold">{name}</span>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={!canEditScouting}
                                      onClick={() => {
                                        setCustomClubs(prev => {
                                          const updated = { ...prev };
                                          delete updated[name];
                                          localStorage.setItem('scouting_custom_clubs', JSON.stringify(updated));
                                          return updated;
                                        });
                                        if (formClub === name) {
                                          setFormClub('Agente Libre');
                                          setFormClubCrestUrl('');
                                        }
                                      }}
                                      className="p-1 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40 block shrink-0"
                                      title="Eliminar Club"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Nacionalidad</label>
                      <input
                        type="text"
                        required
                        disabled={!canEditScouting}
                        value={formNationality}
                        onChange={(e) => setFormNationality(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Valoración Global Tracker (1.0 - 10.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="10.0"
                        required
                        disabled={!canEditScouting}
                        value={formRating}
                        onChange={(e) => setFormRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">Foto del Jugador</label>
                    
                    {/* Visual File Drag & Drop + Click Upload Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (canEditScouting && !isUploadingPhoto) setIsDraggingPhoto(true);
                      }}
                      onDragLeave={() => {
                        setIsDraggingPhoto(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(false);
                        if (!canEditScouting || isUploadingPhoto) return;
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          handlePhotoFile(file);
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 transition-all text-center ${
                        isDraggingPhoto 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
                      } ${isUploadingPhoto ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canEditScouting || isUploadingPhoto}
                        id="player-photo-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoFile(file);
                          }
                        }}
                      />

                      {isUploadingPhoto ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                          </div>
                          <div className="text-left w-full">
                            <p className="text-xs text-slate-200 font-bold animate-pulse">Subiendo foto al bucket...</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Subiendo a Supabase Storage</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {formPhoto ? (
                            <div className="relative group/photo">
                              <img
                                referrerPolicy="no-referrer"
                                src={formPhoto}
                                alt="Foto del jugador"
                                className="w-16 h-16 rounded-full object-cover border-2 border-slate-800 shadow-lg"
                              />
                              {canEditScouting && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormPhoto('');
                                    setUploadError(null);
                                  }}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-colors cursor-pointer"
                                  title="Eliminar foto"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                              <Upload className="w-5 h-5" />
                            </div>
                          )}

                          <div className="text-left">
                            <p className="text-xs text-slate-200 font-bold">
                              {formPhoto ? '¡Foto cargada!' : 'Arrastra o haz clic para subir foto'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Soporta PNG, JPEG o WebP (Max. 2MB)
                            </p>
                          </div>
                        </div>
                      )}

                      {canEditScouting && !isUploadingPhoto && (
                        <label
                          htmlFor="player-photo-upload"
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all shrink-0"
                        >
                          Elegir Archivo
                        </label>
                      )}
                    </div>

                    {uploadError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-[11px] text-rose-400">
                        <strong className="block font-bold mb-0.5">⚠️ Detalle del Storage de Supabase:</strong>
                        <span>Se ha usado almacenamiento local temporal en su lugar. Recuerda crear el bucket <code className="bg-rose-950/40 px-1.5 py-0.5 rounded text-white text-[10px]">fotos jugadores</code> y activar sus políticas de acceso público (RLS) en Supabase para habilitar la sincronización web.</span>
                      </div>
                    )}

                    {/* Fallback standard URL input for external Unsplash links */}
                    <div className="pt-1.5 opacity-70 focus-within:opacity-100 transition-opacity">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">O bien, ingresa una URL web externa</span>
                        {formPhoto && formPhoto.startsWith('http') && (
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">Enlace Directo</span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Pegar enlace de imagen (ej. Unsplash URL)"
                        disabled={!canEditScouting || isUploadingPhoto}
                        value={formPhoto.startsWith('data:image') ? '' : formPhoto}
                        onChange={(e) => setFormPhoto(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-900 text-slate-200 rounded-lg text-[11px] font-mono focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 placeholder-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Partido de Observación (Scouting)</label>
                      <input
                        type="text"
                        placeholder="Ej. Real Sociedad vs Athletic Club"
                        disabled={!canEditScouting}
                        value={formMatchObserved}
                        onChange={(e) => setFormMatchObserved(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Categoría</label>
                      <select
                        disabled={!canEditScouting}
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="">Selecciona una categoría...</option>
                        <option value="2 RFEF">2 RFEF</option>
                        <option value="3 RFEF">3 RFEF</option>
                        <option value="1 ASTURFUTBOL">1 ASTURFUTBOL</option>
                        <option value="2 ASTURFUBOL">2 ASTURFUBOL</option>
                        <option value="JUVENIL">JUVENIL</option>
                        <option value="INFANTIL">INFANTIL</option>
                        <option value="ALEVIN">ALEVIN</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Escudo del Club (Upload / Archivo)</label>
                      
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (canEditScouting && !isUploadingCrest) setIsDraggingCrest(true);
                        }}
                        onDragLeave={() => setIsDraggingCrest(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingCrest(false);
                          if (!canEditScouting || isUploadingCrest) return;
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleCrestFile(file, false);
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-3 flex flex-col items-center justify-center gap-2 text-center transition-all min-h-[90px] ${
                          isDraggingCrest 
                            ? 'border-emerald-500 bg-emerald-500/10' 
                            : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
                        } ${isUploadingCrest ? 'opacity-75 pointer-events-none' : ''}`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!canEditScouting || isUploadingCrest}
                          id="club-crest-file-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCrestFile(file, false);
                          }}
                        />

                        {isUploadingCrest ? (
                          <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-[10px] text-slate-400 font-medium animate-pulse">Subiendo escudo...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                referrerPolicy="no-referrer"
                                src={formClubCrestUrl || FALLBACK_CLUB_CREST}
                                alt="Escudo del club"
                                className="w-10 h-10 object-contain rounded-md bg-slate-900 border border-slate-800 p-0.5"
                              />
                              {canEditScouting && formClubCrestUrl && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormClubCrestUrl('');
                                  }}
                                  className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow transition-colors cursor-pointer"
                                  title="Eliminar escudo"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="text-left">
                              <p className="text-[11px] text-slate-200 font-bold font-mono">
                                {formClubCrestUrl ? 'Escudo cargado' : 'Subir escudo del club'}
                              </p>
                              <p className="text-[9px] text-slate-500 font-mono">
                                Haz clic o arrastra para cambiar
                              </p>
                            </div>
                          </div>
                        )}

                        {canEditScouting && !isUploadingCrest && (
                          <label
                            htmlFor="club-crest-file-upload"
                            className="px-2 py-0.5 mt-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-md font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer transition-all shrink-0"
                          >
                            Elegir Escudo
                          </label>
                        )}
                      </div>
                      
                      {crestUploadError && (
                        <div className="mt-1 bg-rose-500/10 border border-rose-500/20 rounded p-1.5 text-[9px] text-rose-400 font-mono">
                          ⚠️ Guardado localmente como Base64.
                        </div>
                      )}


                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Valoración de Scouting (Decisión)</label>
                      <select
                        disabled={!canEditScouting}
                        value={formScoutingStatus}
                        onChange={(e) => setFormScoutingStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="Selección">Selección</option>
                        <option value="Interesante">Interesante</option>
                        <option value="Seguir">Seguir</option>
                        <option value="Descartar">Descartar</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Nombre del Scout</label>
                      <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-850 p-2.5 rounded-2xl">
                        <div className="relative shrink-0">
                          {getScoutPhotoUrl(formScoutName) ? (
                            <img
                              referrerPolicy="no-referrer"
                              src={getScoutPhotoUrl(formScoutName) || ''}
                              alt={`Foto de ${formScoutName}`}
                              className="w-12 h-12 object-cover rounded-full border border-slate-700 shadow-inner"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-xs uppercase tracking-wider font-mono shadow-inner ${getScoutColor(formScoutName)}`}>
                              {getScoutInitials(formScoutName)}
                            </div>
                          )}
                          
                          {canEditScouting && (
                            <label
                              htmlFor="scout-photo-file-upload"
                              className="absolute -bottom-1 -right-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all transform hover:scale-110"
                              title="Subir foto para este Scout"
                            >
                              <Camera className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/*"
                                id="scout-photo-file-upload"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleScoutPhotoFile(file, formScoutName);
                                }}
                              />
                            </label>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <select
                            disabled={!canEditScouting}
                            value={formScoutName}
                            onChange={(e) => setFormScoutName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50 capitalize font-medium"
                          >
                            <option value="baldomir">baldomir</option>
                            <option value="julio">julio</option>
                            <option value="maria">maria</option>
                            <option value="parra">parra</option>
                            <option value="mariano">mariano</option>
                          </select>
                          <div className="text-[9px] font-mono pl-1 leading-normal">
                            {isUploadingScoutPhoto ? (
                              <p className="text-amber-400 animate-pulse">Subiendo foto...</p>
                            ) : syncingScoutPhotos[formScoutName] ? (
                              <p className="text-amber-400 animate-pulse flex items-center gap-1">⏱️ Sincronizando con Supabase Storage...</p>
                            ) : scoutPhotos[formScoutName] && scoutPhotos[formScoutName].includes('supabase.co') ? (
                              <p className="text-emerald-400 flex items-center gap-1">✓ Sincronizado en Supabase Storage</p>
                            ) : isSupabaseConfigured ? (
                              <button 
                                type="button" 
                                onClick={async () => {
                                  const localSrc = DEFAULT_AI_STUDIO_SCOUT_PHOTOS[formScoutName.toLowerCase()];
                                  if (localSrc) {
                                    try {
                                      setSyncingScoutPhotos(prev => ({ ...prev, [formScoutName]: true }));
                                      const response = await fetch(localSrc);
                                      const blob = await response.blob();
                                      const file = new File([blob], `scout_ai_${formScoutName.toLowerCase()}.png`, { type: 'image/png' });
                                      const supabaseUrl = await uploadScoutPhoto(file);
                                      setScoutPhotos(prev => {
                                        const updated = { ...prev, [formScoutName]: supabaseUrl };
                                        localStorage.setItem('scouting_scout_photos', JSON.stringify(updated));
                                        return updated;
                                      });
                                    } catch (err) {
                                      alert('Error de sincronización con Supabase.');
                                    } finally {
                                      setSyncingScoutPhotos(prev => ({ ...prev, [formScoutName]: false }));
                                    }
                                  }
                                }}
                                className="text-emerald-450 hover:text-emerald-400 underline cursor-pointer text-left font-medium block"
                              >
                                Vincular foto de AI Studio con Supabase Storage
                              </button>
                            ) : (
                              <p className="text-slate-500">Almacenada localmente (AI Studio)</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Observaciones Iniciales del Scout</label>
                    <textarea
                      rows={2}
                      required
                      disabled={!canEditScouting}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 text-slate-150 rounded-xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50 resize-y"
                      placeholder="Describe aptitudes tácticas principales..."
                    />
                  </div>

                  {/* Follow-up notes logs */}
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                      Bitácora de Seguimiento Continuo (Logs del Cuerpo Técnico)
                    </span>
                    
                    {editingPlayer && editingPlayer.followUpHistory.length > 0 ? (
                      <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                        {editingPlayer.followUpHistory.map((log, index) => (
                          <div key={index} className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-left">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                              <span>Fecha: {log.date}</span>
                              <span className="text-emerald-400 font-semibold">{log.author}</span>
                            </div>
                            <p className="text-slate-350 italic">"{log.note}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">Ningún comentario estructurado registrado.</p>
                    )}

                    {canEditScouting && (
                      <div className="pt-2">
                        <label className="block text-[10px] font-mono text-emerald-500 mb-1">
                          Añadir anotación temporal a la bitácora:
                        </label>
                        <input
                          type="text"
                          value={newFollowUpNote}
                          onChange={(e) => setNewFollowUpNote(e.target.value)}
                          placeholder="Ej: Destacó en repliegue hoy o partido espectacular..."
                          className="w-full px-3 py-2 bg-slate-950 border border-emerald-900/35 text-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ATTRIBUTES & RATINGS */}
              {modalTab === 'attributes' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950/80 border border-slate-850 p-4 rounded-2xl gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Aptitudes y Atributos Generales</h4>
                      <p className="text-xs text-slate-400">Determina el potencial individual escalando habilidades clave.</p>
                    </div>
                    {canEditScouting && (
                      <button
                        type="button"
                        onClick={calculateGlobalRatingFromAttributes}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs rounded-lg transition-all shadow-md flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Autocalcular Valoración Global</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Panel: Sliders */}
                    <div className="space-y-4 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block mb-2">Habilidades Básicas (0 - 100)</span>
                      
                      {/* Speed Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-450 font-bold flex items-center gap-1">⚡ Velicidad (Speed)</span>
                          <span className="text-white font-bold">{attrSpeed}/100</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="99"
                          disabled={!canEditScouting}
                          value={attrSpeed}
                          onChange={(e) => setAttrSpeed(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Agility Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-450 font-bold flex items-center gap-1">👟 Agilidad (Agility)</span>
                          <span className="text-white font-bold">{attrAgility}/100</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="99"
                          disabled={!canEditScouting}
                          value={attrAgility}
                          onChange={(e) => setAttrAgility(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Shooting Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-450 font-bold flex items-center gap-1">🎯 Disparo (Shooting)</span>
                          <span className="text-white font-bold">{attrShooting}/100</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="99"
                          disabled={!canEditScouting}
                          value={attrShooting}
                          onChange={(e) => setAttrShooting(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Defending Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-450 font-bold flex items-center gap-1">🛡️ Defensa (Defending)</span>
                          <span className="text-white font-bold">{attrDefending}/100</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="99"
                          disabled={!canEditScouting}
                          value={attrDefending}
                          onChange={(e) => setAttrDefending(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Passing Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-450 font-bold flex items-center gap-1">🧬 Pase (Passing)</span>
                          <span className="text-white font-bold">{attrPassing}/100</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="99"
                          disabled={!canEditScouting}
                          value={attrPassing}
                          onChange={(e) => setAttrPassing(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Physical Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-450 font-bold flex items-center gap-1">🏋️ Físico (Physical)</span>
                          <span className="text-white font-bold">{attrPhysical}/100</span>
                        </div>
                        <input
                          type="range"
                          min="35"
                          max="99"
                          disabled={!canEditScouting}
                          value={attrPhysical}
                          onChange={(e) => setAttrPhysical(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Right Panel: Beautiful attribute list visualizer */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block mb-3">Ficha de Valoración de Atributos</span>
                        
                        <div className="space-y-3.5">
                          {[
                            { label: 'VELOCIDAD', value: attrSpeed, color: getAttributeColor(attrSpeed) },
                            { label: 'AGILIDAD', value: attrAgility, color: getAttributeColor(attrAgility) },
                            { label: 'DISPARO', value: attrShooting, color: getAttributeColor(attrShooting) },
                            { label: 'DEFENSA', value: attrDefending, color: getAttributeColor(attrDefending) },
                            { label: 'PASES', value: attrPassing, color: getAttributeColor(attrPassing) },
                            { label: 'FÍSICO', value: attrPhysical, color: getAttributeColor(attrPhysical) },
                          ].map((attr, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-400 font-bold">{attr.label}</span>
                                <span className="text-slate-200 font-bold">{attr.value}</span>
                              </div>
                              <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`bg-gradient-to-r ${attr.color} h-2 rounded-full transition-all duration-550`} 
                                  style={{ width: `${attr.value}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center mt-3">
                        <div className="text-[10px] font-mono text-slate-500">PROMEDIO CALCULADO</div>
                        <div className="text-2xl font-black text-white font-mono mt-0.5">
                          {((attrSpeed + attrAgility + attrShooting + attrDefending + attrPassing + attrPhysical) / 6).toFixed(1)} <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PERFORMANCE DETAILS STATISTICS */}
              {modalTab === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                    <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest mb-1.5">Métricas de Campaña / Estadísticas Acumuladas</h4>
                    <p className="text-[11px] text-slate-400">Edita o introduce manualmente los números estadísticos del jugador. Estos valores alimentan el radar general.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Goles Totales</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEditScouting}
                        value={statGoals}
                        onChange={(e) => setStatGoals(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-amber-400 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Asistencias</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEditScouting}
                        value={statAssists}
                        onChange={(e) => setStatAssists(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-emerald-400 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Entradas / Tackles</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEditScouting}
                        value={statTackles}
                        onChange={(e) => setStatTackles(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-blue-400 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Pases Completados</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEditScouting}
                        value={statPasses}
                        onChange={(e) => setStatPasses(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-teal-400 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Eficacia Pase (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={!canEditScouting}
                        value={statPassesAccuracy}
                        onChange={(e) => setStatPassesAccuracy(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-yellow-500 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Minutos Jugados</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEditScouting}
                        value={statMinutesPlayed}
                        onChange={(e) => setStatMinutesPlayed(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">T. Amarillas</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEditScouting}
                        value={statCardsYellow}
                        onChange={(e) => setStatCardsYellow(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-yellow-600 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl block text-left">
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">T. Rojas</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEditScouting}
                        value={statCardsRed}
                        onChange={(e) => setStatCardsRed(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-red-500 font-bold rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic KPI analytics helper */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl mt-4">
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-bold block mb-3">Analítica Proactiva Computada (Cada 90 minutos)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-900 p-2.5 border border-slate-800 rounded-xl">
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Goles por 90'</div>
                        <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                          {statMinutesPlayed > 0 ? ((statGoals * 90) / statMinutesPlayed).toFixed(2) : '0.00'}
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2.5 border border-slate-800 rounded-xl">
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Asistencias por 90'</div>
                        <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                          {statMinutesPlayed > 0 ? ((statAssists * 90) / statMinutesPlayed).toFixed(2) : '0.00'}
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2.5 border border-slate-800 rounded-xl">
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Participación en Goles</div>
                        <div className="text-xl font-bold font-mono text-white mt-1">
                          {statGoals + statAssists} <span className="text-xs text-slate-500 font-normal">G+A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MATCH HISTORY */}
              {modalTab === 'matches' && (
                <div className="space-y-6">
                  {canEditScouting && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3.5">
                      <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                        <PlusCircle className="w-4 h-4 text-emerald-500" />
                        <span>Manualmente añadir registro de partido</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Rival / Oponente</label>
                          <input
                            type="text"
                            placeholder="Ej: Italia"
                            value={newMatchOpponent}
                            onChange={(e) => setNewMatchOpponent(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Competición</label>
                          <select
                            value={newMatchComp}
                            onChange={(e) => setNewMatchComp(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                          >
                            <option value="LaLiga">LaLiga</option>
                            <option value="Champions League">Champions League</option>
                            <option value="Eurocopa 2026">Eurocopa 2026</option>
                            <option value="Clasificación Mundial">Clasificación Mundial</option>
                            <option value="Amistosos Internacionales">Amistosos Internacionales</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Fecha</label>
                          <input
                            type="date"
                            value={newMatchDate}
                            onChange={(e) => setNewMatchDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Valoración Partido</label>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="10.0"
                            value={newMatchRating}
                            onChange={(e) => setNewMatchRating(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Goles anotados</label>
                          <input
                            type="number"
                            min="0"
                            value={newMatchGoals}
                            onChange={(e) => setNewMatchGoals(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Asistencias</label>
                          <input
                            type="number"
                            min="0"
                            value={newMatchAssists}
                            onChange={(e) => setNewMatchAssists(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Minutos jugados</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={newMatchMinutes}
                            onChange={(e) => setNewMatchMinutes(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Comentario táctico del partido</label>
                        <input
                          type="text"
                          placeholder="Ej: Gran repliegue defensivo y constante peligro..."
                          value={newMatchNotes}
                          onChange={(e) => setNewMatchNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddMatchEntry}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 font-black text-slate-950 text-xs rounded-xl shadow-md transition-colors"
                        >
                          + Registrar Partido
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Registered Matches list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Partidos Jugados Recientes</span>
                    
                    {matchList.length > 0 ? (
                      <div className="divide-y divide-slate-800 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden">
                        {matchList.map((m) => (
                          <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white uppercase font-mono">{m.opponent}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">{m.competition}</span>
                                <span className="text-[10px] font-mono text-slate-500">{m.date}</span>
                              </div>
                              {m.notes && <p className="text-slate-400 italic">"{m.notes}"</p>}
                              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-3">
                                <span>Minutos: <strong className="text-slate-200">{m.minutes}'</strong></span>
                                <span>Goles: <strong className="text-amber-400">{m.goals}</strong></span>
                                <span>Asistencias: <strong className="text-emerald-400">{m.assists}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 justify-between sm:justify-end">
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                m.rating >= 8.5 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                Nota: {m.rating.toFixed(1)}
                              </span>

                              {canEditScouting && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMatchEntry(m.id)}
                                  className="p-1 px-1.5 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-950/20 transition-all"
                                  title="Eliminar partido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="p-6 text-center text-slate-500 bg-slate-950 border border-slate-850 rounded-2xl text-xs italic">
                        Ningún registro de partidos ingresado en el sistema de scouting nacional.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: INJURY HISTORY */}
              {modalTab === 'injuries' && (
                <div className="space-y-6">
                  {canEditScouting && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3.5">
                      <span className="text-xs font-bold font-mono text-red-400 uppercase tracking-widest flex items-center gap-1">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        <span>Añadir registro al historial médico nacional</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Diagnóstico / Tipo de Lesión</label>
                          <input
                            type="text"
                            placeholder="Ej: Esguince de tobillo grado II"
                            value={newInjuryType}
                            onChange={(e) => setNewInjuryType(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Duración de la baja estimada</label>
                          <input
                            type="text"
                            placeholder="Ej: 3 semanas, 10 días"
                            value={newInjuryDuration}
                            onChange={(e) => setNewInjuryDuration(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Gravedad de la Lesión</label>
                          <select
                            value={newInjurySeverity}
                            onChange={(e) => setNewInjurySeverity(e.target.value as InjurySeverity)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Baja">Baja (Preventiva)</option>
                            <option value="Media">Media (Leve / Moderada)</option>
                            <option value="Alta">Alta (Grave / Quirúrgico)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Estado de la Lesión</label>
                          <select
                            value={newInjuryStatus}
                            onChange={(e) => setNewInjuryStatus(e.target.value as InjuryStatus)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Disponible">Disponible (Recuperado)</option>
                            <option value="Recuperación">En Recuperación (Readaptación)</option>
                            <option value="Lesionado">Lesionado (Inactivo)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Fecha de Baja</label>
                          <input
                            type="date"
                            value={newInjuryDate}
                            onChange={(e) => setNewInjuryDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-805 text-slate-100 text-xs rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddInjuryEntry}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl shadow-md transition-colors"
                        >
                          + Registrar Lesión
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Registered Injuries list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Bitácora Médica de Lesiones Históricas</span>
                    
                    {injuryList.length > 0 ? (
                      <div className="divide-y divide-slate-800 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden">
                        {injuryList.map((ih) => (
                          <div key={ih.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-rose-450 uppercase">{ih.type}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  ih.severity === 'Alta' ? 'bg-red-500/20 text-red-400' : ih.severity === 'Media' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                  Gravedad: {ih.severity}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">{ih.date}</span>
                              </div>
                              <p className="text-slate-400">
                                Período estimado de baja: <strong className="text-slate-300">{ih.duration}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-3 justify-between sm:justify-end">
                              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg font-mono ${
                                ih.status === 'Disponible' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                ih.status === 'Recuperación' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {ih.status.toUpperCase()}
                              </span>

                              {canEditScouting && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInjuryEntry(ih.id)}
                                  className="p-1 px-1.5 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-950/20 transition-all"
                                  title="Eliminar registro médico"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="p-6 text-center text-slate-500 bg-slate-950 border border-slate-850 rounded-2xl text-xs italic">
                        Sin diagnóstico clínico registrado en bases de datos nacionales. Historial limpio.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {editingPlayer ? `ID: ${editingPlayer.id}` : "Nueva Incorporación"} | {canEditScouting ? "EDICIÓN HABILITADA" : "SÓLO LECTURA"}
              </span>

              <div className="flex justify-end gap-2 px-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                {canEditScouting && (
                  <button
                    type="button"
                    onClick={handleSavePlayer}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/10"
                  >
                    Guardar Cambios
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED FIFA/FUT STYLE GIANT EXPANDED CARD MODAL */}
      {expandedPlayer && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setExpandedPlayer(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">Informe Detallado de Jugador (FUT Pro Analytics)</span>
              </div>
              <button 
                onClick={() => setExpandedPlayer(null)}
                className="w-8 h-8 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Content Grid */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch justify-items-center">
              
              {/* Giant FUT Card Column */}
              <div className="md:col-span-5 flex justify-center w-full">
                {(() => {
                  const rStyle = getRatingStyle(expandedPlayer.rating);
                  const { status: valStatus, stars: valStars, statusColor: valStatusColor, starColor: valStarColor } = getScoutingValuationData(expandedPlayer);
                  return (
                    <div className={`w-72 aspect-[2/3] bg-gradient-to-b ${rStyle.bg} border-2 rounded-[2rem] overflow-hidden p-6 flex flex-col justify-between relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${rStyle.glow} hover:scale-102 transition-transform duration-300`}>
                      
                      {/* Aura glowing lines effect */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
                      
                      {/* Top Header Row of Card */}
                      <div className="flex justify-between items-start relative z-10">
                        {/* Rating, Position */}
                        <div className="flex flex-col items-center">
                          <div className="font-mono font-black text-4xl text-white tracking-tighter leading-none drop-shadow-md">
                            {expandedPlayer.rating.toFixed(1)}
                          </div>
                          <span className={`inline-block mt-2 text-[10px] uppercase font-black px-2 py-0.5 rounded-md border font-mono ${rStyle.badge} tracking-wider`}>
                            {expandedPlayer.position}
                          </span>
                        </div>
                        
                        {/* Nationality flag representation or star rating */}
                        <div className="text-right flex flex-col items-end">
                          <span className="text-[9px] text-slate-400 font-mono tracking-wider">{expandedPlayer.nationality}</span>
                          <div className="flex gap-0.5 mt-1.5 bg-slate-950/60 px-1.5 py-0.5 rounded-full border border-slate-800/40">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-2.5 h-2.5 ${
                                  i < valStars 
                                    ? `${valStarColor}` 
                                    : 'text-slate-700'
                                  }`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Main Player Display Picture */}
                      <div className="flex justify-center my-4 relative z-10">
                        <div className="relative">
                          <img
                            referrerPolicy="no-referrer"
                            src={expandedPlayer.photo || FALLBACK_PLAYER_PHOTO}
                            alt={`${expandedPlayer.firstName} ${expandedPlayer.lastName}`}
                            className="w-32 h-32 rounded-full border-2 border-slate-700/80 object-cover shadow-2xl relative z-10"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_PLAYER_PHOTO;
                            }}
                          />
                          {(expandedPlayer.clubCrestUrl || DEFAULT_CLUB_CRESTS[expandedPlayer.currentClub]) && (
                            <div className="absolute bottom-0 right-1 bg-slate-900 border-2 border-slate-700 rounded-full p-1 w-10 h-10 flex items-center justify-center shadow-2xl z-20">
                              <img
                                referrerPolicy="no-referrer"
                                src={expandedPlayer.clubCrestUrl || DEFAULT_CLUB_CRESTS[expandedPlayer.currentClub]}
                                alt=""
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = FALLBACK_CLUB_CREST;
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Player Name and Team Details */}
                      <div className="text-center relative z-10">
                        <h4 className="text-xl font-black text-white leading-tight tracking-wide drop-shadow">
                          {expandedPlayer.firstName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-300 block">{expandedPlayer.lastName}</span>
                        </h4>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-center gap-1.5">
                          <span>{expandedPlayer.currentClub}</span>
                        </div>
                      </div>

                      {/* FUT Comprehensive Attributes Rows */}
                      <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 relative z-10">
                        <div className="grid grid-cols-3 gap-y-2 gap-x-2 text-center text-xs font-mono">
                          <div className="border-r border-slate-800/50">
                            <span className="block text-[8px] text-slate-500 uppercase">PAC</span>
                            <span className="font-black text-emerald-400 text-sm">{expandedPlayer.attributes?.speed ?? 75}</span>
                          </div>
                          <div className="border-r border-slate-800/50">
                            <span className="block text-[8px] text-slate-500 uppercase">AGI</span>
                            <span className="font-black text-emerald-400 text-sm">{expandedPlayer.attributes?.agility ?? 75}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-500 uppercase">PAS</span>
                            <span className="font-black text-emerald-400 text-sm">{expandedPlayer.attributes?.passing ?? 70}</span>
                          </div>
                          <div className="border-t border-r border-slate-800/50 pt-1.5 mt-1">
                            <span className="block text-[8px] text-slate-500 uppercase">DIS</span>
                            <span className="font-black text-emerald-400 text-sm">{expandedPlayer.attributes?.shooting ?? 70}</span>
                          </div>
                          <div className="border-t border-r border-slate-800/50 pt-1.5 mt-1">
                            <span className="block text-[8px] text-slate-500 uppercase">DEF</span>
                            <span className="font-black text-emerald-400 text-sm">{expandedPlayer.attributes?.defending ?? 65}</span>
                          </div>
                          <div className="border-t border-slate-800/50 pt-1.5 mt-1">
                            <span className="block text-[8px] text-slate-500 uppercase">FIS</span>
                            <span className="font-black text-emerald-400 text-sm">{expandedPlayer.attributes?.physical ?? 70}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>

              {/* Extended Interactive Scout Report panel */}
              <div className="md:col-span-12 lg:col-span-7 space-y-4 text-left w-full flex flex-col justify-between">
                <div>
                  {/* Tabs Navigator list */}
                  <div className="flex border-b border-slate-850 mb-4 overflow-x-auto scrollbar-none gap-2">
                    {[
                      { id: 'info', label: 'Ficha General', icon: BookOpen },
                      { id: 'stats', label: 'Stats FUT', icon: Activity },
                      { id: 'matches', label: 'Partidos', icon: Trophy, badge: expandedPlayer.matchHistory?.length },
                      { id: 'history', label: 'Hitos Seguimiento', icon: Calendar, badge: expandedPlayer.followUpHistory?.length },
                      { id: 'medical', label: 'Ficha Médica', icon: HeartPulse, badge: expandedPlayer.injuryHistory?.filter(i => i.status === 'Lesionado').length, badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
                    ].map((tab) => {
                      const IconComponent = tab.icon;
                      const isActive = expandedTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setExpandedTab(tab.id as any)}
                          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                            isActive 
                              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-850/20'
                          }`}
                        >
                          <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span>{tab.label}</span>
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border leading-none ${tab.badgeColor || 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* TAB 1: FICHA GENERAL MODULE */}
                  {expandedTab === 'info' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300"></div>
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-450" />
                          Notas del Scout & Informe de Campo
                        </h5>
                        <p className="text-xs text-slate-300 italic leading-relaxed whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-850/50">
                          "{expandedPlayer.notes || 'Sin comentarios registrados por scouts de la federación.'}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950/55 p-3.5 border border-slate-850 rounded-2xl">
                          <span className="text-[9px] font-mono text-slate-520 uppercase block tracking-wider font-bold">Lateral Preferido</span>
                          <div className="text-xs font-black text-slate-100 flex items-center gap-2 mt-1.5">
                            <Footprints className="w-4 h-4 text-emerald-400" />
                            <span>{expandedPlayer.preferredFoot}</span>
                          </div>
                        </div>

                        <div className="bg-slate-950/55 p-3.5 border border-slate-850 rounded-2xl">
                          <span className="text-[9px] font-mono text-slate-520 uppercase block tracking-wider font-bold">Rango de Edad y Nacimiento</span>
                          <div className="text-xs font-black text-slate-100 flex items-center gap-2 mt-1.5">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span>{expandedPlayer.age} años ({expandedPlayer.birthDate || 'S/D'})</span>
                          </div>
                        </div>

                        <div className="bg-slate-950/55 p-3.5 border border-slate-850 rounded-2xl">
                          <span className="text-[9px] font-mono text-slate-520 uppercase block tracking-wider font-bold">Selección Autonómica</span>
                          <div className="text-xs font-black text-emerald-400 flex items-center gap-2 mt-1.5 font-mono">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{expandedPlayer.selectableCategory ? `✓ Jugador ${expandedPlayer.selectableCategory}` : 'No convocado'}</span>
                          </div>
                        </div>

                        <div className="bg-slate-950/55 p-3.5 border border-slate-850 rounded-2xl">
                          <span className="text-[9px] font-mono text-slate-520 uppercase block tracking-wider font-bold">Categoría de Liga</span>
                          <div className="text-xs font-black text-slate-100 flex items-center gap-2 mt-1.5 font-mono">
                            <Award className="w-4 h-4 text-yellow-405" />
                            <span>{expandedPlayer.category || 'Sin categoría cargada'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Scout Asignado:</span>
                          <div className="flex items-center gap-1.5">
                            {getScoutPhotoUrl(expandedPlayer.scoutName || '') ? (
                              <img
                                referrerPolicy="no-referrer"
                                src={getScoutPhotoUrl(expandedPlayer.scoutName || '') || ''}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover border border-slate-705"
                              />
                            ) : (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[8px] ${getScoutColor(expandedPlayer.scoutName || '')}`}>
                                {getScoutInitials(expandedPlayer.scoutName || '')}
                              </div>
                            )}
                            <span className="text-xs font-bold text-slate-200 capitalize">{expandedPlayer.scoutName || 'baldomir'}</span>
                          </div>
                        </div>

                        {expandedPlayer.matchObserved && (
                          <div className="text-right text-[10px] font-mono">
                            <span className="text-slate-500">Observado en: </span>
                            <span className="text-slate-200 font-bold border border-slate-800 px-1.5 py-0.5 rounded bg-slate-950">{expandedPlayer.matchObserved}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: RENDIMIENTO Y STATS INDEPTH */}
                  {expandedTab === 'stats' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          Desglose de Atributos Físicos & Técnicos (FUT)
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                          {[
                            { val: expandedPlayer.attributes?.speed ?? 75, label: 'PAC • Velocidad y Aceleración' },
                            { val: expandedPlayer.attributes?.agility ?? 75, label: 'AGI • Agilidad y Regates' },
                            { val: expandedPlayer.attributes?.passing ?? 70, label: 'PAS • Precisión y Visión de Pase' },
                            { val: expandedPlayer.attributes?.shooting ?? 70, label: 'DIS • Disparo y Finalización' },
                            { val: expandedPlayer.attributes?.defending ?? 65, label: 'DEF • Robos e Intercepciones' },
                            { val: expandedPlayer.attributes?.physical ?? 70, label: 'FIS • Fuerza y Resistencia' }
                          ].map((item, idx) => {
                            const percent = Math.min(Math.max(item.val, 0), 100);
                            let color = 'bg-rose-500';
                            if (percent >= 80) color = 'bg-emerald-500';
                            else if (percent >= 70) color = 'bg-yellow-500';
                            else if (percent >= 50) color = 'bg-orange-505';
                            return (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-slate-400">{item.label}</span>
                                  <span className="font-bold text-slate-150">{percent}/100</span>
                                </div>
                                <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden p-0.5 flex">
                                  <span className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-3 px-1 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-yellow-501" />
                          Estadísticas de Rendimiento Histórico Copa / Liga
                        </h5>
                        {(() => {
                          const pos = expandedPlayer.position;
                          const s = expandedPlayer.stats || {
                            goals: pos === 'DEL' ? 14 : pos === 'MED' ? 4 : 1,
                            assists: pos === 'DEL' ? 6 : pos === 'MED' ? 11 : 2,
                            passesAccuracy: pos === 'MED' ? 88 : pos === 'DEF' ? 82 : 74,
                            tackles: pos === 'DEF' ? 36 : pos === 'MED' ? 24 : 4,
                            minutesPlayed: 1420,
                            cardsYellow: 3,
                            cardsRed: 0
                          };
                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850/60">
                                <span className="text-[8px] font-mono text-slate-500 block uppercase">Goles</span>
                                <span className="text-xl font-bold font-mono text-emerald-450 mt-1 block">{s.goals}</span>
                              </div>
                              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850/60">
                                <span className="text-[8px] font-mono text-slate-500 block uppercase">Asistencias</span>
                                <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">{s.assists}</span>
                              </div>
                              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850/60">
                                <span className="text-[8px] font-mono text-slate-500 block uppercase">Precisión Pases</span>
                                <span className="text-xl font-bold font-mono text-yellow-405 mt-1 block">{s.passesAccuracy}%</span>
                              </div>
                              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850/60">
                                <span className="text-[8px] font-mono text-slate-500 block uppercase">Minutos Temporada</span>
                                <span className="text-xl font-bold font-mono text-slate-205 mt-1 block">{s.minutesPlayed || 0}</span>
                              </div>
                              
                              <div className="sm:col-span-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-850/50 flex justify-around items-center px-4 leading-none">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">Amonestaciones:</span>
                                <div className="flex gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-3.5 bg-yellow-400 rounded-sm inline-block shadow"></span>
                                    <span className="text-xs font-mono font-bold text-slate-205">{s.cardsYellow || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-3.5 bg-rose-550 rounded-sm inline-block shadow"></span>
                                    <span className="text-xs font-mono font-bold text-slate-205">{s.cardsRed || 0}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="sm:col-span-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-850/50 flex justify-between items-center px-4 text-left font-mono">
                                <span className="text-[8px] text-slate-500 uppercase">Robos / Entradas:</span>
                                <span className="text-xs text-slate-200 font-bold">{s.tackles || 0}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PARTIDOS OFICIALES LIST */}
                  {expandedTab === 'matches' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-emerald-450" />
                            Historial de Actuaciones de Partidos Registrados
                          </span>
                          <span className="text-[9px] text-slate-510 font-mono">({expandedPlayer.matchHistory?.length ?? 0} partidos)</span>
                        </h5>
                        
                        {!expandedPlayer.matchHistory || expandedPlayer.matchHistory.length === 0 ? (
                          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-850 border-dashed">
                            <Trophy className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-slate-400 font-medium">No hay registros de partidos oficiales de la federación para este jugador.</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">Puede agregar actuaciones de partidos desde el formulario de edición.</p>
                          </div>
                        ) : (
                          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {expandedPlayer.matchHistory.map((m) => {
                              let ratingBg = 'bg-rose-500/15 border-rose-550/20 text-rose-400';
                              if (m.rating >= 8.0) ratingBg = 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400';
                              else if (m.rating >= 6.5) ratingBg = 'bg-yellow-500/15 border-yellow-500/20 text-yellow-400';
                              return (
                                <div key={m.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono text-slate-500">{m.date}</span>
                                      <span className="text-[8px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">{m.competition}</span>
                                    </div>
                                    <p className="text-xs text-slate-200 font-bold">vs {m.opponent}</p>
                                  </div>
                                  <div className="flex flex-col sm:items-end justify-center min-w-[70px]">
                                    <div className="flex gap-2.5 items-center font-mono text-[10px]">
                                      <span className="text-slate-500 leading-none">Minutos: <strong className="text-slate-200">{m.minutes}'</strong></span>
                                      {m.goals > 0 && <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded text-[9px]">⚽ {m.goals} G</span>}
                                      {m.assists > 0 && <span className="text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1 rounded text-[9px]">👟 {m.assists} A</span>}
                                    </div>
                                    {m.notes && <p className="text-[9px] text-slate-400 italic mt-0.5 line-clamp-1">"{m.notes}"</p>}
                                  </div>
                                  <div className={`px-2 py-1 rounded-lg border font-mono font-bold text-xs text-center min-w-[45px] self-start sm:self-auto ${ratingBg}`}>
                                    {m.rating.toFixed(1)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SEGUIMIENTO TIMELINE HISTORIAL */}
                  {expandedTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-4 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          Línea Temporal de Modificaciones y Comentarios de Campo
                        </h5>
                        
                        {!expandedPlayer.followUpHistory || expandedPlayer.followUpHistory.length === 0 ? (
                          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-850 border-dashed">
                            <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-slate-400 font-medium">No hay evaluaciones cronológicas registradas en el historial.</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">Los cambios en los informes del scout se registrarán aquí automáticamente.</p>
                          </div>
                        ) : (
                          <div className="relative border-l border-slate-800 ml-3 pl-4 space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {expandedPlayer.followUpHistory.map((item, idx) => (
                              <div key={idx} className="relative group text-left">
                                <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-slate-900 group-hover:bg-yellow-400 transition-colors"></span>
                                
                                <div className="space-y-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono text-slate-500 font-bold">{item.date}</span>
                                      <span className="text-[9px] font-mono font-black border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 px-1.5 rounded-full capitalize">
                                        {item.author}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/60 whitespace-pre-line">
                                    {item.note}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: HISTORIAL MEDICO & LESIONES */}
                  {expandedTab === 'medical' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                            <HeartPulse className="w-4 h-4 text-emerald-450" />
                            Ficha Médica & Historial de Lesiones
                          </h5>
                          {(() => {
                            const isInjured = expandedPlayer.injuryHistory?.some(i => i.status === 'Lesionado') || false;
                            const inRecovery = expandedPlayer.injuryHistory?.some(i => i.status === 'Recuperación') || false;
                            
                            let medText = 'Disponible / Apto';
                            let medClasses = 'bg-emerald-500/15 border-emerald-500/25 text-emerald-450';
                            if (isInjured) {
                              medText = 'De Baja por Lesión';
                              medClasses = 'bg-rose-500/15 border-rose-500/25 text-rose-400';
                            } else if (inRecovery) {
                              medText = 'En Fase de Recuperación';
                              medClasses = 'bg-orange-500/15 border-orange-500/25 text-orange-400';
                            }
                            return (
                              <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border ${medClasses}`}>
                                ● {medText}
                              </span>
                            );
                          })()}
                        </div>

                        {!expandedPlayer.injuryHistory || expandedPlayer.injuryHistory.length === 0 ? (
                          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-850 border-dashed">
                            <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-30" />
                            <p className="text-xs text-slate-300 font-bold text-emerald-455">Sin lesiones registradas.</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">El jugador se encuentra en un estado de forma física óptimo para la competición.</p>
                          </div>
                        ) : (
                          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {expandedPlayer.injuryHistory.map((inj) => {
                              let sevColor = 'text-green-400 bg-green-500/10 border-green-500/20';
                              if (inj.severity === 'Alta') sevColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                              else if (inj.severity === 'Media') sevColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
                              
                              let statColor = 'text-slate-400 bg-slate-900 border-slate-800';
                              if (inj.status === 'Lesionado') statColor = 'text-rose-400 bg-rose-500/15 border-rose-500/25 animate-pulse';
                              else if (inj.status === 'Recuperación') statColor = 'text-orange-400 bg-orange-500/15 border-orange-500/25';
                              return (
                                <div key={inj.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3 text-left">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono text-slate-500">{inj.date}</span>
                                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${sevColor}`}>
                                        Sev: {inj.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-200 font-bold">{inj.type}</p>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-1 font-mono">
                                    <span className="text-[9px] text-slate-505 block leading-none">Baja: <strong>{inj.duration}</strong></span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statColor}`}>
                                      {inj.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <div className="pt-4 border-t border-slate-850 flex justify-end gap-3 self-end w-full">
                  <button
                    type="button"
                    onClick={() => {
                      exportPlayerToPDF(expandedPlayer);
                    }}
                    className="px-4 py-2 bg-slate-950 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Exportar en PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedPlayer(null)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition-colors shadow-lg shadow-emerald-500/10"
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
