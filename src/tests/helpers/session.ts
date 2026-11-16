import { writeSession } from "../../config/authStorage";
import type { AuthSession } from "../../types";

/** Sessão já aberta em memória, como depois do login ou do refresh ao abrir a página. */
export function seedSession(session: Partial<AuthSession> & { token: string; user: Partial<AuthSession["user"]> }): void {
    writeSession(session as AuthSession);
}
