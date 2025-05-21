export interface ApiErrorType {
  status?: number;
  data?: {
    message?: string;
  };
  error?: string;
}
