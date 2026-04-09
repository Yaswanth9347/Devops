import Spinner from "./ui/Spinner";

function Loader({ text = "Loading..." }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      color: '#888'
    }}>
      <Spinner size={40} borderWidth={4} color="#3498db" trackColor="#ecf0f1" />
      <p style={{ marginTop: '15px' }}>{text}</p>
    </div>
  );
}

export default Loader;
