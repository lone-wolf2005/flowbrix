import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, CheckCircle, Clipboard, AlertCircle, ArrowRight, Check
} from 'lucide-react';

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [empDetails, setEmpDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Assign task form
  const [taskDescription, setTaskDescription] = useState('');

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

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;
    setError('');
    try {
      await api.assignTask(selectedEmpId, { description: taskDescription, assignedBy: 'Manager' });
      setTaskDescription('');
      await fetchEmployeeDetails(selectedEmpId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveOnboarding = async () => {
    setError('');
    try {
      await api.approveOnboarding(selectedEmpId);
      await fetchEmployeeDetails(selectedEmpId);
      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Manager Console...</div>;

  // Check if current employee has any incomplete tasks
  const allTasksCompleted = empDetails?.tasks?.length > 0 && empDetails.tasks.every(t => t.completed);
  // Check if we are ready to approve (status can be VERIFIED or TASKS_ASSIGNED)
  const canApprove = empDetails && 
    (empDetails.user.status === 'VERIFIED' || empDetails.user.status === 'TASKS_ASSIGNED') && 
    allTasksCompleted;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Manager Approvals Board</h1>
        <p>Review checklists, assign manager tasks, and sign off on completed onboardings. {api.isMock() && "(Demo Mock Mode)"}</p>
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
            <Users color="var(--accent-color)" /> Team Onboardings
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
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px' }}>{emp.fullName}</h3>
                    <p style={{ fontSize: '12px' }}>{emp.email}</p>
                  </div>
                  <span className={`badge ${
                    ['APPROVED', 'ASSETS_ALLOCATED', 'COMPLETED'].includes(emp.status) ? 'badge-success' : 'badge-pending'
                  }`} style={{ fontSize: '10px' }}>
                    {emp.status}
                  </span>
                </div>
              </div>
            ))}
            {employees.length === 0 && <p style={{ fontStyle: 'italic' }}>No employees registered yet.</p>}
          </div>
        </div>

        {/* Manager Operations */}
        <div>
          {selectedEmpId && empDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Employee Overview & Final Approval */}
              <div className="glass-card">
                <h2>{empDetails.user.fullName}</h2>
                <p style={{ marginBottom: '20px' }}>Status: <strong>{empDetails.user.status}</strong></p>

                {['APPROVED', 'ASSETS_ALLOCATED', 'COMPLETED'].includes(empDetails.user.status) ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--success-color)'
                  }}>
                    <CheckCircle /> Onboarding Manager Sign-off completed.
                  </div>
                ) : (
                  <div>
                    {canApprove ? (
                      <div>
                        <p style={{ marginBottom: '16px', color: 'white' }}>
                          ✓ All onboarding tasks have been completed. You can now sign off.
                        </p>
                        <button onClick={handleApproveOnboarding} className="btn-primary" style={{ width: '100%', gap: '6px' }}>
                          <Check size={18} /> Grant Manager Approval
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: 'var(--warning-color)',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        <AlertCircle shrink={0} size={20} />
                        <div>
                          Onboarding approval is locked. The employee must complete all assigned tasks first.
                          {!empDetails?.tasks?.length && <div style={{ fontWeight: '600', marginTop: '4px' }}>Please assign at least one task.</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Task list and assignment */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clipboard size={18} color="var(--accent-color)" /> Onboarding Checklist
                </h3>

                {/* Manager Task Form */}
                {!['APPROVED', 'ASSETS_ALLOCATED', 'COMPLETED'].includes(empDetails.user.status) && (
                  <form onSubmit={handleAssignTask} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input
                      type="text" className="glass-input" placeholder="e.g. Schedule team intro call..."
                      value={taskDescription} onChange={e => setTaskDescription(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      Assign <ArrowRight size={14} />
                    </button>
                  </form>
                )}

                {/* Checklist */}
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
                <p>Select an employee from the sidebar to review checklists and grant approval.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
