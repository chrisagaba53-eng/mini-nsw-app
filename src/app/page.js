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
  const [gatewayStatus, setGatewayStatus] = useState('Operational'); // Admin function control
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'User authentication verified', role: 'TRADER', time: '08:30 WAT' },
    { id: 2, action: 'Customs clearance processed', role: 'AGENCY', time: '09:05 WAT' }
  ]);
  
  // Dynamic Application State with Default Data
  const [applications, setApplications] = useState([
    { id: 'NSW-2026-0001', company: 'ABC Manufacturing Ltd', type: 'Import Permit', product: 'Industrial Machine', status: 'Pending Review' },
    { id: 'NSW-2026-0002', company: 'ABC Manufacturing Ltd', type: 'Export License', product: 'Raw Cashew Nuts', status: 'Approved' },
    { id: 'NSW-2026-0003', company: 'Global Trade Co', type: 'Import Permit', product: 'Chemical Solvents', status: 'Pending Review' }
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
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('nsw_applications', JSON.stringify(applications));
      localStorage.setItem('nsw_notifications', JSON.stringify(notifications));
    }
  }, [applications, notifications, isClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const totalApps = applications.length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const pendingApps = applications.filter(a => a.status === 'Pending Review').length;
  const queriedApps = applications.filter(a => a.status === 'Queried').length;

  const filteredApps = applications.filter(app => 
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Professional Role-Preset Selector for Clean Demonstration
  const handlePresetLogin = (roleType) => {
    setLoginError('');
    if (roleType === 'trader') {
      setSession({ role: 'trader', name: 'ABC Manufacturing Ltd', email: 'trader@abc.com' });
    } else if (roleType === 'agency') {
      setSession({ role: 'agency', name: 'Customs Officer (J. Adebayo)', email: 'customs@nsw.gov.ng' });
    } else if (roleType === 'admin') {
      setSession({ role: 'admin', name: 'Platform Administrator', email: 'admin@nsw.gov.ng' });
    }
  };

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

  const handleNewApplication = () => {
    const newId = `NSW-2026-000${applications.length + 1}`;
    const newApp = {
      id: newId,
      company: session.name,
      type: 'Import Permit',
      product: 'New Equipment',
      status: 'Pending Review'
    };
    setApplications([newApp, ...applications]);
    
    const newNotif = {
      id: Date.now(),
      text: `Application ${newId} submitted successfully by ${session.name}.`,
      time: 'Just now',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
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
  };

  const toggleGateway = () => {
    const nextStatus = gatewayStatus === 'Operational' ? 'Maintenance Mode' : 'Operational';
    setGatewayStatus(nextStatus);
    setAuditLogs([{ id: Date.now(), action: `Gateway status changed to ${nextStatus}`, role: 'ADMIN', time: 'Just now' }, ...auditLogs]);
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">Approved</span>;
    if (status === 'Queried') return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">Queried</span>;
    return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">Pending Review</span>;
  };

  if (!isClient) return null;

  // Professional Enterprise Login Portal
  if (!session) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border-t-8 border-emerald-700">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="National Single Window Logo" className="h-16 w-auto object-contain" />
          </div>

          <h1 className="text-2xl font-extrabold text-emerald-900 text-center tracking-tight">National Single Window</h1>
          <p className="text-xs text-gray-500 text-center mt-1 mb-6 uppercase tracking-widest font-semibold">Enterprise Trade Portal (Nigeria)</p>

          {/* Professional Role Access Selection */}
          <div className="mb-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <span className="block text-xs font-bold text-emerald-900 uppercase mb-2 text-center">Select Portal Access Gateway</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handlePresetLogin('trader')}
                className="bg-white hover:bg-emerald-800 hover:text-white text-emerald-900 border border-emerald-300 text-xs font-bold py-2 px-2 rounded-lg shadow-sm transition text-center"
              >
                Trader Portal
              </button>
              <button 
                onClick={() => handlePresetLogin('agency')}
                className="bg-white hover:bg-emerald-800 hover:text-white text-emerald-900 border border-emerald-300 text-xs font-bold py-2 px-2 rounded-lg shadow-sm transition text-center"
              >
                Agency Review
              </button>
              <button 
                onClick={() => handlePresetLogin('admin')}
                className="bg-white hover:bg-emerald-800 hover:text-white text-emerald-900 border border-emerald-300 text-xs font-bold py-2 px-2 rounded-lg shadow-sm transition text-center"
              >
                System Admin
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold">Or Sign In Manually</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

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
                placeholder="name@agency.gov.ng or company.com" 
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
        </div>
      </div>
    );
  }

  // Authenticated Portal Layout
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="NSW Logo" className="h-12 w-auto object-contain bg-white rounded p-1" />
            <div>
              <h1 className="text-base font-bold tracking-wide">National Single Window (NSW)</h1>
              <p className="text-xs text-emerald-300">Federal Republic of Nigeria - Trade Portal</p>
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
              <div>
                <span className="block text-[10px] text-emerald-300 uppercase">Authenticated Role</span>
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
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-4">Core Workflow Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="block font-bold text-emerald-800 text-sm">1. Trader</span>
              <span className="text-xs text-gray-600">Submit Application</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">2. NSW Gateway</span>
              <span className="text-xs text-gray-600">Validate Data</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">3. Gov Agency</span>
              <span className="text-xs text-gray-600">Document Review</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">4. Decision</span>
              <span className="text-xs text-gray-600">Approve / Query</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="block font-bold text-emerald-800 text-sm">5. Alert</span>
              <span className="text-xs text-gray-600">Notification Sent</span>
            </div>
          </div>
        </section>

        {session.role === 'trader' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Trader Dashboard - {session.name}</h3>
              <div className="flex space-x-4">
                <input 
                  type="text" 
                  placeholder="Search ID or Type..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <button 
                  onClick={handleNewApplication}
                  className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-900 transition"
                >
                  + New Application
                </button>
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredApps.filter(app => app.company === 'ABC Manufacturing Ltd').map(app => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                    <td className="py-3 px-4">{app.type}</td>
                    <td className="py-3 px-4">{app.product}</td>
                    <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {session.role === 'agency' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Government Agency Review Console (Customs)</h3>
              <input 
                type="text" 
                placeholder="Search Company or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredApps.map(app => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-emerald-700">{app.id}</td>
                    <td className="py-3 px-4">{app.company}</td>
                    <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3 px-4 space-x-2">
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
        )}

        {session.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Administration & Oversight Console</h3>
                <p className="text-xs text-gray-500 mt-1">Responsible for platform-wide gateway health, user access governance, and audit tracking.</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-600">Gateway Status:</span>
                <button 
                  onClick={toggleGateway} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow transition ${gatewayStatus === 'Operational' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                >
                  {gatewayStatus} (Click to Toggle)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Platform Metrics Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-semibold uppercase">Total Applications</span>
                  <h4 className="text-3xl font-extrabold text-emerald-900 mt-1">{totalApps}</h4>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-xs text-green-700 font-semibold uppercase">Approved</span>
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">System Security Audit Logs</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-48 overflow-y-auto text-xs font-mono space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex justify-between border-b pb-1">
                    <span className="text-gray-800">[{log.role}] {log.action}</span>
                    <span className="text-gray-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

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
              <p><strong className="text-gray-900">Declared Product:</strong> {selectedAppDocs.product}</p>
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