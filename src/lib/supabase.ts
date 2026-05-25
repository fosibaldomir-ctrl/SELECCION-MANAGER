import { createClient } from '@supabase/supabase-js';
import { ScoutPlayer } from '../types';

// Retrieve keys gracefully from Vite environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase keys exist to avoid startup crashes
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Lazy initialize the client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * RAW SQL script for the Supabase SQL Editor:
 * 
 * -- Create the scout_players table
 * CREATE TABLE IF NOT EXISTS scout_players (
 *   id TEXT PRIMARY KEY,
 *   first_name TEXT,
 *   last_name TEXT,
 *   age INTEGER,
 *   birth_date TEXT,
 *   selectable_category TEXT,
 *   position TEXT,
 *   position_full TEXT,
 *   current_club TEXT,
 *   nationality TEXT,
 *   preferred_foot TEXT,
 *   rating NUMERIC,
 *   photo TEXT,
 *   notes TEXT,
 *   stats JSONB,
 *   attributes JSONB,
 *   follow_up_history JSONB DEFAULT '[]'::jsonb,
 *   match_history JSONB DEFAULT '[]'::jsonb,
 *   injury_history JSONB DEFAULT '[]'::jsonb,
 *   category TEXT,
 *   club_crest_url TEXT,
 *   scouting_status TEXT,
 *   scout_name TEXT,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 * 
 * -- Enable Realtime on this table
 * alter publication supabase_realtime add table scout_players;
 */

/**
 * Maps a local ScoutPlayer object to the Postgres database snake_case columns
 */
function mapToDatabase(player: any) {
  return {
    id: player.id,
    first_name: player.firstName,
    last_name: player.lastName,
    age: player.age,
    birth_date: player.birthDate || null,
    selectable_category: player.selectableCategory || null,
    position: player.position,
    position_full: player.positionFull,
    current_club: player.currentClub,
    nationality: player.nationality,
    preferred_foot: player.preferredFoot,
    rating: player.rating,
    photo: player.photo,
    notes: player.notes,
    stats: player.stats,
    attributes: player.attributes,
    follow_up_history: player.followUpHistory || [],
    match_history: player.matchHistory || [],
    injury_history: player.injuryHistory || [],
    category: player.category || '',
    club_crest_url: player.clubCrestUrl || '',
    scouting_status: player.scoutingStatus || 'Seguir',
    scout_name: player.scoutName || 'baldomir'
  };
}

/**
 * Maps DB response row components back to ScoutPlayer TypeScript types
 */
function mapFromDatabase(dbRow: any): ScoutPlayer {
  return {
    id: dbRow.id,
    firstName: dbRow.first_name || '',
    lastName: dbRow.last_name || '',
    age: Number(dbRow.age ?? 0),
    birthDate: dbRow.birth_date || '',
    selectableCategory: dbRow.selectable_category || '',
    position: dbRow.position || 'MED',
    positionFull: dbRow.position_full || '',
    currentClub: dbRow.current_club || '',
    nationality: dbRow.nationality || '',
    preferredFoot: dbRow.preferred_foot || 'Diestro',
    rating: Number(dbRow.rating ?? 0),
    photo: dbRow.photo || '',
    notes: dbRow.notes || '',
    stats: dbRow.stats || { goals: 0, assists: 0, passes: 0, passesAccuracy: 0, tackles: 0, minutesPlayed: 0, cardsYellow: 0, cardsRed: 0 },
    attributes: dbRow.attributes || { speed: 50, agility: 50, shooting: 50, defending: 50, physical: 50, passing: 50 },
    followUpHistory: dbRow.follow_up_history || [],
    matchHistory: dbRow.match_history || [],
    injuryHistory: dbRow.injury_history || [],
    category: dbRow.category || '',
    clubCrestUrl: dbRow.club_crest_url || '',
    scoutingStatus: dbRow.scouting_status || 'Seguir',
    scoutName: dbRow.scout_name || ''
  };
}

/**
 * Fetch players from Supabase, or fall back to local storage
 */
export async function getPlayersFromSupabase(): Promise<ScoutPlayer[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('scout_players')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed, relying on localStorage:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(mapFromDatabase);
    }
    return [];
  } catch (err) {
    console.error('Error fetching from Supabase:', err);
    return null;
  }
}

/**
 * Save / Upsert a player to Supabase
 */
export async function savePlayerToSupabase(player: ScoutPlayer): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload = mapToDatabase(player);
    const { error } = await supabase
      .from('scout_players')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      console.error('Error saving player to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception saving to Supabase:', err);
    return false;
  }
}

/**
 * Delete a player from Supabase
 */
export async function deletePlayerFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('scout_players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting player from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception deleting from Supabase:', err);
    return false;
  }
}

/**
 * Upload a player photo file to Supabase Storage.
 * It will try the main bucket names and both direct/subfolder paths.
 */
export async function uploadPlayerPhoto(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase no está configurado o inicializado.');
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  // Priority bucket names
  const potentialBuckets = [
    'fotos jugadores',
    'fotos_jugadores',
    'fotos-jugadores',
    'players',
    'fotos'
  ];
  
  let lastError: any = null;
  
  for (const bucket of potentialBuckets) {
    const pathsToTry = [fileName, `players/${fileName}`];
    for (const filePath of pathsToTry) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
          
          if (urlData?.publicUrl) {
            console.log(`Foto subida exitosamente al bucket "${bucket}" (${filePath}):`, urlData.publicUrl);
            return urlData.publicUrl;
          }
        } else {
          lastError = error;
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  // If all failed, throw a descriptive error
  const errorMsg = lastError?.message || lastError || 'Error desconocido';
  throw new Error(errorMsg);
}

/**
 * Upload a club crest / logo to Supabase Storage with dedicated club categories
 */
export async function uploadClubCrest(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase no está configurado o inicializado.');
  }

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  // Dedicated club crest storage buckets with high priority for the user's exact buckets
  const potentialBuckets = [
    'fotos escudos',
    'fotos_escudos',
    'fotos-escudos',
    'fotos escudo',
    'escudos',
    'escudos clubes',
    'escudos_clubes',
    'escudos-clubes',
    'club_crests',
    'club-crests',
    'clubs',
    'fotos jugadores',
    'fotos_jugadores',
    'players',
    'fotos'
  ];
  
  let lastError: any = null;
  
  for (const bucket of potentialBuckets) {
    const pathsToTry = [fileName, `clubs/${fileName}`];
    for (const filePath of pathsToTry) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
          
          if (urlData?.publicUrl) {
            console.log(`Escudo de club subido exitosamente al bucket "${bucket}" (${filePath}):`, urlData.publicUrl);
            return urlData.publicUrl;
          }
        } else {
          lastError = error;
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  // Fallback to player photo upload if club-specific buckets aren't created
  try {
    return await uploadPlayerPhoto(file);
  } catch (fallbackErr) {
    const errorMsg = lastError?.message || lastError || 'Error al subir escudo';
    throw new Error(errorMsg);
  }
}

/**
 * Upload a scout photo to Supabase Storage
 */
export async function uploadScoutPhoto(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase no está configurado o inicializado.');
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  // Dedicated scout photo buckets prioritizing the user's exact names
  const potentialBuckets = [
    'fotos scout',
    'fotos scouts',
    'fotos_scout',
    'fotos_scouts',
    'fotos-scout',
    'fotos-scouts',
    'scout-photos',
    'scouts',
    'fotos jugadores',
    'fotos_jugadores',
    'players',
    'fotos'
  ];
  
  let lastError: any = null;
  
  for (const bucket of potentialBuckets) {
    const pathsToTry = [fileName, `scouts/${fileName}`];
    for (const filePath of pathsToTry) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
          
          if (urlData?.publicUrl) {
            console.log(`Foto de scout subida exitosamente al bucket "${bucket}" (${filePath}):`, urlData.publicUrl);
            return urlData.publicUrl;
          }
        } else {
          lastError = error;
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  // Fallback to player photo upload if scout-specific buckets aren't created
  try {
    return await uploadPlayerPhoto(file);
  } catch (fallbackErr) {
    const errorMsg = lastError?.message || lastError || 'Error al subir foto de scout';
    throw new Error(errorMsg);
  }
}
