"use client";
import { useState } from 'react';

export default function Home() {
  const [session, setSession] = useState(null); // { role: 'trader' | 'agency' | 'admin', name: string, email: string }
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Import Permit NSW-2026-0001 approved by Customs.", time: "10m ago", read: false },
    { id: 2, text: "Additional documentation requested for NSW-2026-0002.", time: "1h ago", read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogin = (roleType) => {
    if (roleType === 'trader') {
      setSession({ role: 'trader', name: 'ABC Manufacturing Ltd', email: 'trader@abc.com' });
    } else if (roleType === 'agency') {
      setSession({ role: 'agency', name: 'Customs Officer (J. Adebayo)', email: 'customs@nsw.gov.ng' });
    } else if (roleType === 'admin') {
      setSession({ role: 'admin', name: 'Platform Administrator', email: 'admin@nsw.gov.ng' });
    }
  };

  // Secure Enterprise Login View
  if (!session) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-t-8 border-emerald-700">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="National Single Window Logo" className="h-16 w-auto object-contain" />
          </div>

          <h1 className="text-2xl font-extrabold text-emerald-900 text-center tracking-tight">National Single Window</h1>
          <p className="text-xs text-gray-500 text-center mt-1 mb-6 uppercase tracking-widest font-semibold">Enterprise Trade Portal (Nigeria)</p>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin('trader'); }} className="space-y-4">
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

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-[11px] text-gray-500 text-center mb-3 font-semibold uppercase tracking-wider">Quick Demo Access (Supervisor Review)</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleLogin('trader')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2 px-2 rounded border border-emerald-200 transition"
              >
                Trader
              </button>
              <button 
                onClick={() => handleLogin('agency')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold py-2 px-2 rounded border border-blue-200 transition"
              >
                Agency
              </button>
              <button 
                onClick={() => handleLogin('admin')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 px-2 rounded border border-gray-300 transition"
              >
                Admin
              </button>
            </div>
          </div>
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
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setNotifications(notifications.map(n => ({...n, read: true}))); }}
                className="relative p-2 rounded-full hover:bg-emerald-800 transition focus:outline-none"
                aria-label="Notifications"
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
                <span className="block text-[10px] text-emerald-300 uppercase">Authenticated as</span>
                <span className="font-bold uppercase">{session.role} ({session.email})</span>
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
              <span className="text-xs text-gray-600">Submit Application & Docs</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">2. NSW Gateway</span>
              <span className="text-xs text-gray-600">Validate & Route Data</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">3. Gov Agency</span>
              <span className="text-xs text-gray-600">Customs / NAFDAC Review</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="block font-bold text-gray-700 text-sm">4. Decision</span>
              <span className="text-xs text-gray-600">Approve / Reject / Query</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="block font-bold text-emerald-800 text-sm">5. Alert</span>
              <span className="text-xs text-gray-600">Instant Notification</span>
            </div>
          </div>
        </section>

        {session.role === 'trader' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Trader Dashboard - ABC Manufacturing Ltd</h3>
              <button className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-900 transition">
                + New Application
              </button>
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
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">NSW-2026-0001</td>
                  <td className="py-3 px-4">Import Permit</td>
                  <td className="py-3 px-4">Industrial Machine</td>
                  <td className="py-3 px-4"><span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">Pending Review</span></td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">NSW-2026-0002</td>
                  <td className="py-3 px-4">Export License</td>
                  <td className="py-3 px-4">Raw Cashew Nuts</td>
                  <td className="py-3 px-4"><span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">Approved</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {session.role === 'agency' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Government Agency Review Console (Customs & NAFDAC)</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Customs Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">NSW-2026-0001</td>
                  <td className="py-3 px-4">ABC Manufacturing Ltd</td>
                  <td className="py-3 px-4"><span className="text-blue-600 font-medium">Under Review</span></td>
                  <td className="py-3 px-4 space-x-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700">Approve</button>
                    <button className="bg-amber-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-amber-600">Query</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {session.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">System Activity & Metrics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-700 font-semibold uppercase">Total Applications</span>
                <h4 className="text-2xl font-extrabold text-emerald-900 mt-1">248</h4>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <span className="text-xs text-green-700 font-semibold uppercase">Approved</span>
                <h4 className="text-2xl font-extrabold text-green-900 mt-1">192</h4>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <span className="text-xs text-yellow-700 font-semibold uppercase">Pending Review</span>
                <h4 className="text-2xl font-extrabold text-yellow-900 mt-1">42</h4>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <span className="text-xs text-red-700 font-semibold uppercase">Rejected / Queried</span>
                <h4 className="text-2xl font-extrabold text-red-900 mt-1">14</h4>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}