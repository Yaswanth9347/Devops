function Container({ children }) {
  return (
    <div
      style={{
        maxWidth: "1100px",
        width: "100%",
        margin: "0 auto",
        padding: "0 10px",
        boxSizing: "border-box"
      }}
    >
      {children}
    </div>
  );
}

export default Container;
