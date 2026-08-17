"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState(null); 
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppDocs, setSelectedAppDocs] = useState(null);
  
  // New Application Modal State
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [newAppType, setNewAppType] = useState('Import Permit');
  const [newAppProduct, setNewAppProduct] = useState('');
  const [newAppQuantity, setNewAppQuantity] = useState('');
  const [newAppHsCode, setNewAppHsCode] = useState('');

  // Admin Control States
  const [gatewayStatus, setGatewayStatus] = useState('Operational');
  const [systemUsers, setSystemUsers] = useState([
    { id: 1, name: 'ABC Manufacturing Ltd', email: 'trader@abc.com', role: 'Trader', status: 'Active' },
    { id: 2, name: 'Customs Officer J. Adebayo', email: 'customs@nsw.gov.ng', role: 'Agency', status: 'Active' },
    { id: 3, name: 'Global Trade Co', email: 'trader2@global.com', role: 'Trader', status: 'Pending Approval' }
  ]);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'User authentication verified', role: 'TRADER', time: '08:30 WAT' },
    { id: 2, action: 'Customs clearance processed', role: 'AGENCY', time: '09:05 WAT' }
  ]);
  
  const [applications, setApplications] = useState([
    { id: 'NSW-2026-0001', company: 'ABC Manufacturing Ltd', type: 'Import Permit', product: 'Industrial Machine', quantity: '10 Units', hsCode: '8479.90.00', status: 'Pending Review' },
    { id: 'NSW-2026-0002', company: 'ABC Manufacturing Ltd', type: 'Export License', product: 'Raw Cashew Nuts', quantity: '50 Metric Tons', hsCode: '0801.31.00', status: 'Approved' },
    { id: 'NSW-2026-0003', company: 'Global Trade Co', type: 'Import Permit', product: 'Chemical Solvents', quantity: '500 Litres', hsCode: '3824.99.99', status: 'Pending Review' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "System maintenance scheduled for 00:00 WAT.", time: "2h ago", read: false }
  ]);

  useEffect(() => {
    setIsClient(true);
    const savedApps = localStorage.getItem('nsw_applications');
    if (savedApps) setApplications(JSON.parse(savedApps));
    
    const savedNotifs = localStorage.getItem('nsw_notifications');
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    const savedUsers = localStorage.getItem('nsw_users');
    if (savedUsers) setSystemUsers(JSON.parse(savedUsers));
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('nsw_applications', JSON.stringify(applications));
      localStorage.setItem('nsw_notifications', JSON.stringify(notifications));
      localStorage.setItem('nsw_users', JSON.stringify(systemUsers));
    }
  }, [applications, notifications, systemUsers, isClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const totalApps = applications.length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const pendingApps = applications.filter(a => a.status === 'Pending Review').length;
  const queriedApps = applications.filter(a => a.status === 'Queried').length;

  const filteredApps = applications.filter(app => 
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Strict Login Validation (No bypass shortcuts)
  const handleSecureLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const email = emailInput.trim().toLowerCase();
    const pwd = passwordInput.trim();

    if (email === 'trader@abc.com' && pwd === 'password123') {
      setSession({ role: 'trader', name: 'ABC Manufacturing Ltd', email: 'trader@abc.com' });
    } else if (email === 'customs@nsw.gov.ng' && pwd === 'secure2026') {
      setSession({ role: 'agency', name: 'Customs Officer (J. Adebayo)', email: 'customs@nsw.gov.ng' });
    } else if (email === 'admin@nsw.gov.ng' && pwd === 'admin2026') {
      setSession({ role: 'admin', name: 'Platform Administrator', email: 'admin@nsw.gov.ng' });
    } else {
      setLoginError('Access Denied: Invalid official credentials.');
    }
  };

  const handleFormSubmitApplication = (e) => {
    e.preventDefault();
    if (!newAppProduct || !newAppQuantity || !newAppHsCode) return;

    const newId = `NSW-2026-000${applications.length + 1}`;
    const newApp = {
      id: newId,
      company: session.name,
      type: newAppType,
      product: newAppProduct,
      quantity: newAppQuantity,
      hsCode: newAppHsCode,
      status: 'Pending Review'
    };
    setApplications([newApp, ...applications]);
    
    const newNotif = {
      id: Date.now(),
      text: `Application ${newId} (${newAppProduct}) submitted successfully by ${session.name}.`,
      time: 'Just now',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
    setAuditLogs([{ id: Date.now(), action: `New application ${newId} submitted`, role: 'TRADER', time: 'Just now' }, ...auditLogs]);

    // Reset and close
    setNewAppProduct('');
    setNewAppQuantity('');
    setNewAppHsCode('');
    setShowNewAppModal(false);
  };

  const handleAgencyAction = (appId, action) => {
    const updatedStatus = action === 'Approve' ? 'Approved' : 'Queried';
    const updatedApps = applications.map(app => 
      app.id === appId ? { ...app, status: updatedStatus } : app
    );
    setApplications(updatedApps);

    const newNotif = {
      id: Date.now(),
      text: `Application ${appId} has been ${updatedStatus.toLowerCase()} by Customs.`,
      time: 'Just now',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
    setAuditLogs([{ id: Date.now(), action: `Application ${appId} status updated to ${updatedStatus}`, role: 'AGENCY', time: 'Just now' }, ...auditLogs]);
  };

  const toggleGateway = () => {
    const nextStatus = gatewayStatus === 'Operational' ? 'Maintenance Mode' : 'Operational';
    setGatewayStatus(nextStatus);
    setAuditLogs([{ id: Date.now(), action: `Gateway status changed to ${nextStatus}`, role: 'ADMIN', time: 'Just now' }, ...auditLogs]);
  };

  const handleApproveUser = (userId) => {
    setSystemUsers(systemUsers.map(u => u.id === userId ? { ...u, status: 'Active' } : u));
    setAuditLogs([{ id: Date.now(), action: `User account ID ${userId} approved by Admin`, role: 'ADMIN', time: 'Just now' }, ...auditLogs]);
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const newNotif = {
      id: Date.now(),
      text: `ADMIN BROADCAST: ${broadcastMessage}`,
      time: 'Just now',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
    setAuditLogs([{ id: Date.now(), action: `Broadcast message sent to portal users`, role: 'ADMIN', time: 'Just now' }, ...auditLogs]);
    setBroadcastMessage('');
    alert('Broadcast notification successfully pushed to all active portal users.');
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">Approved</span>;
    if (status === 'Queried') return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">Queried</span>;
    return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">Pending Review</span>;
  };

  // Determine Dynamic Workflow Step for current view or selected context
  const getWorkflowStep = (status) => {
    if (status === 'Approved') return 5; // Completed / Alert sent
    if (status === 'Queried') return 4;  // Decision queried
    return 3; // Pending Review sits at Gov Agency review stage
  };

  if (!isClient) return null;

  // Professional Clean Login Portal
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
                placeholder="trader@abc.com or customs@nsw.gov.ng" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
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

          {/* <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 space-y-1">
            <p>Demo Traders: <code className="text-emerald-700">trader@abc.com</code> / <code className="text-emerald-700">password123</code></p>
            <p>Demo Agency: <code className="text-emerald-700">customs@nsw.gov.ng</code> / <code className="text-emerald-700">secure2026</code></p>
            <p>Demo Admin: <code className="text-emerald-700">admin@nsw.gov.ng</code> / <code className="text-emerald-700">admin2026</code></p>
          </div> */}
        </div>
      </div>
    );
  }

  // Authenticated Portal Layout
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img src="/logo.png" alt="NSW Logo" className="h-10 w-auto object-contain bg-white rounded p-1 flex-shrink-0" />
            <div className="truncate">
              <h1 className="text-sm md:text-base font-bold tracking-wide truncate">National Single Window (NSW)</h1>
              <p className="text-[10px] md:text-xs text-emerald-300 truncate">Federal Republic of Nigeria - Trade Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative">
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setNotifications(notifications.map(n => ({...n, read: true}))); }}
                className="relative p-2 rounded-full hover:bg-emerald-800 transition focus:outline-none"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 text-gray-800 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-sm">System Notifications</span>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Live</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 text-xs">
                        <p className="font-medium text-gray-900">{notif.text}</p>
                        <span className="text-gray-400 mt-1 block">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs font-medium bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-700 flex items-center space-x-3">
              <div className="hidden sm:block">
                <span className="block text-[10px] text-emerald-300 uppercase">{session.name}</span>
                <span className="font-bold uppercase">{session.role}</span>
              </div>
              <button 
                onClick={() => setSession(null)} 
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-semibold transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dynamic Core Workflow Process Bar */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Core Workflow Process Tracker</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-semibold">Active Role: {session.role.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            <div className={`p-3 rounded-lg border transition ${session.role === 'trader' ? 'bg-emerald-800 text-white border-emerald-900 shadow' : 'bg-emerald-50 text-emerald-900 border-emerald-100'}`}>
              <span className="block font-bold text-sm">1. Trader</span>
              <span className="text-[11px] opacity-90">Submit Application</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">2. NSW Gateway</span>
              <span className="text-[11px] text-gray-600">Validate Data</span>
            </div>
            <div className={`p-3 rounded-lg border transition ${session.role === 'agency' ? 'bg-blue-800 text-white border-blue-900 shadow' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              <span className="block font-bold text-sm">3. Gov Agency</span>
              <span className="text-[11px] opacity-90">Document Review</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">4. Decision</span>
              <span className="text-[11px] text-gray-600">Approve / Query</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">5. Alert</span>
              <span className="text-[11px] text-gray-600">Notification Sent</span>
            </div>
          </div>
        </section>

        {/* TRADER DASHBOARD */}
        {session.role === 'trader' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Trader Dashboard - {session.name}</h3>
                <p className="text-xs text-gray-500">Manage your import permits, export licenses, and Form M submissions.</p>
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
                  className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-900 transition shadow"
                >
                  + New Application
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Quantity / HS Code</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredApps.filter(app => app.company === session.name || app.company === 'ABC Manufacturing Ltd').map(app => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                      <td className="py-3 px-4">{app.type}</td>
                      <td className="py-3 px-4">{app.product}</td>
                      <td className="py-3 px-4 text-xs text-gray-600">{app.quantity} <br/> <span className="font-mono text-gray-400">{app.hsCode}</span></td>
                      <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGENCY REVIEW CONSOLE */}
        {session.role === 'agency' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Government Agency Review Console (Customs)</h3>
                <p className="text-xs text-gray-500">Review commercial shipping papers, verify Form M, and issue regulatory clearances.</p>
              </div>
              <input 
                type="text" 
                placeholder="Search Company, ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none w-full sm:w-auto"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Product / HS Code</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Regulatory Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredApps.map(app => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                      <td className="py-3 px-4">{app.company}</td>
                      <td className="py-3 px-4">{app.product} <span className="block text-xs font-mono text-gray-400">{app.hsCode}</span></td>
                      <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                      <td className="py-3 px-4 space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedAppDocs(app)} 
                          className="bg-blue-600 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-blue-700 shadow-sm transition"
                        >
                          View Docs
                        </button>
                        {app.status === 'Pending Review' ? (
                          <>
                            <button onClick={() => handleAgencyAction(app.id, 'Approve')} className="bg-green-600 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-green-700 shadow-sm transition">Approve</button>
                            <button onClick={() => handleAgencyAction(app.id, 'Query')} className="bg-red-600 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-red-700 shadow-sm transition">Query</button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SYSTEM ADMINISTRATOR CONSOLE */}
        {session.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Administration & Oversight Console</h3>
                <p className="text-xs text-gray-500 mt-1">Responsible for platform-wide gateway health, user access governance, and federal broadcast alerts.</p>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-xs font-bold text-gray-600">Gateway Status:</span>
                <button 
                  onClick={toggleGateway} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow transition ${gatewayStatus === 'Operational' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                >
                  {gatewayStatus} (Click to Toggle)
                </button>
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Platform Trade Metrics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-semibold uppercase">Total Applications</span>
                  <h4 className="text-3xl font-extrabold text-emerald-900 mt-1">{totalApps}</h4>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-xs text-green-700 font-semibold uppercase">Approved Permits</span>
                  <h4 className="text-3xl font-extrabold text-green-900 mt-1">{approvedApps}</h4>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <span className="text-xs text-yellow-700 font-semibold uppercase">Pending Review</span>
                  <h4 className="text-3xl font-extrabold text-yellow-900 mt-1">{pendingApps}</h4>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-xs text-red-700 font-semibold uppercase">Queried / Flagged</span>
                  <h4 className="text-3xl font-extrabold text-red-900 mt-1">{queriedApps}</h4>
                </div>
              </div>
            </div>

            {/* User Account Governance Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">User Account & Role Governance</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-3 px-4">Entity Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {systemUsers.map(user => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-xs text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-xs font-bold text-emerald-800">{user.role}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.status === 'Pending Approval' ? (
                            <button onClick={() => handleApproveUser(user.id)} className="bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-emerald-800 transition">Approve Access</button>
                          ) : (
                            <span className="text-gray-400 text-xs">Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Broadcast Notice & Audit Logs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Push Broadcast Notice</h4>
                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <textarea 
                    rows="3"
                    required
                    placeholder="Enter urgent system-wide announcement for all traders and agencies..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  ></textarea>
                  <button type="submit" className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-900 transition shadow">
                    Broadcast to Portal
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">System Security Audit Logs</h4>
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

      {/* New Application Intake Modal */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-t-8 border-emerald-700">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="font-bold text-gray-900 text-base">Submit New Trade Application</h4>
              <button onClick={() => setShowNewAppModal(false)} className="text-gray-500 hover:text-gray-700 font-bold text-lg">×</button>
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
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Heavy Industrial Generator" 
                  value={newAppProduct}
                  onChange={(e) => setNewAppProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity & Units</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 5 Units / 100 Metric Tons" 
                  value={newAppQuantity}
                  onChange={(e) => setNewAppQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Harmonized System (HS) Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 8502.11.00" 
                  value={newAppHsCode}
                  onChange={(e) => setNewAppHsCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewAppModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-900 transition shadow"
                >
                  Submit to Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Verification Modal */}
      {selectedAppDocs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border-t-8 border-emerald-700">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="font-bold text-gray-900 text-base">Document Verification: {selectedAppDocs.id}</h4>
              <button onClick={() => setSelectedAppDocs(null)} className="text-gray-500 hover:text-gray-700 font-bold text-lg">×</button>
            </div>
            <div className="space-y-3 text-xs text-gray-700 mb-6">
              <p><strong className="text-gray-900">Applicant Company:</strong> {selectedAppDocs.company}</p>
              <p><strong className="text-gray-900">Application Type:</strong> {selectedAppDocs.type}</p>
              <p><strong className="text-gray-900">Declared Product:</strong> {selectedAppDocs.product} ({selectedAppDocs.quantity})</p>
              <p><strong className="text-gray-900">HS Code:</strong> <span className="font-mono">{selectedAppDocs.hsCode}</span></p>
              <p><strong className="text-gray-900">Form M Reference:</strong> NG-FM-2026-98421</p>
              <p><strong className="text-gray-900">Bill of Lading:</strong> BL-99281-Abuja</p>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <span className="font-semibold text-emerald-800 block mb-1">Compliance Check Result:</span>
                <p className="text-gray-600">All electronic signatures and trade clearances align with official federal regulatory data.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedAppDocs(null)} 
                className="bg-emerald-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-emerald-900 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
