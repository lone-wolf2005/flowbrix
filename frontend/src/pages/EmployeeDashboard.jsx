import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User as UserIcon, Phone, MapPin, CreditCard, Upload, CheckCircle, 
  Clock, XCircle, Award, Briefcase, Cpu, Download
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const [docName, setDocName] = useState('ID Proof');
  const [docUrl, setDocUrl] = useState('');
  
  const fetchDetails = async () => {
    try {
      const data = await api.getEmployeeDetails(user.id);
      setDetails(data);
      if (data.user) {
        setPhone(data.user.phone || '');
        setAddress(data.user.address || '');
        setBankName(data.user.bankName || '');
        setBankAccount(data.user.bankAccountNumber || '');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [user.id]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.completeProfile(user.id, { phone, address, bankName, bankAccountNumber: bankAccount });
      await fetchDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    setError('');
    if (!docUrl.trim()) {
      setError('Please provide a file URL or description.');
      return;
    }
    try {
      await api.uploadDoc(user.id, { name: docName, fileUrl: docUrl });
      setDocUrl('');
      await fetchDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.completeTask(taskId);
      await fetchDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Workspace...</div>;

  const currentStatus = details?.user?.status || 'REGISTERED';

  // Map status to active index for stepper
  const statusMapping = {
    'REGISTERED': 0,
    'PROFILE_COMPLETED': 1,
    'DOCS_UPLOADED': 2,
    'VERIFIED': 3,
    'TASKS_ASSIGNED': 4,
    'APPROVED': 5,
    'ASSETS_ALLOCATED': 6,
    'COMPLETED': 7
  };

  const activeIndex = statusMapping[currentStatus] ?? 0;
  
  const steps = [
    { label: 'Register', desc: 'Employee registration completed' },
    { label: 'Profile', desc: 'Provide contact and bank details' },
    { label: 'Documents', desc: 'Upload required verification files' },
    { label: 'Verification', desc: 'HR review and validation' },
    { label: 'Tasks', desc: 'Complete training & setups' },
    { label: 'Approval', desc: 'Manager review & sign-off' },
    { label: 'Assets', desc: 'IT equipment assignment' },
    { label: 'Completed', desc: 'Receive Digital QR ID' }
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Welcome, {details?.user?.fullName}</h1>
        <p>Role: Employee | Employee ID: #{details?.user?.id} {api.isMock() && " (Demo Mock Mode)"}</p>
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

      {/* Onboarding Stepper */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}>Onboarding Progress</h3>
        <div className="stepper">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex || currentStatus === 'COMPLETED';
            const isActive = idx === activeIndex && currentStatus !== 'COMPLETED';
            return (
              <div key={idx} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                <div className="step-icon">
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Current Phase: <strong>{steps[Math.min(activeIndex, 7)].desc}</strong>
        </p>
      </div>

      <div className="grid-2">
        {/* Main Action Card */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase color="var(--accent-color)" /> Action Required
          </h2>

          {/* STAGE 1: Profile Completion */}
          {currentStatus === 'REGISTERED' && (
            <form onSubmit={handleProfileSubmit}>
              <p style={{ marginBottom: '20px' }}>Please complete your profile to initiate document submission.</p>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input
                    type="text" required className="glass-input" style={{ paddingLeft: '44px' }}
                    value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Home Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input
                    type="text" required className="glass-input" style={{ paddingLeft: '44px' }}
                    value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Bank Name</label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                    <input
                      type="text" required className="glass-input" style={{ paddingLeft: '44px' }}
                      value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Apex Bank"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Account Number</label>
                  <input
                    type="text" required className="glass-input"
                    value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="1234567890"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save and Continue</button>
            </form>
          )}

          {/* STAGE 2: Document Upload */}
          {currentStatus === 'PROFILE_COMPLETED' && (
            <form onSubmit={handleUploadDoc}>
              <p style={{ marginBottom: '20px' }}>Upload copies of your documents. For this demo, enter a name and any placeholder text/file link.</p>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Document Type</label>
                <select 
                  className="glass-input" 
                  value={docName} 
                  onChange={e => setDocName(e.target.value)}
                  style={{ appearance: 'none', background: 'rgba(0,0,0,0.4) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center', backgroundSize: '16px' }}
                >
                  <option value="ID Proof">Government ID (Passport/SSN)</option>
                  <option value="Degree Certificate">Academic Degree Certificate</option>
                  <option value="Direct Deposit Auth">Direct Deposit Authorization Form</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Document File Link / Content</label>
                <div style={{ position: 'relative' }}>
                  <Upload size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input
                    type="text" required className="glass-input" style={{ paddingLeft: '44px' }}
                    value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="e.g. passport_scan.pdf or google drive link"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Upload Document</button>
            </form>
          )}

          {/* STAGE 3: Document Verification */}
          {currentStatus === 'DOCS_UPLOADED' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Clock size={48} color="var(--warning-color)" style={{ marginBottom: '16px', animation: 'pulse 2s infinite' }} />
              <h3>Awaiting HR Verification</h3>
              <p style={{ marginTop: '8px' }}>Your documents have been submitted successfully. HR will review and verify them shortly.</p>
            </div>
          )}

          {/* STAGE 4: Document Verified / Waiting for Tasks */}
          {currentStatus === 'VERIFIED' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Clock size={48} color="var(--warning-color)" style={{ marginBottom: '16px' }} />
              <h3>Documents Verified</h3>
              <p style={{ marginTop: '8px' }}>Your documents have been approved by HR! Please wait for your Manager to assign your onboarding tasks.</p>
            </div>
          )}

          {/* STAGE 5: Task Completion */}
          {currentStatus === 'TASKS_ASSIGNED' && (
            <div>
              <p style={{ marginBottom: '20px' }}>Please complete the following custom onboarding tasks assigned by your Manager/HR:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {details.tasks?.map((task) => (
                  <div key={task.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: '500' }}>{task.description}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Assigned by: {task.assignedBy}</p>
                    </div>
                    {task.completed ? (
                      <span className="badge badge-success" style={{ gap: '4px' }}><CheckCircle size={12} /> Done</span>
                    ) : (
                      <button onClick={() => handleCompleteTask(task.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))}
                {details.tasks?.length === 0 && <p style={{ fontStyle: 'italic' }}>No tasks assigned yet.</p>}
              </div>
            </div>
          )}

          {/* STAGE 6: Approved / Waiting for IT */}
          {currentStatus === 'APPROVED' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Clock size={48} color="var(--warning-color)" style={{ marginBottom: '16px' }} />
              <h3>Onboarding Approved</h3>
              <p style={{ marginTop: '8px' }}>Your manager has signed off on your onboarding tasks. Your profile is now with IT Support to configure your workspace assets.</p>
            </div>
          )}

          {/* STAGE 7: Assets Allocated / Complete */}
          {currentStatus === 'ASSETS_ALLOCATED' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Clock size={48} color="var(--warning-color)" style={{ marginBottom: '16px' }} />
              <h3>Workspace Configured</h3>
              <p style={{ marginTop: '8px' }}>IT Support has configured your assets. Finishing up your onboarding process...</p>
            </div>
          )}

          {/* STAGE 8: Onboarding Completed */}
          {currentStatus === 'COMPLETED' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Award size={48} color="var(--success-color)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--success-color)' }}>Onboarding Complete!</h3>
              <p style={{ marginTop: '8px', marginBottom: '20px' }}>Welcome to the team! Your digital ID card has been issued. You can verify it anytime by showing the QR code on the right.</p>
              
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '10px', fontSize: '13px', textAlign: 'left', lineHeight: '1.5' }}>
                <strong>✓ Account Configured:</strong> Check your inbox for workspace login credentials.<br/>
                <strong>✓ Hardware Ready:</strong> IT has shipped your company device. See tracking details under "Assets Allocated".
              </div>
            </div>
          )}
        </div>

        {/* Info Column (Docs, Tasks, Assets, or Final QR Code) */}
        <div>
          {currentStatus === 'COMPLETED' ? (
            /* Digital ID Card with QR Code */
            <div className="glass-card" style={{
              background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0.5) 100%)',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 15px 35px rgba(99, 102, 241, 0.15)'
            }}>
              {/* Card Accent lines */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'var(--accent-gradient)', filter: 'blur(30px)', opacity: '0.5' }}></div>
              
              <span className="badge badge-success" style={{ alignSelf: 'flex-end', marginBottom: '12px' }}>Verified Employee</span>
              
              <div style={{
                width: '180px',
                height: '180px',
                background: 'white',
                padding: '10px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                marginBottom: '20px'
              }}>
                <img src={details?.user?.qrCodeData} alt="Onboarding QR Code ID" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              <div style={{ textAlign: 'center', width: '100%' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{details?.user?.fullName}</h3>
                <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px', marginBottom: '12px' }}>Software Engineer</p>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
                  <div><strong>EMP ID:</strong> #{details?.user?.id}</div>
                  <div><strong>EMAIL:</strong> {details?.user?.email}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>ISSUED:</strong> {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <a href={details?.user?.qrCodeData} download={`${details?.user?.username}_flowbrix_id.png`} className="btn-secondary" style={{ marginTop: '24px', width: '100%', padding: '8px 16px', fontSize: '13px', gap: '6px' }}>
                <Download size={14} /> Download QR Code
              </a>
            </div>
          ) : (
            /* Standard summary of docs, tasks, and assets */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Profile Details summary */}
              {details?.user?.phone && (
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><UserIcon size={16} color="var(--accent-color)" /> Personal Details</h3>
                  <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ color: 'white' }}><strong>Phone:</strong> {details.user.phone}</p>
                    <p style={{ color: 'white' }}><strong>Address:</strong> {details.user.address}</p>
                    <p style={{ color: 'white' }}><strong>Bank:</strong> {details.user.bankName} (Acc: ****{details.user.bankAccountNumber?.slice(-4)})</p>
                  </div>
                </div>
              )}

              {/* Documents List */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Upload size={16} color="var(--accent-color)" /> Documents Uploaded</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {details?.documents?.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                      <span>{doc.name}</span>
                      <div>
                        {doc.status === 'PENDING' && <span className="badge badge-pending"><Clock size={10} /> Pending</span>}
                        {doc.status === 'APPROVED' && <span className="badge badge-success"><CheckCircle size={10} /> Approved</span>}
                        {doc.status === 'REJECTED' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className="badge badge-danger"><XCircle size={10} /> Rejected</span>
                            <span style={{ fontSize: '10px', color: 'var(--danger-color)', marginTop: '2px' }}>Reason: {doc.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {details?.documents?.length === 0 && <p style={{ fontStyle: 'italic', fontSize: '13px' }}>No documents uploaded yet.</p>}
                </div>
              </div>

              {/* Assets allocated */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={16} color="var(--accent-color)" /> Allocated Assets</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {details?.assets?.map(asset => (
                    <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                      <div>
                        <p style={{ color: 'white', fontWeight: '500' }}>{asset.assetName}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SN: {asset.serialNumber || 'N/A'}</p>
                      </div>
                      <span className="badge badge-success"><CheckCircle size={10} /> Provisioned</span>
                    </div>
                  ))}
                  {details?.assets?.length === 0 && <p style={{ fontStyle: 'italic', fontSize: '13px' }}>No hardware/software allocated yet.</p>}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
