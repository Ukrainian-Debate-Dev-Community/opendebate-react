import { AxiosError } from "axios";

export const extractErrorMessage = (
  error: unknown,
  defaultMessage = "An unexpected error occurred.",
): string => {
  if (error instanceof AxiosError && error.response) {
    return error.response.data.message || defaultMessage;
  }
  return defaultMessage;
};
