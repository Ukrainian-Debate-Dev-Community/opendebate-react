import { apiClient } from "./axios";
import type { Format } from "../types/api";

export const fetchFormats = async (): Promise<Format[]> => {
  const response = await apiClient.get("/formats");
  return response.data.data;
};
