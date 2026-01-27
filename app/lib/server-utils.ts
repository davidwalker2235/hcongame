/**
 * Utilidades de servidor para verificación de usuario y sincronización de nivel
 * Estas funciones pueden usarse en Server Components, API Routes y Middleware
 */

import { ref, get, update } from 'firebase/database';
import { database } from './firebase';
import { get as apiGet } from './api';

interface ChallengeResponse {
  level: number;
  difficulty: string;
  story: string;
}

interface UserData {
  email?: string;
  nickname?: string;
  currentLevel?: number;
  [key: string]: any;
}

/**
 * Lee datos de usuario desde Firebase
 */
export async function getUserData(sessionId: string): Promise<UserData | null> {
  try {
    const dbRef = ref(database, `users/${sessionId}`);
    const snapshot = await get(dbRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error reading user data from Firebase:', error);
    return null;
  }
}

/**
 * Actualiza el currentLevel del usuario en Firebase
 */
export async function updateUserCurrentLevel(
  sessionId: string,
  level: number
): Promise<void> {
  try {
    const dbRef = ref(database, `users/${sessionId}`);
    await update(dbRef, { currentLevel: level });
  } catch (error) {
    console.error('Error updating user currentLevel:', error);
    throw error;
  }
}

/**
 * Obtiene el challenge actual desde la API
 */
export async function getChallengeFromApi(
  sessionId: string
): Promise<ChallengeResponse | null> {
  try {
    const response = await apiGet<ChallengeResponse>(
      `/challenge/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error('Error fetching challenge from API:', error);
    return null;
  }
}

/**
 * Sincroniza solo el nivel del usuario (sin verificar email/nickname)
 * Útil para sincronización automática al inicio de la aplicación
 * 
 * @returns true si se actualizó el nivel, false si no era necesario o hubo error
 */
export async function syncUserLevelOnly(
  sessionId: string
): Promise<boolean> {
  try {
    // 1. Obtener datos del usuario desde Firebase
    const userData = await getUserData(sessionId);
    
    if (!userData) {
      return false;
    }

    // 2. Obtener challenge actual de la API
    const challengeResponse = await getChallengeFromApi(sessionId);

    if (!challengeResponse || challengeResponse.level === undefined) {
      return false;
    }

    // 3. Comparar y actualizar si es necesario
    const currentLevel = userData.currentLevel ?? null;

    if (challengeResponse.level !== currentLevel) {
      await updateUserCurrentLevel(sessionId, challengeResponse.level);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in syncUserLevelOnly:', error);
    return false;
  }
}

/**
 * Verifica y sincroniza el nivel del usuario
 * Esta función:
 * 1. Verifica si el usuario tiene email y nickname
 * 2. Obtiene el challenge actual de la API
 * 3. Compara el level con el currentLevel del usuario
 * 4. Actualiza Firebase si no coinciden
 * 
 * @returns Objeto con información del usuario y si fue actualizado
 */
export async function verifyAndSyncUserLevel(
  sessionId: string
): Promise<{
  userData: UserData | null;
  isVerified: boolean;
  levelUpdated: boolean;
  error?: string;
}> {
  try {
    // 1. Obtener datos del usuario desde Firebase
    const userData = await getUserData(sessionId);
    
    if (!userData) {
      return {
        userData: null,
        isVerified: false,
        levelUpdated: false,
        error: 'User not found',
      };
    }

    // 2. Verificar si tiene email y nickname
    const hasEmail =
      userData.email &&
      typeof userData.email === 'string' &&
      userData.email.trim() !== '';
    const hasNickname =
      userData.nickname &&
      typeof userData.nickname === 'string' &&
      userData.nickname.trim() !== '';

    if (!hasEmail || !hasNickname) {
      return {
        userData,
        isVerified: false,
        levelUpdated: false,
      };
    }

    // 3. Obtener challenge actual de la API
    const challengeResponse = await getChallengeFromApi(sessionId);

    if (!challengeResponse || challengeResponse.level === undefined) {
      return {
        userData,
        isVerified: true,
        levelUpdated: false,
        error: 'Failed to fetch challenge',
      };
    }

    // 4. Comparar y actualizar si es necesario
    const currentLevel = userData.currentLevel ?? null;
    let levelUpdated = false;

    if (challengeResponse.level !== currentLevel) {
      await updateUserCurrentLevel(sessionId, challengeResponse.level);
      levelUpdated = true;
      
      // Actualizar userData local
      userData.currentLevel = challengeResponse.level;
    }

    return {
      userData,
      isVerified: true,
      levelUpdated,
    };
  } catch (error) {
    console.error('Error in verifyAndSyncUserLevel:', error);
    return {
      userData: null,
      isVerified: false,
      levelUpdated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
