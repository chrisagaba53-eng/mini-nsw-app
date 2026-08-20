'use client';

import React, { useState } from 'react';

export default function SingleWindowPortal() {
  // System authentication state
  const [session, setSession] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Applications master state
  const [applications, setApplications] = useState([
    {
      id: 'NSW-2026-1042',
      type: 'Import Permit',
      product: 'Industrial Solar Panels',
      quantity: '500 Units',
      hsCode: '8541.40.00',
      company: 'Apex Logistics Ltd',
      status: 'Pending Review',
      submittedAt: '2026-08-10',
      attachedDocument: null
    },
    {
      id: 'NSW-2026-1088',
      type: 'Export License',
      product: 'Raw Cocoa Beans',
      quantity: '50 Metric Tons',
      hsCode: '1801.00.00',
      company: 'AgroExport Nigeria',
      status: 'Approved',
      submittedAt: '2026-08-12',
      attachedDocument: null
    }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Admin & Governance state
  const [gatewayStatus, setGatewayStatus] = useState('Operational');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [systemUsers, setSystemUsers] = useState([
    { id: 1, name: 'Apex Logistics', email: 'trader@apex.ng', role: 'trader', status: 'Active' },
    { id: 2, name: 'Customs Officer', email: 'officer@customs.gov.ng', role: 'agency', status: 'Active' },
    { id: 3, name: 'System Admin', email: 'admin@nsw.gov.ng', role: 'admin', status: 'Active' }
  ]);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, role: 'System', action: 'Gateway initialized in Operational mode', time: '08:00 AM' },
    { id: 2, role: 'Trader', action: 'Application NSW-2026-1042 submitted', time: '09:15 AM' }
  ]);

  // Modal & Interactive states
  const [trackedApp, setTrackedApp] = useState(null);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [newAppType, setNewAppType] = useState('Import Permit');
  const [newAppCompany, setNewAppCompany] = useState('');
  const [newAppProduct, setNewAppProduct] = useState('');
  const [newAppQuantity, setNewAppQuantity] = useState('');
  const [newAppFile, setNewAppFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [docPreview, setDocPreview] = useState(null);
  const [viewingPermit, setViewingPermit] = useState(null);

  // Authentication Handler
  const handleSecureLogin = (e) => {
    e.preventDefault();
    if (emailInput.includes('trader')) {
      setSession({ name: 'Trader Enterprise', role: 'trader', email: emailInput });
    } else if (emailInput.includes('agency') || emailInput.includes('customs')) {
      setSession({ name: 'Customs Regulatory Unit', role: 'agency', email: emailInput });
    } else if (emailInput.includes('admin')) {
      setSession({ name: 'System Administrator', role: 'admin', email: emailInput });
    } else {
      setSession({ name: 'Portal User', role: 'trader', email: emailInput });
    }
    setLoginError('');
  };

  const handleLogout = () => {
    setSession(null);
    setEmailInput('');
    setPasswordInput('');
  };

  // File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size exceeds 5MB limit.');
        setNewAppFile(null);
        e.target.value = '';
        return;
      }
      setFileError('');
      const reader = new FileReader();
      reader.onloadend = () => setNewAppFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Application Submission Handler
  const handleFormSubmitApplication = (e) => {
    e.preventDefault();
    const newId = `NSW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      id: newId,
      type: newAppType,
      company: newAppCompany || session?.name || 'Trader Enterprise',
      product: newAppProduct,
      quantity: newAppQuantity,
      hsCode: '8502.11.00',
      status: 'Pending Review',
      submittedAt: new Date().toISOString().split('T')[0],
      attachedDocument: newAppFile
    };

    setApplications([newApp, ...applications]);
    setAuditLogs([
      { id: Date.now(), role: 'Trader', action: `Submitted application ${newId}`, time: new Date().toLocaleTimeString() },
      ...auditLogs
    ]);
    setShowNewAppModal(false);
    setNewAppCompany('');
    setNewAppProduct('');
    setNewAppQuantity('');
    setNewAppFile(null);
  };

  // Status Action Handlers
  const handleAgencyAction = (appId, newStatus) => {
    setApplications(applications.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    if (trackedApp && trackedApp.id === appId) {
      setTrackedApp({ ...trackedApp, status: newStatus });
    }
    setAuditLogs([
      { id: Date.now(), role: 'Agency', action: `Updated ${appId} to ${newStatus}`, time: new Date().toLocaleTimeString() },
      ...auditLogs
    ]);
  };

  const handleForceDeleteApp = (appId) => {
    setApplications(applications.filter(app => app.id !== appId));
    setAuditLogs([
      { id: Date.now(), role: 'Admin', action: `Force purged ${appId}`, time: new Date().toLocaleTimeString() },
      ...auditLogs
    ]);
  };

  const toggleGateway = () => {
    const nextStatus = gatewayStatus === 'Operational' ? 'Maintenance' : 'Operational';
    setGatewayStatus(nextStatus);
    setAuditLogs([
      { id: Date.now(), role: 'Admin', action: `Toggled Gateway status to ${nextStatus}`, time: new Date().toLocaleTimeString() },
      ...auditLogs
    ]);
  };

  const handleUserStatusChange = (userId, newStatus) => {
    setSystemUsers(systemUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    alert(`Broadcast Sent: ${broadcastMessage}`);
    setBroadcastMessage('');
  };

  // Helper status checkers
  const isApproved = (status) => status === 'Approved';
  const isDenied = (status) => status === 'Denied' || status === 'Rejected';
  const isPending = (status) => !isApproved(status) && !isDenied(status);

  // Filtering Logic
  const filteredApps = applications.filter(app => {
    if (selectedFilter === 'Approved') return isApproved(app.status);
    if (selectedFilter === 'Pending') return isPending(app.status);
    if (selectedFilter === 'Denied') return isDenied(app.status);
    return true;
  });

  const displayedApps = filteredApps.filter(app => 
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- UI COMPONENTS ---

  const FilterDashboard = () => (
    <div className="flex space-x-2 bg-gray-100 p-1.5 rounded-lg w-fit text-xs font-bold mb-4">
      {['All', 'Pending', 'Approved', 'Denied'].map(f => (
        <button
          key={f}
          onClick={() => setSelectedFilter(f)}
          className={`px-3 py-1.5 rounded-md transition ${selectedFilter === f ? 'bg-emerald-800 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {f}
        </button>
      ))}
    </div>
  );

  const DashboardMetrics = () => {
    const total = applications.length;
    const approved = applications.filter(a => isApproved(a.status)).length;
    const denied = applications.filter(a => isDenied(a.status)).length;
    const pending = applications.filter(a => isPending(a.status)).length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">No of Applications</span>
          <span className="text-3xl font-extrabold text-blue-700">{total}</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">No of Pending</span>
          <span className="text-3xl font-extrabold text-amber-600">{pending}</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">No of Approved</span>
          <span className="text-3xl font-extrabold text-green-700">{approved}</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">No of Denied</span>
          <span className="text-3xl font-extrabold text-red-600">{denied}</span>
        </div>
      </div>
    );
  };

  // ---------------- UNSECURED LOGIN VIEW ----------------
  if (!session) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-t-8 border-emerald-700">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="National Single Window Logo" className="h-16 w-auto object-contain max-w-full" />
          </div>

          <h1 className="text-2xl font-extrabold text-emerald-900 text-center tracking-tight">National Single Window</h1>
          <p className="text-xs text-gray-500 text-center mt-1 mb-6 uppercase tracking-widest font-semibold">Enterprise Trade Portal (Nigeria)</p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSecureLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Official Email Address</label>
              <input 
                type="email" 
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="trader@apex.ng, agency@customs.gov.ng, or admin@nsw.gov.ng"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <input 
                type="password" 
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-emerald-900 transition shadow"
            >
              Sign In to Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- AUTHENTICATED PORTAL VIEW ----------------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-emerald-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="National Single Window Logo" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-base font-extrabold tracking-tight">National Single Window</h1>
              <p className="text-[11px] text-emerald-200">Federal Trade Governance Gateway</p>
            </div>
          </div>

          <div className="flex items-center space-x-5 text-xs">
            {/* Notification Bell */}
            <button className="relative text-emerald-200 hover:text-white transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm border border-red-600">
                1
              </span>
            </button>

            <div className="text-right border-l border-emerald-700 pl-5">
              <span className="block font-bold text-white">{session.name}</span>
              <span className="block text-[10px] uppercase font-semibold text-emerald-300">{session.role} Role</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold border border-emerald-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* TRADER CONSOLE */}
        {session.role === 'trader' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Trader Dashboard - {session.name}</h3>
                <p className="text-xs text-gray-500">Filter your applications by state or submit a new application.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search ID, Product..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none flex-grow sm:flex-grow-0"
                />
                <button 
                  onClick={() => setShowNewAppModal(true)}
                  className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-900 transition shadow whitespace-nowrap"
                >
                  + New Application
                </button>
              </div>
            </div>

            <DashboardMetrics />
            <FilterDashboard />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <th className="py-3 px-4">Application ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Product / HS Code</th>
                      <th className="py-3 px-4">Current State</th>
                      <th className="py-3 px-4">Process Flow</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {displayedApps.length > 0 ? displayedApps.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                        <td className="py-3 px-4">{app.type}</td>
                        <td className="py-3 px-4">{app.product} <br/> <span className="font-mono text-xs text-gray-400">{app.hsCode}</span></td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                            ${isApproved(app.status) ? 'bg-green-100 text-green-800' : ''}
                            ${isDenied(app.status) ? 'bg-red-100 text-red-800' : ''}
                            ${isPending(app.status) ? 'bg-amber-100 text-amber-800' : ''}
                          `}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => setTrackedApp(app)}
                            className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-800 transition shadow-sm"
                          >
                            Trace Status
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">
                          No applications found for the selected state.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AGENCY CONSOLE */}
        {session.role === 'agency' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Regulatory & Review Console</h3>
                <p className="text-xs text-gray-500">Filter applications by state to manage your approval queue.</p>
              </div>
              <input 
                type="text" 
                placeholder="Search Company, ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none w-full sm:w-auto"
              />
            </div>

            <DashboardMetrics />
            <FilterDashboard />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <th className="py-3 px-4">Application ID</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Product / HS Code</th>
                      <th className="py-3 px-4">Uploaded File</th>
                      <th className="py-3 px-4">Current State</th>
                      <th className="py-3 px-4">Actions & Flow</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {displayedApps.length > 0 ? displayedApps.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                        <td className="py-3 px-4">{app.company}</td>
                        <td className="py-3 px-4">{app.product} <span className="block text-xs font-mono text-gray-400">{app.hsCode}</span></td>
                        <td className="py-3 px-4">
                          {app.attachedDocument ? (
                            <button 
                              onClick={() => setDocPreview(app.attachedDocument)} 
                              className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded text-xs font-bold hover:bg-blue-100 transition shadow-sm"
                            >
                              View Doc
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No Attachment</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                            ${isApproved(app.status) ? 'bg-green-100 text-green-800' : ''}
                            ${isDenied(app.status) ? 'bg-red-100 text-red-800' : ''}
                            ${isPending(app.status) ? 'bg-amber-100 text-amber-800' : ''}
                          `}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => setTrackedApp(app)}
                            className="bg-emerald-700 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-emerald-800 transition shadow-sm"
                          >
                            Audit Flow
                          </button>
                          {isPending(app.status) ? (
                            <>
                              <button onClick={() => handleAgencyAction(app.id, 'Approved')} className="bg-green-600 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-green-700 transition shadow-sm">Approve</button>
                              <button onClick={() => handleAgencyAction(app.id, 'Denied')} className="bg-red-600 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-red-700 transition shadow-sm">Deny</button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs italic font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                          No applications found for the selected state.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN CONSOLE */}
        {session.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Governance & Gateway Console</h3>
                <p className="text-xs text-gray-500 mt-1">Platform-wide trade metrics, user account access control, and broadcast notices.</p>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-xs font-bold text-gray-600">Gateway Status:</span>
                <button 
                  onClick={toggleGateway} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition ${gatewayStatus === 'Operational' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                >
                  {gatewayStatus} (Toggle)
                </button>
              </div>
            </div>

            <DashboardMetrics />
            <FilterDashboard />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Global Application View</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">State</th>
                      <th className="py-3 px-4">System Override</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 bg-white">
                    {displayedApps.map(app => (
                      <tr key={app.id}>
                        <td className="py-2 px-4 font-medium text-emerald-700">{app.id}</td>
                        <td className="py-2 px-4">{app.company}</td>
                        <td className="py-2 px-4">{app.type}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isApproved(app.status) ? 'bg-green-100 text-green-800' : isDenied(app.status) ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <button 
                            onClick={() => handleForceDeleteApp(app.id)}
                            className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase border border-red-200 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition"
                          >
                            Force Purge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Identity & Access Management</h4>
                  <span className="text-xs text-gray-500 font-medium">Manage Agency & Trader Accounts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <th className="py-3 px-4">User / Entity Name</th>
                      <th className="py-3 px-4">Role Area</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 bg-white">
                    {systemUsers.map(user => (
                      <tr key={user.id}>
                        <td className="py-3 px-4">
                          <span className="block font-medium text-gray-900">{user.name}</span>
                          <span className="block text-xs text-gray-500">{user.email}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{user.role.toUpperCase()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-green-100 text-green-800' : user.status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 space-x-2">
                          {user.status !== 'Active' && (
                            <button onClick={() => handleUserStatusChange(user.id, 'Active')} className="bg-emerald-600 text-white px-2 py-1 rounded text-[11px] font-bold hover:bg-emerald-700 transition">Authorize</button>
                          )}
                          {user.status !== 'Suspended' && (
                            <button onClick={() => handleUserStatusChange(user.id, 'Suspended')} className="bg-gray-800 text-white px-2 py-1 rounded text-[11px] font-bold hover:bg-gray-900 transition">Suspend</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Push Broadcast Notice</h4>
                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <textarea 
                    rows="3"
                    required
                    placeholder="Enter urgent system-wide announcement for traders and agencies..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  ></textarea>
                  <button type="submit" className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-900 transition shadow">
                    Broadcast Notice
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">System Security Audit Trail</h4>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-40 overflow-y-auto text-[11px] font-mono space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex justify-between border-b pb-1">
                      <span className="text-gray-800">[{log.role}] {log.action}</span>
                      <span className="text-gray-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------- TRACE STATUS OVERLAY MODAL ---------------- */}
      {trackedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="bg-emerald-900 text-white p-5 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block mb-1">Transaction Flow Status</span>
                <h3 className="text-lg font-extrabold">{trackedApp.id}</h3>
                <p className="text-xs text-emerald-200 mt-0.5">{trackedApp.product} ({trackedApp.quantity})</p>
              </div>
              <button onClick={() => setTrackedApp(null)} className="text-white hover:text-emerald-300 font-bold text-xl leading-none">✕</button>
            </div>

            <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-0">
                
                <div className="relative pl-8 pb-8">
                  <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-emerald-500"></div>
                  <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">✓</div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Application Submitted</h5>
                    <p className="text-xs text-gray-600 mt-0.5">Documentation uploaded by {trackedApp.company}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">{trackedApp.submittedAt}</span>
                  </div>
                </div>

                <div className="relative pl-8 pb-8">
                  <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-emerald-500"></div>
                  <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">✓</div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Gateway</h5>
                    <p className="text-xs text-gray-600 mt-0.5">HS Code ({trackedApp.hsCode}) tariff validation passed</p>
                  </div>
                </div>

                <div className="relative pl-8 pb-8">
                  <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${isApproved(trackedApp.status) ? 'bg-emerald-500' : isDenied(trackedApp.status) ? 'bg-red-300' : 'bg-gray-200'}`}></div>
                  {isPending(trackedApp.status) ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-amber-100 animate-pulse">⏳</div>
                  ) : isApproved(trackedApp.status) ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">✓</div>
                  ) : (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow">!</div>
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Customs and Regulatory Review</h5>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {isPending(trackedApp.status) && 'Currently being inspected by Customs'}
                      {isApproved(trackedApp.status) && 'Document verification completed'}
                      {isDenied(trackedApp.status) && 'Denied: Missing regulatory clearance'}
                    </p>
                  </div>
                </div>

                <div className="relative pl-8">
                  {isApproved(trackedApp.status) ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow ring-4 ring-emerald-100">✓</div>
                  ) : isDenied(trackedApp.status) ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-red-100 border-2 border-red-500 text-red-600 flex items-center justify-center text-xs font-bold">✕</div>
                  ) : (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-300 text-gray-400 flex items-center justify-center text-xs font-bold">4</div>
                  )}
                  <div>
                    <h5 className={`text-sm font-bold ${isApproved(trackedApp.status) ? 'text-emerald-900 font-extrabold' : 'text-gray-400'}`}>
                      Final Decision
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isApproved(trackedApp.status) ? 'Digital Permit released successfully' : isDenied(trackedApp.status) ? 'Application rejected' : 'Awaiting final state'}
                    </p>
                    
                    {isApproved(trackedApp.status) && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center">
                        <div>
                          <span className="block text-xs font-bold text-emerald-900">Official E-Permit Generated</span>
                          <span className="block text-[10px] text-emerald-700 font-mono">{trackedApp.id}-PERMIT</span>
                        </div>
                        <button 
                          onClick={() => setViewingPermit(trackedApp)} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center shadow-sm"
                        >
                          View Official E-Permit
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
            
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end items-center space-x-2">
              {session.role === 'agency' && isPending(trackedApp.status) && (
                <>
                  <button onClick={() => handleAgencyAction(trackedApp.id, 'Approved')} className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-800 transition">Approve</button>
                  <button onClick={() => handleAgencyAction(trackedApp.id, 'Denied')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition">Deny</button>
                </>
              )}
              <button onClick={() => setTrackedApp(null)} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition">Close Window</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- NEW APPLICATION FORM MODAL ---------------- */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-t-8 border-emerald-700">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="font-bold text-gray-900 text-base">Submit New Trade Application</h4>
              <button onClick={() => setShowNewAppModal(false)} className="text-gray-500 hover:text-gray-700 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleFormSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Application Type</label>
                <select 
                  value={newAppType} 
                  onChange={(e) => setNewAppType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="Import Permit">Import Permit (Form M)</option>
                  <option value="Export License">Export License</option>
                  <option value="Transit Goods Clearance">Transit Goods Clearance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company / Enterprise Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Global Freight Ltd" 
                  value={newAppCompany} 
                  onChange={(e) => setNewAppCompany(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Description</label>
                <input type="text" required placeholder="e.g., Heavy Industrial Generator" value={newAppProduct} onChange={(e) => setNewAppProduct(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity & Units</label>
                <input type="text" required placeholder="e.g., 5 Units / 100 Metric Tons" value={newAppQuantity} onChange={(e) => setNewAppQuantity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload Supporting Document (Max 5MB)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handleFileChange} 
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                />
                {fileError && <p className="text-red-600 text-[11px] font-bold mt-1">{fileError}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowNewAppModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-900 transition shadow">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- AGENCY ATTACHED DOCUMENT MODAL ---------------- */}
      {docPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4 border-t-4 border-emerald-700">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h4 className="font-bold text-gray-900 text-sm uppercase">Attached Trader Documentation</h4>
              <button onClick={() => setDocPreview(null)} className="text-gray-500 hover:text-gray-700 font-bold">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-gray-100 rounded p-2">
              {docPreview.startsWith('data:image') ? (
                <img src={docPreview} alt="Attached Document" className="max-w-full h-auto rounded" />
              ) : (
                <iframe src={docPreview} title="Document Preview" className="w-full h-96 rounded"></iframe>
              )}
            </div>
            <div className="mt-3 text-right">
              <button onClick={() => setDocPreview(null)} className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs font-bold">Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- FORMAL E-PERMIT CERTIFICATE MODAL ---------------- */}
      {viewingPermit && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow-2xl border-8 border-double border-emerald-900 relative">
            <div className="text-center border-b-2 border-emerald-900 pb-4 mb-6">
              <p className="text-[10px] font-bold tracking-widest text-emerald-900 uppercase">Federal Republic of Nigeria</p>
              <h2 className="text-xl font-extrabold text-emerald-950 uppercase tracking-tight mt-1">National Single Window Trade Portal</h2>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mt-0.5">Official Electronic Import / Export Permit</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-emerald-50/50 p-4 rounded border border-emerald-100">
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Permit Reference</span>
                <span className="font-mono font-bold text-gray-900 text-sm">{viewingPermit.id}-PERMIT</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Date of Issuance</span>
                <span className="font-bold text-gray-900">{viewingPermit.submittedAt}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Authorized Holder</span>
                <span className="font-bold text-gray-900">{viewingPermit.company}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Permit Status</span>
                <span className="font-bold text-emerald-700 uppercase">CLEARED / VALID</span>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-gray-300 mb-6">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-[10px]">
                  <th className="border border-gray-300 p-2">Item Description</th>
                  <th className="border border-gray-300 p-2">Quantity</th>
                  <th className="border border-gray-300 p-2">Classification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 font-medium">{viewingPermit.product}</td>
                  <td className="border border-gray-300 p-2">{viewingPermit.quantity}</td>
                  <td className="border border-gray-300 p-2 font-mono">{viewingPermit.hsCode}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-end pt-4 border-t border-gray-200">
              <div className="border-2 border-emerald-800 p-2 text-center rounded bg-white">
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center font-mono text-[9px] text-gray-500 mx-auto">
                  [QR VALID]
                </div>
                <span className="text-[9px] font-bold text-emerald-900 block mt-1">SECURE VERIFIED</span>
              </div>
              <div className="text-right">
                <div className="border-b border-gray-400 w-40 ml-auto mb-1"></div>
                <span className="text-[10px] font-bold text-gray-700 uppercase block">Comptroller General / Authorizing Officer</span>
                <span className="text-[9px] text-gray-500 block">National Single Window Governance</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => window.print()} className="bg-emerald-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-emerald-900">Print Permit</button>
              <button onClick={() => setViewingPermit(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-xs font-bold hover:bg-gray-300">Close Document</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}