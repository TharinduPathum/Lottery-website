import React, { useEffect, useState } from "react";
import API from "../api/axiosInstance";

interface Transaction {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  type: "deposit" | "purchase" | "winning";
  amount: number;
  status: "success" | "pending" | "failed";
  createdAt: string;
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    API.get("/admin/transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Error fetching transactions:", err))
      .finally(() => setLoading(false));
  }, []);

  // 🔄 🟢 AdminDraw එකේ පාවිච්චි කරපු Loading ස්පිනර් එකමයි (ඩාර්ක් පසුබිම සමඟ)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-amber-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🔍 Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "all") return true;
    return tx.type === filterType;
  });

  // 💰 ගණනය කිරීම් (Summary Metrics)
  const totalDeposits = transactions.filter(t => t.type === "deposit" && t.status === "success").reduce((sum, t) => sum + t.amount, 0);
  const totalSales = transactions.filter(t => t.type === "purchase" && t.status === "success").reduce((sum, t) => sum + t.amount, 0);
  const totalPayouts = transactions.filter(t => t.type === "winning" && t.status === "success").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 📑 Header Title */}
        <div className="border-b border-slate-900 pb-4">
          <h1 className="text-3xl font-black text-amber-400 tracking-wide uppercase">
            💼 Transaction Management Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">සිස්ටම් එක තුළ සිදුවූ සියලුම මුදල් ගනුදෙනු වාර්තා මෙතැනින් පරීක්ෂා කරන්න.</p>
        </div>

        {/* 📈 💰 QUICK SUMMARY CARDS (AdminDraw ස්ටයිල් එකට හැදූ කාඩ් පද්ධතිය) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-500 uppercase block font-bold tracking-wider">Total User Deposits</span>
            <span className="text-2xl font-black block text-emerald-400 mt-1">Rs. {totalDeposits}/-</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-500 uppercase block font-bold tracking-wider">Total Ticket Sales (Income)</span>
            <span className="text-2xl font-black block text-amber-400 mt-1">Rs. {totalSales}/-</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-500 uppercase block font-bold tracking-wider">Total Prize Payouts</span>
            <span className="text-2xl font-black block text-cyan-400 mt-1">Rs. {totalPayouts}/-</span>
          </div>
        </div>

        {/* 🎛️ FILTER BAR (ඩාර්ක් මෝඩ් බටන්ස්) */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter History:</span>
          <div className="flex gap-2 w-full sm:w-auto">
            {["all", "deposit", "purchase", "winning"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  filterType === type
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {type === "winning" ? "Winnings" : type === "all" ? "All Logs" : `${type}s`}
              </button>
            ))}
          </div>
        </div>

        {/* 📅 🧾 TRANSACTIONS PREMIUM TABLE */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <p className="text-center py-12 text-slate-500 font-bold tracking-wide">කිසිදු ගනුදෙනු වාර්තාවක් හමු නොවීය.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Transaction Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors duration-150">
                      
                      {/* Date */}
                      <td className="p-4 font-medium text-slate-500 text-xs">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      
                      {/* User Info */}
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{tx.user?.name || "Unknown User"}</div>
                        <div className="text-xs text-slate-500 font-mono">{tx.user?.email}</div>
                      </td>
                      
                      {/* Type Badge (Admin Draw එකේ බැජ් ස්ටයිල් එකටම හැදුවා) */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                          tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          tx.type === "purchase" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}>
                          {tx.type === "winning" ? "🏆 Prize Win" : tx.type}
                        </span>
                      </td>
                      
                      {/* Amount */}
                      <td className={`p-4 font-black text-base ${
                        tx.type === "deposit" ? "text-emerald-400" : tx.type === "winning" ? "text-cyan-400" : "text-slate-200"
                      }`}>
                        {tx.type === "deposit" || tx.type === "winning" ? "+" : "-"} Rs. {tx.amount.toLocaleString()}
                      </td>
                      
                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          tx.status === "success" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : tx.status === "failed" 
                            ? "bg-red-500/10 text-red-400" 
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === "success" ? "bg-emerald-400" : tx.status === "failed" ? "bg-red-400" : "bg-amber-400"
                          }`}></span>
                          <span className="capitalize text-[11px] font-black tracking-wider">{tx.status}</span>
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminTransactions;