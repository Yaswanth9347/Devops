export function getRequestErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;

  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  if (!error.response) {
    return "Unable to connect to server. Check your network or backend service.";
  }

  const status = error.response.status;
  if (status >= 500) return "Server error occurred. Please try again.";
  if (status === 404) return "Requested resource was not found.";
  if (status === 401 || status === 403) return "You are not authorized for this action.";
  if (status >= 400) return "Request could not be processed. Please verify input and retry.";

  return fallbackMessage;
}
