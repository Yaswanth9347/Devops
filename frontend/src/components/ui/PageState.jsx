import Loader from "../Loader";
import ErrorMessage from "./ErrorMessage";

function PageState({
  loading,
  error,
  loadingText = "Loading...",
  onRetry,
  retryLabel = "Retry Loading",
  retrying = false,
  children
}) {
  if (loading) {
    return <Loader text={loadingText} />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={onRetry}
        retryLabel={retryLabel}
        retrying={retrying}
      />
    );
  }

  return children;
}

export default PageState;
