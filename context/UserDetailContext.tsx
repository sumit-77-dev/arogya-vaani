import {createContext} from "react";

export type UserDetail = {
  name: string;
  email: string;
  credit: number;
};

export interface UserDetailContextType {
  UserDetail: UserDetail | null;
  setUserDetail: React.Dispatch<React.SetStateAction<UserDetail | null>>;
}

export const UserDetailContext = createContext<UserDetailContextType | null>(null);