export interface EmailSignInProps {
  email: string;
  realname: string;
  username: string;
  password: string;
}

export interface PhoneSignInProps {
  phone: string;
  realname: string;
  username: string;
  password: string;
}

export interface AllUserProps {
  id: number;
  email: string;
  realname: string;
  username: string;
  password: string;
  follower_count: number;
  follwing_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface EmailUserRole {
  email: string;
}

export interface PhoneUserRole {
  phone: string;
}

export interface UserRole {
  id: number;
  email: string | null;
  phone: string | null;
  is_verified: 0 | 1;
  key_expired_at: Date | null;
  civ_key: string | null;
}
