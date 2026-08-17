"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function EnterpriseNSWPortal() {
  const [userRole, setUserRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [viewingDocs, setViewingDocs] = useState(null);

  const [companyName, setCompanyName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [tin, setTin] = useState("");
  const [permitType, setPermitType] = useState("Import Permit (Form M)");
  const [productDesc, setProductDesc] = useState("");
  const [originCountry, setOriginCountry] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Failed to load applications", err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const EXPECTED_PASSWORD = "Password123!"; 

    if (password !== EXPECTED_PASSWORD) {
      alert("Authentication Failed: Invalid password. Portal access denied.");
      return;
    }

    if (email === "trader@nsw.gov") setUserRole("trader");
    else if (email === "customs@nsw.gov") setUserRole("customs");
    else if (email === "nafdac@nsw.gov") setUserRole("nafdac");
    else if (email === "firs@nsw.gov") setUserRole("firs");
    else if (email === "admin@nsw.gov") setUserRole("admin");
    else alert("Authentication Failed: Unrecognized government or trader identity.");
  };

  const updateStatus = async (appId, field, status) => {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", appId, field, status }),
    });
    const data = await res.json();
    if (data.success) {
      setApplications(data.applications);
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!rcNumber.startsWith("RC-")) {
      alert("Invalid CAC format. Must start with 'RC-' (e.g. RC-123456)");
      return;
    }

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        company: companyName,
        rcNumber,
        tin,
        permitType,
        productDesc,
        originCountry,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setApplications(data.applications);
      setProductDesc("");
      setOriginCountry("");
      setCompanyName("");
      setRcNumber("");
      setTin("");
      alert("Form M & Application successfully saved to Single Window database.");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Legacy Data";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  if (!userRole) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-green-100">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="National Single Window Logo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center text-green-800 mb-1">National Single Window</h1>
          <p className="text-center text-gray-500 mb-6 text-sm">Enterprise Trade Portal (Nigeria)</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black text-sm" placeholder="trader@nsw.gov" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black text-sm" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 text-sm">Sign In to Portal</button>
          </form>
          <div className="mt-6 text-xs text-gray-500 space-y-1 bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="font-semibold text-green-800 mb-1">Test Accounts (Password: <code className="bg-white px-1">Password123!</code>):</p>
            <p>Trader: <code className="bg-white px-1">trader@nsw.gov</code></p>
            <p>Customs: <code className="bg-white px-1">customs@nsw.gov</code> | NAFDAC: <code className="bg-white px-1">nafdac@nsw.gov</code></p>
            <p>FIRS: <code className="bg-white px-1">firs@nsw.gov</code> | Admin: <code className="bg-white px-1">admin@nsw.gov</code></p>
          </div>
        </div>
      </main>
    );
  }

  const activeApp = applications[0];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="NSW Logo" width={36} height={36} className="bg-white rounded p-0.5 object-contain" />
          <span className="font-bold text-lg tracking-wide">Nigeria National Single Window</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="capitalize bg-green-800 px-3 py-1 rounded-full text-xs font-semibold border border-green-600">
            Role: {userRole}
          </span>
          <button onClick={() => { setUserRole(null); setPassword(""); }} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {userRole === "trader" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-900">Trader Portal - Form M & Permits</h2>

            {activeApp && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Submission: {activeApp.id} ({activeApp.overallStatus})
                  </h3>
                  <div className="space-x-2">
                    {(activeApp.paymentStatus === "Unpaid" || !activeApp.paymentStatus) && (
                      <button 
                        onClick={() => {
                          alert("Redirecting to Remita Secure Gateway...\n\nPayment Successful! TSA updated.");
                          updateStatus(activeApp.id, "paymentStatus", "Paid");
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded shadow animate-pulse"
                      >
                        Pay Levies via Remita
                      </button>
                    )}
                    {activeApp.overallStatus === "Approved" && (
                      <button
                        onClick={() => setSelectedCertificate(activeApp)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded shadow"
                      >
                        View Digital Clearance Certificate
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg border mb-4">
                  <div><strong>Customs (NCS):</strong> <span className="text-blue-600">{activeApp.customsStatus}</span></div>
                  <div><strong>NAFDAC:</strong> <span className="text-amber-600">{activeApp.nafdacStatus}</span></div>
                  <div><strong>FIRS Tax:</strong> <span className="text-green-600">{activeApp.firsStatus}</span></div>
                  <div><strong>TSA Payment:</strong> <span className={activeApp.paymentStatus === "Paid" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{activeApp.paymentStatus || "Unpaid"}</span></div>
                </div>
                <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">Attached Manifest Documents:</span> {activeApp.documents ? activeApp.documents.join(", ") : "None"}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Initiate New Trade Application</h3>
              <form onSubmit={handleCreateApplication} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Company Registered Name</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black" required /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">CAC RC Number</label><input type="text" value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black" required /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">FIRS Tax ID (TIN)</label><input type="text" value={tin} onChange={(e) => setTin(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black" required /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Permit Type</label><select value={permitType} onChange={(e) => setPermitType(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-black"><option value="Import Permit (Form M)">Import Permit (Form M)</option><option value="Export License">Export License</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Product Description</label><input type="text" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black" required /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Origin Country</label><input type="text" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black" required /></div>
                <div className="md:col-span-3"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition">Submit to Single Window Registry</button></div>
              </form>
            </div>
          </div>
        )}

        {(userRole === "customs" || userRole === "nafdac") && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-900">
              {userRole === "customs" ? "Nigeria Customs Service (NCS) - Duty & PAAR Module" : "NAFDAC - Regulatory Compliance & Inspection"}
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-green-50 text-green-900 border-b border-green-100">
                  <tr><th className="p-4">App ID</th><th className="p-4">Company</th><th className="p-4">Product</th><th className="p-4">Documents</th><th className="p-4">TSA Payment</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => {
                    const isPaid = app.paymentStatus === "Paid";
                    const statusField = userRole === "customs" ? "customsStatus" : "nafdacStatus";
                    const currentStatus = app[statusField];
                    return (
                      <tr key={app.id}>
                        <td className="p-4 font-mono font-bold text-green-800">{app.id}</td>
                        <td className="p-4">{app.company}</td>
                        <td className="p-4">{app.product}</td>
                        <td className="p-4">
                          <button onClick={() => setViewingDocs(app)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded border font-semibold text-gray-700">
                            View Files ({app.documents ? app.documents.length : 0})
                          </button>
                        </td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{app.paymentStatus || "Unpaid"}</span></td>
                        <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{currentStatus}</span></td>
                        <td className="p-4 text-right">
                          <button disabled={!isPaid} onClick={() => updateStatus(app.id, statusField, "Cleared")} className={`px-3 py-1 rounded text-xs text-white ${isPaid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`} title={!isPaid ? "Cannot clear until TSA payment is confirmed" : "Clear Cargo"}>
                            {userRole === "customs" ? "Clear Cargo" : "Approve Inspection"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {userRole === "firs" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-900">Federal Inland Revenue Service (FIRS) - TIN Verification</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-green-50 text-green-900 border-b border-green-100">
                  <tr><th className="p-4">App ID</th><th className="p-4">Company</th><th className="p-4">TIN Number</th><th className="p-4">Tax Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id}><td className="p-4 font-mono font-bold text-green-800">{app.id}</td><td className="p-4">{app.company}</td><td className="p-4 font-mono">{app.tin}</td><td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">{app.firsStatus}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {userRole === "admin" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-900">National Single Window - Master Oversight</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase">Total Trade Submissions</p>
                <p className="text-3xl font-extrabold text-green-800 mt-2">{applications.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase">Fully Approved Permits</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">{applications.filter((a) => a.overallStatus === "Approved").length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase">Pending Payments</p>
                <p className="text-3xl font-extrabold text-red-500 mt-2">{applications.filter((a) => a.paymentStatus !== "Paid").length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 text-white p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold">System-Wide Audit Log</h3>
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">Read-Only</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr><th className="p-3">Timestamp</th><th className="p-3">App ID</th><th className="p-3">Company Entity</th><th className="p-3">FIRS (Tax)</th><th className="p-3">Payment (TSA)</th><th className="p-3">NCS (Customs)</th><th className="p-3">NAFDAC</th><th className="p-3">System Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-500">{formatDate(app.createdAt)}</td>
                        <td className="p-3 font-mono font-bold">{app.id}</td>
                        <td className="p-3">{app.company} <br/><span className="text-gray-400">{app.rcNumber}</span></td>
                        <td className="p-3"><span className="text-green-600">{app.firsStatus}</span></td>
                        <td className="p-3"><span className={app.paymentStatus === "Paid" ? "text-green-600" : "text-red-500"}>{app.paymentStatus || "Unpaid"}</span></td>
                        <td className="p-3"><span className="text-blue-600">{app.customsStatus}</span></td>
                        <td className="p-3"><span className="text-amber-600">{app.nafdacStatus}</span></td>
                        <td className="p-3"><span className={`px-2 py-1 rounded font-bold ${app.overallStatus === "Approved" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{app.overallStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Document Inspector Modal */}
      {viewingDocs && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 text-black shadow-2xl">
            <h3 className="text-lg font-bold text-green-900 border-b pb-2">Application Documents: {viewingDocs.id}</h3>
            <p className="text-xs text-gray-600">Submitted by: <strong>{viewingDocs.company}</strong></p>
            <div className="space-y-2">
              {viewingDocs.documents?.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded border text-sm">
                  <span className="font-mono text-xs">{doc}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">Verified Secure</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingDocs(null)} className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded text-xs font-bold">Close Inspector</button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Clearance Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 border-4 border-green-800 shadow-2xl relative space-y-6 text-black">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-extrabold text-green-900 uppercase tracking-wider">Federal Republic of Nigeria</h2>
              <p className="text-sm font-semibold text-gray-600">National Single Window (NSW) Enterprise Trade Portal</p>
              <h3 className="text-lg font-bold text-green-700 mt-2">ELECTRONIC PERMIT & CARGO RELEASE CERTIFICATE</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-green-50 p-4 rounded-xl border border-green-200">
              <div><strong>Application ID:</strong> <span className="font-mono font-bold">{selectedCertificate.id}</span></div>
              <div><strong>Permit Type:</strong> {selectedCertificate.type}</div>
              <div><strong>Beneficiary Company:</strong> {selectedCertificate.company}</div>
              <div><strong>CAC RC Number:</strong> <span className="font-mono">{selectedCertificate.rcNumber}</span></div>
              <div><strong>FIRS Tax TIN:</strong> <span className="font-mono">{selectedCertificate.tin}</span></div>
              <div><strong>Origin Country:</strong> {selectedCertificate.origin}</div>
              <div className="col-span-2"><strong>Product Description:</strong> {selectedCertificate.product}</div>
            </div>

            <div className="border-t border-b py-3 flex justify-between items-center text-xs text-gray-600">
              <div>
                <p className="font-bold text-green-800">MULTIDIMENSIONAL AGENCY VALIDATION:</p>
                <p>✓ FIRS Tax Verified | ✓ Remita TSA Paid | ✓ NCS Cleared | ✓ NAFDAC Inspected</p>
              </div>
              <div className="text-right font-mono text-[10px] bg-gray-100 p-2 rounded">
                DIGITAL HASH: SHA-256-NSW-2026-SECURE
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => window.print()} className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded text-xs font-bold">Print Certificate</button>
              <button onClick={() => setSelectedCertificate(null)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-bold">Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}