import { ObjectId } from "mongoose";

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
  role?: Role;
}

export interface Marks {
  english?: number;
  hindi?: number;
  computers?: number;
  maths?: number;
  science?: number;
  physical?: number;
}

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  role?: Role;
}

export interface Teacher {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  role?: Role;
}

export interface ServerResponse {
  status: number;
  message?: string;
  accessToken?: string;
  data?: any;
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

export interface Result {
  status: number;
  message: string;
  data: any;
}

export interface foundUser {
  role: Role;
  index: number;
}
