import {createContext} from "react";
import { UserDetail } from "@/app/provider";

export interface UserDetailContextType {
  UserDetail: UserDetail | null;
  setUserDetail: React.Dispatch<React.SetStateAction<UserDetail | null>>;
}

export const UserDetailContext = createContext<UserDetailContextType | null>(null);