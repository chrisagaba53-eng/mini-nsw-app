'use client';

import React, { useState, useEffect } from 'react';

export default function SingleWindowPortal() {
  const [session, setSession] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [systemUsers, setSystemUsers] = useState([
    { id: 1, name: 'Apex Logistics', email: 'trader@apex.ng', role: 'trader', status: 'Active' },
    { id: 2, name: 'Customs Officer', email: 'officer@customs.gov.ng', role: 'agency', status: 'Active' },
    { id: 3, name: 'System Admin', email: 'admin@nsw.gov.ng', role: 'admin', status: 'Active' }
  ]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('nsw_system_users');
    if (savedUsers) {
      try {
        setSystemUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Failed to load saved user state', e);
      }
    }
  }, []);

  const updateUsersState = (newUsers) => {
    setSystemUsers(newUsers);
    localStorage.setItem('nsw_system_users', JSON.stringify(newUsers));
  };

  const [applications, setApplications] = useState([
    {
      id: 'NSW-2026-1042',
      type: 'Import Permit',
      product: 'Industrial Solar Panels',
      quantity: '500 Units',
      hsCode: '8502.11.00',
      company: 'Apex Logistics Ltd',
      status: 'Pending Review',
      gatewayPassed: true,
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
      gatewayPassed: true,
      submittedAt: '2026-08-12',
      attachedDocument: null
    }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, role: 'System', action: 'Gateway initialized in Operational mode', time: '08:00 AM' },
    { id: 2, role: 'Trader', action: 'Application NSW-2026-1042 submitted', time: '09:15 AM' }
  ]);

  const [gatewayStatus, setGatewayStatus] = useState('Operational');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [trackedApp, setTrackedApp] = useState(null);
  const [showPermit, setShowPermit] = useState(false); 
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [newAppType, setNewAppType] = useState('Import Permit');
  const [newAppCompany, setNewAppCompany] = useState('');
  const [newAppProduct, setNewAppProduct] = useState('');
  const [newAppQuantity, setNewAppQuantity] = useState('');
  const [newAppHsCode, setNewAppHsCode] = useState('');
  const [newAppFile, setNewAppFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [docPreview, setDocPreview] = useState(null);

  const handleSecureLogin = (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    const targetUser = systemUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (targetUser && targetUser.status === 'Suspended') {
      setLoginError('Account Suspended: Access revoked by System Administrator.');
      return;
    }

    if (cleanEmail.includes('trader')) {
      setSession({ name: 'Trader Enterprise', role: 'trader', email: cleanEmail });
    } else if (cleanEmail.includes('agency') || cleanEmail.includes('customs')) {
      setSession({ name: 'Customs Regulatory Unit', role: 'agency', email: cleanEmail });
    } else if (cleanEmail.includes('admin')) {
      setSession({ name: 'System Administrator', role: 'admin', email: cleanEmail });
    } else {
      setSession({ name: 'Portal User', role: 'trader', email: cleanEmail });
    }
    setLoginError('');
  };

  const handleLogout = () => {
    setSession(null);
    setEmailInput('');
    setPasswordInput('');
    setLoginError('');
  };

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

  const addLog = (role, action) => {
    setAuditLogs(prev => [{ id: Date.now(), role, action, time: new Date().toLocaleTimeString() }, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleFormSubmitApplication = (e) => {
    e.preventDefault();
    const newId = `NSW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Tariff Validation Rule: Codes starting with '99' or matching '0000' fail automated gateway check
    const cleanHs = newAppHsCode.trim();
    const gatewayPassed = !(cleanHs.startsWith('99') || cleanHs === '0000.00.00');

    const newApp = {
      id: newId,
      type: newAppType,
      company: newAppCompany || session?.name || 'Trader Enterprise',
      product: newAppProduct,
      quantity: newAppQuantity,
      hsCode: cleanHs,
      status: gatewayPassed ? 'Pending Review' : 'Gateway Failed',
      gatewayPassed: gatewayPassed,
      submittedAt: new Date().toISOString().split('T')[0],
      attachedDocument: newAppFile
    };

    setApplications([newApp, ...applications]);
    addLog('Trader', `Submitted application ${newId} (HS: ${cleanHs}) -> Gateway: ${gatewayPassed ? 'Passed' : 'Failed'}`);
    setShowNewAppModal(false);
    setNewAppCompany('');
    setNewAppProduct('');
    setNewAppQuantity('');
    setNewAppHsCode('');
    setNewAppFile(null);
  };

  const handleAgencyAction = (appId, newStatus) => {
    setApplications(applications.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    if (trackedApp && trackedApp.id === appId) {
      setTrackedApp({ ...trackedApp, status: newStatus });
    }
    addLog('Agency', `Updated ${appId} to ${newStatus}`);
  };

  const handleFlagApp = (appId) => {
    addLog('Admin', `Flagged application ${appId} for mandatory compliance audit`);
    alert(`Application ${appId} has been flagged for regulatory review. Activity logged.`);
  };

  const toggleGateway = () => {
    const nextStatus = gatewayStatus === 'Operational' ? 'Maintenance' : 'Operational';
    setGatewayStatus(nextStatus);
    addLog('Admin', `Toggled Gateway status to ${nextStatus}`);
  };

  const handleUserStatusChange = (userId, newStatus) => {
    const updated = systemUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    updateUsersState(updated);
    addLog('Admin', `Updated account status for user ID ${userId} to ${newStatus}`);
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    addLog('System', `BROADCAST: ${broadcastMessage}`);
    setBroadcastMessage('');
  };

  const isApproved = (status) => status === 'Approved';
  const isDenied = (status) => status === 'Denied' || status === 'Rejected' || status === 'Gateway Failed';
  const isPending = (status) => !isApproved(status) && !isDenied(status);

  const filteredApps = applications.filter(app => {
    if (selectedFilter === 'Approved') return isApproved(app.status);
    if (selectedFilter === 'Pending') return isPending(app.status);
    if (selectedFilter === 'Denied') return isDenied(app.status);
    return true;
  });

  const displayedApps = filteredApps.filter(app => 
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.hsCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DashboardMetrics = () => {
    const total = applications.length;
    const approved = applications.filter(a => isApproved(a.status)).length;
    const denied = applications.filter(a => isDenied(a.status)).length;
    const pending = applications.filter(a => isPending(a.status)).length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div 
          onClick={() => setSelectedFilter('All')}
          className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'All' ? 'bg-gray-100 border-gray-800 ring-2 ring-gray-200' : 'bg-white border-gray-200 hover:border-gray-400'}`}
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Applications</span>
          <span className="text-3xl font-extrabold text-black">{total}</span>
        </div>
        <div 
          onClick={() => setSelectedFilter('Pending')}
          className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'Pending' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-100' : 'bg-white border-gray-200 hover:border-amber-300'}`}
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pending Review</span>
          <span className="text-3xl font-extrabold text-amber-600">{pending}</span>
        </div>
        <div 
          onClick={() => setSelectedFilter('Approved')}
          className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'Approved' ? 'bg-green-50 border-green-500 ring-2 ring-green-100' : 'bg-white border-gray-200 hover:border-green-300'}`}
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Approved</span>
          <span className="text-3xl font-extrabold text-green-700">{approved}</span>
        </div>
        <div 
          onClick={() => setSelectedFilter('Denied')}
          className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'Denied' ? 'bg-red-50 border-red-500 ring-2 ring-red-100' : 'bg-white border-gray-200 hover:border-red-300'}`}
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Denied / Blocked</span>
          <span className="text-3xl font-extrabold text-red-600">{denied}</span>
        </div>
      </div>
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-t-8 border-emerald-700">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Portal Logo" className="h-16 w-auto object-contain max-w-full" />
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSecureLogin} className="space-y-4">
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-emerald-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  type="email" 
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="trader@apex.ng, agency@customs.gov.ng..."
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-emerald-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input 
                  type="password" 
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-emerald-900 text-white shadow-md relative z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Portal Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-black uppercase tracking-wider leading-tight">National Single Window</h1>
              <p className="text-[10px] text-emerald-300 font-medium tracking-wide">Federal Trade Governance Gateway</p>
            </div>
          </div>

          <div className="flex items-center space-x-5 text-xs">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
                className="relative text-emerald-200 hover:text-white transition focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm border border-red-600">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 text-gray-800 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase text-gray-700">Recent Activity</h4>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {auditLogs.slice(0, 8).map(log => (
                      <div key={log.id} className="p-3 hover:bg-gray-50 transition">
                        <p className="text-[11px] font-medium text-gray-900 leading-tight">
                          <span className="font-bold text-emerald-700">[{log.role}]</span> {log.action}
                        </p>
                        <span className="text-[9px] text-gray-400 mt-1 block">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {session.role === 'trader' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Trader Portal - {session.name}</h3>
                <p className="text-xs text-gray-500">Filter your applications by clicking the metric cards.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search ID, Product, HS Code..." 
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <th className="py-3 px-4">Application ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">HS Code</th>
                      <th className="py-3 px-4">Current State</th>
                      <th className="py-3 px-4">Process Flow</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {displayedApps.length > 0 ? displayedApps.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                        <td className="py-3 px-4">{app.type}</td>
                        <td className="py-3 px-4">{app.product}</td>
                        <td className="py-3 px-4 font-mono text-xs">{app.hsCode}</td>
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
                        <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                          No applications found for the '{selectedFilter}' state.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {session.role === 'agency' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Regulatory & Review Portal</h3>
                <p className="text-xs text-gray-500">Filter your approval queue by clicking the metric cards.</p>
              </div>
              <input 
                type="text" 
                placeholder="Search Company, ID, HS Code..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none w-full sm:w-auto"
              />
            </div>

            <DashboardMetrics />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <th className="py-3 px-4">Application ID</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Product & HS Code</th>
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
                        <td className="py-3 px-4">
                          <span className="block font-medium">{app.product}</span>
                          <span className="block font-mono text-[11px] text-gray-500">{app.hsCode}</span>
                        </td>
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
                          No applications found for the '{selectedFilter}' state.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {session.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Governance & Gateway Portal</h3>
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6 border-l-4 border-l-emerald-700">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">System Broadcast Center</h4>
              <form onSubmit={handleSendBroadcast} className="flex gap-3">
                <input 
                  type="text" 
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type an operational notice for all active portal users..."
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <button type="submit" className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap">
                  Broadcast Notice
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                 <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Inter-Agency API Gateway Latency</h4>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Customs API</span><span className="text-xs font-mono text-green-600">24ms (Online)</span></div>
                   <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Central Bank Portal</span><span className="text-xs font-mono text-green-600">45ms (Online)</span></div>
                   <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Standards Organization</span><span className="text-xs font-mono text-amber-600">120ms (Degraded)</span></div>
                 </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                 <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Tariff Reconciliation (Today)</h4>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Transactions Processed</span><span className="text-xs font-bold text-gray-900">1,245</span></div>
                   <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Processing Fees Collected</span><span className="text-xs font-bold text-gray-900">₦4,250,000.00</span></div>
                   <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Failed Settlements</span><span className="text-xs font-bold text-emerald-600">0</span></div>
                 </div>
              </div>
            </div>

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
                      <th className="py-3 px-4">HS Code</th>
                      <th className="py-3 px-4">State</th>
                      <th className="py-3 px-4">Audit & Control Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 bg-white">
                    {displayedApps.map(app => (
                      <tr key={app.id}>
                        <td className="py-2 px-4 font-medium text-emerald-700">{app.id}</td>
                        <td className="py-2 px-4">{app.company}</td>
                        <td className="py-2 px-4">{app.type}</td>
                        <td className="py-2 px-4 font-mono text-xs">{app.hsCode}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isApproved(app.status) ? 'bg-green-100 text-green-800' : isDenied(app.status) ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 space-x-2">
                           <button 
                            onClick={() => setTrackedApp(app)}
                            className="text-emerald-700 hover:text-emerald-900 text-[10px] font-bold uppercase border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition shadow-sm"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleFlagApp(app.id)}
                            className="text-amber-700 hover:text-amber-900 text-[10px] font-bold uppercase border border-amber-200 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded transition shadow-sm"
                          >
                            Flag for Audit
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
                            <button onClick={() => handleUserStatusChange(user.id, 'Active')} className="bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-emerald-700 transition">Authorize</button>
                          )}
                          {user.status !== 'Suspended' && (
                            <button onClick={() => handleUserStatusChange(user.id, 'Suspended')} className="bg-gray-800 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-gray-900 transition">Suspend</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* New Application Modal with HS Code Input */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Submit New Trade Application</h3>
              <button onClick={() => setShowNewAppModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleFormSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Permit / License Type</label>
                <select 
                  value={newAppType} 
                  onChange={(e) => setNewAppType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="Import Permit">Import Permit</option>
                  <option value="Export License">Export License</option>
                  <option value="Transit Goods Clearance">Transit Goods Clearance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Apex Logistics Ltd"
                  value={newAppCompany}
                  onChange={(e) => setNewAppCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Industrial Solar Panels"
                  value={newAppProduct}
                  onChange={(e) => setNewAppProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity / Volume</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 500 Units"
                    value={newAppQuantity}
                    onChange={(e) => setNewAppQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">HS Code (Tariff)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 8502.11.00"
                    value={newAppHsCode}
                    onChange={(e) => setNewAppHsCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Test fail: use code starting with 99</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Attach Supporting Document (Max 5MB)</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {fileError && <p className="text-xs text-red-600 mt-1 font-bold">{fileError}</p>}
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowNewAppModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Flow Status Modal */}
      {trackedApp && !showPermit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-[#1e4638] text-white p-6 relative">
              <button onClick={() => setTrackedApp(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 font-bold">✕</button>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">Transaction Flow Status</p>
              <h2 className="text-2xl font-black tracking-tight">{trackedApp.id}</h2>
              <p className="text-sm text-emerald-100">{trackedApp.product} (HS: {trackedApp.hsCode})</p>
            </div>
            
            <div className="p-6 bg-gray-50">
              <div className="relative pl-6 border-l-2 border-emerald-600 space-y-6">
                
                {/* Step 1: Submission */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-0 bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">✓</div>
                  <h4 className="font-bold text-gray-900 text-sm">Application Submitted</h4>
                  <p className="text-xs text-gray-500">Documentation & HS Code uploaded by {trackedApp.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{trackedApp.submittedAt}</p>
                </div>
                
                {/* Step 2: Gateway Validation */}
                <div className="relative">
                  <div className={`absolute -left-[35px] top-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm ${trackedApp.gatewayPassed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {trackedApp.gatewayPassed ? '✓' : '✕'}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Automated Tariff Gateway</h4>
                  <p className="text-xs text-gray-500">
                    {trackedApp.gatewayPassed 
                      ? `HS Code (${trackedApp.hsCode}) tariff validation passed successfully` 
                      : `Gateway Error: HS Code (${trackedApp.hsCode}) is restricted or prohibited`}
                  </p>
                </div>
                
                {/* Step 3: Regulatory Review */}
                <div className="relative">
                  <div className={`absolute -left-[35px] top-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm ${!trackedApp.gatewayPassed ? 'bg-gray-300 text-gray-500' : isPending(trackedApp.status) ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                    {!trackedApp.gatewayPassed ? '🚫' : isPending(trackedApp.status) ? '⏳' : '✓'}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Customs and Regulatory Review</h4>
                  <p className="text-xs text-gray-500">
                    {!trackedApp.gatewayPassed 
                      ? 'Halted due to tariff validation failure' 
                      : isPending(trackedApp.status) 
                      ? 'Document verification in progress' 
                      : 'Document verification completed'}
                  </p>
                </div>
                
                {/* Step 4: Final Decision */}
                <div className="relative">
                  <div className={`absolute -left-[35px] top-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm ${isApproved(trackedApp.status) ? 'bg-emerald-600 text-white' : isDenied(trackedApp.status) ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                    {isApproved(trackedApp.status) ? '✓' : isDenied(trackedApp.status) ? '✕' : '⏳'}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Final Decision</h4>
                  <p className="text-xs text-gray-500">
                    {isApproved(trackedApp.status) 
                      ? 'Digital Permit released successfully' 
                      : isDenied(trackedApp.status) 
                      ? 'Application blocked/denied by system' 
                      : 'Awaiting final decision'}
                  </p>
                </div>

              </div>

              {isApproved(trackedApp.status) && (
                <div className="mt-8 bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Official E-Permit Generated</h5>
                    <p className="text-[10px] text-gray-500 uppercase">{trackedApp.id}-PERMIT</p>
                  </div>
                  <button
                    onClick={() => setShowPermit(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded shadow transition"
                  >
                    View Official E-Permit
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <button onClick={() => setTrackedApp(null)} className="text-xs text-gray-500 hover:text-gray-700 font-bold transition">
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official E-Permit Document Modal */}
      {showPermit && trackedApp && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 shadow-2xl relative min-h-[500px]">
            <button onClick={() => setShowPermit(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-lg">✕</button>
            <div className="border-4 border-double border-emerald-800 p-8 h-full flex flex-col items-center text-center relative">
              <img src="/logo.png" alt="Logo" className="h-16 mb-4 opacity-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 object-contain pointer-events-none" />
              <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-widest border-b-2 border-emerald-800 pb-2 mb-8 relative z-10">Official Trade Permit</h1>
              <div className="w-full text-left space-y-4 relative z-10 text-sm">
                <p><strong className="text-gray-700 w-40 inline-block">Permit No:</strong> {trackedApp.id}-PERMIT</p>
                <p><strong className="text-gray-700 w-40 inline-block">Issued To:</strong> {trackedApp.company}</p>
                <p><strong className="text-gray-700 w-40 inline-block">Product/Commodity:</strong> {trackedApp.product}</p>
                <p><strong className="text-gray-700 w-40 inline-block">HS Code:</strong> {trackedApp.hsCode}</p>
                <p><strong className="text-gray-700 w-40 inline-block">Quantity Authorized:</strong> {trackedApp.quantity || 'Standard Unit'}</p>
                <p><strong className="text-gray-700 w-40 inline-block">Issue Date:</strong> {new Date().toISOString().split('T')[0]}</p>
                <p><strong className="text-gray-700 w-40 inline-block">Status:</strong> <span className="text-green-700 font-bold uppercase">Valid & Authorized</span></p>
              </div>
              <div className="mt-auto w-full pt-12 flex justify-between items-end relative z-10">
                <div className="text-center">
                  <div className="border-b border-black w-40 mb-2"></div>
                  <p className="text-[10px] font-bold uppercase text-gray-600">Authorized Signature</p>
                </div>
                <div className="w-24 h-24 border-4 border-red-700 text-red-700 flex items-center justify-center rounded-full font-black text-[10px] uppercase transform -rotate-12 opacity-80 leading-tight">
                  Official<br/>Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {docPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Attached Document Preview</h3>
              <button onClick={() => setDocPreview(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg p-2 bg-gray-50 flex justify-center">
              {docPreview.startsWith('data:image') ? (
                <img src={docPreview} alt="Attached Document" className="max-w-full h-auto object-contain" />
              ) : (
                <div className="py-12 text-center text-gray-600 text-xs">
                  <p className="font-bold mb-2">Document Data Loaded Successfully</p>
                  <a href={docPreview} download="attached-document" className="text-emerald-700 underline font-bold">Download File</a>
                </div>
              )}
            </div>
            <button onClick={() => setDocPreview(null)} className="w-full mt-4 bg-gray-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-900">
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}