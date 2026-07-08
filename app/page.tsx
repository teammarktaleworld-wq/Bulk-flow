// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { getTemplate, buildWhatsAppURL, TEMPLATES, Template } from "@/lib/templates";

// type Contact = {
//   id: string;
//   name: string;
//   phone: string;
//   category: string;
//   status: string;
//   batchId: string;
//   sentAt?: string;
// };

// type Batch = {
//   id: string;
//   fileName: string;
//   totalCount: number;
//   sentCount: number;
//   createdAt: string;
// };

// type Stats = {
//   pending: number;
//   sent: number;
//   skipped: number;
//   failed: number;
// };

// export default function BulkFlowDashboard() {
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
//   const [currentContact, setCurrentContact] = useState<Contact | null>(null);
//   const [remaining, setRemaining] = useState(0);
//   const [stats, setStats] = useState<Stats>({ pending: 0, sent: 0, skipped: 0, failed: 0 });
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadResult, setUploadResult] = useState<{ total: number; batchId: string } | null>(null);
//   const [done, setDone] = useState(false);
//   const [sentCount, setSentCount] = useState(0);
//   const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [contactsTab, setContactsTab] = useState<"all" | "sent" | "pending" | "skipped">("all");
//   const [activeTab, setActiveTab] = useState<"send" | "contacts" | "batches">("send");
//   const [linkCopied, setLinkCopied] = useState(false);
//   const fileRef = useRef<HTMLInputElement>(null);
//   const waWindowRef = useRef<Window | null>(null);

//   // Fetch batches
//   const fetchBatches = useCallback(async () => {
//     const res = await fetch("/api/batches");
//     const data = await res.json();
//     setBatches(data.batches || []);
//   }, []);

//   // Fetch next contact
//   const fetchNext = useCallback(async (batchId?: string) => {
//     setLoading(true);
//     setLinkCopied(false);
//     const url = `/api/contacts/next${batchId ? `?batchId=${batchId}` : ""}`;
//     const res = await fetch(url);
//     const data = await res.json();
//     if (data.done || !data.contact) {
//       setDone(true);
//       setCurrentContact(null);
//     } else {
//       setCurrentContact(data.contact);
//       setRemaining(data.remaining);
//       setCurrentTemplate(getTemplate(data.contact.category));
//       setDone(false);
//     }
//     setLoading(false);
//   }, []);

//   // Fetch contacts list
//   const fetchContacts = useCallback(async (batchId?: string, status?: string) => {
//     const params = new URLSearchParams();
//     if (batchId) params.set("batchId", batchId);
//     if (status && status !== "all") params.set("status", status);
//     const res = await fetch(`/api/contacts?${params}`);
//     const data = await res.json();
//     setContacts(data.contacts || []);
//   }, []);

//   useEffect(() => {
//     fetchBatches();
//   }, [fetchBatches]);

//   useEffect(() => {
//     if (activeTab === "contacts") {
//       fetchContacts(selectedBatch || undefined, contactsTab);
//     }
//   }, [activeTab, contactsTab, selectedBatch, fetchContacts]);

//   // Upload handler
//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploading(true);
//     setUploadResult(null);

//     const form = new FormData();
//     form.append("file", file);

//     try {
//       const res = await fetch("/api/contacts/upload", { method: "POST", body: form });
//       const data = await res.json();
//       if (data.success) {
//         setUploadResult({ total: data.total, batchId: data.batchId });
//         setSelectedBatch(data.batchId);
//         await fetchBatches();
//         await fetchNext(data.batchId);
//         setSentCount(0);
//         setDone(false);
//       } else {
//         alert("Upload failed: " + data.error);
//       }
//     } catch {
//       alert("Upload error. Please try again.");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   // Mark current contact and open WhatsApp
//   const handleSend = async () => {
//     if (!currentContact || !currentTemplate) return;

//     const msg = currentTemplate.message(currentContact.name);
//     const url = buildWhatsAppURL(currentContact.phone, msg);

//     // Reuse the same window if it exists and is not closed
//     if (waWindowRef.current && !waWindowRef.current.closed) {
//       waWindowRef.current.location.href = url;
//       waWindowRef.current.focus();
//     } else {
//       waWindowRef.current = window.open(url, "whatsapp_bulkflow") as Window;
//     }

//     // Mark as sent
//     await fetch(`/api/contacts/${currentContact.id}/status`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: "sent" }),
//     });

//     setSentCount((c) => c + 1);
//     await fetchNext(selectedBatch || undefined);
//   };

//   const handleSkip = async () => {
//     if (!currentContact) return;
//     await fetch(`/api/contacts/${currentContact.id}/status`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: "skipped" }),
//     });
//     await fetchNext(selectedBatch || undefined);
//   };

//   const handleBatchSelect = async (batchId: string) => {
//     setSelectedBatch(batchId);
//     setSentCount(0);
//     setDone(false);
//     await fetchNext(batchId);
//   };

//   // Copy WhatsApp link to clipboard
//   const handleCopyLink = async () => {
//     if (!currentContact || !currentTemplate) return;
//     const msg = currentTemplate.message(currentContact.name);
//     const url = buildWhatsAppURL(currentContact.phone, msg);
//     try {
//       await navigator.clipboard.writeText(url);
//       setLinkCopied(true);
//       setTimeout(() => setLinkCopied(false), 2500);
//     } catch {
//       // Fallback: select a temp input
//       const el = document.createElement("input");
//       el.value = url;
//       document.body.appendChild(el);
//       el.select();
//       document.execCommand("copy");
//       document.body.removeChild(el);
//       setLinkCopied(true);
//       setTimeout(() => setLinkCopied(false), 2500);
//     }
//   };

//   const progressPct =
//     selectedBatch && batches.length
//       ? (() => {
//           const b = batches.find((b) => b.id === selectedBatch);
//           if (!b || b.totalCount === 0) return 0;
//           return Math.round((b.sentCount / b.totalCount) * 100);
//         })()
//       : 0;

//   // Compute the WhatsApp URL for current contact (for display)
//   const currentWaUrl =
//     currentContact && currentTemplate
//       ? buildWhatsAppURL(currentContact.phone, currentTemplate.message(currentContact.name))
//       : null;

//   return (
//     <div className="min-h-screen bg-[#0f1117] text-white font-sans">
//       {/* Header */}
//       <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-xl">
//             💬
//           </div>
//           <div>
//             <h1 className="text-lg font-bold tracking-tight">BulkFlow For Priya</h1>
//             <p className="text-xs text-white/40">WhatsApp Bulk Messenger</p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <nav className="flex gap-1 bg-white/5 rounded-xl p-1">
//           {(["send", "contacts", "batches"] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
//                 activeTab === tab
//                   ? "bg-[#25D366] text-black"
//                   : "text-white/50 hover:text-white"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </nav>

//         <div className="text-right">
//           <div className="text-2xl font-bold text-[#25D366]">{sentCount}</div>
//           <div className="text-xs text-white/40">sent this session</div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-6 py-8">

//         {/* ── SEND TAB ── */}
//         {activeTab === "send" && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//             {/* Left: Upload + Batch */}
//             <div className="space-y-4">
//               {/* Upload Card */}
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                 <h2 className="font-semibold mb-1 text-sm text-white/70 uppercase tracking-wider">
//                   1. Upload Contacts
//                 </h2>
//                 <p className="text-xs text-white/40 mb-4">
//                   CSV or Excel with columns: name, phone/number, category
//                 </p>

//                 <label className="block w-full cursor-pointer">
//                   <div className="border-2 border-dashed border-white/20 hover:border-[#25D366]/60 rounded-xl p-6 text-center transition-colors">
//                     {uploading ? (
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
//                         <span className="text-sm text-white/50">Uploading...</span>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="text-3xl mb-2">📂</div>
//                         <div className="text-sm text-white/60">Click to upload CSV / Excel</div>
//                         <div className="text-xs text-white/30 mt-1">.csv, .xls, .xlsx</div>
//                       </>
//                     )}
//                   </div>
//                   <input
//                     ref={fileRef}
//                     type="file"
//                     accept=".csv,.xls,.xlsx"
//                     onChange={handleUpload}
//                     className="hidden"
//                   />
//                 </label>

//                 {uploadResult && (
//                   <div className="mt-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-4 py-3">
//                     <p className="text-[#25D366] text-sm font-semibold">
//                       ✅ {uploadResult.total} contacts imported!
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Batch Selector */}
//               {batches.length > 0 && (
//                 <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                   <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">
//                     2. Select Batch
//                   </h2>
//                   <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//                     {batches.map((b) => {
//                       const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
//                       return (
//                         <button
//                           key={b.id}
//                           onClick={() => handleBatchSelect(b.id)}
//                           className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
//                             selectedBatch === b.id
//                               ? "border-[#25D366] bg-[#25D366]/10"
//                               : "border-white/10 hover:border-white/20"
//                           }`}
//                         >
//                           <div className="flex justify-between items-start mb-2">
//                             <span className="text-sm font-medium truncate max-w-[130px]">
//                               {b.fileName}
//                             </span>
//                             <span className="text-xs text-white/40">{pct}%</span>
//                           </div>
//                           <div className="w-full bg-white/10 rounded-full h-1.5">
//                             <div
//                               className="bg-[#25D366] h-1.5 rounded-full transition-all"
//                               style={{ width: `${pct}%` }}
//                             />
//                           </div>
//                           <div className="mt-1.5 text-xs text-white/40">
//                             {b.sentCount}/{b.totalCount} sent
//                           </div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Template Legend */}
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                 <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">
//                   Categories
//                 </h2>
//                 <div className="space-y-1.5">
//                   {TEMPLATES.map((t) => (
//                     <div key={t.category} className="flex items-center gap-2.5 text-sm">
//                       <span className="text-base">{t.emoji}</span>
//                       <span className="text-white/60">{t.label}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Center + Right: Active Send Panel */}
//             <div className="lg:col-span-2 space-y-4">
//               {!selectedBatch && (
//                 <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
//                   <div className="text-5xl mb-4">⬆️</div>
//                   <p className="text-white/50 text-sm">
//                     Upload a CSV file or select a batch to start sending
//                   </p>
//                 </div>
//               )}

//               {selectedBatch && done && (
//                 <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
//                   <div className="text-5xl mb-4">🎉</div>
//                   <h3 className="text-xl font-bold text-[#25D366] mb-2">All Done!</h3>
//                   <p className="text-white/50 text-sm">
//                     All contacts in this batch have been processed.
//                   </p>
//                   <p className="text-white/40 text-sm mt-1">
//                     You sent {sentCount} messages this session.
//                   </p>
//                 </div>
//               )}

//               {selectedBatch && !done && currentContact && currentTemplate && (
//                 <>
//                   {/* Progress Bar */}
//                   <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
//                     <div className="flex justify-between text-sm mb-2">
//                       <span className="text-white/50">Batch Progress</span>
//                       <span className="font-semibold text-[#25D366]">{progressPct}%</span>
//                     </div>
//                     <div className="w-full bg-white/10 rounded-full h-2">
//                       <div
//                         className="bg-gradient-to-r from-[#25D366] to-[#128C7E] h-2 rounded-full transition-all duration-500"
//                         style={{ width: `${progressPct}%` }}
//                       />
//                     </div>
//                     <div className="mt-2 text-xs text-white/40">
//                       {remaining} contacts remaining in queue
//                     </div>
//                   </div>

//                   {/* Current Contact Card */}
//                   <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
//                     <div className="flex items-start justify-between mb-5">
//                       <div>
//                         <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
//                           Next Contact
//                         </div>
//                         <h2 className="text-2xl font-bold">{currentContact.name}</h2>
//                         <div className="flex items-center gap-3 mt-1.5">
//                           <span className="text-white/50 text-sm font-mono">
//                             +{currentContact.phone}
//                           </span>
//                           <span
//                             className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${currentTemplate.color} bg-opacity-20 text-white`}
//                           >
//                             {currentTemplate.emoji} {currentTemplate.label}
//                           </span>
//                         </div>
//                       </div>
//                       {loading && (
//                         <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
//                       )}
//                     </div>

//                     {/* Message Preview */}
//                     <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 mb-4">
//                       <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
//                         <span>💬</span> Message Preview
//                       </div>
//                       <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
//                         {currentTemplate.message(currentContact.name)}
//                       </pre>
//                     </div>

//                     {/* ── WhatsApp Link Row ── */}
//                     {currentWaUrl && (
//                       <div className="mb-5 bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl px-4 py-3">
//                         <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
//                           <span>🔗</span> WhatsApp Link for this contact
//                         </div>
//                         <div className="flex items-center gap-2">
//                           {/* Scrollable link display */}
//                           <a
//                             href={currentWaUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="flex-1 min-w-0 text-xs font-mono text-[#25D366] truncate hover:underline"
//                             title={currentWaUrl}
//                           >
//                             {currentWaUrl}
//                           </a>

//                           {/* Copy button */}
//                           <button
//                             onClick={handleCopyLink}
//                             className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
//                               linkCopied
//                                 ? "bg-[#25D366]/20 border-[#25D366]/50 text-[#25D366]"
//                                 : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white"
//                             }`}
//                           >
//                             {linkCopied ? (
//                               <>
//                                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                                   <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                                 </svg>
//                                 Copied!
//                               </>
//                             ) : (
//                               <>
//                                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                                   <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
//                                   <path d="M8 4V2.8A.8.8 0 007.2 2H2.8A.8.8 0 002 2.8v4.4A.8.8 0 002.8 8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
//                                 </svg>
//                                 Copy Link
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     {/* Action Buttons */}
//                     <div className="flex gap-3">
//                       <button
//                         onClick={handleSend}
//                         disabled={loading}
//                         className="flex-1 bg-[#25D366] hover:bg-[#20c55a] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
//                       >
//                         <span>📤</span>
//                         Send on WhatsApp
//                       </button>
//                       <button
//                         onClick={handleSkip}
//                         disabled={loading}
//                         className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 font-medium transition-all"
//                       >
//                         Skip
//                       </button>
//                     </div>
//                     <p className="text-xs text-white/30 text-center mt-3">
//                       Click Send → WhatsApp Web opens pre-filled → just hit Send there
//                     </p>
//                   </div>

//                   {/* Quick Stats */}
//                   <div className="grid grid-cols-3 gap-3">
//                     {[
//                       { label: "Sent", value: sentCount, color: "text-[#25D366]" },
//                       { label: "Remaining", value: remaining, color: "text-yellow-400" },
//                       {
//                         label: "Total",
//                         value: batches.find((b) => b.id === selectedBatch)?.totalCount || 0,
//                         color: "text-white",
//                       },
//                     ].map((s) => (
//                       <div
//                         key={s.label}
//                         className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center"
//                       >
//                         <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
//                         <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── CONTACTS TAB ── */}
//         {activeTab === "contacts" && (
//           <div>
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="text-lg font-semibold">All Contacts</h2>
//               <div className="flex gap-1 bg-white/5 rounded-xl p-1">
//                 {(["all", "pending", "sent", "skipped"] as const).map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => setContactsTab(s)}
//                     className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
//                       contactsTab === s
//                         ? "bg-[#25D366] text-black"
//                         : "text-white/50 hover:text-white"
//                     }`}
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
//                     <th className="text-left px-5 py-3">Name</th>
//                     <th className="text-left px-5 py-3">Phone</th>
//                     <th className="text-left px-5 py-3">Category</th>
//                     <th className="text-left px-5 py-3">Status</th>
//                     <th className="text-left px-5 py-3">Sent At</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {contacts.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="text-center py-12 text-white/30">
//                         No contacts found
//                       </td>
//                     </tr>
//                   ) : (
//                     contacts.map((c) => {
//                       const t = getTemplate(c.category);
//                       return (
//                         <tr
//                           key={c.id}
//                           className="border-b border-white/5 hover:bg-white/5 transition-colors"
//                         >
//                           <td className="px-5 py-3 font-medium">{c.name}</td>
//                           <td className="px-5 py-3 font-mono text-white/60">+{c.phone}</td>
//                           <td className="px-5 py-3">
//                             <span className="text-sm">
//                               {t.emoji} {t.label}
//                             </span>
//                           </td>
//                           <td className="px-5 py-3">
//                             <span
//                               className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                 c.status === "sent"
//                                   ? "bg-green-500/20 text-green-400"
//                                   : c.status === "pending"
//                                   ? "bg-yellow-500/20 text-yellow-400"
//                                   : c.status === "skipped"
//                                   ? "bg-white/10 text-white/40"
//                                   : "bg-red-500/20 text-red-400"
//                               }`}
//                             >
//                               {c.status}
//                             </span>
//                           </td>
//                           <td className="px-5 py-3 text-white/40 text-xs">
//                             {c.sentAt
//                               ? new Date(c.sentAt).toLocaleString("en-IN", {
//                                   day: "2-digit",
//                                   month: "short",
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })
//                               : "—"}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* ── BATCHES TAB ── */}
//         {activeTab === "batches" && (
//           <div>
//             <h2 className="text-lg font-semibold mb-5">Upload History</h2>
//             <div className="space-y-3">
//               {batches.length === 0 ? (
//                 <div className="text-center py-16 text-white/30">No batches yet. Upload a CSV to get started.</div>
//               ) : (
//                 batches.map((b) => {
//                   const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
//                   return (
//                     <div
//                       key={b.id}
//                       className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex items-center gap-6"
//                     >
//                       <div className="flex-1">
//                         <div className="font-medium mb-0.5">{b.fileName}</div>
//                         <div className="text-xs text-white/40">
//                           {new Date(b.createdAt).toLocaleString("en-IN")}
//                         </div>
//                       </div>
//                       <div className="w-48">
//                         <div className="flex justify-between text-xs mb-1.5">
//                           <span className="text-white/50">{b.sentCount}/{b.totalCount}</span>
//                           <span className="text-[#25D366] font-semibold">{pct}%</span>
//                         </div>
//                         <div className="w-full bg-white/10 rounded-full h-2">
//                           <div
//                             className="bg-[#25D366] h-2 rounded-full"
//                             style={{ width: `${pct}%` }}
//                           />
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => {
//                           handleBatchSelect(b.id);
//                           setActiveTab("send");
//                         }}
//                         className="px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium rounded-xl transition-all"
//                       >
//                         Resume →
//                       </button>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }














// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { getTemplate, buildWhatsAppURL, TEMPLATES, Template } from "@/lib/templates";

// type Contact = {
//   id: string;
//   name: string;
//   phone: string;
//   category: string;
//   status: string;
//   batchId: string;
//   sentAt?: string;
// };

// type Batch = {
//   id: string;
//   fileName: string;
//   totalCount: number;
//   sentCount: number;
//   createdAt: string;
// };

// type Stats = {
//   pending: number;
//   sent: number;
//   skipped: number;
//   failed: number;
// };

// /**
//  * Builds a direct WhatsApp Web URL that skips the wa.me redirect.
//  * `api.whatsapp.com/send` opens the chat immediately without a redirect hop.
//  */
// function buildDirectWaUrl(phone: string, message: string): string {
//   // Strip all non-digits, ensure no leading +
//   const cleaned = phone.replace(/\D/g, "");
//   const encoded = encodeURIComponent(message);
//   return `https://web.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
// }

// export default function BulkFlowDashboard() {
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
//   const [currentContact, setCurrentContact] = useState<Contact | null>(null);
//   const [remaining, setRemaining] = useState(0);
//   const [stats, setStats] = useState<Stats>({ pending: 0, sent: 0, skipped: 0, failed: 0 });
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadResult, setUploadResult] = useState<{ total: number; batchId: string } | null>(null);
//   const [done, setDone] = useState(false);
//   const [sentCount, setSentCount] = useState(0);
//   const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [contactsTab, setContactsTab] = useState<"all" | "sent" | "pending" | "skipped">("all");
//   const [activeTab, setActiveTab] = useState<"send" | "contacts" | "batches">("send");
//   const [linkCopied, setLinkCopied] = useState(false);
//   const [waReady, setWaReady] = useState(false);

//   const fileRef = useRef<HTMLInputElement>(null);
//   // Single persistent WhatsApp Web window — opened once, reused forever
//   const waWindowRef = useRef<Window | null>(null);

//   // ─── Pre-warm: open WhatsApp Web tab once on mount ───────────────────────
//   // Opens a blank WhatsApp Web tab so the user can log in / it stays loaded.
//   // All subsequent sends just update location.href — no new tab, no cold load.
//   const openWaTab = useCallback(() => {
//     if (waWindowRef.current && !waWindowRef.current.closed) {
//       waWindowRef.current.focus();
//       setWaReady(true);
//       return;
//     }
//     const win = window.open("https://web.whatsapp.com", "bulkflow_wa");
//     if (win) {
//       waWindowRef.current = win;
//       setWaReady(true);
//     }
//   }, []);

//   // Fetch batches
//   const fetchBatches = useCallback(async () => {
//     const res = await fetch("/api/batches");
//     const data = await res.json();
//     setBatches(data.batches || []);
//   }, []);

//   // Fetch next contact
//   const fetchNext = useCallback(async (batchId?: string) => {
//     setLoading(true);
//     setLinkCopied(false);
//     const url = `/api/contacts/next${batchId ? `?batchId=${batchId}` : ""}`;
//     const res = await fetch(url);
//     const data = await res.json();
//     if (data.done || !data.contact) {
//       setDone(true);
//       setCurrentContact(null);
//     } else {
//       setCurrentContact(data.contact);
//       setRemaining(data.remaining);
//       setCurrentTemplate(getTemplate(data.contact.category));
//       setDone(false);
//     }
//     setLoading(false);
//   }, []);

//   // Fetch contacts list
//   const fetchContacts = useCallback(async (batchId?: string, status?: string) => {
//     const params = new URLSearchParams();
//     if (batchId) params.set("batchId", batchId);
//     if (status && status !== "all") params.set("status", status);
//     const res = await fetch(`/api/contacts?${params}`);
//     const data = await res.json();
//     setContacts(data.contacts || []);
//   }, []);

//   useEffect(() => {
//     fetchBatches();
//   }, [fetchBatches]);

//   useEffect(() => {
//     if (activeTab === "contacts") {
//       fetchContacts(selectedBatch || undefined, contactsTab);
//     }
//   }, [activeTab, contactsTab, selectedBatch, fetchContacts]);

//   // Upload handler
//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploading(true);
//     setUploadResult(null);

//     const form = new FormData();
//     form.append("file", file);

//     try {
//       const res = await fetch("/api/contacts/upload", { method: "POST", body: form });
//       const data = await res.json();
//       if (data.success) {
//         setUploadResult({ total: data.total, batchId: data.batchId });
//         setSelectedBatch(data.batchId);
//         await fetchBatches();
//         await fetchNext(data.batchId);
//         setSentCount(0);
//         setDone(false);
//       } else {
//         alert("Upload failed: " + data.error);
//       }
//     } catch {
//       alert("Upload error. Please try again.");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   // ─── SEND ────────────────────────────────────────────────────────────────
//   // Does NOT open a new tab. Just updates location.href on the existing tab.
//   // Mark as sent and fetch next contact fire in parallel with the WA navigation.
//   const handleSend = async () => {
//     if (!currentContact || !currentTemplate) return;

//     const msg = currentTemplate.message(currentContact.name);
//     const url = buildDirectWaUrl(currentContact.phone, msg);

//     // Navigate the existing WhatsApp tab — instant, no new tab
//     if (waWindowRef.current && !waWindowRef.current.closed) {
//       waWindowRef.current.location.href = url;
//       waWindowRef.current.focus();
//     } else {
//       // Tab was closed — reopen (shouldn't happen if pre-warmed)
//       const win = window.open(url, "bulkflow_wa");
//       if (win) waWindowRef.current = win;
//     }

//     // Fire status update + fetch next in parallel — don't await sequentially
//     setSentCount((c) => c + 1);
//     const markSent = fetch(`/api/contacts/${currentContact.id}/status`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: "sent" }),
//     });
//     const nextContact = fetchNext(selectedBatch || undefined);
//     await Promise.all([markSent, nextContact]);
//   };

//   const handleSkip = async () => {
//     if (!currentContact) return;
//     // Fire both in parallel
//     const markSkipped = fetch(`/api/contacts/${currentContact.id}/status`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: "skipped" }),
//     });
//     const nextContact = fetchNext(selectedBatch || undefined);
//     await Promise.all([markSkipped, nextContact]);
//   };

//   const handleBatchSelect = async (batchId: string) => {
//     setSelectedBatch(batchId);
//     setSentCount(0);
//     setDone(false);
//     await fetchNext(batchId);
//   };

//   // Copy WhatsApp link to clipboard
//   const handleCopyLink = async () => {
//     if (!currentContact || !currentTemplate) return;
//     const msg = currentTemplate.message(currentContact.name);
//     const url = buildDirectWaUrl(currentContact.phone, msg);
//     try {
//       await navigator.clipboard.writeText(url);
//     } catch {
//       const el = document.createElement("input");
//       el.value = url;
//       document.body.appendChild(el);
//       el.select();
//       document.execCommand("copy");
//       document.body.removeChild(el);
//     }
//     setLinkCopied(true);
//     setTimeout(() => setLinkCopied(false), 2500);
//   };

//   const progressPct =
//     selectedBatch && batches.length
//       ? (() => {
//           const b = batches.find((b) => b.id === selectedBatch);
//           if (!b || b.totalCount === 0) return 0;
//           return Math.round((b.sentCount / b.totalCount) * 100);
//         })()
//       : 0;

//   const currentWaUrl =
//     currentContact && currentTemplate
//       ? buildDirectWaUrl(currentContact.phone, currentTemplate.message(currentContact.name))
//       : null;

//   return (
//     <div className="min-h-screen bg-[#0f1117] text-white font-sans">
//       {/* Header */}
//       <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-xl">
//             💬
//           </div>
//           <div>
//             <h1 className="text-lg font-bold tracking-tight">BulkFlow For Priya</h1>
//             <p className="text-xs text-white/40">WhatsApp Bulk Messenger</p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <nav className="flex gap-1 bg-white/5 rounded-xl p-1">
//           {(["send", "contacts", "batches"] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
//                 activeTab === tab
//                   ? "bg-[#25D366] text-black"
//                   : "text-white/50 hover:text-white"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </nav>

//         <div className="flex items-center gap-4">
//           {/* Pre-warm button */}
//           <button
//             onClick={openWaTab}
//             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
//               waReady
//                 ? "border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366]"
//                 : "border-white/20 bg-white/5 text-white/50 hover:text-white hover:border-white/40"
//             }`}
//             title="Open WhatsApp Web tab so it stays loaded and ready"
//           >
//             <span className={`w-1.5 h-1.5 rounded-full ${waReady ? "bg-[#25D366]" : "bg-white/30"}`} />
//             {waReady ? "WA Ready" : "Open WA Tab"}
//           </button>

//           <div className="text-right">
//             <div className="text-2xl font-bold text-[#25D366]">{sentCount}</div>
//             <div className="text-xs text-white/40">sent this session</div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-6 py-8">

//         {/* ── SEND TAB ── */}
//         {activeTab === "send" && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//             {/* Left: Upload + Batch */}
//             <div className="space-y-4">
//               {/* Upload Card */}
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                 <h2 className="font-semibold mb-1 text-sm text-white/70 uppercase tracking-wider">
//                   1. Upload Contacts
//                 </h2>
//                 <p className="text-xs text-white/40 mb-4">
//                   CSV or Excel with columns: name, phone/number, category
//                 </p>

//                 <label className="block w-full cursor-pointer">
//                   <div className="border-2 border-dashed border-white/20 hover:border-[#25D366]/60 rounded-xl p-6 text-center transition-colors">
//                     {uploading ? (
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
//                         <span className="text-sm text-white/50">Uploading...</span>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="text-3xl mb-2">📂</div>
//                         <div className="text-sm text-white/60">Click to upload CSV / Excel</div>
//                         <div className="text-xs text-white/30 mt-1">.csv, .xls, .xlsx</div>
//                       </>
//                     )}
//                   </div>
//                   <input
//                     ref={fileRef}
//                     type="file"
//                     accept=".csv,.xls,.xlsx"
//                     onChange={handleUpload}
//                     className="hidden"
//                   />
//                 </label>

//                 {uploadResult && (
//                   <div className="mt-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-4 py-3">
//                     <p className="text-[#25D366] text-sm font-semibold">
//                       ✅ {uploadResult.total} contacts imported!
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Batch Selector */}
//               {batches.length > 0 && (
//                 <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                   <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">
//                     2. Select Batch
//                   </h2>
//                   <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//                     {batches.map((b) => {
//                       const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
//                       return (
//                         <button
//                           key={b.id}
//                           onClick={() => handleBatchSelect(b.id)}
//                           className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
//                             selectedBatch === b.id
//                               ? "border-[#25D366] bg-[#25D366]/10"
//                               : "border-white/10 hover:border-white/20"
//                           }`}
//                         >
//                           <div className="flex justify-between items-start mb-2">
//                             <span className="text-sm font-medium truncate max-w-[130px]">
//                               {b.fileName}
//                             </span>
//                             <span className="text-xs text-white/40">{pct}%</span>
//                           </div>
//                           <div className="w-full bg-white/10 rounded-full h-1.5">
//                             <div
//                               className="bg-[#25D366] h-1.5 rounded-full transition-all"
//                               style={{ width: `${pct}%` }}
//                             />
//                           </div>
//                           <div className="mt-1.5 text-xs text-white/40">
//                             {b.sentCount}/{b.totalCount} sent
//                           </div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Template Legend */}
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                 <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">
//                   Categories
//                 </h2>
//                 <div className="space-y-1.5">
//                   {TEMPLATES.map((t) => (
//                     <div key={t.category} className="flex items-center gap-2.5 text-sm">
//                       <span className="text-base">{t.emoji}</span>
//                       <span className="text-white/60">{t.label}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Center + Right: Active Send Panel */}
//             <div className="lg:col-span-2 space-y-4">
//               {!selectedBatch && (
//                 <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
//                   <div className="text-5xl mb-4">⬆️</div>
//                   <p className="text-white/50 text-sm">
//                     Upload a CSV file or select a batch to start sending
//                   </p>
//                 </div>
//               )}

//               {selectedBatch && done && (
//                 <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
//                   <div className="text-5xl mb-4">🎉</div>
//                   <h3 className="text-xl font-bold text-[#25D366] mb-2">All Done!</h3>
//                   <p className="text-white/50 text-sm">
//                     All contacts in this batch have been processed.
//                   </p>
//                   <p className="text-white/40 text-sm mt-1">
//                     You sent {sentCount} messages this session.
//                   </p>
//                 </div>
//               )}

//               {selectedBatch && !done && currentContact && currentTemplate && (
//                 <>
//                   {/* Progress Bar */}
//                   <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
//                     <div className="flex justify-between text-sm mb-2">
//                       <span className="text-white/50">Batch Progress</span>
//                       <span className="font-semibold text-[#25D366]">{progressPct}%</span>
//                     </div>
//                     <div className="w-full bg-white/10 rounded-full h-2">
//                       <div
//                         className="bg-gradient-to-r from-[#25D366] to-[#128C7E] h-2 rounded-full transition-all duration-500"
//                         style={{ width: `${progressPct}%` }}
//                       />
//                     </div>
//                     <div className="mt-2 text-xs text-white/40">
//                       {remaining} contacts remaining in queue
//                     </div>
//                   </div>

//                   {/* Current Contact Card */}
//                   <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
//                     <div className="flex items-start justify-between mb-5">
//                       <div>
//                         <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
//                           Next Contact
//                         </div>
//                         <h2 className="text-2xl font-bold">{currentContact.name}</h2>
//                         <div className="flex items-center gap-3 mt-1.5">
//                           <span className="text-white/50 text-sm font-mono">
//                             +{currentContact.phone}
//                           </span>
//                           <span
//                             className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${currentTemplate.color} bg-opacity-20 text-white`}
//                           >
//                             {currentTemplate.emoji} {currentTemplate.label}
//                           </span>
//                         </div>
//                       </div>
//                       {loading && (
//                         <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
//                       )}
//                     </div>

//                     {/* Message Preview */}
//                     <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 mb-4">
//                       <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
//                         <span>💬</span> Message Preview
//                       </div>
//                       <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
//                         {currentTemplate.message(currentContact.name)}
//                       </pre>
//                     </div>

//                     {/* WhatsApp Link Row */}
//                     {currentWaUrl && (
//                       <div className="mb-5 bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl px-4 py-3">
//                         <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
//                           <span>🔗</span> WhatsApp Direct Link
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <a
//                             href={currentWaUrl}
//                             target="bulkflow_wa"
//                             rel="noopener noreferrer"
//                             className="flex-1 min-w-0 text-xs font-mono text-[#25D366] truncate hover:underline"
//                             title={currentWaUrl}
//                           >
//                             {currentWaUrl}
//                           </a>
//                           <button
//                             onClick={handleCopyLink}
//                             className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
//                               linkCopied
//                                 ? "bg-[#25D366]/20 border-[#25D366]/50 text-[#25D366]"
//                                 : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white"
//                             }`}
//                           >
//                             {linkCopied ? (
//                               <>
//                                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                                   <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                                 </svg>
//                                 Copied!
//                               </>
//                             ) : (
//                               <>
//                                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                                   <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
//                                   <path d="M8 4V2.8A.8.8 0 007.2 2H2.8A.8.8 0 002 2.8v4.4A.8.8 0 002.8 8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
//                                 </svg>
//                                 Copy Link
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     {/* Action Buttons */}
//                     <div className="flex gap-3">
//                       <button
//                         onClick={handleSend}
//                         disabled={loading}
//                         className="flex-1 bg-[#25D366] hover:bg-[#20c55a] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
//                       >
//                         <span>📤</span>
//                         Send on WhatsApp
//                       </button>
//                       <button
//                         onClick={handleSkip}
//                         disabled={loading}
//                         className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 font-medium transition-all"
//                       >
//                         Skip
//                       </button>
//                     </div>

//                     {/* Speed tip */}
//                     {!waReady && (
//                       <div className="mt-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
//                         <span className="text-yellow-400 text-sm">⚡</span>
//                         <p className="text-xs text-yellow-400/80">
//                           Click{" "}
//                           <button onClick={openWaTab} className="underline font-semibold">
//                             Open WA Tab
//                           </button>{" "}
//                           in the header to pre-load WhatsApp Web — makes every send instant.
//                         </p>
//                       </div>
//                     )}
//                     {waReady && (
//                       <p className="text-xs text-white/30 text-center mt-3">
//                         WhatsApp tab is open — sends navigate directly, no new tab opens.
//                       </p>
//                     )}
//                   </div>

//                   {/* Quick Stats */}
//                   <div className="grid grid-cols-3 gap-3">
//                     {[
//                       { label: "Sent", value: sentCount, color: "text-[#25D366]" },
//                       { label: "Remaining", value: remaining, color: "text-yellow-400" },
//                       {
//                         label: "Total",
//                         value: batches.find((b) => b.id === selectedBatch)?.totalCount || 0,
//                         color: "text-white",
//                       },
//                     ].map((s) => (
//                       <div
//                         key={s.label}
//                         className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center"
//                       >
//                         <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
//                         <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── CONTACTS TAB ── */}
//         {activeTab === "contacts" && (
//           <div>
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="text-lg font-semibold">All Contacts</h2>
//               <div className="flex gap-1 bg-white/5 rounded-xl p-1">
//                 {(["all", "pending", "sent", "skipped"] as const).map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => setContactsTab(s)}
//                     className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
//                       contactsTab === s
//                         ? "bg-[#25D366] text-black"
//                         : "text-white/50 hover:text-white"
//                     }`}
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
//                     <th className="text-left px-5 py-3">Name</th>
//                     <th className="text-left px-5 py-3">Phone</th>
//                     <th className="text-left px-5 py-3">Category</th>
//                     <th className="text-left px-5 py-3">Status</th>
//                     <th className="text-left px-5 py-3">Sent At</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {contacts.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="text-center py-12 text-white/30">
//                         No contacts found
//                       </td>
//                     </tr>
//                   ) : (
//                     contacts.map((c) => {
//                       const t = getTemplate(c.category);
//                       return (
//                         <tr
//                           key={c.id}
//                           className="border-b border-white/5 hover:bg-white/5 transition-colors"
//                         >
//                           <td className="px-5 py-3 font-medium">{c.name}</td>
//                           <td className="px-5 py-3 font-mono text-white/60">+{c.phone}</td>
//                           <td className="px-5 py-3">
//                             <span className="text-sm">
//                               {t.emoji} {t.label}
//                             </span>
//                           </td>
//                           <td className="px-5 py-3">
//                             <span
//                               className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                 c.status === "sent"
//                                   ? "bg-green-500/20 text-green-400"
//                                   : c.status === "pending"
//                                   ? "bg-yellow-500/20 text-yellow-400"
//                                   : c.status === "skipped"
//                                   ? "bg-white/10 text-white/40"
//                                   : "bg-red-500/20 text-red-400"
//                               }`}
//                             >
//                               {c.status}
//                             </span>
//                           </td>
//                           <td className="px-5 py-3 text-white/40 text-xs">
//                             {c.sentAt
//                               ? new Date(c.sentAt).toLocaleString("en-IN", {
//                                   day: "2-digit",
//                                   month: "short",
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })
//                               : "—"}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* ── BATCHES TAB ── */}
//         {activeTab === "batches" && (
//           <div>
//             <h2 className="text-lg font-semibold mb-5">Upload History</h2>
//             <div className="space-y-3">
//               {batches.length === 0 ? (
//                 <div className="text-center py-16 text-white/30">No batches yet. Upload a CSV to get started.</div>
//               ) : (
//                 batches.map((b) => {
//                   const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
//                   return (
//                     <div
//                       key={b.id}
//                       className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex items-center gap-6"
//                     >
//                       <div className="flex-1">
//                         <div className="font-medium mb-0.5">{b.fileName}</div>
//                         <div className="text-xs text-white/40">
//                           {new Date(b.createdAt).toLocaleString("en-IN")}
//                         </div>
//                       </div>
//                       <div className="w-48">
//                         <div className="flex justify-between text-xs mb-1.5">
//                           <span className="text-white/50">{b.sentCount}/{b.totalCount}</span>
//                           <span className="text-[#25D366] font-semibold">{pct}%</span>
//                         </div>
//                         <div className="w-full bg-white/10 rounded-full h-2">
//                           <div
//                             className="bg-[#25D366] h-2 rounded-full"
//                             style={{ width: `${pct}%` }}
//                           />
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => {
//                           handleBatchSelect(b.id);
//                           setActiveTab("send");
//                         }}
//                         className="px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium rounded-xl transition-all"
//                       >
//                         Resume →
//                       </button>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }














// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { getTemplate, buildWhatsAppURL, TEMPLATES, Template } from "@/lib/templates";

// type Contact = {
//   id: string;
//   name: string;
//   phone: string;
//   category: string;
//   status: string;
//   batchId: string;
//   sentAt?: string;
// };

// type Batch = {
//   id: string;
//   fileName: string;
//   totalCount: number;
//   sentCount: number;
//   createdAt: string;
// };

// type Stats = {
//   pending: number;
//   sent: number;
//   skipped: number;
//   failed: number;
// };

// function buildDirectWaUrl(phone: string, message: string): string {
//   const cleaned = phone.replace(/\D/g, "");
//   const encoded = encodeURIComponent(message);
//   return `https://web.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
// }

// export default function BulkFlowDashboard() {
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
//   const [currentContact, setCurrentContact] = useState<Contact | null>(null);
//   const [remaining, setRemaining] = useState(0);
//   const [stats, setStats] = useState<Stats>({ pending: 0, sent: 0, skipped: 0, failed: 0 });
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadResult, setUploadResult] = useState<{ total: number; batchId: string } | null>(null);
//   const [done, setDone] = useState(false);
//   const [sentCount, setSentCount] = useState(0);
//   const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [contactsTab, setContactsTab] = useState<"all" | "sent" | "pending" | "skipped">("all");
//   const [activeTab, setActiveTab] = useState<"send" | "contacts" | "batches">("send");
//   const [linkCopied, setLinkCopied] = useState(false);
//   const [waReady, setWaReady] = useState(false);

//   const fileRef = useRef<HTMLInputElement>(null);
//   const waWindowRef = useRef<Window | null>(null);

//   const openWaTab = useCallback(() => {
//     if (waWindowRef.current && !waWindowRef.current.closed) {
//       waWindowRef.current.focus();
//       setWaReady(true);
//       return;
//     }
//     const win = window.open("https://web.whatsapp.com", "bulkflow_wa");
//     if (win) {
//       waWindowRef.current = win;
//       setWaReady(true);
//     }
//   }, []);

//   const fetchBatches = useCallback(async () => {
//     const res = await fetch("/api/batches");
//     const data = await res.json();
//     setBatches(data.batches || []);
//   }, []);

//   const fetchNext = useCallback(async (batchId?: string) => {
//     setLoading(true);
//     setLinkCopied(false);
//     const url = `/api/contacts/next${batchId ? `?batchId=${batchId}` : ""}`;
//     const res = await fetch(url);
//     const data = await res.json();
//     if (data.done || !data.contact) {
//       setDone(true);
//       setCurrentContact(null);
//     } else {
//       setCurrentContact(data.contact);
//       setRemaining(data.remaining);
//       setCurrentTemplate(getTemplate(data.contact.category));
//       setDone(false);
//     }
//     setLoading(false);
//   }, []);

//   const fetchContacts = useCallback(async (batchId?: string, status?: string) => {
//     const params = new URLSearchParams();
//     if (batchId) params.set("batchId", batchId);
//     if (status && status !== "all") params.set("status", status);
//     const res = await fetch(`/api/contacts?${params}`);
//     const data = await res.json();
//     setContacts(data.contacts || []);
//   }, []);

//   useEffect(() => { fetchBatches(); }, [fetchBatches]);

//   useEffect(() => {
//     if (activeTab === "contacts") {
//       fetchContacts(selectedBatch || undefined, contactsTab);
//     }
//   }, [activeTab, contactsTab, selectedBatch, fetchContacts]);

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploading(true);
//     setUploadResult(null);
//     const form = new FormData();
//     form.append("file", file);
//     try {
//       const res = await fetch("/api/contacts/upload", { method: "POST", body: form });
//       const data = await res.json();
//       if (data.success) {
//         setUploadResult({ total: data.total, batchId: data.batchId });
//         setSelectedBatch(data.batchId);
//         await fetchBatches();
//         await fetchNext(data.batchId);
//         setSentCount(0);
//         setDone(false);
//       } else {
//         alert("Upload failed: " + data.error);
//       }
//     } catch {
//       alert("Upload error. Please try again.");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   const handleSend = async () => {
//     if (!currentContact || !currentTemplate) return;
//     const msg = currentTemplate.message(currentContact.name);
//     const url = buildDirectWaUrl(currentContact.phone, msg);
//     if (waWindowRef.current && !waWindowRef.current.closed) {
//       waWindowRef.current.location.href = url;
//       waWindowRef.current.focus();
//     } else {
//       const win = window.open(url, "bulkflow_wa");
//       if (win) waWindowRef.current = win;
//     }
//     setSentCount((c) => c + 1);
//     await Promise.all([
//       fetch(`/api/contacts/${currentContact.id}/status`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: "sent" }),
//       }),
//       fetchNext(selectedBatch || undefined),
//     ]);
//   };

//   const handleSkip = async () => {
//     if (!currentContact) return;
//     await Promise.all([
//       fetch(`/api/contacts/${currentContact.id}/status`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: "skipped" }),
//       }),
//       fetchNext(selectedBatch || undefined),
//     ]);
//   };

//   const handleBatchSelect = async (batchId: string) => {
//     setSelectedBatch(batchId);
//     setSentCount(0);
//     setDone(false);
//     await fetchNext(batchId);
//   };

//   const handleCopyLink = async () => {
//     if (!currentContact || !currentTemplate) return;
//     const url = buildDirectWaUrl(currentContact.phone, currentTemplate.message(currentContact.name));
//     try {
//       await navigator.clipboard.writeText(url);
//     } catch {
//       const el = document.createElement("input");
//       el.value = url;
//       document.body.appendChild(el);
//       el.select();
//       document.execCommand("copy");
//       document.body.removeChild(el);
//     }
//     setLinkCopied(true);
//     setTimeout(() => setLinkCopied(false), 2500);
//   };

//   const progressPct =
//     selectedBatch && batches.length
//       ? (() => {
//           const b = batches.find((b) => b.id === selectedBatch);
//           if (!b || b.totalCount === 0) return 0;
//           return Math.round((b.sentCount / b.totalCount) * 100);
//         })()
//       : 0;

//   const currentWaUrl =
//     currentContact && currentTemplate
//       ? buildDirectWaUrl(currentContact.phone, currentTemplate.message(currentContact.name))
//       : null;

//   return (
//     <div className="min-h-screen bg-[#0f1117] text-white font-sans">
//       {/* Header */}
//       <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-xl">💬</div>
//           <div>
//             <h1 className="text-lg font-bold tracking-tight">BulkFlow For Priya</h1>
//             <p className="text-xs text-white/40">WhatsApp Bulk Messenger</p>
//           </div>
//         </div>

//         <nav className="flex gap-1 bg-white/5 rounded-xl p-1">
//           {(["send", "contacts", "batches"] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
//                 activeTab === tab ? "bg-[#25D366] text-black" : "text-white/50 hover:text-white"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </nav>

//         <div className="flex items-center gap-4">
//           <button
//             onClick={openWaTab}
//             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
//               waReady
//                 ? "border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366]"
//                 : "border-white/20 bg-white/5 text-white/50 hover:text-white hover:border-white/40"
//             }`}
//           >
//             <span className={`w-1.5 h-1.5 rounded-full ${waReady ? "bg-[#25D366]" : "bg-white/30"}`} />
//             {waReady ? "WA Ready" : "Open WA Tab"}
//           </button>
//           <div className="text-right">
//             <div className="text-2xl font-bold text-[#25D366]">{sentCount}</div>
//             <div className="text-xs text-white/40">sent this session</div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-6 py-8">

//         {/* ── SEND TAB ── */}
//         {activeTab === "send" && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//             <div className="space-y-4">
//               {/* Upload */}
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                 <h2 className="font-semibold mb-1 text-sm text-white/70 uppercase tracking-wider">1. Upload Contacts</h2>
//                 <p className="text-xs text-white/40 mb-4">CSV or Excel with columns: name, phone/number, category</p>
//                 <label className="block w-full cursor-pointer">
//                   <div className="border-2 border-dashed border-white/20 hover:border-[#25D366]/60 rounded-xl p-6 text-center transition-colors">
//                     {uploading ? (
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
//                         <span className="text-sm text-white/50">Uploading...</span>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="text-3xl mb-2">📂</div>
//                         <div className="text-sm text-white/60">Click to upload CSV / Excel</div>
//                         <div className="text-xs text-white/30 mt-1">.csv, .xls, .xlsx</div>
//                       </>
//                     )}
//                   </div>
//                   <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" onChange={handleUpload} className="hidden" />
//                 </label>
//                 {uploadResult && (
//                   <div className="mt-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-4 py-3">
//                     <p className="text-[#25D366] text-sm font-semibold">✅ {uploadResult.total} contacts imported!</p>
//                   </div>
//                 )}
//               </div>

//               {/* Batch Selector */}
//               {batches.length > 0 && (
//                 <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                   <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">2. Select Batch</h2>
//                   <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//                     {batches.map((b) => {
//                       const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
//                       return (
//                         <button
//                           key={b.id}
//                           onClick={() => handleBatchSelect(b.id)}
//                           className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
//                             selectedBatch === b.id ? "border-[#25D366] bg-[#25D366]/10" : "border-white/10 hover:border-white/20"
//                           }`}
//                         >
//                           <div className="flex justify-between items-start mb-2">
//                             <span className="text-sm font-medium truncate max-w-[130px]">{b.fileName}</span>
//                             <span className="text-xs text-white/40">{pct}%</span>
//                           </div>
//                           <div className="w-full bg-white/10 rounded-full h-1.5">
//                             <div className="bg-[#25D366] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
//                           </div>
//                           <div className="mt-1.5 text-xs text-white/40">{b.sentCount}/{b.totalCount} sent</div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Template Legend */}
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                 <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">Categories</h2>
//                 <div className="space-y-1.5">
//                   {TEMPLATES.map((t) => (
//                     <div key={t.category} className="flex items-center gap-2.5 text-sm">
//                       <span className="text-base">{t.emoji}</span>
//                       <span className="text-white/60">{t.label}</span>
//                       {t.imagePath && (
//                         <span className="ml-auto text-xs text-pink-400/70 flex items-center gap-1">
//                           <span>🖼️</span> image
//                         </span>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Send Panel */}
//             <div className="lg:col-span-2 space-y-4">
//               {!selectedBatch && (
//                 <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
//                   <div className="text-5xl mb-4">⬆️</div>
//                   <p className="text-white/50 text-sm">Upload a CSV file or select a batch to start sending</p>
//                 </div>
//               )}

//               {selectedBatch && done && (
//                 <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
//                   <div className="text-5xl mb-4">🎉</div>
//                   <h3 className="text-xl font-bold text-[#25D366] mb-2">All Done!</h3>
//                   <p className="text-white/50 text-sm">All contacts in this batch have been processed.</p>
//                   <p className="text-white/40 text-sm mt-1">You sent {sentCount} messages this session.</p>
//                 </div>
//               )}

//               {selectedBatch && !done && currentContact && currentTemplate && (
//                 <>
//                   {/* Progress */}
//                   <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
//                     <div className="flex justify-between text-sm mb-2">
//                       <span className="text-white/50">Batch Progress</span>
//                       <span className="font-semibold text-[#25D366]">{progressPct}%</span>
//                     </div>
//                     <div className="w-full bg-white/10 rounded-full h-2">
//                       <div
//                         className="bg-gradient-to-r from-[#25D366] to-[#128C7E] h-2 rounded-full transition-all duration-500"
//                         style={{ width: `${progressPct}%` }}
//                       />
//                     </div>
//                     <div className="mt-2 text-xs text-white/40">{remaining} contacts remaining in queue</div>
//                   </div>

//                   {/* Contact Card */}
//                   <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
//                     {/* Contact Header */}
//                     <div className="flex items-start justify-between mb-5">
//                       <div>
//                         <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Next Contact</div>
//                         <h2 className="text-2xl font-bold">{currentContact.name}</h2>
//                         <div className="flex items-center gap-3 mt-1.5">
//                           <span className="text-white/50 text-sm font-mono">+{currentContact.phone}</span>
//                           <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${currentTemplate.color} bg-opacity-20 text-white`}>
//                             {currentTemplate.emoji} {currentTemplate.label}
//                           </span>
//                         </div>
//                       </div>
//                       {loading && <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />}
//                     </div>

//                     {/* Image Attachment — shown only when template has imagePath */}
//                     {currentTemplate.imagePath && (
//                       <div className="mb-4 flex items-start gap-4 bg-pink-500/5 border border-pink-500/20 rounded-xl px-4 py-3">
//                         <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
//                           <img
//                             src={currentTemplate.imagePath}
//                             alt="Template image"
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                         <div>
//                           <div className="text-xs font-semibold text-pink-300 mb-1">📎 Image attachment</div>
//                           <div className="text-xs text-white/50 mb-1">{currentTemplate.imagePath.split("/").pop()}</div>
//                           <div className="text-xs text-yellow-400/80 leading-relaxed">
//                             WhatsApp Web links can't auto-attach images.<br />
//                             Open the chat, then manually send this image.
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Message Preview */}
//                     <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 mb-4">
//                       <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
//                         <span>💬</span> Message Preview
//                       </div>
//                       <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
//                         {currentTemplate.message(currentContact.name)}
//                       </pre>
//                     </div>

//                     {/* WhatsApp Link Row */}
//                     {currentWaUrl && (
//                       <div className="mb-5 bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl px-4 py-3">
//                         <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
//                           <span>🔗</span> WhatsApp Direct Link
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <a
//                             href={currentWaUrl}
//                             target="bulkflow_wa"
//                             rel="noopener noreferrer"
//                             className="flex-1 min-w-0 text-xs font-mono text-[#25D366] truncate hover:underline"
//                             title={currentWaUrl}
//                           >
//                             {currentWaUrl}
//                           </a>
//                           <button
//                             onClick={handleCopyLink}
//                             className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
//                               linkCopied
//                                 ? "bg-[#25D366]/20 border-[#25D366]/50 text-[#25D366]"
//                                 : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white"
//                             }`}
//                           >
//                             {linkCopied ? (
//                               <>
//                                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                                   <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                                 </svg>
//                                 Copied!
//                               </>
//                             ) : (
//                               <>
//                                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                                   <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
//                                   <path d="M8 4V2.8A.8.8 0 007.2 2H2.8A.8.8 0 002 2.8v4.4A.8.8 0 002.8 8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
//                                 </svg>
//                                 Copy Link
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     {/* Action Buttons */}
//                     <div className="flex gap-3">
//                       <button
//                         onClick={handleSend}
//                         disabled={loading}
//                         className="flex-1 bg-[#25D366] hover:bg-[#20c55a] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
//                       >
//                         <span>📤</span>
//                         Send on WhatsApp
//                       </button>
//                       <button
//                         onClick={handleSkip}
//                         disabled={loading}
//                         className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 font-medium transition-all"
//                       >
//                         Skip
//                       </button>
//                     </div>

//                     {!waReady && (
//                       <div className="mt-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
//                         <span className="text-yellow-400 text-sm">⚡</span>
//                         <p className="text-xs text-yellow-400/80">
//                           Click{" "}
//                           <button onClick={openWaTab} className="underline font-semibold">Open WA Tab</button>
//                           {" "}in the header to pre-load WhatsApp Web — makes every send instant.
//                         </p>
//                       </div>
//                     )}
//                     {waReady && (
//                       <p className="text-xs text-white/30 text-center mt-3">
//                         WhatsApp tab is open — sends navigate directly, no new tab opens.
//                       </p>
//                     )}
//                   </div>

//                   {/* Quick Stats */}
//                   <div className="grid grid-cols-3 gap-3">
//                     {[
//                       { label: "Sent", value: sentCount, color: "text-[#25D366]" },
//                       { label: "Remaining", value: remaining, color: "text-yellow-400" },
//                       { label: "Total", value: batches.find((b) => b.id === selectedBatch)?.totalCount || 0, color: "text-white" },
//                     ].map((s) => (
//                       <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center">
//                         <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
//                         <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── CONTACTS TAB ── */}
//         {activeTab === "contacts" && (
//           <div>
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="text-lg font-semibold">All Contacts</h2>
//               <div className="flex gap-1 bg-white/5 rounded-xl p-1">
//                 {(["all", "pending", "sent", "skipped"] as const).map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => setContactsTab(s)}
//                     className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
//                       contactsTab === s ? "bg-[#25D366] text-black" : "text-white/50 hover:text-white"
//                     }`}
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
//                     <th className="text-left px-5 py-3">Name</th>
//                     <th className="text-left px-5 py-3">Phone</th>
//                     <th className="text-left px-5 py-3">Category</th>
//                     <th className="text-left px-5 py-3">Status</th>
//                     <th className="text-left px-5 py-3">Sent At</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {contacts.length === 0 ? (
//                     <tr><td colSpan={5} className="text-center py-12 text-white/30">No contacts found</td></tr>
//                   ) : (
//                     contacts.map((c) => {
//                       const t = getTemplate(c.category);
//                       return (
//                         <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
//                           <td className="px-5 py-3 font-medium">{c.name}</td>
//                           <td className="px-5 py-3 font-mono text-white/60">+{c.phone}</td>
//                           <td className="px-5 py-3"><span className="text-sm">{t.emoji} {t.label}</span></td>
//                           <td className="px-5 py-3">
//                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               c.status === "sent" ? "bg-green-500/20 text-green-400"
//                               : c.status === "pending" ? "bg-yellow-500/20 text-yellow-400"
//                               : c.status === "skipped" ? "bg-white/10 text-white/40"
//                               : "bg-red-500/20 text-red-400"
//                             }`}>
//                               {c.status}
//                             </span>
//                           </td>
//                           <td className="px-5 py-3 text-white/40 text-xs">
//                             {c.sentAt
//                               ? new Date(c.sentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
//                               : "—"}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* ── BATCHES TAB ── */}
//         {activeTab === "batches" && (
//           <div>
//             <h2 className="text-lg font-semibold mb-5">Upload History</h2>
//             <div className="space-y-3">
//               {batches.length === 0 ? (
//                 <div className="text-center py-16 text-white/30">No batches yet. Upload a CSV to get started.</div>
//               ) : (
//                 batches.map((b) => {
//                   const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
//                   return (
//                     <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex items-center gap-6">
//                       <div className="flex-1">
//                         <div className="font-medium mb-0.5">{b.fileName}</div>
//                         <div className="text-xs text-white/40">{new Date(b.createdAt).toLocaleString("en-IN")}</div>
//                       </div>
//                       <div className="w-48">
//                         <div className="flex justify-between text-xs mb-1.5">
//                           <span className="text-white/50">{b.sentCount}/{b.totalCount}</span>
//                           <span className="text-[#25D366] font-semibold">{pct}%</span>
//                         </div>
//                         <div className="w-full bg-white/10 rounded-full h-2">
//                           <div className="bg-[#25D366] h-2 rounded-full" style={{ width: `${pct}%` }} />
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => { handleBatchSelect(b.id); setActiveTab("send"); }}
//                         className="px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium rounded-xl transition-all"
//                       >
//                         Resume →
//                       </button>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }




















"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getTemplate, buildWhatsAppURL, TEMPLATES, Template } from "@/lib/templates";

type Contact = {
  id: string;
  name: string;
  phone: string;
  category: string;
  status: string;
  batchId: string;
  sentAt?: string;
};

type Batch = {
  id: string;
  fileName: string;
  totalCount: number;
  sentCount: number;
  createdAt: string;
};

type Stats = {
  pending: number;
  sent: number;
  skipped: number;
  failed: number;
};

function buildDirectWaUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
}

export default function BulkFlowDashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [stats, setStats] = useState<Stats>({ pending: 0, sent: 0, skipped: 0, failed: 0 });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ total: number; batchId: string } | null>(null);
  const [done, setDone] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsTab, setContactsTab] = useState<"all" | "sent" | "pending" | "skipped">("all");
  const [activeTab, setActiveTab] = useState<"send" | "contacts" | "batches">("send");
  const [linkCopied, setLinkCopied] = useState(false);
  const [waReady, setWaReady] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const waWindowRef = useRef<Window | null>(null);

  const openWaTab = useCallback(() => {
    if (waWindowRef.current && !waWindowRef.current.closed) {
      waWindowRef.current.focus();
      setWaReady(true);
      return;
    }
    const win = window.open("https://web.whatsapp.com", "bulkflow_wa");
    if (win) {
      waWindowRef.current = win;
      setWaReady(true);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    const res = await fetch("/api/batches");
    const data = await res.json();
    setBatches(data.batches || []);
  }, []);

  const fetchNext = useCallback(async (batchId?: string) => {
    setLoading(true);
    setLinkCopied(false);
    const url = `/api/contacts/next${batchId ? `?batchId=${batchId}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.done || !data.contact) {
      setDone(true);
      setCurrentContact(null);
    } else {
      setCurrentContact(data.contact);
      setRemaining(data.remaining);
      setCurrentTemplate(getTemplate(data.contact.category));
      setDone(false);
    }
    setLoading(false);
  }, []);

  const fetchContacts = useCallback(async (batchId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (batchId) params.set("batchId", batchId);
    if (status && status !== "all") params.set("status", status);
    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    setContacts(data.contacts || []);
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  useEffect(() => {
    if (activeTab === "contacts") {
      fetchContacts(selectedBatch || undefined, contactsTab);
    }
  }, [activeTab, contactsTab, selectedBatch, fetchContacts]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/contacts/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setUploadResult({ total: data.total, batchId: data.batchId });
        setSelectedBatch(data.batchId);
        await fetchBatches();
        await fetchNext(data.batchId);
        setSentCount(0);
        setDone(false);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch {
      alert("Upload error. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!currentContact || !currentTemplate) return;
    const msg = currentTemplate.message(currentContact.name);
    const url = buildDirectWaUrl(currentContact.phone, msg);
    if (waWindowRef.current && !waWindowRef.current.closed) {
      waWindowRef.current.location.href = url;
      waWindowRef.current.focus();
    } else {
      const win = window.open(url, "bulkflow_wa");
      if (win) waWindowRef.current = win;
    }
    setSentCount((c) => c + 1);
    await Promise.all([
      fetch(`/api/contacts/${currentContact.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      }),
      fetchNext(selectedBatch || undefined),
    ]);
  };

  const handleSkip = async () => {
    if (!currentContact) return;
    await Promise.all([
      fetch(`/api/contacts/${currentContact.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "skipped" }),
      }),
      fetchNext(selectedBatch || undefined),
    ]);
  };

  const handleBatchSelect = async (batchId: string) => {
    setSelectedBatch(batchId);
    setSentCount(0);
    setDone(false);
    await fetchNext(batchId);
  };

  const handleCopyLink = async () => {
    if (!currentContact || !currentTemplate) return;
    const url = buildDirectWaUrl(currentContact.phone, currentTemplate.message(currentContact.name));
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const progressPct =
    selectedBatch && batches.length
      ? (() => {
          const b = batches.find((b) => b.id === selectedBatch);
          if (!b || b.totalCount === 0) return 0;
          return Math.round((b.sentCount / b.totalCount) * 100);
        })()
      : 0;

  const currentWaUrl =
    currentContact && currentTemplate
      ? buildDirectWaUrl(currentContact.phone, currentTemplate.message(currentContact.name))
      : null;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-xl">💬</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">BulkFlow For Priya</h1>
            <p className="text-xs text-white/40">WhatsApp Bulk Messenger</p>
          </div>
        </div>

        <nav className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(["send", "contacts", "batches"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-[#25D366] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={openWaTab}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              waReady
                ? "border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366]"
                : "border-white/20 bg-white/5 text-white/50 hover:text-white hover:border-white/40"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${waReady ? "bg-[#25D366]" : "bg-white/30"}`} />
            {waReady ? "WA Ready" : "Open WA Tab"}
          </button>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#25D366]">{sentCount}</div>
            <div className="text-xs text-white/40">sent this session</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── SEND TAB ── */}
        {activeTab === "send" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="space-y-4">
              {/* Upload */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="font-semibold mb-1 text-sm text-white/70 uppercase tracking-wider">1. Upload Contacts</h2>
                <p className="text-xs text-white/40 mb-4">CSV or Excel with columns: name, phone/number, category</p>
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-white/20 hover:border-[#25D366]/60 rounded-xl p-6 text-center transition-colors">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-white/50">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl mb-2">📂</div>
                        <div className="text-sm text-white/60">Click to upload CSV / Excel</div>
                        <div className="text-xs text-white/30 mt-1">.csv, .xls, .xlsx</div>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" onChange={handleUpload} className="hidden" />
                </label>
                {uploadResult && (
                  <div className="mt-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-4 py-3">
                    <p className="text-[#25D366] text-sm font-semibold">✅ {uploadResult.total} contacts imported!</p>
                  </div>
                )}
              </div>

              {/* Batch Selector */}
              {batches.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">2. Select Batch</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {batches.map((b) => {
                      const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
                      return (
                        <button
                          key={b.id}
                          onClick={() => handleBatchSelect(b.id)}
                          className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                            selectedBatch === b.id ? "border-[#25D366] bg-[#25D366]/10" : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium truncate max-w-[130px]">{b.fileName}</span>
                            <span className="text-xs text-white/40">{pct}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-[#25D366] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="mt-1.5 text-xs text-white/40">{b.sentCount}/{b.totalCount} sent</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Template Legend */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="font-semibold mb-3 text-sm text-white/70 uppercase tracking-wider">Categories</h2>
                <div className="space-y-1.5">
                  {TEMPLATES.map((t) => (
                    <div key={t.category} className="flex items-center gap-2.5 text-sm">
                      <span className="text-base">{t.emoji}</span>
                      <span className="text-white/60">{t.label}</span>
                      {t.imagePath && (
                        <span className="ml-auto text-xs text-pink-400/70 flex items-center gap-1">
                          <span>🖼️</span> image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Send Panel */}
            <div className="lg:col-span-2 space-y-4">
              {!selectedBatch && (
                <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-5xl mb-4">⬆️</div>
                  <p className="text-white/50 text-sm">Upload a CSV file or select a batch to start sending</p>
                </div>
              )}

              {selectedBatch && done && (
                <div className="h-80 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-[#25D366] mb-2">All Done!</h3>
                  <p className="text-white/50 text-sm">All contacts in this batch have been processed.</p>
                  <p className="text-white/40 text-sm mt-1">You sent {sentCount} messages this session.</p>
                </div>
              )}

              {selectedBatch && !done && currentContact && currentTemplate && (
                <>
                  {/* Progress */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/50">Batch Progress</span>
                      <span className="font-semibold text-[#25D366]">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#25D366] to-[#128C7E] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-white/40">{remaining} contacts remaining in queue</div>
                  </div>

                  {/* Contact Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                    {/* ── Contact Header with BIG SEND BUTTON ── */}
                    <div className="mb-5">
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Next Contact</div>

                      {/* Name row */}
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold leading-none">{currentContact.name}</h2>
                        {loading && <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin shrink-0" />}
                      </div>

                      {/* Phone + category row */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-white/50 text-sm font-mono">+{currentContact.phone}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${currentTemplate.color} bg-opacity-20 text-white`}>
                          {currentTemplate.emoji} {currentTemplate.label}
                        </span>
                      </div>

                      {/* ── BIG SEND BUTTON (top, full width) ── */}
                      <button
                        onClick={handleSend}
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#20c55a] active:scale-[0.98] disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg shadow-[#25D366]/20"
                      >
                        <span className="text-xl">📤</span>
                        Send on WhatsApp
                      </button>
                    </div>

                    {/* Image Attachment — shown only when template has imagePath */}
                    {currentTemplate.imagePath && (
                      <div className="mb-4 flex items-start gap-4 bg-pink-500/5 border border-pink-500/20 rounded-xl px-4 py-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img
                            src={currentTemplate.imagePath}
                            alt="Template image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-pink-300 mb-1">📎 Image attachment</div>
                          <div className="text-xs text-white/50 mb-1">{currentTemplate.imagePath.split("/").pop()}</div>
                          <div className="text-xs text-yellow-400/80 leading-relaxed">
                            WhatsApp Web links can't auto-attach images.<br />
                            Open the chat, then manually send this image.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message Preview */}
                    <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 mb-4">
                      <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
                        <span>💬</span> Message Preview
                      </div>
                      <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                        {currentTemplate.message(currentContact.name)}
                      </pre>
                    </div>

                    {/* WhatsApp Link Row */}
                    {currentWaUrl && (
                      <div className="mb-5 bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl px-4 py-3">
                        <div className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
                          <span>🔗</span> WhatsApp Direct Link
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={currentWaUrl}
                            target="bulkflow_wa"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 text-xs font-mono text-[#25D366] truncate hover:underline"
                            title={currentWaUrl}
                          >
                            {currentWaUrl}
                          </a>
                          <button
                            onClick={handleCopyLink}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              linkCopied
                                ? "bg-[#25D366]/20 border-[#25D366]/50 text-[#25D366]"
                                : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {linkCopied ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
                                  <path d="M8 4V2.8A.8.8 0 007.2 2H2.8A.8.8 0 002 2.8v4.4A.8.8 0 002.8 8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                                Copy Link
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Bottom Action Buttons (Send again + Skip) ── */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSend}
                        disabled={loading}
                        className="flex-1 bg-[#25D366] hover:bg-[#20c55a] active:scale-[0.98] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
                      >
                        <span>📤</span>
                        Send on WhatsApp
                      </button>
                      <button
                        onClick={handleSkip}
                        disabled={loading}
                        className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 font-medium transition-all"
                      >
                        Skip
                      </button>
                    </div>

                    {!waReady && (
                      <div className="mt-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
                        <span className="text-yellow-400 text-sm">⚡</span>
                        <p className="text-xs text-yellow-400/80">
                          Click{" "}
                          <button onClick={openWaTab} className="underline font-semibold">Open WA Tab</button>
                          {" "}in the header to pre-load WhatsApp Web — makes every send instant.
                        </p>
                      </div>
                    )}
                    {waReady && (
                      <p className="text-xs text-white/30 text-center mt-3">
                        WhatsApp tab is open — sends navigate directly, no new tab opens.
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Sent", value: sentCount, color: "text-[#25D366]" },
                      { label: "Remaining", value: remaining, color: "text-yellow-400" },
                      { label: "Total", value: batches.find((b) => b.id === selectedBatch)?.totalCount || 0, color: "text-white" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {activeTab === "contacts" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">All Contacts</h2>
              <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {(["all", "pending", "sent", "skipped"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setContactsTab(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                      contactsTab === s ? "bg-[#25D366] text-black" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Phone</th>
                    <th className="text-left px-5 py-3">Category</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-white/30">No contacts found</td></tr>
                  ) : (
                    contacts.map((c) => {
                      const t = getTemplate(c.category);
                      return (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3 font-medium">{c.name}</td>
                          <td className="px-5 py-3 font-mono text-white/60">+{c.phone}</td>
                          <td className="px-5 py-3"><span className="text-sm">{t.emoji} {t.label}</span></td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.status === "sent" ? "bg-green-500/20 text-green-400"
                              : c.status === "pending" ? "bg-yellow-500/20 text-yellow-400"
                              : c.status === "skipped" ? "bg-white/10 text-white/40"
                              : "bg-red-500/20 text-red-400"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-white/40 text-xs">
                            {c.sentAt
                              ? new Date(c.sentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BATCHES TAB ── */}
        {activeTab === "batches" && (
          <div>
            <h2 className="text-lg font-semibold mb-5">Upload History</h2>
            <div className="space-y-3">
              {batches.length === 0 ? (
                <div className="text-center py-16 text-white/30">No batches yet. Upload a CSV to get started.</div>
              ) : (
                batches.map((b) => {
                  const pct = b.totalCount ? Math.round((b.sentCount / b.totalCount) * 100) : 0;
                  return (
                    <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex items-center gap-6">
                      <div className="flex-1">
                        <div className="font-medium mb-0.5">{b.fileName}</div>
                        <div className="text-xs text-white/40">{new Date(b.createdAt).toLocaleString("en-IN")}</div>
                      </div>
                      <div className="w-48">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/50">{b.sentCount}/{b.totalCount}</span>
                          <span className="text-[#25D366] font-semibold">{pct}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-[#25D366] h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <button
                        onClick={() => { handleBatchSelect(b.id); setActiveTab("send"); }}
                        className="px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium rounded-xl transition-all"
                      >
                        Resume →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}