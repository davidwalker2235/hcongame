import * as admin from "firebase-admin";

let cachedApp: admin.app.App | null = null;

export function getAdminDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!projectId || !clientEmail || !privateKeyRaw || !databaseURL) {
    throw new Error(
      "Firebase Admin: faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY o FIREBASE_DATABASE_URL."
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  if (!cachedApp) {
    cachedApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          databaseURL,
        });
  }

  return admin.database(cachedApp);
}
