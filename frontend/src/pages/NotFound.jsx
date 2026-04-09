import PageContainer from "../components/PageContainer";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <PageContainer title="Not Found" subtitle="This route is unavailable">
      <EmptyState
        icon="🧭"
        title="Page Not Found"
        message="The page you are trying to access does not exist."
        action={(
          <Button onClick={() => navigate("/")} variant="info">
            Go to Dashboard
          </Button>
        )}
      />
    </PageContainer>
  );
}

export default NotFound;
