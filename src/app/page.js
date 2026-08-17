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
  
  // Selected Application for OPay-style Flowbox Modal
  const [trackedApp, setTrackedApp] = useState(null);
  
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
    { 
      id: 'NSW-2026-0001', 
      company: 'ABC Manufacturing Ltd', 
      type: 'Import Permit', 
      product: 'Industrial Machine Generator', 
      quantity: '10 Units', 
      hsCode: '8479.90.00', 
      status: 'Pending Review',
      submittedAt: '17 Aug 2026, 08:30 WAT'
    },
    { 
      id: 'NSW-2026-0002', 
      company: 'ABC Manufacturing Ltd', 
      type: 'Export License', 
      product: 'Raw Cashew Nuts', 
      quantity: '50 Metric Tons', 
      hsCode: '0801.31.00', 
      status: 'Approved',
      submittedAt: '16 Aug 2026, 11:15 WAT'
    },
    { 
      id: 'NSW-2026-0003', 
      company: 'Global Trade Co', 
      type: 'Import Permit', 
      product: 'Chemical Solvents', 
      quantity: '500 Litres', 
      hsCode: '3824.99.99', 
      status: 'Pending Review',
      submittedAt: '17 Aug 2026, 09:40 WAT'
    }
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
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' WAT';
    const nowDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newApp = {
      id: newId,
      company: session.name,
      type: newAppType,
      product: newAppProduct,
      quantity: newAppQuantity,
      hsCode: newAppHsCode,
      status: 'Pending Review',
      submittedAt: `${nowDate}, ${nowTime}`
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

    if (trackedApp && trackedApp.id === appId) {
      setTrackedApp({ ...trackedApp, status: updatedStatus });
    }

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
    if (status === 'Approved') return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">Approved</span>;
    if (status === 'Queried') return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">Queried</span>;
    return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">Pending Review</span>;
  };

  if (!isClient) return null;

  // Unauthenticated Login
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

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 space-y-1">
            <p>Demo Traders: <code className="text-emerald-700">trader@abc.com</code> / <code className="text-emerald-700">password123</code></p>
            <p>Demo Agency: <code className="text-emerald-700">customs@nsw.gov.ng</code> / <code className="text-emerald-700">secure2026</code></p>
            <p>Demo Admin: <code className="text-emerald-700">admin@nsw.gov.ng</code> / <code className="text-emerald-700">admin2026</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Header */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-40">
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
        
        {/* TRADER VIEW */}
        {session.role === 'trader' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Trader Dashboard - {session.name}</h3>
                <p className="text-xs text-gray-500">Track application progress step-by-step or submit new Form M trade documentation.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search Application..." 
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
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Product / HS Code</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Process Flow</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredApps.filter(app => app.company === session.name || app.company === 'ABC Manufacturing Ltd').map(app => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                      <td className="py-3 px-4">{app.type}</td>
                      <td className="py-3 px-4">{app.product} <br/> <span className="font-mono text-xs text-gray-400">{app.hsCode}</span></td>
                      <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setTrackedApp(app)}
                          className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-800 transition flex items-center space-x-1.5 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          <span>Track Live Status</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGENCY VIEW */}
        {session.role === 'agency' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Customs Regulatory & Review Console</h3>
                <p className="text-xs text-gray-500">Inspect commercial documentation and trigger step-by-step workflow status updates.</p>
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
                    <th className="py-3 px-4">Actions & Timeline</th>
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
                          onClick={() => setTrackedApp(app)}
                          className="bg-emerald-700 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-emerald-800 transition"
                        >
                          Flow Box
                        </button>
                        {app.status === 'Pending Review' ? (
                          <>
                            <button onClick={() => handleAgencyAction(app.id, 'Approve')} className="bg-green-600 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-green-700 transition">Approve</button>
                            <button onClick={() => handleAgencyAction(app.id, 'Query')} className="bg-red-600 text-white px-2.5 py-1.5 rounded text-xs font-bold hover:bg-red-700 transition">Query</button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
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
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs text-amber-700 font-semibold uppercase">Pending Review</span>
                  <h4 className="text-3xl font-extrabold text-amber-900 mt-1">{pendingApps}</h4>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-xs text-red-700 font-semibold uppercase">Queried / Flagged</span>
                  <h4 className="text-3xl font-extrabold text-red-900 mt-1">{queriedApps}</h4>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">User Account & Access Control</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-3 px-4">Entity Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
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
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
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

      {/* OPAY-STYLE STEP-BY-STEP PROCESS FLOWBOX MODAL */}
      {trackedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white p-5 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block mb-1">Transaction Flow Status</span>
                <h3 className="text-lg font-extrabold">{trackedApp.id}</h3>
                <p className="text-xs text-emerald-200 mt-0.5">{trackedApp.product} ({trackedApp.quantity})</p>
              </div>
              <button 
                onClick={() => setTrackedApp(null)}
                className="text-white hover:text-emerald-300 font-bold text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* OPay Style Process Flow Box */}
            <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-0">
                
                {/* STEP 1: Application Submitted */}
                <div className="relative pl-8 pb-8">
                  {/* Connecting Line */}
                  <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-emerald-500"></div>
                  {/* Step Node */}
                  <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">
                    ✓
                  </div>
                  {/* Content */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Application Submitted</h5>
                    <p className="text-xs text-gray-600 mt-0.5">Form M & Trade documentation uploaded by {trackedApp.company}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">{trackedApp.submittedAt}</span>
                  </div>
                </div>

                {/* STEP 2: Gateway Data Validation */}
                <div className="relative pl-8 pb-8">
                  {/* Connecting Line */}
                  <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${trackedApp.status !== 'Pending Review' ? 'bg-emerald-500' : 'bg-emerald-500'}`}></div>
                  {/* Step Node */}
                  <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">
                    ✓
                  </div>
                  {/* Content */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Gateway Data Validation</h5>
                    <p className="text-xs text-gray-600 mt-0.5">Automated HS Code ({trackedApp.hsCode}) compliance check complete</p>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Validated by NSW Engine</span>
                  </div>
                </div>

                {/* STEP 3: Customs & Agency Review */}
                <div className="relative pl-8 pb-8">
                  {/* Connecting Line */}
                  <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${trackedApp.status === 'Approved' ? 'bg-emerald-500' : trackedApp.status === 'Queried' ? 'bg-red-300' : 'bg-gray-200'}`}></div>
                  {/* Step Node */}
                  {trackedApp.status === 'Pending Review' ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-amber-100 animate-pulse">
                      •
                    </div>
                  ) : trackedApp.status === 'Approved' ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">
                      ✓
                    </div>
                  ) : (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow">
                      !
                    </div>
                  )}
                  {/* Content */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Customs & Regulatory Review</h5>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {trackedApp.status === 'Pending Review' && 'Currently being inspected by Nigeria Customs Service'}
                      {trackedApp.status === 'Approved' && 'Document verification completed and verified'}
                      {trackedApp.status === 'Queried' && 'Queried by officer: Missing tax identification certificate'}
                    </p>
                    <span className={`text-[10px] font-semibold mt-1 block ${trackedApp.status === 'Pending Review' ? 'text-amber-600 font-bold' : trackedApp.status === 'Approved' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {trackedApp.status === 'Pending Review' ? 'Processing in progress...' : 'Review Completed'}
                    </span>
                  </div>
                </div>

                {/* STEP 4: Clearance & Final Decision */}
                <div className="relative pl-8 pb-8">
                  {/* Connecting Line */}
                  <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${trackedApp.status === 'Approved' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                  {/* Step Node */}
                  {trackedApp.status === 'Approved' ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">
                      ✓
                    </div>
                  ) : trackedApp.status === 'Queried' ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-red-100 border-2 border-red-500 text-red-600 flex items-center justify-center text-xs font-bold">
                      ✕
                    </div>
                  ) : (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-300 text-gray-400 flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                  )}
                  {/* Content */}
                  <div>
                    <h5 className={`text-sm font-bold ${trackedApp.status === 'Pending Review' ? 'text-gray-400' : 'text-gray-900'}`}>
                      Clearance & Regulatory Approval
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {trackedApp.status === 'Approved' ? 'Duty payment & regulatory assessment cleared' : trackedApp.status === 'Queried' ? 'Application flagged for review' : 'Awaiting agency decision'}
                    </p>
                  </div>
                </div>

                {/* STEP 5: Permit Generation & Release */}
                <div className="relative pl-8">
                  {/* Step Node */}
                  {trackedApp.status === 'Approved' ? (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow ring-4 ring-emerald-100">
                      ✓
                    </div>
                  ) : (
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-300 text-gray-400 flex items-center justify-center text-xs font-bold">
                      5
                    </div>
                  )}
                  {/* Content */}
                  <div>
                    <h5 className={`text-sm font-bold ${trackedApp.status === 'Approved' ? 'text-emerald-900 font-extrabold' : 'text-gray-400'}`}>
                      Official Trade Permit Issued
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {trackedApp.status === 'Approved' ? 'Digital Permit released to Trader Portal & Port Terminal' : 'Pending final approval'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer / Quick Agency Action */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Ref: {trackedApp.hsCode}</span>
              <div className="space-x-2">
                {session.role === 'agency' && trackedApp.status === 'Pending Review' && (
                  <>
                    <button onClick={() => handleAgencyAction(trackedApp.id, 'Approve')} className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-800 transition">Approve Permit</button>
                    <button onClick={() => handleAgencyAction(trackedApp.id, 'Query')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition">Query Issue</button>
                  </>
                )}
                <button 
                  onClick={() => setTrackedApp(null)} 
                  className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW APPLICATION MODAL */}
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
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}