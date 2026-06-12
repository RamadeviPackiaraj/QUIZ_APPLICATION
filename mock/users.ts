import type { ManagedUser } from "@/types";

export const mockUsers: ManagedUser[] = [
  {
    id: "usr-super-001",
    displayId: "SUP-0001",
    name: "Super Admin",
    email: "superadmin@quizapp.com",
    role: "SUPER_ADMIN",
    passwordHash: "mock-hash-super123",
    temporaryPassword: "super123",
    status: "active",
    createdDate: "2026-06-01",
    isFirstLogin: false,
  },
  {
    id: "usr-admin-001",
    displayId: "ADM-0001",
    name: "Aptora Admin",
    email: "admin@quizapp.com",
    role: "ADMIN",
    passwordHash: "mock-hash-admin123",
    temporaryPassword: "admin123",
    status: "active",
    createdDate: "2026-06-03",
    isFirstLogin: true,
  },
  {
    id: "usr-candidate-001",
    displayId: "CAN-0001",
    name: "Aarav Mehta",
    email: "aarav@example.com",
    role: "CANDIDATE",
    department: "React Advanced",
    passwordHash: "mock-hash-student123",
    temporaryPassword: "student123",
    status: "active",
    createdDate: "2026-06-04",
    isFirstLogin: true,
  },
];

export const userSeed = {
  admins: mockUsers.filter((user) => user.role === "ADMIN"),
  candidates: mockUsers.filter((user) => user.role === "CANDIDATE"),
};
