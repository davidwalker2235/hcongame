import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminDb } from "@/app/lib/firebaseAdmin";

export const runtime = "nodejs";

const SESSION_COOKIE_NAME = "hcongame_session_id";

type FirebaseAction = "read" | "write" | "update" | "remove" | "push";

type FirebaseRequestBody = {
  action?: FirebaseAction;
  path?: string;
  data?: unknown;
};

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

function isUserPath(path: string, sessionId: string): boolean {
  return path === `users/${sessionId}` || path.startsWith(`users/${sessionId}/`);
}

function sanitizeUsersList(value: unknown): Record<string, { nickname?: string }> | null {
  if (!value || typeof value !== "object") return null;
  const entries = Object.entries(value as Record<string, any>).map(([id, data]) => {
    const nickname = typeof data?.nickname === "string" ? data.nickname : undefined;
    return [id, nickname ? { nickname } : {}];
  });
  return Object.fromEntries(entries);
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json()) as FirebaseRequestBody;
    const action = body.action;
    const rawPath = body.path;

    if (!action || !rawPath) {
      return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
    }

    const path = normalizePath(rawPath);
    const isUsersRoot = path === "users";
    const isSelfPath = isUserPath(path, sessionId);

    if (!isUsersRoot && !isSelfPath) {
      return NextResponse.json({ error: "Ruta no permitida." }, { status: 403 });
    }

    if (action !== "read" && !isSelfPath) {
      return NextResponse.json({ error: "Operación no permitida." }, { status: 403 });
    }

    const adminDb = getAdminDb();
    const ref = adminDb.ref(path);

    switch (action) {
      case "read": {
        const snapshot = await ref.get();
        const value = snapshot.exists() ? snapshot.val() : null;
        if (isUsersRoot) {
          return NextResponse.json({ data: sanitizeUsersList(value) });
        }
        return NextResponse.json({ data: value });
      }
      case "write": {
        await ref.set(body.data ?? null);
        return NextResponse.json({ data: true });
      }
      case "update": {
        if (!body.data || typeof body.data !== "object") {
          return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
        }
        await ref.update(body.data as Record<string, unknown>);
        return NextResponse.json({ data: true });
      }
      case "remove": {
        await ref.remove();
        return NextResponse.json({ data: true });
      }
      case "push": {
        const newRef = ref.push();
        await newRef.set(body.data ?? null);
        return NextResponse.json({ data: { key: newRef.key } });
      }
      default:
        return NextResponse.json({ error: "Acción no soportada." }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
