import { mockUsers } from "@/mock/users";
import type { ManagedUser, UserRole } from "@/types";

const roleRoute: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  CANDIDATE: "/candidate/dashboard",
};

export function hashPassword(password: string) {
  return `mock-hash-${btoa(password).replace(/=+$/g, "")}`;
}

export function generateDisplayId(prefix: "ADM" | "CAN", existingCount: number) {
  return `${prefix}-${String(existingCount + 1).padStart(4, "0")}`;
}

export function generateTemporaryPassword() {
  const random = Math.random().toString(36).slice(2, 8);
  return `Qz@${random}${Math.floor(100 + Math.random() * 900)}`;
}

export function authenticateByEmail(email: string, password: string) {
  const user = mockUsers.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.status === "active"
  );

  if (!user || user.temporaryPassword !== password) {
    return null;
  }

  return {
    user,
    route: user.isFirstLogin ? "/change-password" : roleRoute[user.role],
    finalRoute: roleRoute[user.role],
  };
}

export function createManagedUser(input: {
  name: string;
  email: string;
  role: Extract<UserRole, "ADMIN" | "CANDIDATE">;
  department?: string;
  existingUsers: ManagedUser[];
}) {
  const temporaryPassword = generateTemporaryPassword();
  const displayId = generateDisplayId(input.role === "ADMIN" ? "ADM" : "CAN", input.existingUsers.length);
  const user: ManagedUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    displayId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    department: input.department?.trim() || undefined,
    passwordHash: hashPassword(temporaryPassword),
    temporaryPassword,
    status: "active",
    createdDate: new Date().toISOString().slice(0, 10),
    isFirstLogin: true,
  };

  console.info("[EMAIL]", `Credentials sent to ${user.email}`, {
    userId: user.displayId,
    temporaryPassword,
    forcePasswordChange: true,
  });

  return user;
}

export function routeForRole(role: UserRole) {
  return roleRoute[role];
}
