// API Service for Authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
      isFirstLogin: boolean;
      createdDate?: string;
    };
    token: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    isFirstLogin: boolean;
  };
}

class AuthAPI {
  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async getProfile(token: string): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      return response.json();
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  async changePassword(
    token: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: "PATCH",
        headers: this.getHeaders(token),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password change failed");
      }

      return response.json();
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  async logout(token: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(token),
      });

      return response.json();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}

export default new AuthAPI();
