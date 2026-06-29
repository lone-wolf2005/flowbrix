import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Check, X, Clipboard, ArrowRight, UserCheck, 
  MapPin, Phone, CreditCard, FileText
} from 'lucide-react';

export default function HrDashboard() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [empDetails, setEmpDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Assign task form
  const [taskDescription, setTaskDescription] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDocId, setRejectDocId] = useState(null);

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

  const handleVerifyDoc = async (docId, status, reason = '') => {
    setError('');
    try {
      await api.verifyDoc(docId, { status, rejectionReason: reason });
      
      // Reset rejection helper states
      setRejectDocId(null);
      setRejectReason('');

      // Refresh data
      await fetchEmployeeDetails(selectedEmpId);
      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;
    setError('');
    try {
      await api.assignTask(selectedEmpId, { description: taskDescription, assignedBy: 'HR' });
      setTaskDescription('');
      await fetchEmployeeDetails(selectedEmpId);
      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading HR Console...</div>;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>HR Operations Hub</h1>
        <p>Manage employee registrations, document approvals, and onboarding checklists. {api.isMock() && "(Demo Mock Mode)"}</p>
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
            <Users color="var(--accent-color)" /> Employees ({employees.length})
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

        {/* Details and Operations */}
        <div>
          {selectedEmpId && empDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Employee Summary Card */}
              <div className="glass-card">
                <h2>{empDetails.user.fullName}</h2>
                <p style={{ marginBottom: '16px' }}>Status: <strong>{empDetails.user.status}</strong></p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                  <p style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--accent-color)" /> {empDetails.user.phone || 'No phone number'}
                  </p>
                  <p style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--accent-color)" /> {empDetails.user.address || 'No address details'}
                  </p>
                  <p style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
                    <CreditCard size={14} color="var(--accent-color)" /> Bank: {empDetails.user.bankName || 'N/A'} (Acc: {empDetails.user.bankAccountNumber || 'N/A'})
                  </p>
                </div>
              </div>

              {/* Document Review Card */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={18} color="var(--accent-color)" /> Document Submissions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {empDetails.documents?.map(doc => (
                    <div key={doc.id} className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <p style={{ color: 'white', fontWeight: '600' }}>{doc.name}</p>
                          <a href="#" onClick={(e) => { e.preventDefault(); alert(`Viewing file: ${doc.fileUrl}`); }} style={{ fontSize: '12px', color: 'var(--accent-color)' }}>
                            View Uploaded File
                          </a>
                        </div>
                        <span className={`badge ${
                          doc.status === 'APPROVED' ? 'badge-success' : doc.status === 'REJECTED' ? 'badge-danger' : 'badge-pending'
                        }`} style={{ fontSize: '10px' }}>{doc.status}</span>
                      </div>

                      {doc.status === 'PENDING' && (
                        <div>
                          {rejectDocId === doc.id ? (
                            <div style={{ marginTop: '12px' }}>
                              <input 
                                type="text" className="glass-input" placeholder="Enter rejection reason..."
                                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                style={{ marginBottom: '8px' }}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleVerifyDoc(doc.id, 'REJECTED', rejectReason)} className="btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                  Confirm Reject
                                </button>
                                <button onClick={() => setRejectDocId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                              <button onClick={() => handleVerifyDoc(doc.id, 'APPROVED')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}>
                                <Check size={12} /> Approve
                              </button>
                              <button onClick={() => setRejectDocId(doc.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}>
                                <X size={12} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {doc.status === 'REJECTED' && (
                        <p style={{ fontSize: '12px', color: 'var(--danger-color)', marginTop: '4px' }}>
                          Reason: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))}
                  {empDetails.documents?.length === 0 && <p style={{ fontStyle: 'italic' }}>No documents uploaded by employee yet.</p>}
                </div>
              </div>

              {/* Task Assignment Card */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clipboard size={18} color="var(--accent-color)" /> Assign Onboarding Tasks
                </h3>
                
                {/* Task Form */}
                <form onSubmit={handleAssignTask} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <input
                    type="text" className="glass-input" placeholder="e.g. Sign the company handbook..."
                    value={taskDescription} onChange={e => setTaskDescription(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    Assign <ArrowRight size={14} />
                  </button>
                </form>

                {/* Assigned Tasks list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {empDetails.tasks?.map(task => (
                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                      <div>
                        <p style={{ color: 'white', fontWeight: '500' }}>{task.description}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Assigned by: {task.assignedBy}</p>
                      </div>
                      <span className={`badge ${task.completed ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '10px' }}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                  {empDetails.tasks?.length === 0 && <p style={{ fontStyle: 'italic', fontSize: '13px' }}>No tasks assigned yet.</p>}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifySelf: 'center', minHeight: '300px' }}>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <Users size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p>Select an employee from the sidebar to review details and take actions.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
