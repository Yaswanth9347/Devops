import Container from "./ui/Container";

function PageContainer({ title, subtitle, actions, children }) {
  return (
    <Container>
      <div>
        {/* Page Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px"
        }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "1.5em", color: "#1a1d2e" }}>{title}</h1>
            {subtitle && <p style={{ margin: 0, color: "#888", fontSize: "0.9em" }}>{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
        {children}
      </div>
    </Container>
  );
}

export default PageContainer;
