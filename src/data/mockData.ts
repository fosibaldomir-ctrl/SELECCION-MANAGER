import { 
  ScoutPlayer, 
  TrainingSession, 
  TacticalSetup, 
  TacticalPlayer,
  InjuryReport, 
  CalendarEvent, 
  PDPPlayerPlan, 
  UserSession 
} from '../types';

// Mock staff profiles with active role customization
export const MOCK_STAFF_PROFILES: UserSession[] = [
  {
    name: "Luis de la Fuente",
    role: "coach",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
    email: "luis.coach@rffpa.es"
  },
  {
    name: "Andrés Montero",
    role: "scout",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    email: "andres.scout@rffpa.es"
  },
  {
    name: "Dra. Helena Sanz",
    role: "doctor",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80",
    email: "helena.medical@rffpa.es"
  },
  {
    name: "Carlos Rivera",
    role: "physio",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80",
    email: "carlos.physio@rffpa.es"
  },
  {
    name: "Alvaro Guerrero",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    email: "alvaro.admin@rffpa.es"
  }
];

// 1. Scouting Players db
export const INITIAL_SCOUT_PLAYERS: ScoutPlayer[] = [
  {
    id: "p1",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    firstName: "Lamine",
    lastName: "Yamal",
    age: 18,
    position: "DEL",
    positionFull: "Extremo Derecho",
    currentClub: "FC Barcelona",
    nationality: "Española",
    preferredFoot: "Zurdo",
    rating: 9.5,
    notes: "Talento generacional. Excelente habilidad para el desborde interior de derecha a izquierda, visión de pase periférica y gran toma de decisiones en el último tercio del campo.",
    followUpHistory: [
      { date: "2026-03-10", author: "Andrés Montero", note: "Partido sobresaliente contra Francia. Clave en transiciones ofensivas." },
      { date: "2026-04-15", author: "Andrés Montero", note: "Gran madurez táctica en defensa replegando y tapando al lateral rival." }
    ],
    stats: { goals: 12, assists: 15, passes: 812, passesAccuracy: 84, tackles: 24, minutesPlayed: 1840, cardsYellow: 2, cardsRed: 0 },
    matchHistory: [
      { id: "m1", date: "2026-05-18", opponent: "Italia", competition: "Amistosos Internacionales", rating: 9.0, goals: 1, assists: 1, minutes: 82, notes: "Determinante por banda derecha, gol en diagonal y desborde imparable." },
      { id: "m2", date: "2026-05-12", opponent: "Alemania", competition: "Amistosos Internacionales", rating: 8.5, goals: 0, assists: 2, minutes: 90, notes: "Asistió en los goles de Nico Williams. Gran control del juego." }
    ],
    injuryHistory: [
      { id: "ih1", date: "2026-04-01", type: "Sobrecarga Isquiotibiales", duration: "10 días", severity: "Baja", status: "Disponible" }
    ],
    attributes: { speed: 92, agility: 96, shooting: 88, defending: 45, physical: 74, passing: 91 }
  },
  {
    id: "p2",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80",
    firstName: "Nico",
    lastName: "Williams",
    age: 23,
    position: "DEL",
    positionFull: "Extremo Izquierdo",
    currentClub: "Athletic Club",
    nationality: "Española",
    preferredFoot: "Diestro",
    rating: 8.8,
    notes: "Potencia, velocidad punta de élite y desborde en el 1 contra 1. Capaz de jugar a pierna cambiada o por banda natural.",
    followUpHistory: [
      { date: "2026-03-22", author: "Luis de la Fuente", note: "Hizo un daño constante con diagonales hacia portería." }
    ],
    stats: { goals: 9, assists: 7, passes: 450, passesAccuracy: 78, tackles: 18, minutesPlayed: 1450, cardsYellow: 1, cardsRed: 0 },
    matchHistory: [
      { id: "m3", date: "2026-05-18", opponent: "Italia", competition: "Amistosos Internacionales", rating: 8.2, goals: 1, assists: 0, minutes: 75, notes: "Gran definición al palo largo en transición directa." }
    ],
    injuryHistory: [],
    attributes: { speed: 96, agility: 92, shooting: 84, defending: 38, physical: 78, passing: 81 }
  },
  {
    id: "p3",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    firstName: "Rodri",
    lastName: "Hernández",
    age: 29,
    position: "MED",
    positionFull: "Centrocampista Defensivo",
    currentClub: "Manchester City",
    nationality: "Española",
    preferredFoot: "Diestro",
    rating: 9.8,
    notes: "El mejor pivote defensivo del mundo. Lectura de juego, distribución perfecta, orientación corporal y liderazgo en la presión tras pérdida.",
    followUpHistory: [
      { date: "2026-01-12", author: "Andrés Montero", note: "Recuperado y rindiendo a un nivel superlativo. Distribución impecable." }
    ],
    stats: { goals: 4, assists: 6, passes: 1980, passesAccuracy: 93, tackles: 65, minutesPlayed: 2100, cardsYellow: 5, cardsRed: 0 },
    matchHistory: [
      { id: "m4", date: "2026-05-18", opponent: "Italia", competition: "Amistosos Internacionales", rating: 9.5, goals: 0, assists: 1, minutes: 90, notes: "Recuperó 12 balones y organizó el repliegue. Omnipresente." }
    ],
    injuryHistory: [
      { id: "ih2", date: "2026-02-15", type: "Esguince de Tobillo", duration: "3 semanas", severity: "Media", status: "Disponible" }
    ],
    attributes: { speed: 78, agility: 80, shooting: 82, defending: 94, physical: 91, passing: 95 }
  },
  {
    id: "p4",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    firstName: "Pedri",
    lastName: "González",
    age: 23,
    position: "MED",
    positionFull: "Interior Creativo",
    currentClub: "FC Barcelona",
    nationality: "Española",
    preferredFoot: "Diestro",
    rating: 9.2,
    notes: "Habilidad única para encontrar espacios entre líneas. Giro rápido del cuerpo sobre su propio eje y excelente pausa de juego.",
    followUpHistory: [
      { date: "2026-02-14", author: "Andrés Montero", note: "Gran resistencia exhibida en partidos de alta intensidad física." }
    ],
    stats: { goals: 3, assists: 8, passes: 1420, passesAccuracy: 90, tackles: 32, minutesPlayed: 1250, cardsYellow: 1, cardsRed: 0 },
    matchHistory: [
      { id: "m5", date: "2026-05-18", opponent: "Italia", competition: "Amistosos Internacionales", rating: 8.8, goals: 0, assists: 0, minutes: 68, notes: "Inició la jugada del primer gol. Giros espectaculares." }
    ],
    injuryHistory: [
      { id: "ih3", date: "2026-03-01", type: "Rotura de fibras en muslo", duration: "4 semanas", severity: "Alta", status: "Disponible" }
    ],
    attributes: { speed: 82, agility: 94, shooting: 78, defending: 68, physical: 75, passing: 94 }
  },
  {
    id: "p5",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
    firstName: "Robin",
    lastName: "Le Normand",
    age: 29,
    position: "DEF",
    positionFull: "Central Derecho",
    currentClub: "Atlético de Madrid",
    nationality: "Española",
    preferredFoot: "Diestro",
    rating: 8.2,
    notes: "Excelente juego aéreo ofensivo y defensivo. Central de marcaje contundente, juego de espaldas férreo y salida de balón limpia.",
    followUpHistory: [
      { date: "2026-04-01", author: "Andrés Montero", note: "Muy seguro en vigilancias defensivas y juego de anticipación aérea por alto." }
    ],
    stats: { goals: 1, assists: 0, passes: 1100, passesAccuracy: 88, tackles: 58, minutesPlayed: 1900, cardsYellow: 4, cardsRed: 1 },
    matchHistory: [
      { id: "m6", date: "2026-05-18", opponent: "Italia", competition: "Amistosos Internacionales", rating: 8.0, goals: 0, assists: 0, minutes: 90, notes: "Infranqueable en el juego aéreo. Secó a los delanteros centros rivales." }
    ],
    injuryHistory: [],
    attributes: { speed: 76, agility: 75, shooting: 55, defending: 88, physical: 89, passing: 81 }
  },
  {
    id: "p6",
    photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80",
    firstName: "Daniel",
    lastName: "Carvajal",
    age: 34,
    position: "DEF",
    positionFull: "Lateral Derecho",
    currentClub: "Real Madrid",
    nationality: "Española",
    preferredFoot: "Diestro",
    rating: 8.9,
    notes: "Competidor insaciable. Profundidad constante en ataque, agresividad defensiva controlada y gran capacidad táctica correctora.",
    followUpHistory: [
      { date: "2026-04-10", author: "Carlos Rivera", note: "Físicamente impecable tras la dosificación en su club." }
    ],
    stats: { goals: 2, assists: 4, passes: 980, passesAccuracy: 83, tackles: 72, minutesPlayed: 1750, cardsYellow: 6, cardsRed: 0 },
    matchHistory: [
      { id: "m7", date: "2026-05-18", opponent: "Italia", competition: "Amistosos Internacionales", rating: 8.4, goals: 0, assists: 1, minutes: 90, notes: "Asistencia milimétrica desde banda derecha. Defendió con gran orgullo." }
    ],
    injuryHistory: [],
    attributes: { speed: 83, agility: 82, shooting: 68, defending: 89, physical: 88, passing: 82 }
  },
  {
    id: "p7",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80",
    firstName: "Unai",
    lastName: "Simón",
    age: 28,
    position: "POR",
    positionFull: "Portero",
    currentClub: "Athletic Club",
    nationality: "Española",
    preferredFoot: "Diestro",
    rating: 8.7,
    notes: "Gran portero de reflejos en línea de gol. Excelente juego con los pies para salidas asociativas y autoridad defensiva en área pequeña.",
    followUpHistory: [
      { date: "2026-05-01", author: "Andrés Montero", note: "Entrenamiento de penaltis muy satisfactorio." }
    ],
    stats: { goals: 0, assists: 0, passes: 720, passesAccuracy: 81, tackles: 2, minutesPlayed: 2300, cardsYellow: 1, cardsRed: 0 },
    matchHistory: [
      { id: "m8", date: "2026-05-18", opponent: "Italia", competition: "Amistosos Internacionales", rating: 8.6, goals: 0, assists: 0, minutes: 90, notes: "Paradas clave de uno contra uno. Portería a cero." }
    ],
    injuryHistory: [],
    attributes: { speed: 75, agility: 88, shooting: 30, defending: 92, physical: 84, passing: 85 }
  },
  {
    id: "p8",
    photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80",
    firstName: "Martin",
    lastName: "Zubimendi",
    age: 27,
    position: "MED",
    positionFull: "Pivote Organizador",
    currentClub: "Real Sociedad",
    nationality: "Española",
    preferredFoot: "Diestro",
    rating: 8.5,
    notes: "Gran sentido posicional y equilibrio defensivo. Capaz de desatascar salidas complejas con pases limpios en vertical.",
    followUpHistory: [
      { date: "2026-05-05", author: "Luis de la Fuente", note: "Excelente partido como pivote único. Domina el ritmo del centro del campo." }
    ],
    stats: { goals: 1, assists: 2, passes: 1050, passesAccuracy: 92, tackles: 48, minutesPlayed: 1100, cardsYellow: 2, cardsRed: 0 },
    matchHistory: [
      { id: "m9", date: "2026-05-12", opponent: "Alemania", competition: "Amistosos Internacionales", rating: 8.3, goals: 0, assists: 0, minutes: 45, notes: "Entró en la segunda parte para dar equilibrio." }
    ],
    injuryHistory: [],
    attributes: { speed: 78, agility: 81, shooting: 70, defending: 86, physical: 82, passing: 89 }
  }
];

// 2. Training Sessions and Workouts
export const INITIAL_TRAINING_SESSIONS: TrainingSession[] = [
  {
    id: "t1",
    title: "Presión alta y repliegue rápido tras pérdida",
    dateTime: "2026-05-22T10:00",
    description: "Trabajo estructurado de rondos 5x2 de alta velocidad seguidos de transiciones 8x6 para automatizar el bloque de presión activa sobre centrocampistas y repliegue defensivo de extremos.",
    videoUrl: "https://www.youtube.com/embed/jZ_vVq4t4Yg", // Tactical high press tutorial embed
    category: "Táctico",
    completed: false
  },
  {
    id: "t2",
    title: "Salida asociativa bajo acoso de rival bloque bajo",
    dateTime: "2026-05-23T11:30",
    description: "Ejercicios de tercer hombre, salida en rombo desde el guardameta combinando con interiores, y generación de pasillo central. Vídeo de apoyo que detalla los movimientos clave de los centrales abiertos.",
    videoUrl: "https://www.youtube.com/embed/zH0F6_t9Fqg", // Out from the back tactics video embed
    category: "Táctico",
    completed: false
  },
  {
    id: "t3",
    title: "Optimización aeróbica en ráfagas e intervalos de sprint",
    dateTime: "2026-05-20T09:00",
    description: "Bloque de fuerza explosiva en tren inferior seguido de series intermitentes de velocidad. Monitoreo por radar GPS de cargas y distancias en aceleración intensa.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Fitness tutorial example embed
    category: "Físico",
    completed: true
  },
  {
    id: "t4",
    title: "Centros laterales con finalización a un toque",
    dateTime: "2026-05-24T10:00",
    description: "Ejercicios técnicos repetitivos de desborde y centro templado o raso, con incorporaciones desde segunda línea de interiores y rematadores a espalda de centrales contrarios.",
    videoUrl: "https://www.youtube.com/embed/nU2W627W9e4", // Crossing and finishing drills
    category: "Técnico",
    completed: false
  },
  {
    id: "t5",
    title: "Defensa de bloque en balones parados y córners",
    dateTime: "2026-05-21T17:00",
    description: "Ejecución de córners a favor con bloqueos ofensivos y control de contraataques rivales. Zonas de cobertura mixtas (zona e individual). Sesión completada hoy.",
    videoUrl: "https://www.youtube.com/embed/S263Z547pS4", // Set pieces strategies
    category: "Estrategia",
    completed: true
  }
];

// 3. Formations Coordinates preset presets (x: lateral 0-100, y: vertical [0 is goalkeeper-end, 100/higher is striker-end depending on orientation, but let's treat x 0-100 left-to-right, and y 100-0 from opponent-box back to goalkeeper, or y 0-100 where 90 is goalkeeper, 10 is strikers)
// Field coordinates standard: Y ranges from 5 (Goalie) to 90 (Strikers).
export const PRESETS_FORMATIONS: Record<string, TacticalPlayer[]> = {
  "4-3-3": [
    { id: "tp1", name: "Unai Simón", x: 50, y: 92, number: 1, roleName: "POR / Goalkeeper" },
    { id: "tp2", name: "Daniel Carvajal", x: 15, y: 70, number: 2, roleName: "LD / Right Back" },
    { id: "tp3", name: "Le Normand", x: 38, y: 75, number: 3, roleName: "DFD / Right Center Back" },
    { id: "tp4", name: "Aymeric Laporte", x: 62, y: 75, number: 4, roleName: "DFI / Left Center Back" },
    { id: "tp5", name: "Marc Cucurella", x: 85, y: 70, number: 24, roleName: "LI / Left Back" },
    { id: "tp6", name: "Rodri Hernández", x: 50, y: 55, number: 16, roleName: "MCD / Pivot" },
    { id: "tp7", name: "Unai Ruiz", x: 32, y: 40, number: 6, roleName: "MC / Internal Right" },
    { id: "tp8", name: "Pedri González", x: 68, y: 40, number: 20, roleName: "MC / Internal Left" },
    { id: "tp9", name: "Lamine Yamal", x: 20, y: 22, number: 19, roleName: "ED / Right Winger" },
    { id: "tp10", name: "Álvaro Morata", x: 50, y: 15, number: 7, roleName: "DC / Striker" },
    { id: "tp11", name: "Nico Williams", x: 80, y: 22, number: 17, roleName: "EI / Left Winger" }
  ],
  "4-4-2": [
    { id: "tp1", name: "Unai Simón", x: 50, y: 92, number: 1, roleName: "POR" },
    { id: "tp2", name: "Daniel Carvajal", x: 15, y: 70, number: 2, roleName: "LD" },
    { id: "tp3", name: "Le Normand", x: 38, y: 75, number: 3, roleName: "DFC" },
    { id: "tp4", name: "Aymeric Laporte", x: 62, y: 75, number: 4, roleName: "DFC" },
    { id: "tp5", name: "Marc Cucurella", x: 85, y: 70, number: 24, roleName: "LI" },
    { id: "tp6", name: "Rodri Hernández", x: 35, y: 52, number: 16, roleName: "MC" },
    { id: "tp7", name: "Martin Zubimendi", x: 65, y: 52, number: 18, roleName: "MC" },
    { id: "tp8", name: "Lamine Yamal", x: 18, y: 40, number: 19, roleName: "MD / Right Mid" },
    { id: "tp9", name: "Nico Williams", x: 82, y: 40, number: 17, roleName: "MI / Left Mid" },
    { id: "tp10", name: "Álvaro Morata", x: 40, y: 18, number: 7, roleName: "DC" },
    { id: "tp11", name: "Dani Olmo", x: 60, y: 20, number: 10, roleName: "DC / Forward" }
  ],
  "3-5-2": [
    { id: "tp1", name: "Unai Simón", x: 50, y: 92, number: 1, roleName: "POR" },
    { id: "tp2", name: "Dani Carvajal", x: 25, y: 75, number: 2, roleName: "DEC" },
    { id: "tp3", name: "Le Normand", x: 50, y: 78, number: 3, roleName: "DEC" },
    { id: "tp4", name: "Aymeric Laporte", x: 75, y: 75, number: 4, roleName: "DEC" },
    { id: "tp5", name: "Rodri Hernández", x: 50, y: 58, number: 16, roleName: "MCD" },
    { id: "tp6", name: "Alex Baena", x: 30, y: 45, number: 15, roleName: "MC" },
    { id: "tp7", name: "Pedri González", x: 70, y: 45, number: 20, roleName: "MC" },
    { id: "tp8", name: "Lamine Yamal", x: 12, y: 38, number: 19, roleName: "CAD / Attacking Right Back" },
    { id: "tp9", name: "Nico Williams", x: 88, y: 38, number: 17, roleName: "CAI / Attacking Left Back" },
    { id: "tp10", name: "Álvaro Morata", x: 42, y: 18, number: 7, roleName: "DC" },
    { id: "tp11", name: "Dani Olmo", x: 58, y: 18, number: 10, roleName: "DC" }
  ],
  "4-2-3-1": [
    { id: "tp1", name: "Unai Simón", x: 50, y: 92, number: 1, roleName: "POR" },
    { id: "tp2", name: "Daniel Carvajal", x: 15, y: 72, number: 2, roleName: "LD" },
    { id: "tp3", name: "Le Normand", x: 38, y: 76, number: 3, roleName: "DFC" },
    { id: "tp4", name: "Aymeric Laporte", x: 62, y: 76, number: 4, roleName: "DFC" },
    { id: "tp5", name: "Marc Cucurella", x: 85, y: 72, number: 24, roleName: "LI" },
    { id: "tp6", name: "Rodri Hernández", x: 38, y: 55, number: 16, roleName: "MCD" },
    { id: "tp7", name: "Martin Zubimendi", x: 62, y: 55, number: 18, roleName: "MCD" },
    { id: "tp8", name: "Dani Olmo", x: 50, y: 32, number: 10, roleName: "MCO / Attacking Mid" },
    { id: "tp9", name: "Lamine Yamal", x: 18, y: 25, number: 19, roleName: "ED" },
    { id: "tp10", name: "Nico Williams", x: 82, y: 25, number: 17, roleName: "EI" },
    { id: "tp11", name: "Álvaro Morata", x: 50, y: 14, number: 7, roleName: "DC" }
  ],
  "Personalizado": [
    { id: "tp1", name: "Unai Simón", x: 50, y: 92, number: 1, roleName: "POR" },
    { id: "tp2", name: "Daniel Carvajal", x: 20, y: 70, number: 2, roleName: "LD" },
    { id: "tp3", name: "Le Normand", x: 40, y: 72, number: 3, roleName: "DFC" },
    { id: "tp4", name: "Aymeric Laporte", x: 60, y: 72, number: 4, roleName: "DFC" },
    { id: "tp5", name: "Marc Cucurella", x: 80, y: 70, number: 24, roleName: "LI" },
    { id: "tp6", name: "Rodri Hernández", x: 50, y: 50, number: 16, roleName: "MCD" },
    { id: "tp7", name: "Pedri González", x: 40, y: 35, number: 20, roleName: "MC" },
    { id: "tp8", name: "Fabián Ruiz", x: 60, y: 35, number: 8, roleName: "MC" },
    { id: "tp9", name: "Lamine Yamal", x: 15, y: 20, number: 19, roleName: "ED" },
    { id: "tp10", name: "Nico Williams", x: 85, y: 20, number: 17, roleName: "EI" },
    { id: "tp11", name: "Álvaro Morata", x: 50, y: 10, number: 7, roleName: "DC" }
  ]
};

export const INITIAL_TACTICS: TacticalSetup[] = [
  {
    id: "ts1",
    name: "Sistema Ofensivo Estrella Euro",
    formation: "4-3-3",
    teamColor: "#10B981", // Emerald
    opponentColor: "#EF4444", // Red
    players: PRESETS_FORMATIONS["4-3-3"],
    notes: "Bloque intermedio-alto para forzar la salida en largo del oponente. Pedri realiza desmarques interiores arrastrando líneas enemigas."
  },
  {
    id: "ts2",
    name: "Cierre Estructural Bloque Bajo",
    formation: "4-2-3-1",
    teamColor: "#3B82F6", // Blue
    opponentColor: "#F59E0B", // Amber
    players: PRESETS_FORMATIONS["4-2-3-1"],
    notes: "Utilizado en segundas partes para resguardar marcadores ajustados. Doble pivote asfixiante con Rodri y Zubimendi para taponar pases internos."
  }
];

// 4. Incident Reports / Injuries
export const INITIAL_INJURIES: InjuryReport[] = [
  {
    id: "i1",
    playerId: "p4", // Pedri
    playerName: "Pedri González",
    bodyZone: "rodilla-izq",
    type: "Esguince de ligamento colateral interno grado I",
    severity: "Media",
    date: "2026-05-10",
    estimatedRecovery: "12 días",
    status: "Recuperación",
    history: [
      "2026-05-10: Traumatismo en entrenamiento tras choque fortuito.",
      "2026-05-12: Resonancia descarta rotura mayor. Comienza fisioterapia suave.",
      "2026-05-18: Trabajo de movilidad específico y carrera sin carga en cinta elíptica."
    ]
  },
  {
    id: "i2",
    playerId: "p3", // Rodri
    playerName: "Rodri Hernández",
    bodyZone: "isquios-der",
    type: "Rotura fibrilar en porción larga de bíceps femoral",
    severity: "Alta",
    date: "2026-05-02",
    estimatedRecovery: "4 semanas",
    status: "Lesionado",
    history: [
      "2026-05-02: Se retira dolorido en el minuto 65 de partido.",
      "2026-05-05: Ecografía confirma rotura de 1.5 cm.",
      "2026-05-14: Reducción notable del hematoma. Iniciando drenajes y termoterapia."
    ]
  },
  {
    id: "i3",
    playerId: "p6", // Dani Carvajal
    playerName: "Daniel Carvajal",
    bodyZone: "tobillo-der",
    type: "Contusión fuerte sobre maleolo externo",
    severity: "Baja",
    date: "2026-05-19",
    estimatedRecovery: "3 días",
    status: "Disponible",
    history: [
      "2026-05-19: Recibe vendaje compresivo.",
      "2026-05-21: Completa entrenamiento con el grupo con normalidad."
    ]
  }
];

// 5. Calendar Events
export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "e1",
    title: "Análisis Táctico Rival: Alemania",
    type: "reunión",
    start: "2026-05-22T08:30",
    end: "2026-05-22T09:45",
    description: "Revisión en vídeo de la salida de balón del oponente e interceptaciones en zona alta. Convocado el staff técnico completo.",
    location: "Sala de Vídeo RFFPA"
  },
  {
    id: "e2",
    title: "Entrenamiento Matutino Presión",
    type: "entrenamiento",
    start: "2026-05-22T10:00",
    end: "2026-05-22T12:00",
    description: "Trabajo en bloque sobre el césped principal de Las Rozas. Véase sesión t1 adjunta.",
    location: "Campo 1 - Ciudad del Fútbol"
  },
  {
    id: "e3",
    title: "Vuelo de Convocatoria a Berlín",
    type: "viaje",
    start: "2026-05-25T14:30",
    end: "2026-05-25T18:00",
    description: "Concentración general. Vuelo chárter desde Madrid-Barajas T4.",
    location: "Aeropuerto Barajas - Berlín Brandenburg"
  },
  {
    id: "e4",
    title: "Rueda de Prensa Oficial",
    type: "reunión",
    start: "2026-05-26T12:00",
    end: "2026-05-26T13:00",
    description: "Conferencia oficial de Luis de la Fuente y capitán del combinado nacional.",
    location: "Berlín Olympiastadion Press Room"
  },
  {
    id: "e5",
    title: "Amistoso Internacional: España vs Alemania",
    type: "partido",
    start: "2026-05-26T20:45",
    end: "2026-05-26T22:45",
    description: "Partido preparatorio para la Copa Mundial. Equipamiento principal rojo oficial.",
    location: "Olympiastadion Berlin"
  },
  {
    id: "e6",
    title: "Atención Médica Individualizada",
    type: "reunión",
    start: "2026-05-23T08:30",
    end: "2026-05-23T09:30",
    description: "Evaluación ecográfica preventiva para jugadores con molestias.",
    location: "Unidad Médica RFFPA"
  }
];

// 6. Individual Improvement Plans
export const INITIAL_PDP_PLANS: PDPPlayerPlan[] = [
  {
    id: "pdp1",
    playerId: "p1", // Lamine Yamal
    playerName: "Lamine Yamal",
    position: "DEL",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    objectives: [
      {
        id: "ob1",
        name: "Repliegue de cobertura defensiva",
        progress: 75,
        exercise: "Ejercicios de temporización y sombra defensiva bloqueando carriles interiores.",
        videoUrl: "https://www.youtube.com/embed/jZ_vVq4t4Yg"
      },
      {
        id: "ob2",
        name: "Definición a segundo poste en rosca",
        progress: 90,
        exercise: "15 finalizaciones diarias desde el pico del área perfilando pierna izquierda.",
        videoUrl: "https://www.youtube.com/embed/nU2W627W9e4"
      }
    ],
    metrics: {
      tecnica: 95,
      fisica: 80,
      tactica: 84,
      mentalidad: 92
    },
    metricsHistory: [
      { date: "2026-01-10", tecnica: 92, fisica: 75, tactica: 78, mentalidad: 85 },
      { date: "2026-03-15", tecnica: 93, fisica: 78, tactica: 81, mentalidad: 89 },
      { date: "2026-05-15", tecnica: 95, fisica: 80, tactica: 84, mentalidad: 92 }
    ]
  },
  {
    id: "pdp2",
    playerId: "p4", // Pedri
    playerName: "Pedri González",
    position: "MED",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    objectives: [
      {
        id: "ob3",
        name: "Llegada al área desde segunda línea",
        progress: 60,
        exercise: "Acompañamiento a desborde de extremos colocándose en el punto de penalti.",
        videoUrl: "https://www.youtube.com/embed/zH0F6_t9Fqg"
      },
      {
        id: "ob4",
        name: "Recuperación muscular intensiva",
        progress: 85,
        exercise: "Rutinas específicas de estiramiento miofascial coordinado tras esfuerzos prolongados.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      }
    ],
    metrics: {
      tecnica: 96,
      fisica: 78,
      tactica: 94,
      mentalidad: 90
    },
    metricsHistory: [
      { date: "2026-01-10", tecnica: 94, fisica: 85, tactica: 92, mentalidad: 88 },
      { date: "2026-03-15", tecnica: 95, fisica: 82, tactica: 93, mentalidad: 89 },
      { date: "2026-05-15", tecnica: 96, fisica: 78, tactica: 94, mentalidad: 90 }
    ]
  },
  {
    id: "pdp3",
    playerId: "p3", // Rodri
    playerName: "Rodri Hernández",
    position: "MED",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    objectives: [
      {
        id: "ob5",
        name: "Pase de ruptura de líneas compactas",
        progress: 95,
        exercise: "Pases filtrados rasos de precisión buscando desmarques de apoyo de interiores.",
        videoUrl: "https://www.youtube.com/embed/zH0F6_t9Fqg"
      }
    ],
    metrics: {
      tecnica: 91,
      fisica: 88,
      tactica: 99,
      mentalidad: 98
    },
    metricsHistory: [
      { date: "2026-01-10", tecnica: 90, fisica: 89, tactica: 97, mentalidad: 95 },
      { date: "2026-05-15", tecnica: 91, fisica: 88, tactica: 99, mentalidad: 98 }
    ]
  }
];
