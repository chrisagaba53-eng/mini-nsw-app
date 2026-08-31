'use client';

import React, { useState } from 'react';
import Link from "next/link";

export default function UnifiedNationalSingleWindow() {
  // ==========================================
  // 1. STATE MANAGEMENT (PORTAL & LANDING)
  // ==========================================
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [session, setSession] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [systemUsers, setSystemUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('nsw_system_users');
      if (savedUsers) {
        try { return JSON.parse(savedUsers); } catch (e) { console.error(e); }
      }
    }
    return [
      { id: 1, name: 'Apex Logistics', email: 'trader@apex.ng', role: 'trader', status: 'Active' },
      { id: 2, name: 'Customs Officer', email: 'officer@customs.gov.ng', role: 'agency', status: 'Active' },
      { id: 3, name: 'System Admin', email: 'admin@nsw.gov.ng', role: 'admin', status: 'Active' }
    ];
  });

  const [applications, setApplications] = useState([
    { id: 'NSW-2026-1042', type: 'Import Permit', product: 'Industrial Solar Panels', quantity: '500 Units', company: 'Apex Logistics Ltd', status: 'Approved', gatewayPassed: true, submittedAt: '2026-08-10', attachedDocument: null },
    { id: 'NSW-2026-1088', type: 'Export License', product: 'Raw Cocoa Beans', quantity: '50 Metric Tons', company: 'AgroExport Nigeria', status: 'Approved', gatewayPassed: true, submittedAt: '2026-08-12', attachedDocument: null }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('All');
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
  const [newAppFile, setNewAppFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [docPreview, setDocPreview] = useState(null);

  // ==========================================
  // 2. LOGIC & HANDLERS
  // ==========================================

  const updateUsersState = (newUsers) => {
    setSystemUsers(newUsers);
    if (typeof window !== 'undefined') localStorage.setItem('nsw_system_users', JSON.stringify(newUsers));
  };

  const handleSecureLogin = (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    let targetUser = systemUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!targetUser) {
      if (cleanEmail.includes('trader')) targetUser = systemUsers.find(u => u.role === 'trader');
      else if (cleanEmail.includes('agency') || cleanEmail.includes('customs')) targetUser = systemUsers.find(u => u.role === 'agency');
      else if (cleanEmail.includes('admin')) targetUser = systemUsers.find(u => u.role === 'admin');
    }

    if (targetUser && targetUser.status === 'Suspended') {
      setLoginError(`Account Suspended: Access for ${targetUser.email} has been revoked.`);
      return;
    }

    if (cleanEmail.includes('trader')) setSession({ name: targetUser?.name || 'Trader Enterprise', role: 'trader', email: cleanEmail });
    else if (cleanEmail.includes('agency') || cleanEmail.includes('customs')) setSession({ name: targetUser?.name || 'Customs Regulatory Unit', role: 'agency', email: cleanEmail });
    else if (cleanEmail.includes('admin')) setSession({ name: targetUser?.name || 'System Administrator', role: 'admin', email: cleanEmail });
    else setSession({ name: 'Portal User', role: 'trader', email: cleanEmail });
    
    setLoginError('');
    setActiveModal(null);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert("Registration submission successful!");
    setActiveModal(null);
  };

  const handleLogout = () => {
    setSession(null);
    setEmailInput('');
    setPasswordInput('');
    setLoginError('');
  };

  const addLog = (role, action) => {
    setAuditLogs(prev => [{ id: Date.now(), role, action, time: new Date().toLocaleTimeString() }, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setFileError('File size exceeds 5MB limit.'); setNewAppFile(null); e.target.value = ''; return; }
      setFileError('');
      const reader = new FileReader();
      reader.onloadend = () => setNewAppFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmitApplication = (e) => {
    e.preventDefault();
    const newId = `NSW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = { id: newId, type: newAppType, company: newAppCompany || session?.name || 'Trader Enterprise', product: newAppProduct, quantity: newAppQuantity, status: 'Pending Review', gatewayPassed: true, submittedAt: new Date().toISOString().split('T')[0], attachedDocument: newAppFile };
    setApplications([newApp, ...applications]);
    addLog('Trader', `Submitted application ${newId} -> Gateway Passed`);
    setShowNewAppModal(false);
    setNewAppCompany(''); setNewAppProduct(''); setNewAppQuantity(''); setNewAppFile(null);
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

  const displayedApps = applications.filter(app => {
    if (selectedFilter === 'Approved') return isApproved(app.status);
    if (selectedFilter === 'Pending') return isPending(app.status);
    if (selectedFilter === 'Denied') return isDenied(app.status);
    return true;
  });

  // ==========================================
  // 3. RENDER: LANDING PAGE (Unauthenticated)
  // ==========================================
  if (!session) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          html { scroll-behavior: smooth; }
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
          body { background-color: #f8f9fa; color: #333; }
          header { display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 15px 5%; box-shadow: 0 2px 5px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; }
          .logo-container { display: flex; align-items: center; gap: 15px; }
          .logo-container img { height: 50px; width: auto; object-fit: contain; }
          .logo-container h1 { font-size: 22px; color: #00563f; }
          nav ul { display: flex; list-style: none; gap: 25px; }
          nav a { text-decoration: none; color: #333; font-weight: 600; }
          nav a:hover { color: #00563f; }
          .auth-buttons button { padding: 10px 20px; margin-left: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .auth-buttons button:first-of-type { background-color: transparent; color: #00563f; border: 1px solid #00563f; }
          .auth-buttons button:last-of-type { background-color: #00563f; color: #ffffff; }
          .menu-toggle { display: none; font-size: 28px; background: none; border: none; color: #00563f; cursor: pointer; }
          .hero-section { text-align: center; padding: 80px 20px; background-color: #e8f5e9; }
          .hero-section h2 { font-size: 40px; color: #00563f; margin-bottom: 15px; }
          .hero-section p { font-size: 18px; margin-bottom: 25px; color: #555; }
          .hero-actions button { padding: 12px 24px; margin: 10px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold; }
          .hero-actions button:first-child { background-color: #00563f; color: white; }
          .hero-actions button:last-child { background-color: white; color: #00563f; border: 1px solid #00563f; }
          .statistics-row { display: flex; justify-content: center; gap: 30px; margin-top: 60px; }
          .stat-box { background-color: white; padding: 25px 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); min-width: 200px; }
          .stat-box h3 { font-size: 32px; color: #00563f; margin-bottom: 5px; }
          .about-section { padding: 60px 5%; background-color: #ffffff; text-align: center; }
          .about-content { max-width: 800px; margin: 0 auto; line-height: 1.6; color: #555; font-size: 16px; }
          .services-section, .stats-section, .news-section { padding: 60px 5%; background-color: #f8f9fa; text-align: center; }
          .stats-section { background-color: #f0f4f1; }
          h2 { font-size: 32px; color: #00563f; margin-bottom: 5px; }
          .section-subtitle { color: #666; margin-bottom: 40px; }
          .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; text-align: left; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-top: 30px; }
          .news-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-top: 30px; text-align: left; }
          .service-card, .stat-card, .news-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between; }
          .stat-card { border-left: 4px solid #00563f; padding: 20px; }
          .service-card h3, .news-card h3 { font-size: 18px; color: #222; margin-bottom: 10px; }
          .service-card p, .news-card p { font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.5; }
          .service-card .tag { display: inline-block; background-color: #e8f5e9; color: #00563f; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; width: fit-content; margin-bottom: 15px; }
          .card-btn, .news-link { text-decoration: none; color: #00563f; font-weight: bold; font-size: 14px; cursor: pointer; border: none; background: none; padding: 0; }
          .stat-card .stat-number { font-size: 28px; font-weight: bold; color: #00563f; margin: 10px 0 5px 0; }
          footer { background-color: #1a2521; color: #e0e0e0; padding-top: 50px; }
          .footer-container { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 30px; padding: 0 5% 40px 5%; }
          .footer-col { flex: 1; min-width: 220px; }
          .footer-col h3, .footer-col h4 { color: #ffffff; margin-bottom: 15px; }
          .footer-col a { color: #ccc; text-decoration: none; font-size: 14px; }
          .footer-bottom { border-top: 1px solid #2d3a35; text-align: center; padding: 20px; font-size: 13px; }
          .close-btn { position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; color: #666; }
          
          .login-modal-overlay { display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #013624; z-index: 2000; justify-content: center; align-items: center; }
          .login-card { background-color: #ffffff; padding: 40px; border-radius: 12px; width: 90%; max-width: 450px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
          .login-header { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 25px; }
          .login-header img, .login-header svg { height: 45px; width: auto; object-fit: contain; }
          .login-header-text { display: flex; flex-direction: column; color: #4b5563; font-size: 16px; line-height: 1.2; text-align: left; font-weight: 600; }
          .input-group { position: relative; margin-bottom: 20px; }
          .input-group svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #00563f; width: 18px; height: 18px; }
          .input-group input { width: 100%; padding: 14px 14px 14px 45px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
          .input-group input:focus { border-color: #00563f; box-shadow: 0 0 0 2px rgba(0,86,63,0.1); }
          .login-submit-btn { width: 100%; padding: 14px; background-color: #00563f; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 15px; cursor: pointer; transition: background-color 0.2s; }
          .login-submit-btn:hover { background-color: #004230; }

          @media screen and (max-width: 768px) {
              header { flex-wrap: wrap; padding: 15px 20px; }
              .logo-container h1 { font-size: 18px; }
              .menu-toggle { display: block; }
              nav { display: none; width: 100%; order: 3; margin-top: 15px; background-color: #ffffff; padding: 15px 0; border-top: 1px solid #e0e0e0; }
              nav.active { display: block; }
              nav ul { flex-direction: column; align-items: center; gap: 15px; }
              nav a { display: block; padding: 5px 0; }
              .auth-buttons { display: flex; gap: 10px; }
              .auth-buttons button { margin-left: 0; padding: 8px 14px; }
              .hero-section { padding: 40px 15px; }
              .hero-section h2 { font-size: 24px; }
              .hero-actions { display: flex; flex-direction: column; gap: 10px; }
              .hero-actions button { margin: 0; width: 100%; }
              .statistics-row { flex-direction: column; align-items: center; gap: 15px; }
              .stat-box { width: 100%; min-width: unset; }
              .services-grid, .stats-grid, .news-grid { grid-template-columns: 1fr; }
              .footer-container { flex-direction: column; text-align: center; gap: 30px; }
              .footer-col { min-width: 100%; }
          }
        `}} />

        <header>
          <Link href="/" className="logo-container" style={{ textDecoration: "none" }}>
            <img src="/logo.png" alt="Nigeria Coat of Arms" />
          </Link>
          <button className="menu-toggle" aria-label="Toggle Navigation" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            &#9776;
          </button>
          <nav className={isMobileMenuOpen ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#news">News</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button onClick={() => setActiveModal('register')}>Register</button>
            <button onClick={() => setActiveModal('login')}>Login</button>
          </div>
        </header>

        <section id="home" className="hero-section">
          <h2>National Premier Trade Platform</h2>
          <p>Digital Trade Gateway</p>
          <p>Connecting Nigeria's trade ecosystem through innovative digital solutions</p>
          <div className="hero-actions">
            <button onClick={() => setActiveModal('register')}>Get Started</button>
            <button onClick={() => window.location.href = '#services'}>Explore Features</button>
          </div>
          <div className="statistics-row">
            <div className="stat-box"><h3>9185</h3><p>Active Users</p></div>
            <div className="stat-box"><h3>24/7</h3><p>Support</p></div>
            <div className="stat-box"><h3>99.5%</h3><p>Uptime</p></div>
          </div>
        </section>

        <section id="about" className="about-section">
          <h2>About Us</h2>
          <p className="section-subtitle">Simplifying Trade, Empowering Commerce</p>
          <div className="about-content">
            <p>The National Single Window (NSW) is a cross-government website that facilitates trade by giving all parties involved in trade and transport access to a single point to lodge standardized information and documents with a single entry point to fulfill all import, export, and transit-related regulatory requirements.</p>
          </div>
        </section>

        <section id="services" className="services-section">
          <h2>Popular eServices</h2>
          <p className="section-subtitle">Access our most frequently used digital services</p>
          <div className="services-grid">
            <div className="service-card">
              <span className="tag">Importer</span><h3>Importer/Exporter Registration</h3>
              <p>Sign up as an Importer/Exporter to start using NSW services.</p>
              <button onClick={() => setActiveModal('register')} className="card-btn">Register &rarr;</button>
            </div>
            <div className="service-card">
              <span className="tag">Clearing</span><h3>License Customs/Freight Forwarding</h3>
              <p>Register as a License Customs/Freight Forwarding Agent to start using NSW services.</p>
              <button onClick={() => setActiveModal('register')} className="card-btn">Register &rarr;</button>
            </div>
            <div className="service-card">
              <span className="tag">Shipping</span><h3>Shipping Lines Registration</h3>
              <p>Register your Shipping Line to access and utilize NSW services.</p>
              <button onClick={() => setActiveModal('register')} className="card-btn">Register &rarr;</button>
            </div>
            <div className="service-card">
              <span className="tag">Track</span><h3>Track your Application</h3>
              <p>Check the status of your registration or application.</p>
              <button onClick={() => setActiveModal('login')} className="card-btn">Track &rarr;</button>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <h2>Facts and Figures for this Quarter</h2>
          <p className="section-subtitle">Q1 - 2026 Overview</p>
          <div className="stats-grid">
            <div className="stat-card"><h4>Air Ports</h4><p className="stat-number">5</p><p className="stat-desc">International hubs</p></div>
            <div className="stat-card"><h4>Sea Ports</h4><p className="stat-number">11</p><p className="stat-desc">Active terminals</p></div>
            <div className="stat-card"><h4>Traders</h4><p className="stat-number">2,847</p><p className="stat-desc">Registered users</p></div>
            <div className="stat-card"><h4>Manifests</h4><p className="stat-number">45,623</p><p className="stat-desc">This quarter</p></div>
            <div className="stat-card"><h4>Permits</h4><p className="stat-number">12,156</p><p className="stat-desc">Issued</p></div>
          </div>
        </section>

        <section id="news" className="news-section">
          <h2>Latest News</h2>
          <p className="section-subtitle">Stay updated with trade announcements and updates</p>
          <div className="news-grid">
            <article className="news-card">
              <span style={{ color: "#00563f", fontWeight: "bold", fontSize: "12px", marginBottom: "10px" }}>06 April 2026</span>
              <h3>About NSW Platform Capabilities</h3><p>Learn more about how the National Single Window enhances trade efficiency across Nigeria.</p>
              <a href="#about" className="news-link">Read more &rarr;</a>
            </article>
            <article className="news-card">
              <span style={{ color: "#00563f", fontWeight: "bold", fontSize: "12px", marginBottom: "10px" }}>05 April 2026</span>
              <h3>NSW to Host Regional Trade Conference</h3><p>Join key government agencies and stakeholders for the largest trade facilitation event.</p>
              <a href="#about" className="news-link">Read more &rarr;</a>
            </article>
            <article className="news-card">
              <span style={{ color: "#00563f", fontWeight: "bold", fontSize: "12px", marginBottom: "10px" }}>05 April 2026</span>
              <h3>Trade Facilitation Report Released</h3><p>Download the official comprehensive report evaluating digital trade metrics.</p>
              <a href="#about" className="news-link">Read more &rarr;</a>
            </article>
          </div>
        </section>

        <footer id="contact">
          <div className="footer-container">
            <div className="footer-col">
              <h3>National Single Window</h3><p>Driving Efficiency and Transparency in Nigeria's Trade Ecosystem.</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul style={{ listStyle: "none" }}>
                <li style={{ marginBottom: "8px" }}><a href="#home">Home</a></li>
                <li style={{ marginBottom: "8px" }}><a href="#about">About Us</a></li>
                <li style={{ marginBottom: "8px" }}><a href="#services">Services</a></li>
                <li style={{ marginBottom: "8px" }}><a href="#news">News</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact Us</h4>
              <p>26, Sokode Crescent, Wuse Zone 5, Abuja</p>
              <p>+234 803 999 9352</p><p>nsw@firs.gov.ng</p>
            </div>
          </div>
          <div className="footer-bottom"><p>&copy; 2026 National Single Window. All rights reserved.</p></div>
        </footer>

        {/* Full-Screen Login Modal */}
        {activeModal === 'login' && (
          <div className="login-modal-overlay" onClick={(e) => e.target.classList.contains('login-modal-overlay') && setActiveModal(null)}>
            <div className="login-card">
              <span className="close-btn" onClick={() => setActiveModal(null)}>&times;</span>
              <div className="login-header" style={{ justifyContent: 'center' }}>
                <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
              </div>
              
              {loginError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSecureLogin}>
                <div className="input-group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input type="text" placeholder="trader@apex.ng, admin..." required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                </div>
                
                <div className="input-group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input type="password" placeholder="Password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                </div>

                <button type="submit" className="login-submit-btn">Access Portal</button>
              </form>
            </div>
          </div>
        )}

        {/* Full-Screen Register & Get Started Modal */}
        {activeModal === 'register' && (
          <div className="login-modal-overlay" onClick={(e) => e.target.classList.contains('login-modal-overlay') && setActiveModal(null)}>
            <div className="login-card">
              <span className="close-btn" onClick={() => setActiveModal(null)}>&times;</span>
              <div className="login-header" style={{ justifyContent: 'center' }}>
                <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
              </div>
              
              <h3 style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.05em', color: '#00563f', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
                Create Portal Account
              </h3>

              <form onSubmit={handleRegisterSubmit}>
                <div className="input-group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input type="text" placeholder="Full Name" required />
                </div>

                <div className="input-group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input type="email" placeholder="Email Address" required />
                </div>
                
                <div className="input-group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input type="password" placeholder="Create Password" required />
                </div>

                <button type="submit" className="login-submit-btn">Complete Registration</button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // 4. RENDER: PORTAL DASHBOARD (Authenticated)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-emerald-900 text-white shadow-md relative z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Portal Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block border-l border-emerald-700 pl-3 ml-1">
              <span className="text-sm font-semibold tracking-wide text-emerald-50">Trade Operations Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-5 text-xs">
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }} className="relative text-emerald-200 hover:text-white transition focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm border border-red-600">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 text-gray-800 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase text-gray-700">Recent Activity</h4>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 font-bold"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {auditLogs.slice(0, 8).map(log => (
                      <div key={log.id} className="p-3 hover:bg-gray-50 transition">
                        <p className="text-[11px] font-medium text-gray-900 leading-tight"><span className="font-bold text-emerald-700">[{log.role}]</span> {log.action}</p>
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
            
            <button onClick={handleLogout} className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold border border-emerald-600 transition">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-[#002855]">
                {session.role === 'trader' && `Trader Portal - ${session.name}`}
                {session.role === 'agency' && 'Regulatory & Review Portal'}
                {session.role === 'admin' && 'System Governance & Gateway Portal'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {session.role === 'admin' 
                    ? 'Platform-wide trade metrics, user account access control, and broadcast notices.' 
                    : 'Click metric cards to filter status.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {session.role === 'admin' && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-700">Gateway Status:</span>
                  <button 
                    onClick={() => setGatewayStatus(prev => prev === 'Operational' ? 'Maintenance' : 'Operational')}
                    className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition ${gatewayStatus === 'Operational' ? 'bg-[#00a651] text-white hover:bg-green-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
                  >
                    {gatewayStatus} (Toggle)
                  </button>
                </div>
              )}
              {session.role === 'trader' && <button onClick={() => setShowNewAppModal(true)} className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-900 transition shadow whitespace-nowrap">+ New Application</button>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div onClick={() => setSelectedFilter('All')} className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'All' ? 'bg-gray-100 border-gray-800 ring-2 ring-gray-200' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">TOTAL APPLICATIONS</span><span className="text-3xl font-extrabold text-black">{applications.length}</span>
            </div>
            <div onClick={() => setSelectedFilter('Pending')} className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'Pending' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-100' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">PENDING STATE</span><span className="text-3xl font-extrabold text-amber-600">{applications.filter(a => isPending(a.status)).length}</span>
            </div>
            <div onClick={() => setSelectedFilter('Approved')} className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'Approved' ? 'bg-green-50 border-green-500 ring-2 ring-green-100' : 'bg-white border-gray-200 hover:border-green-300'}`}>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">APPROVED STATE</span><span className="text-3xl font-extrabold text-[#00a651]">{applications.filter(a => isApproved(a.status)).length}</span>
            </div>
            <div onClick={() => setSelectedFilter('Denied')} className={`cursor-pointer p-5 rounded-xl shadow-sm border transition flex flex-col justify-center items-center ${selectedFilter === 'Denied' ? 'bg-red-50 border-red-500 ring-2 ring-red-100' : 'bg-white border-gray-200 hover:border-red-300'}`}>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">DENIED STATE</span><span className="text-3xl font-extrabold text-red-600">{applications.filter(a => isDenied(a.status)).length}</span>
            </div>
          </div>

          {session.role === 'admin' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6 border-l-4 border-l-emerald-700">
                <h4 className="text-sm font-bold text-[#002855] uppercase tracking-wider mb-3">SYSTEM BROADCAST CENTER</h4>
                <form onSubmit={handleSendBroadcast} className="flex gap-3">
                  <input type="text" value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Type an operational notice for all active portal users..." className="flex-grow px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-600 focus:outline-none" />
                  <button type="submit" className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-2 rounded text-xs font-bold transition shadow-sm whitespace-nowrap">Broadcast Notice</button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-[#002855] uppercase tracking-wider">IDENTITY & ACCESS MANAGEMENT</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                        <th className="py-3 px-4">User / Entity Name</th><th className="py-3 px-4">Role Area</th><th className="py-3 px-4">Account Status</th><th className="py-3 px-4">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 bg-white">
                      {systemUsers.map(user => (
                        <tr key={user.id}>
                          <td className="py-3 px-4"><span className="block font-medium text-gray-900">{user.name}</span><span className="block text-xs text-gray-500">{user.email}</span></td>
                          <td className="py-3 px-4 font-mono text-xs">{user.role.toUpperCase()}</td>
                          <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></td>
                          <td className="py-3 px-4 space-x-2">
                            {user.status !== 'Active' && <button onClick={() => handleUserStatusChange(user.id, 'Active')} className="bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-emerald-700 transition">Authorize</button>}
                            {user.status !== 'Suspended' && <button onClick={() => handleUserStatusChange(user.id, 'Suspended')} className="bg-gray-800 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-gray-900 transition">Suspend</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-sm font-bold text-[#002855] uppercase tracking-wider">GLOBAL APPLICATION VIEW</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Filter by Application State:</span>
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-500 bg-white"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Denied">Denied</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">COMPANY</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-4">PRODUCT</th>
                    <th className="py-3 px-4">APPLICATION STATE</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {displayedApps.length > 0 ? displayedApps.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 bg-white">
                      <td className="py-4 px-4 font-medium text-[#00a651]">{app.id}</td>
                      <td className="py-4 px-4 text-gray-700">{app.company}</td>
                      <td className="py-4 px-4 text-gray-700">{app.type}</td>
                      <td className="py-4 px-4 text-gray-700">{app.product}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isApproved(app.status) ? 'bg-[#e5f6ed] text-[#00a651]' : ''} ${isDenied(app.status) ? 'bg-red-100 text-red-800' : ''} ${isPending(app.status) ? 'bg-amber-100 text-amber-800' : ''}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" className="text-center py-6 text-gray-500">No applications match your filter.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* New Application Modal */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-emerald-900 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm uppercase">Submit New Application</h3>
              <button onClick={() => setShowNewAppModal(false)} className="text-emerald-200 hover:text-white font-bold">&times;</button>
            </div>
            <form onSubmit={handleFormSubmitApplication} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Application Type</label>
                <select value={newAppType} onChange={e => setNewAppType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none">
                  <option>Import Permit</option><option>Export License</option><option>Customs Clearance</option>
                </select>
              </div>
              {session.role !== 'trader' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Filing on Behalf Of (Company Name)</label>
                  <input type="text" required value={newAppCompany} onChange={e => setNewAppCompany(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                <input type="text" required value={newAppProduct} onChange={e => setNewAppProduct(e.target.value)} placeholder="e.g. Agricultural Machinery" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantity / Volume</label>
                <input type="text" required value={newAppQuantity} onChange={e => setNewAppQuantity(e.target.value)} placeholder="e.g. 5 Containers" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none" />
              </div>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Attach Supporting Document (Max 5MB)</p>
                <input type="file" required onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" className="text-xs text-gray-700 w-full" />
                {fileError && <p className="text-red-500 text-[10px] mt-1 font-bold">{fileError}</p>}
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowNewAppModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-900 shadow">Submit to Gateway</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}