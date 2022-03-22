export interface User {
  name: string;
  email: string;
  password: string;
}
export interface UserData {
  name: string;
  email: string;
}

export interface UserSignIn {
  email: string;
  password: string;
}

export interface ServerResponse {
  status: number;
  message: string;
}
