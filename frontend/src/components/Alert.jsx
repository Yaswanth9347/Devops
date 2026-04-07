import { useState, useEffect } from "react";

function Alert({ message, type = "success", onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (onDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [onDismiss]);

  if (!visible || !message) return null;

  const styles = {
    success: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
    error:   { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
    info:    { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
    warning: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }
  };

  const style = styles[type] || styles.info;

  return (
    <div style={{
      ...style,
      padding: '12px 20px',
      borderRadius: '6px',
      margin: '10px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      animation: 'fadeIn 0.3s ease-in'
    }}>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={() => { setVisible(false); onDismiss(); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '1.2em', color: style.color, padding: '0 0 0 15px'
        }}>✕</button>
      )}
    </div>
  );
}

export default Alert;
