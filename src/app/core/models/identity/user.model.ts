/**
 * Modelo de Usuario
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Comando para login
 */
export interface UserLoginCommand {
  email: string;
  password: string;
}

/**
 * Comando para registro
 */
export interface UserCreateCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Respuesta de autenticación
 */
export interface IdentityAccess {
  succeeded: boolean;
  accessToken: string;
  refreshToken: string;
  expiresAt?: Date | string;
}

/**
 * Comando para refresh token
 */
export interface RefreshTokenCommand {
  refreshToken: string;
}

/**
 * Comando para revocar token
 */
export interface RevokeTokenCommand {
  refreshToken: string;
}
