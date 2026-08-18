'use client';
import React, { useState } from 'react';

export default function EnterpriseTradePortal() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); // { email, role, companyName }
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Portal Global State
  const [gatewayOperational, setGatewayOperational] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState('System maintenance scheduled for Friday 00:00 - 04:00 WAT.');
  
  // Applications Store
  const [applications, setApplications] = useState([
    {
      id: 'NSW-2026-0001',
      company: 'Global Trade Co',
      product: 'Industrial Machine',
      quantity: '10 Units',
      type: 'Import Permit',
      status: 'APPROVED',
      denialReason: '',
      documentName: 'invoice_manifest.pdf',
      auditTrail: [
        { action: 'Application submitted', time: '2026-08-18 09:15', actor: 'Global Trade Co' },
        { action: 'Document Completeness Check passed', time: '2026-08-18 09:20', actor: 'System' },
        { action: 'Regulatory Agency Review approved', time: '2026-08-18 10:00', actor: 'Customs Officer J. Adebayo' },
        { action: 'Final Decision released', time: '2026-08-18 10:05', actor: 'System' }
      ]
    },
    {
      id: 'NSW-2026-0002',
      company: 'Apex Agro Allied',
      product: 'Raw Cashew Nuts',
      quantity: '50 Metric Tons',
      type: 'Export License',
      status: 'PENDING',
      denialReason: '',
      documentName: 'phyto_cert.pdf',
      auditTrail: [
        { action: 'Application submitted', time: '2026-08-18 11:00', actor: 'Apex Agro Allied' }
      ]
    },
    {
      id: 'NSW-2026-0003',
      company: 'Heavy Industries Ltd',
      product: 'Heavy Industrial Generator',
      quantity: '2 Units',
      type: 'Import Permit',
      status: 'DENIED',
      denialReason: 'Denied: Tax Clearance Certificate Expired',
      documentName: 'expired_tax.pdf',
      auditTrail: [
        { action: 'Application submitted', time: '2026-08-18 08:30', actor: 'Heavy Industries Ltd' },
        { action: 'Document Completeness Check failed: Tax Clearance Expired', time: '2026-08-18 08:45', actor: 'Agency Officer' }
      ]
    }
  ]);

  // User Accounts Directory for IAM
  const [usersList, setUsersList] = useState([
    { name: 'Global Trade Co', email: 'trader@abc.com', role: 'TRADER', status: 'ACTIVE' },
    { name: 'Customs Officer J. Adebayo', email: 'customs@nsw.gov.ng', role: 'AGENCY', status: 'ACTIVE' },
    { name: 'Platform Administrator', email: 'admin@nsw.gov.ng', role: 'ADMIN', status: 'ACTIVE' }
  ]);

  // UI Modals & Navigation State
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [selectedAppForTrace, setSelectedAppForTrace] = useState(null);
  const [selectedAppForPermit, setSelectedAppForPermit] = useState(null);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // New Application Form State (No HS Code, includes Dynamic Company & File Upload)
  const [newAppType, setNewAppType] = useState('Import Permit');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [formError, setFormError] = useState('');

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const foundUser = usersList.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.status === 'ACTIVE');
    
    if (!foundUser) {
      setLoginError('Invalid credentials or account is suspended.');
      return;
    }

    // Assign mock credentials mapping
    if (loginEmail === 'trader@abc.com' && loginPassword === 'password123') {
      setCurrentUser({ email: loginEmail, role: 'TRADER', companyName: foundUser.name });
    } else if (loginEmail === 'customs@nsw.gov.ng' && loginPassword === 'secure2026') {
      setCurrentUser({ email: loginEmail, role: 'AGENCY', companyName: 'Nigerian Customs Service' });
    } else if (loginEmail === 'admin@nsw.gov.ng' && loginPassword === 'admin2026') {
      setCurrentUser({ email: loginEmail, role: 'ADMIN', companyName: 'Platform Administration' });
    } else {
      setLoginError('Incorrect password provided.');
    }
  };

  // Handle New Application Submission with File Validation (<5MB)
  const handleCreateApplication = (e) => {
    e.preventDefault();
    setFormError('');

    if (!newCompanyName || !newProduct || !newQuantity) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (newFile) {
      if (newFile.size > 5 * 1024 * 1024) {
        setFormError('File size exceeds the 5MB limit.');
        return;
      }
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(newFile.type)) {
        setFormError('Invalid file format. Only PDF, PNG, and JPEG are supported.');
        return;
      }
    } else {
      setFormError('Please attach a supporting verification document.');
      return;
    }

    const newId = `NSW-2026-000${applications.length + 1}`;
    const newEntry = {
      id: newId,
      company: newCompanyName,
      product: newProduct,
      quantity: newQuantity,
      type: newAppType,
      status: 'PENDING',
      denialReason: '',
      documentName: newFile.name,
      auditTrail: [
        { action: 'Application submitted with document verification', time: new Date().toISOString().slice(0, 16).replace('T', ' '), actor: newCompanyName }
      ]
    };

    setApplications([newEntry, ...applications]);
    setShowNewAppModal(false);
    setNewCompanyName('');
    setNewProduct('');
    setNewQuantity('');
    setNewFile(null);
  };

  // Agency action: Approve or Deny with reason
  const handleAgencyDecision = (id, decision, reason = '') => {
    setApplications(applications.map(app => {
      if (app.id === id) {
        const updatedTrail = [...app.auditTrail, {
          action: decision === 'APPROVED' ? 'Final Decision: Approved & E-Permit Issued' : `Application Denied: ${reason}`,
          time: new Date().toISOString().slice(0, 16).replace('T', ' '),
          actor: currentUser.email
        }];
        return {
          ...app,
          status: decision,
          denialReason: decision === 'DENIED' ? reason : '',
          auditTrail: updatedTrail
        };
      }
      return app;
    }));
  };

  // Admin action: Void / Archive Record (Replacing Force Purge)
  const handleVoidRecord = (id) => {
    setApplications(applications.map(app => {
      if (app.id === id) {
        return {
          ...app,
          status: 'VOIDED',
          denialReason: 'Administrative Override: Record Voided & Archived',
          auditTrail: [...app.auditTrail, { action: 'Record Voided by Admin', time: new Date().toISOString().slice(0, 16).replace('T', ' '), actor: 'Admin' }]
        };
      }
      return app;
    }));
  };

  // IAM User Status Control
  const toggleUserStatus = (email) => {
    setUsersList(usersList.map(u => {
      if (u.email === email) {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  // ================= RENDER LOGIN VIEW =================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-wider uppercase text-emerald-400">Enterprise Trade Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Federal Republic of Nigeria - Regulatory Gateway</p>
          </div>

          {loginError && (
            <div className="bg-rose-900/50 border border-rose-700 text-rose-200 text-xs p-3 rounded mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Official Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. trader@abc.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 rounded text-sm transition-all shadow-lg"
            >
              Sign In to Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= RENDER MAIN PORTAL DASHBOARD =================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Banner / Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black tracking-tight text-emerald-400 uppercase">Enterprise Trade Portal (Nigeria)</h2>
          <p className="text-xs text-slate-400">Unified Regulatory & Compliance Exchange</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-200">{currentUser.companyName}</p>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-semibold">{currentUser.role}</p>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Broadcast Notice Banner */}
      {activeBroadcast && (
        <div className="bg-emerald-950/60 border-b border-emerald-800/50 px-6 py-2 text-xs text-emerald-200 flex justify-between items-center">
          <span>📢 <strong>System Broadcast:</strong> {activeBroadcast}</span>
        </div>
      )}

      {/* Main Dashboard Body */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Gateway Status Header */}
        <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-xl border border-slate-800">
          <div>
            <h3 className="text-lg font-bold">System Governance & Console</h3>
            <p className="text-xs text-slate-400">Live operational oversight and trade record audit views.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 uppercase font-bold">Gateway Status:</span>
            <span className={`px-3 py-1 rounded text-xs font-bold ${gatewayOperational ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-rose-900/60 text-rose-300 border border-rose-700'}`}>
              {gatewayOperational ? 'Operational' : 'Offline / Maintenance'}
            </span>
          </div>
        </div>

        {/* ================= TRADER VIEW ================= */}
        {currentUser.role === 'TRADER' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-200">My Trade Applications</h3>
              <button 
                onClick={() => setShowNewAppModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold px-4 py-2 rounded shadow transition-all"
              >
                + Submit New Application
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/80">
                    <th className="p-4">ID</th>
                    <th className="p-4">Product Description</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Process Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {applications.filter(a => a.company === currentUser.companyName).map(app => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-xs text-emerald-400">{app.id}</td>
                      <td className="p-4 font-medium">{app.product}</td>
                      <td className="p-4 text-slate-300">{app.quantity}</td>
                      <td className="p-4 text-slate-400 text-xs">{app.type}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          app.status === 'DENIED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {app.status}
                        </span>
                        {app.denialReason && <p className="text-[10px] text-rose-400 mt-1">{app.denialReason}</p>}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedAppForTrace(app)}
                          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs px-3 py-1.5 rounded border border-slate-700"
                        >
                          Trace Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= AGENCY VIEW ================= */}
        {currentUser.role === 'AGENCY' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-200">Regulatory Agency Review Queue</h3>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/80">
                    <th className="p-4">ID</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Document Attachment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono text-xs text-emerald-400">{app.id}</td>
                      <td className="p-4 text-slate-300">{app.company}</td>
                      <td className="p-4 font-medium">{app.product}</td>
                      <td className="p-4 text-xs text-slate-400 underline">{app.documentName || 'No File'}</td>
                      <td className="p-4 font-bold text-xs">{app.status}</td>
                      <td className="p-4 text-right space-x-2">
                        {app.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleAgencyDecision(app.id, 'APPROVED')}
                              className="bg-emerald-700 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => {
                                const reason = prompt('Enter specific denial reason (e.g., Tax Clearance Expired):');
                                if (reason) handleAgencyDecision(app.id, 'DENIED', reason);
                              }}
                              className="bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded"
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ADMIN VIEW ================= */}
        {currentUser.role === 'ADMIN' && (
          <div className="space-y-8">
            {/* Admin Metrics & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Total Applications</p>
                <p className="text-3xl font-black mt-2 text-emerald-400">{applications.length}</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Gateway Control</p>
                <button 
                  onClick={() => setGatewayOperational(!gatewayOperational)}
                  className={`mt-3 w-full py-2 text-xs font-bold rounded ${gatewayOperational ? 'bg-amber-800 text-amber-100 hover:bg-amber-700' : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'}`}
                >
                  Toggle Gateway {gatewayOperational ? 'OFFLINE' : 'ONLINE'}
                </button>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Push Broadcast Notice</p>
                <div className="mt-2 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter broadcast update..." 
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs flex-1"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  />
                  <button 
                    onClick={() => { setActiveBroadcast(broadcastMessage); setBroadcastMessage(''); }}
                    className="bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded text-xs"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>

            {/* Global Application View with Compliant Void / Archive Action (Replacing Force Purge) */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-200">Global Records & Compliance Voiding</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="p-3">ID</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">State</th>
                    <th className="p-3 text-right">Compliance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td className="p-3 font-mono text-xs text-emerald-400">{app.id}</td>
                      <td className="p-3">{app.company}</td>
                      <td className="p-3">{app.product}</td>
                      <td className="p-3 font-bold text-xs">{app.status}</td>
                      <td className="p-3 text-right">
                        {app.status !== 'VOIDED' ? (
                          <button 
                            onClick={() => handleVoidRecord(app.id)}
                            className="text-rose-400 hover:text-rose-300 text-xs font-bold underline"
                          >
                            Void / Archive Record
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Identity & Access Management (IAM) */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-200">Identity & Access Management (IAM)</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="p-3">Entity Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {usersList.map(u => (
                    <tr key={u.email}>
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-slate-400 text-xs">{u.email}</td>
                      <td className="p-3 text-xs uppercase text-emerald-400">{u.role}</td>
                      <td className="p-3 font-bold text-xs">{u.status}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => toggleUserStatus(u.email)}
                          className={`text-xs px-3 py-1 rounded font-bold ${u.status === 'ACTIVE' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Authorize'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Security Audit Trail Search */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-200">System Security Audit Trail</h3>
                <input 
                  type="text" 
                  placeholder="Filter audit logs..." 
                  className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 w-64"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {applications.flatMap(a => a.auditTrail).filter(log => log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) || log.actor.toLowerCase().includes(auditSearchQuery.toLowerCase())).map((log, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800 text-xs flex justify-between">
                    <span><strong className="text-emerald-400">[{log.actor}]</strong> {log.action}</span>
                    <span className="text-slate-500 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ================= NEW APPLICATION MODAL (No HS Code, Dynamic Company, File Upload <5MB) ================= */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-bold text-emerald-400">Submit New Trade Application</h3>
            
            {formError && (
              <div className="bg-rose-950 border border-rose-700 text-rose-200 text-xs p-3 rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase mb-1 text-slate-300">Application Type</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value)}
                >
                  <option value="Import Permit">Import Permit</option>
                  <option value="Export License">Export License</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-slate-300">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your registered company name"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-slate-300">Product Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Heavy Industrial Generator"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-slate-300">Quantity & Units</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 5 Units / 100 Metric Tons"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-slate-300">Supporting Verification Document (Max 5MB: PDF, PNG, JPG)</label>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-slate-950 hover:file:bg-emerald-500"
                  onChange={(e) => setNewFile(e.target.files[0])}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowNewAppModal(false)}
                  className="bg-slate-800 px-4 py-2 rounded text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded hover:bg-emerald-500"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TRACE STATUS MODAL (Renamed Process Flow Boxes & Official E-Permit Modal) ================= */}
      {selectedAppForTrace && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-emerald-400">Application Status Trace: {selectedAppForTrace.id}</h3>
              <button onClick={() => setSelectedAppForTrace(null)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            {/* Renamed Process Flow Steps */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Step 1: Document Completeness Check</p>
                  <p className="text-[10px] text-slate-400">File verification and structure checked successfully.</p>
                </div>
                <span className="text-emerald-400 text-xs font-bold">PASSED</span>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Step 2: Regulatory Agency Review</p>
                  <p className="text-[10px] text-slate-400">Compliance and tariff verification completed.</p>
                </div>
                <span className={`text-xs font-bold ${selectedAppForTrace.status === 'DENIED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedAppForTrace.status === 'DENIED' ? 'FAILED' : 'APPROVED'}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Step 3: Final Decision</p>
                  <p className="text-[10px] text-slate-400">Digital regulatory decision released.</p>
                </div>
                <span className={`text-xs font-bold ${selectedAppForTrace.status === 'APPROVED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {selectedAppForTrace.status === 'APPROVED' ? 'RELEASED' : 'PENDING'}
                </span>
              </div>
            </div>

            {/* Official E-Permit Certificate Trigger */}
            {selectedAppForTrace.status === 'APPROVED' && (
              <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl space-y-3">
                <p className="text-xs font-bold text-emerald-300">Official E-Permit Ready</p>
                <button 
                  onClick={() => setSelectedAppForPermit(selectedAppForTrace)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded text-xs"
                >
                  View Official Certificate Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= OFFICIAL E-PERMIT CERTIFICATE MODAL ================= */}
      {selectedAppForPermit && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-900 rounded-xl p-8 w-full max-w-2xl space-y-6 shadow-2xl relative">
            <div className="text-center border-b border-slate-300 pb-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-emerald-800">Federal Republic of Nigeria</h2>
              <h3 className="text-md font-bold text-slate-700">Enterprise Trade Portal - Official E-Permit</h3>
              <p className="text-[10px] font-mono text-slate-500 mt-1">Permit Reference: {selectedAppForPermit.id}-DOC</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <p className="text-slate-500 font-semibold uppercase">Holder / Company Name:</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAppForPermit.company}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase">Permit Classification:</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAppForPermit.type}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase">Approved Product:</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAppForPermit.product} ({selectedAppForPermit.quantity})</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase">Authorization Status:</p>
                <p className="font-bold text-emerald-700 mt-0.5">VALID & OFFICIALLY ISSUED</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-300 text-xs">
              <div>
                <p className="font-bold">Authorized by Regulatory Board</p>
                <p className="text-[10px] text-slate-500">National Single Window Digital Authority</p>
              </div>
              <button 
                onClick={() => alert('Simulated PDF Download Triggered Successfully.')}
                className="bg-slate-900 text-white font-bold px-4 py-2 rounded text-xs hover:bg-slate-800"
              >
                Download Official PDF
              </button>
            </div>

            <button 
              onClick={() => setSelectedAppForPermit(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}