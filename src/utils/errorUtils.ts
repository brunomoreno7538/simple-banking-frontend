export interface AppFetchBaseQueryError {
  status:
    | number
    | "FETCH_ERROR"
    | "PARSING_ERROR"
    | "TIMEOUT_ERROR"
    | "CUSTOM_ERROR";
  data?: unknown;
  error?: string;
}

export interface AppSerializedError {
  message?: string;
  name?: string;
  stack?: string;
  code?: string;
}

export const getSafeErrorMessage = (
  error: unknown,
  resourceName: string
): string => {
  if (!error) {
    return `An unknown error occurred while fetching ${resourceName}.`;
  }

  if (typeof error === "object" && error !== null) {
    if ("status" in error && "data" in error) {
      const fetchError = error as AppFetchBaseQueryError;
      let message = `Error fetching ${resourceName}. Status: ${fetchError.status}.`;
      if (
        fetchError.data &&
        typeof fetchError.data === "object" &&
        "message" in fetchError.data &&
        typeof (fetchError.data as { message?: string }).message === "string"
      ) {
        message += ` Message: ${(fetchError.data as { message: string }).message}`;
      } else if (fetchError.data && typeof fetchError.data === "string") {
        message += ` Data: ${fetchError.data}`;
      }
      return message;
    }
    if (
      "status" in error &&
      "error" in error &&
      typeof (error as AppFetchBaseQueryError).error === "string"
    ) {
      return `Error fetching ${resourceName}. Status: ${(error as AppFetchBaseQueryError).status}. Details: ${(error as AppFetchBaseQueryError).error}`;
    }
    if (
      "message" in error &&
      typeof (error as AppSerializedError).message === "string"
    ) {
      return `Error: ${(error as AppSerializedError).message}`;
    }
  }
  try {
    return `An unexpected error structure was encountered while fetching ${resourceName}. Details: ${JSON.stringify(error)}`;
  } catch (e) {
    return `An unexpected and non-serializable error was encountered while fetching ${resourceName}.`;
  }
};
