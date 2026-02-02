'use client';

/**
 * Ruta sin interfaz para automatizar creación/borrado de usuarios en Firebase.
 * URL: /setup-users?token=VALOR&action=create|delete
 *
 * ELIMINAR ESTA FUNCIONALIDAD: borrar la carpeta app/setup-users/ completa.
 * No hay referencias a esta ruta en el resto de la app.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ref, set, remove } from 'firebase/database';
import { database } from '@/app/lib/firebase';

type Action = 'create' | 'delete';

const USERS_PATH = 'users';

function SetupUsersContent() {
  const searchParams = useSearchParams();
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const action = searchParams.get('action') as Action | null;

    if (!token || !action || (action !== 'create' && action !== 'delete')) {
      setDone('missing');
      return;
    }

    const run = async () => {
      try {
        const path = `${USERS_PATH}/${token}`;
        if (action === 'create') {
          await set(ref(database, path), {
            currentLevel: 1,
            email: '',
            nickname: '',
          });
        } else {
          await remove(ref(database, path));
        }
        setDone('ok');
      } catch {
        setDone('error');
      }
    };

    run();
  }, [searchParams]);

  return (
    <main style={{ padding: 20, fontFamily: 'monospace', fontSize: 14 }}>
      {done === 'ok' && 'OK'}
      {done === 'missing' && 'Missing token or action (create|delete)'}
      {done === 'error' && 'Error'}
      {done === null && '\u00A0'}
    </main>
  );
}

export default function SetupUsersPage() {
  return (
    <Suspense fallback={<main style={{ padding: 20, fontFamily: 'monospace', fontSize: 14 }}>\u00A0</main>}>
      <SetupUsersContent />
    </Suspense>
  );
}
