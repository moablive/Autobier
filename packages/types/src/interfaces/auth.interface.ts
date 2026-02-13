// Token Payload (JWT) - API Auth Externa
export interface ITokenPayload {
  sub: number;
  email: string;
  empresa_id: number;
  role: string;
  iat?: number;
  exp?: number;
}

// Usuário retornado pela API de Auth
export interface IAuthUsuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

// Empresa retornada pela API de Auth
export interface IAuthEmpresa {
  id: number;
  nome: string;
  status: string;
}

// Login Payload
export interface ILoginDTO {
  email: string;
  password: string;
}

// Auth Response - Formato da API externa
export interface IAuthResponse {
  token: string;
  expiresIn: number;
  usuario: IAuthUsuario;
  empresa: IAuthEmpresa;
}