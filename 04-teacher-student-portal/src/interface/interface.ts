export type Role = "Student" | "Teacher";

export interface UserSignUp {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
}

export interface Student {
  name: string;
  email: string;
  password: string;
  marks?: Marks;
  emailVerified: boolean;
}

export interface Marks {
  english?: number;
  hindi?: number;
  computers?: number;
  maths?: number;
  science?: number;
  physical?: number;
}

export interface Teacher {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
}

export interface ServerResponse {
  status: number;
  message?: string;
  accessToken?: string;
}

export interface UserSignIn {
  email: string;
  password: string;
}

export interface userDataResponse {
  name: string;
  email: string;
  marks?: {} | Marks;
  subject?: string;
}

export interface EmailOtp {
  email: string;
  otp: string;
}
