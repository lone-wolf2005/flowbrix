import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HrDashboard from './pages/HrDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ItDashboard from './pages/ItDashboard';
import ThreeBackground from './components/ThreeBackground';
import { LogOut, ShieldAlert } from 'lucide-react';

function App() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-gradient)',
        color: '#fff'
      }}>
        <h2>Loading Flowbrix...</h2>
      </div>
    );
  }

  // Render Login if user is not authenticated
  if (!user) {
    return (
      <>
        <ThreeBackground />
        <Login />
      </>
    );
  }

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      case 'HR_ADMIN':
        return <HrDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'IT_SUPPORT':
        return <ItDashboard />;
      default:
        return (
          <div className="glass-card" style={{ textAlign: 'center', marginTop: '40px' }}>
            <ShieldAlert size={48} color="var(--danger-color)" style={{ marginBottom: '16px' }} />
            <h2>Unauthorized Role</h2>
            <p style={{ marginTop: '8px' }}>Your account role "{user.role}" does not have access to any dashboard.</p>
            <button onClick={logout} className="btn-primary" style={{ marginTop: '20px' }}>Sign Out</button>
          </div>
        );
    }
  };

  // Convert role strings to user-friendly titles
  const getRoleTitle = (role) => {
    switch (role) {
      case 'EMPLOYEE': return 'Employee Workspace';
      case 'HR_ADMIN': return 'HR Portal';
      case 'MANAGER': return 'Manager Console';
      case 'IT_SUPPORT': return 'IT Admin Panel';
      default: return 'User';
    }
  };

  return (
    <div className="app-container">
      {/* 3D Particle Background */}
      <ThreeBackground />

      {/* Global Navigation Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">F</div>
          <span>FLOWBRIX</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{user.fullName}</p>
            <p style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: '600' }}>
              {getRoleTitle(user.role)}
            </p>
          </div>

          <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', gap: '6px' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default App;
