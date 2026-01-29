import { z } from "zod";
import {
  ApplicationHistoryItem,
  ApplicationRoundSchema,
  ApplicationSchema,
} from "./schemas";

export type Application = z.infer<typeof ApplicationSchema>;

export type User = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
};

export type InterviewRound = z.infer<typeof ApplicationRoundSchema>;

export type ApplicationHistoryItem = z.infer<typeof ApplicationHistoryItem>;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
} | null;
