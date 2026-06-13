import authApi from "@/services/authApi";
import usersApi from "@/services/usersApi";
import type { ManagedUser, Role } from "@/types";

const roleRoute: Record<string, string> = {
  "super-admin": "/super-admin/dashboard",
  admin: "/admin/dashboard",
  candidate: "/candidate/dashboard",
};

// Utility functions for client-side operations
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

// Backend API functions for authentication
export async function authenticateByEmail(email: string, password: string) {
  try {
    const response = await authApi.login(email, password);
    
    if (response.success && response.data) {
      const user = response.data.user;
      const route = user.isFirstLogin ? "/change-password" : roleRoute[user.role] || "/dashboard";
      
      return {
        user,
        route,
        finalRoute: roleRoute[user.role] || "/dashboard",
        token: response.data.token,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function changeUserPassword(token: string, currentPassword: string, newPassword: string) {
  try {
    const response = await authApi.changePassword(token, currentPassword, newPassword);
    return response.success;
  } catch (error) {
    console.error("Password change error:", error);
    return false;
  }
}

// Backend API function for creating users (requires token)
export async function createManagedUserBackend(
  token: string,
  input: {
    name: string;
    email: string;
    role: "ADMIN" | "CANDIDATE";
    department?: string;
    phone?: string;
  }
) {
  try {
    const response = await usersApi.createAdmin(token, input);
    
    if (response.success && response.data) {
      console.info("[EMAIL]", `Credentials sent to ${response.data.user.email}`, {
        userId: response.data.user.displayId,
        temporaryPassword: response.data.temporaryPassword,
        forcePasswordChange: true,
      });
      
      return response.data.user;
    }
    
    return null;
  } catch (error) {
    console.error("Create user error:", error);
    return null;
  }
}

// Client-side function for creating users (for UI state management)
export function createManagedUser(input: {
  name: string;
  email: string;
  role: "ADMIN" | "CANDIDATE";
  department?: string;
  existingUsers: ManagedUser[];
}) {
  const temporaryPassword = generateTemporaryPassword();
  const displayId = generateDisplayId(input.role === "ADMIN" ? "ADM" : "CAN", input.existingUsers.length);
  const role: Role = input.role === "ADMIN" ? "admin" : "candidate";
  const user: ManagedUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    displayId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role,
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

export function routeForRole(role: string) {
  return roleRoute[role] || "/dashboard";
}
