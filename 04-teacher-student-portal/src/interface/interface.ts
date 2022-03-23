export type Role = "Student" | "Teacher";

export interface UserSignUp {
  name: string;
  email: string;
  password: string;
}

export interface Student {
  name: string;
  email: string;
  password: string;
}

export interface Teacher {
  name: string;
  email: string;
  password: string;
}

export interface ServerResponse {
  status: number;
  message: string;
}

export interface UserSignIn {
  email: string;
  password: string;
}
