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

export default {};
