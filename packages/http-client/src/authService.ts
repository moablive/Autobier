// src/services/authService.ts
import { authApi } from './api';
import type { IAuthResponse, ILoginDTO, IAuthUsuario } from '@autobier/types';

export const authService = {
  // 1. Login via API externa
  async login(credentials: ILoginDTO): Promise<IAuthResponse> {
    const { data } = await authApi.post<IAuthResponse>('/auth/login', credentials);
    return data;
  },

  // 2. Salvar Sessão
  saveSession(data: IAuthResponse) {
    localStorage.setItem('autobier_token', data.token);
    localStorage.setItem('autobier_usuario', JSON.stringify(data.usuario));
    localStorage.setItem('autobier_empresa', JSON.stringify(data.empresa));
  },

  // 3. Logout
  logout() {
    localStorage.removeItem('autobier_token');
    localStorage.removeItem('autobier_usuario');
    localStorage.removeItem('autobier_empresa');
  },

  // 4. Recuperar Usuário
  getUser(): IAuthUsuario | null {
    const userStr = localStorage.getItem('autobier_usuario');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as IAuthUsuario;
    } catch (error) {
      console.error("Erro ao ler usuário do cache", error);
      return null;
    }
  },
  
  // 5. Verificar Autenticação
  isAuthenticated(): boolean {
      const token = localStorage.getItem('autobier_token');
      return !!token;
  },

  // 6. Verificar Permissão (Helper)
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
};