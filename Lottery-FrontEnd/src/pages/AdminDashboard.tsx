import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminDraw from "./AdminDraw";

interface DashboardStats {
  totalSales: number;
  activeUsers: number;
  pendingDraws: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "draw" | "tickets">(
    "overview",
  );
  const [generating, setGenerating] = useState<boolean>(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard-stats",
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardStats();
    }
  }, [activeTab]);

  const handleGenerate100Tickets = async () => {
    try {
      setGenerating(true);
      await axios.post("http://localhost:5000/api/tickets/generate");
      alert(
        "🎉 සුපිරියි මල්ලි! රු. 100 ගානේ වටිනා අලුත්ම ටිකට් 100ක් සාර්ථකව ජෙනරේට් වුණා.",
      );
      fetchDashboardStats(); 
    } catch (error) {
      console.error("Error generating tickets:", error);
      alert("❌ ටිකට් ජෙනරේට් කිරීමේදී දෝෂයක් ඇති විය.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* 🧭 Left Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-black text-amber-400 tracking-wider">
            LANKA LOTTERY
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase mt-1">
            Admin Control Panel
          </p>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "overview"
                ? "bg-amber-400 text-slate-950"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            📊 Overview Stats
          </button>
          <button
            onClick={() => setActiveTab("draw")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "draw"
                ? "bg-amber-400 text-slate-950"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            🎰 Live Lottery Draw
          </button>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">
                Dashboard Overview
              </h1>
              <p className="text-slate-400 text-sm">
                සයිට් එකේ වත්මන් තත්ත්වය මෙතනින් බලාගන්න.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <span className="text-slate-500 text-xs font-bold uppercase">
                  Total Ticket Sales
                </span>
                {loadingStats ? (
                  <div className="h-8 bg-slate-800 animate-pulse rounded mt-2 w-32"></div> // ⏳ Loading state placeholder
                ) : (
                  <h3 className="text-3xl font-black text-white mt-2">
                    Rs. {stats?.totalSales.toLocaleString() || "0"}.00
                  </h3>
                )}
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <span className="text-slate-500 text-xs font-bold uppercase">
                  Active Registered Users
                </span>
                {loadingStats ? (
                  <div className="h-8 bg-slate-800 animate-pulse rounded mt-2 w-20"></div>
                ) : (
                  <h3 className="text-3xl font-black text-amber-400 mt-2">
                    {stats?.activeUsers.toLocaleString() || "0"}
                  </h3>
                )}
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <span className="text-slate-500 text-xs font-bold uppercase">
                  Pending Draws
                </span>
                {loadingStats ? (
                  <div className="h-8 bg-slate-800 animate-pulse rounded mt-2 w-16"></div>
                ) : (
                  <h3 className="text-3xl font-black text-emerald-400 mt-2">
                    {stats
                      ? stats.pendingDraws < 10
                        ? `0${stats.pendingDraws}`
                        : stats.pendingDraws
                      : "00"}
                  </h3>
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mt-6">
              <h3 className="font-bold text-white mb-3">
                Quick Actions (කඩිනම් ක්‍රියාකාරකම්)
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={handleGenerate100Tickets}
                  disabled={generating}
                  className={`text-xs font-bold py-3 px-4 rounded-xl border transition-colors ${
                    generating
                      ? "bg-slate-800 text-slate-500 border-slate-800 cursor-not-allowed"
                      : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  }`}
                >
                  {generating
                    ? "⏳ Generating..."
                    : "➕ Generate New 100 Tickets"}
                </button>

                <button
                  onClick={() => navigate("/admin/transactions")}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-4 rounded-xl border border-slate-700 transition-colors"
                >
                  px-4 📑 View All Transactions
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "draw" && (
          <div>
            <AdminDraw />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
