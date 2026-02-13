import axios from 'axios';

// Tenta pegar de import.meta (Vite) ou process.env (Node/Webpack) de forma segura
const getBaseUrl = () => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
             // @ts-ignore
            return import.meta.env.VITE_API_URL;
        }
    } catch {}
    
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
         // @ts-ignore
        return process.env.VITE_API_URL;
    }

    return 'http://localhost:3333/api';
};

const getAuthBaseUrl = () => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AUTH_API_URL) {
             // @ts-ignore
            return import.meta.env.VITE_AUTH_API_URL;
        }
    } catch {}
    
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.VITE_AUTH_API_URL) {
         // @ts-ignore
        return process.env.VITE_AUTH_API_URL;
    }

    return 'https://api-auth.astralwavelabel.com/api';
};

// Instância para a API interna (produtos, categorias, pedidos, etc.)
const api = axios.create({
  baseURL: getBaseUrl(), 
});

// Instância para a API de autenticação externa
export const authApi = axios.create({
  baseURL: getAuthBaseUrl(),
});

// Interceptor de Requisição (Middleware do Frontend)
// Toda vez que fizermos um request, ele verifica se tem token salvo e anexa.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autobier_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Resposta
// Se der erro 401 (Token Expirado/Inválido), limpa o storage para forçar novo login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('autobier_token');
      localStorage.removeItem('autobier_usuario');
      localStorage.removeItem('autobier_empresa');
    }
    return Promise.reject(error);
  }
);

export default api;