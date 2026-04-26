"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingTicket, setResolvingTicket] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user?.primaryEmailAddress?.emailAddress === adminEmail;

  const fetchTickets = async () => {
    if (!isAdmin) return;
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:8080/api/tickets", {
          headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const uniqueTickets = data.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
        setTickets(uniqueTickets);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/tickets/${resolvingTicket.id}/resolve`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resolutionNotes: `[ADMIN RESOLVED] ${adminNotes}` })
      });
      
      if (response.ok) {
          setTickets(prev => prev.map(t => 
            t.id === resolvingTicket.id 
                ? { ...t, status: 'RESOLVED', resolutionNotes: `[ADMIN RESOLVED] ${adminNotes}` } 
                : t
          ));
          setResolvingTicket(null);
          setAdminNotes("");
      }
    } catch (err) {
      alert("Error resolving ticket");
    }
  };

  useEffect(() => {
    if (isLoaded && isAdmin) {
        fetchTickets();
        const interval = setInterval(fetchTickets, 10000);
        return () => clearInterval(interval);
    }
  }, [isLoaded, isAdmin]);

  if (!isLoaded) return null;

  if (!isAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    🔒
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 mb-8">You do not have administrative privileges.</p>
                <Link href="/" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
                    Return to Support Portal
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg text-sm">AS</span>
            AgenticSupport <span className="text-slate-400 font-medium">Admin</span>
        </Link>
        <div className="flex items-center gap-6">
          <button 
            onClick={fetchTickets} 
            className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors"
          >
            {loading ? "Refreshing..." : "Refresh Queue"}
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Support Dashboard</h1>
            <p className="text-slate-500">Manage and resolve escalated customer queries</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard label="Total Tickets" value={tickets.length} color="blue" icon="📁" />
            <StatCard label="Awaiting Human" value={tickets.filter(t => t.status === 'ESCALATED_TO_HUMAN').length} color="amber" icon="⚠️" />
            <StatCard label="Resolved" value={tickets.filter(t => t.status === 'RESOLVED').length} color="emerald" icon="✅" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Info</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Query Detail</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                    <td className="px-8 py-6">
                        <div className="font-bold text-slate-900 text-sm mb-1">{t.customerEmail}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(t.createdAt).toLocaleString()}
                        </div>
                    </td>
                    <td className="px-8 py-6">
                        <p className="text-sm text-slate-600 max-w-sm line-clamp-2" title={t.query}>
                            {t.query}
                        </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <StatusBadge status={t.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                        {t.status === "ESCALATED_TO_HUMAN" ? (
                            <button 
                                onClick={() => setResolvingTicket(t)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-95"
                            >
                                Resolve Now
                            </button>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Archived</span>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Resolution Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] max-w-xl w-full p-10 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Take Action</h2>
                        <p className="text-slate-500 text-sm">Reviewing ticket for {resolvingTicket.customerEmail}</p>
                    </div>
                    <button 
                        onClick={() => setResolvingTicket(null)}
                        className="text-slate-400 hover:text-slate-600 text-2xl"
                    >
                        &times;
                    </button>
                </div>
                
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Customer Query</div>
                    {resolvingTicket.query}
                </div>

                <form onSubmit={handleResolve}>
                    <div className="mb-8">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Internal Resolution Notes</label>
                        <textarea 
                            className="w-full border border-slate-200 rounded-2xl p-5 text-sm h-40 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-900 bg-white"
                            placeholder="Detail the steps taken to resolve this query..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setResolvingTicket(null)}
                            className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Discard
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95"
                        >
                            Confirm Resolution
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    };
    return (
        <div className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-4xl font-black ${colors[color].split(' ')[0]}`}>{value}</p>
            </div>
            <div className="text-3xl opacity-20">{icon}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    OPEN: "bg-red-50 text-red-600 border-red-100",
    IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
    RESOLVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    ESCALATED_TO_HUMAN: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${colors[status]}`}>
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}
