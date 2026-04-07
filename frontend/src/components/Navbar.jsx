import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ 
      padding: '15px 20px', 
      background: '#2c3e50', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ margin: '0 40px 0 0', color: '#1abc9c' }}>DevDeploy</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/projects" style={{ color: 'white', textDecoration: 'none' }}>Projects</Link>
        <Link to="/deployments" style={{ color: 'white', textDecoration: 'none' }}>Deployments</Link>
      </div>
    </nav>
  );
}

export default Navbar;
