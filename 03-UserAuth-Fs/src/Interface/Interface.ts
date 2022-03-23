import { emit } from "process";

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

export interface updateEmailBody {
  userData: {
    name: string;
    email: string;
  };
  newEmail: string;
}

export interface updateNameBody {
  userData: {
    name: string;
    email: string;
  };
  name: string;
}

export interface updateNameBody {
  email: string;
  name: string;
}
