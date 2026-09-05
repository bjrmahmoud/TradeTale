export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  photoURL: string | null;
}

export type AuthMode = 'signin' | 'signup' | 'forgot_password';
