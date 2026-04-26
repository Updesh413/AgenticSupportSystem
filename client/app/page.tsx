"use client";

import { useState, useEffect, useRef } from "react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const pollInterval = useRef<any>(null);

  const fetchHistory = async () => {
    if (!user) return;
    setFetchingHistory(true);
    try {
      const token = await getToken();
      const email = user.primaryEmailAddress?.emailAddress;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/customer?email=${email}&t=${Date.now()}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const uniqueHistory = data
            .filter((v, i, a) => v && v.id && a.findIndex(t => (t.id === v.id)) === i)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHistory(uniqueHistory);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading || !query.trim()) return;
    
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email: user.primaryEmailAddress?.emailAddress, 
          query 
        }),
      });
      const data = await response.json();
      setActiveTicket(data);
      startPolling(data.id);
    } catch (err) {
      alert("The support server is currently 'waking up' from sleep mode. This is common on free hosting tiers. Please wait 30 seconds and try again!");
      setLoading(false);
    }
  };

  const startPolling = (id: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const updatedTicket = await response.json();
        setActiveTicket(updatedTicket);

        if (updatedTicket.status === "RESOLVED" || updatedTicket.status === "ESCALATED_TO_HUMAN") {
          clearInterval(pollInterval.current);
          setLoading(false);
          setTimeout(fetchHistory, 1000);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);
  };

  useEffect(() => {
    if (isLoaded && user) {
        fetchHistory();
    }
    return () => clearInterval(pollInterval.current);
  }, [isLoaded, user]);

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const displayHistory = history.filter(t => t.id !== activeTicket?.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold shadow-lg shadow-blue-100">
                AS
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Support Portal</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Agent Active</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
            Admin Entry
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <UserButton />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-10">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">How can we help?</h2>
                    <p className="text-slate-500">Describe your issue and our AI agent will analyze it in seconds.</p>
                </header>

                {!activeTicket ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <textarea
                            rows={6}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            required
                            className="w-full px-6 py-5 rounded-[24px] border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-slate-800 bg-slate-50/50 resize-none leading-relaxed"
                            placeholder="e.g. 'I haven't received my order #12345 yet...'"
                        ></textarea>
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-[20px] shadow-xl shadow-blue-100 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {loading ? "Agent is Thinking..." : "Start AI Conversation"}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket ID</p>
                                <h3 className="text-sm font-bold text-slate-700">{activeTicket.id.substring(0, 8)}</h3>
                            </div>
                            <StatusBadge status={activeTicket.status} />
                        </div>
                        
                        {(activeTicket.status === "OPEN" || activeTicket.status === "IN_PROGRESS") && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="flex gap-2 mb-4">
                                    <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></span>
                                    <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]"></span>
                                    <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]"></span>
                                </div>
                                <p className="text-blue-600 font-bold">AI Agent is thinking...</p>
                            </div>
                        )}

                        {activeTicket.resolutionNotes && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Response</label>
                                <div className="bg-blue-50/50 p-8 rounded-[28px] border-l-8 border-blue-600 shadow-sm">
                                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                                        {activeTicket.resolutionNotes.replace(/\[DECISION: (RESOLVED|ESCALATED)\]/, "").trim()}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => { setActiveTicket(null); setQuery(""); fetchHistory(); }}
                            className="w-full py-4 rounded-[20px] border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-blue-400 hover:text-blue-600 transition-all text-sm"
                        >
                            + Start another request
                        </button>
                    </div>
                )}
            </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
            <div className="flex justify-between items-center px-4">
                <h3 className="text-lg font-bold text-slate-900">📋 Your History</h3>
                <button 
                    onClick={fetchHistory}
                    disabled={fetchingHistory}
                    className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                >
                    {fetchingHistory ? "Syncing..." : "Refresh History"}
                </button>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-4 custom-scrollbar">
                {displayHistory.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] text-slate-400 font-bold">
                                {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                            <StatusBadge status={t.status} size="sm" />
                        </div>
                        <p className="text-sm text-slate-700 font-bold line-clamp-2 mb-4 group-hover:text-blue-900 transition-colors">
                            {t.query}
                        </p>
                        {t.resolutionNotes && (
                            <div className="text-[11px] text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 italic line-clamp-2">
                                {t.resolutionNotes.replace(/\[DECISION: (RESOLVED|ESCALATED)\]/, "").trim()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function StatusBadge({ status, size = "md" }: { status: string, size?: "sm" | "md" }) {
  const colors: any = {
    OPEN: "bg-red-50 text-red-600 border-red-100",
    IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
    RESOLVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    ESCALATED_TO_HUMAN: "bg-amber-50 text-amber-600 border-amber-100",
  };
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[8px]" : "px-3 py-1 text-[10px]";
  
  return (
    <span className={`${sizeClasses} rounded-lg font-black uppercase border ${colors[status] || "bg-slate-50 text-slate-400"}`}>
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}
span>
  );
}
