export type UserRole = 'admin' | 'coach' | 'scout' | 'physio' | 'doctor';

export interface UserSession {
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
}

export type PlayerPosition = 'DEL' | 'MED' | 'DEF' | 'POR';

export interface PlayerStats {
  goals: number;
  assists: number;
  passes: number;
  passesAccuracy: number; // percentage (e.g., 85)
  tackles: number;
  minutesPlayed: number;
  cardsYellow: number;
  cardsRed: number;
}

export interface MatchHistoryEntry {
  id: string;
  date: string;
  opponent: string;
  competition: string;
  rating: number; // 1 to 10
  goals: number;
  assists: number;
  minutes: number;
  notes?: string;
}

export interface PlayerInjuryHistoryEntry {
  id: string;
  date: string;
  type: string;
  duration: string;
  severity: InjurySeverity;
  status: InjuryStatus;
}

export interface PlayerAttributes {
  speed: number;    // 0-100
  agility: number;  // 0-100
  shooting: number; // 0-100
  defending: number;// 0-100
  physical: number; // 0-100
  passing: number;  // 0-100
}

export interface ScoutPlayer {
  id: string;
  photo: string;
  firstName: string;
  lastName: string;
  age: number;
  position: PlayerPosition;
  positionFull: string;
  currentClub: string;
  nationality: string;
  preferredFoot: 'Diestro' | 'Zurdo' | 'Ambidiestro';
  rating: number; // 1 to 10 scale
  notes: string;
  followUpHistory: Array<{
    date: string;
    author: string;
    note: string;
  }>;
  stats?: PlayerStats;
  matchHistory?: MatchHistoryEntry[];
  injuryHistory?: PlayerInjuryHistoryEntry[];
  attributes?: PlayerAttributes;
  matchObserved?: string;
  category?: string;
  birthDate?: string;
  selectableCategory?: 'Sub-12' | 'Sub-14' | 'Sub-16' | '';
  clubCrestUrl?: string;
  scoutingStatus?: 'Selección' | 'Interesante' | 'Seguir' | 'Descartar';
  scoutName?: string;
}

export type TrainingCategory = 'Táctico' | 'Técnico' | 'Físico' | 'Estrategia';

export interface TrainingSession {
  id: string;
  title: string;
  dateTime: string;
  description: string;
  videoUrl: string;
  category: TrainingCategory;
  completed: boolean;
}

export type TacticalFormation = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | 'Personalizado';

export interface TacticalPlayer {
  id: string;
  name: string;
  x: number; // Percentage 0 - 100 on the field grid
  y: number; // Percentage 0 - 100 on the field grid
  number: number;
  roleName?: string;
  isOpponent?: boolean;
}

export interface TacticalSetup {
  id: string;
  name: string;
  formation: TacticalFormation;
  teamColor: string; // Hex or CSS color
  opponentColor: string; // Hex or CSS color
  players: TacticalPlayer[];
  notes?: string;
}

export type InjurySeverity = 'Baja' | 'Media' | 'Alta';
export type InjuryStatus = 'Recuperación' | 'Disponible' | 'Lesionado';

// Mapping human body parts to specific zones
export type HumanBodyZone = 
  | 'cabeza'
  | 'hombro-izq' | 'hombro-der'
  | 'pecho'
  | 'abdomen'
  | 'brazo-izq' | 'brazo-der'
  | 'cuadriceps-izq' | 'cuadriceps-der'
  | 'isquios-izq' | 'isquios-der'
  | 'rodilla-izq' | 'rodilla-der'
  | 'tobillo-izq' | 'tobillo-der'
  | 'espalda-alta' | 'lumbar';

export interface InjuryReport {
  id: string;
  playerId: string;
  playerName: string;
  bodyZone: HumanBodyZone;
  type: string; // e.g. "Esguince grado II", "Rotura fibrilar", "Sobrecarga"
  severity: InjurySeverity;
  date: string;
  estimatedRecovery: string; // e.g., "3 semanas", "10 días"
  status: InjuryStatus;
  history?: string[];
}

export type CalendarEventType = 'entrenamiento' | 'partido' | 'reunión' | 'viaje';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  start: string; // ISO string or simple YYYY-MM-DDTHH:mm
  end: string;
  description: string;
  location?: string;
}

export interface IndividualObjective {
  id: string;
  name: string;
  progress: number; // 0 to 100
  exercise: string;
  videoUrl?: string; // YouTube or Vimeo to improve
}

export interface PDPPlayerPlan {
  id: string;
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  photo: string;
  objectives: IndividualObjective[];
  metrics: {
    tecnica: number; // 0 - 100
    fisica: number;
    tactica: number;
    mentalidad: number;
  };
  metricsHistory: Array<{
    date: string;
    tecnica: number;
    fisica: number;
    tactica: number;
    mentalidad: number;
  }>;
}
