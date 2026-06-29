import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Cpu, ArrowRight, CheckCircle, Smartphone, Laptop, Key
} from 'lucide-react';

export default function ItDashboard() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [empDetails, setEmpDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  // Asset forms
  const [assetName, setAssetName] = useState('MacBook Pro 14"');
  const [serialNumber, setSerialNumber] = useState('');

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (id) => {
    setDetailsLoading(true);
    setError('');
    try {
      const data = await api.getEmployeeDetails(id);
      setEmpDetails(data);
      setSelectedEmpId(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAllocateAsset = async (e) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;
    setError('');
    try {
      await api.allocateAsset(selectedEmpId, { assetName, serialNumber });
      setSerialNumber('');
      await fetchEmployeeDetails(selectedEmpId);
      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading IT Support Console...</div>;

  const isApproved = empDetails && (
    empDetails.user.status === 'APPROVED' || 
    empDetails.user.status === 'ASSETS_ALLOCATED' || 
    empDetails.user.status === 'COMPLETED'
  );

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>IT Hardware & Asset Provisioning</h1>
        <p>Allocate laptops, secure system credentials, and configure workspaces for approved personnel. {api.isMock() && "(Demo Mock Mode)"}</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '10px',
          padding: '12px',
          color: 'var(--danger-color)',
          marginBottom: '20px'
        }}>{error}</div>
      )}

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 3fr' }}>
        
        {/* Employees List */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
            <Users color="var(--accent-color)" /> Approved Personnel
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {employees.map(emp => (
              <div 
                key={emp.id} 
                onClick={() => fetchEmployeeDetails(emp.id)}
                className="glass-card" 
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer', 
                  background: selectedEmpId === emp.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.01)',
                  borderColor: selectedEmpId === emp.id ? 'var(--accent-color)' : 'var(--glass-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px' }}>{emp.fullName}</h3>
                    <p style={{ fontSize: '12px' }}>{emp.email}</p>
                  </div>
                  <span className={`badge ${
                    emp.status === 'COMPLETED' ? 'badge-success' : 'badge-pending'
                  }`} style={{ fontSize: '10px' }}>
                    {emp.status}
                  </span>
                </div>
              </div>
            ))}
            {employees.length === 0 && <p style={{ fontStyle: 'italic' }}>No employees registered yet.</p>}
          </div>
        </div>

        {/* IT Operations */}
        <div>
          {selectedEmpId && empDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Employee Status Card */}
              <div className="glass-card">
                <h2>{empDetails.user.fullName}</h2>
                <p>Status: <strong>{empDetails.user.status}</strong></p>
              </div>

              {/* Asset Allocation Card */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={18} color="var(--accent-color)" /> Provision Corporate Assets
                </h3>

                {isApproved ? (
                  <div>
                    {/* Allocation Form */}
                    {empDetails.user.status !== 'COMPLETED' && (
                      <form onSubmit={handleAllocateAsset} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Asset Category</label>
                            <select 
                              className="glass-input" 
                              value={assetName} 
                              onChange={e => setAssetName(e.target.value)}
                              style={{ appearance: 'none', background: 'rgba(0,0,0,0.4) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center', backgroundSize: '16px' }}
                            >
                              <option value="MacBook Pro 14">MacBook Pro 14"</option>
                              <option value="Dell XPS 15">Dell XPS 15"</option>
                              <option value="Corporate Email Workspace">Corporate Email Workspace</option>
                              <option value="GitHub Enterprise Access">GitHub Enterprise Access</option>
                              <option value="Slack Workspace Account">Slack Workspace Account</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Serial / Reference ID</label>
                            <input
                              type="text" className="glass-input" placeholder="e.g. SN-9823-A"
                              value={serialNumber} onChange={e => setSerialNumber(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>
                          Provision Asset <ArrowRight size={14} />
                        </button>
                      </form>
                    )}

                    {/* Allocated Assets List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {empDetails.assets?.map(asset => (
                        <div key={asset.id} className="glass-card" style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {asset.assetName.includes('Mac') || asset.assetName.includes('Dell') ? (
                              <Laptop size={20} color="var(--accent-color)" />
                            ) : asset.assetName.includes('Email') ? (
                              <Smartphone size={20} color="var(--accent-color)" />
                            ) : (
                              <Key size={20} color="var(--accent-color)" />
                            )}
                            <div>
                              <p style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>{asset.assetName}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SN: {asset.serialNumber || 'N/A'}</p>
                            </div>
                          </div>
                          <span className="badge badge-success" style={{ gap: '4px', fontSize: '11px' }}>
                            <CheckCircle size={10} /> Active
                          </span>
                        </div>
                      ))}
                      {empDetails.assets?.length === 0 && <p style={{ fontStyle: 'italic', fontSize: '13px' }}>No assets provisioned yet.</p>}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'var(--danger-color)',
                    fontSize: '14px'
                  }}>
                    Asset allocation is locked. The manager must approve the onboarding process first.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifySelf: 'center', minHeight: '300px' }}>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <Cpu size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p>Select an approved employee to configure hardware, accounts, and workspace settings.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
