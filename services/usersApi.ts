// API Service for User Management (Admin Management)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import type { ManagedUser } from "@/types";

export interface CreateAdminRequest {
  name: string;
  email: string;
  phone?: string;
  department?: string;
}

export interface BulkCreateAdminsRequest {
  csv: string;
}

export interface AdminsResponse {
  success: boolean;
  data: ManagedUser[];
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  data: {
    user: ManagedUser;
    temporaryPassword: string;
  };
}

export interface BulkCreateResponse {
  success: boolean;
  data: {
    created: Array<{ user: ManagedUser; temporaryPassword: string }>;
    summary: {
      totalRecords: number;
      validRecords: number;
      duplicateRecords: number;
      invalidRecords: number;
      issues: Array<{ row: number; reason: string; email?: string }>;
    };
  };
}

class UsersAPI {
  private getHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getAllAdmins(token: string): Promise<AdminsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users?role=ADMIN`, {
        method: "GET",
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }

      return response.json();
    } catch (error) {
      console.error("Get admins error:", error);
      throw error;
    }
  }

  async createAdmin(token: string, data: CreateAdminRequest): Promise<CreateAdminResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create-admin`, {
        method: "POST",
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create admin");
      }

      return response.json();
    } catch (error) {
      console.error("Create admin error:", error);
      throw error;
    }
  }

  async bulkCreateAdmins(token: string, csv: string): Promise<BulkCreateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/bulk-create-admins`, {
        method: "POST",
        headers: this.getHeaders(token),
        body: JSON.stringify({ csv }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to bulk create admins");
      }

      return response.json();
    } catch (error) {
      console.error("Bulk create admins error:", error);
      throw error;
    }
  }

  async updateAdmin(token: string, id: string, data: Partial<CreateAdminRequest>): Promise<{ success: boolean; data: ManagedUser }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update admin");
      }

      return response.json();
    } catch (error) {
      console.error("Update admin error:", error);
      throw error;
    }
  }

  async toggleAdminStatus(token: string, id: string): Promise<{ success: boolean; data: ManagedUser }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
        method: "PATCH",
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle admin status");
      }

      return response.json();
    } catch (error) {
      console.error("Toggle admin status error:", error);
      throw error;
    }
  }

  async resetAdminPassword(token: string, id: string): Promise<{ success: boolean; message: string; data: { user: ManagedUser; temporaryPassword: string } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
        method: "PATCH",
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      return response.json();
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  async exportAdmins(token: string, format: "csv" | "pdf"): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/export/${format}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export admins");
      }

      return response.blob();
    } catch (error) {
      console.error("Export admins error:", error);
      throw error;
    }
  }

  async deleteAdmin(token: string, id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }

      return response.json();
    } catch (error) {
      console.error("Delete admin error:", error);
      throw error;
    }
  }
}

export default new UsersAPI();
