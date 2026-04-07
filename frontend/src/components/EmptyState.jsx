function EmptyState({ icon = "📭", title, message }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      color: '#888',
      background: '#fafafa',
      borderRadius: '12px',
      border: '2px dashed #ddd',
      margin: '20px 0'
    }}>
      <p style={{ fontSize: '3em', margin: '0' }}>{icon}</p>
      <h3 style={{ margin: '10px 0 5px', color: '#555' }}>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
