import { useAuth } from "../context/AuthContext";
import PayHereForm from "../components/PayHereForm";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

interface Ticket {
  _id: string;
  ticketNumber: string;
  luckyNumbers: number[]; 
  drawDate: string;
  price: number;
  status: string;
}

const Profile = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(true);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
    
    if (user) {
      API.get("/tickets/my-tickets", {
        headers: {
          "user-id": user.id,
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setTickets(res.data);
        
        if (res.data && res.data.length > 0) {
          const uniqueDates = Array.from(new Set(res.data.map((t: Ticket) => t.drawDate))).sort(
            (a: any, b: any) => new Date(b).getTime() - new Date(a).getTime()
          );
          setSelectedDate(uniqueDates[0] as string); 
        }
      })
      .catch((err) => console.error("Error fetching tickets:", err))
      .finally(() => setTicketsLoading(false));
    }
  }, [user, token, loading, navigate]);

  const uniqueDates = Array.from(new Set(tickets.map((t) => t.drawDate))).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime() 
  );

  const filteredTickets = tickets.filter((ticket) => ticket.drawDate === selectedDate);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">කරුණාකර රැඳී සිටින්න...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-1 text-center h-fit">
          <div className="w-20 h-20 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center font-black text-3xl mx-auto mb-4 shadow">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-sm text-slate-500 mb-6">{user.email}</p>
          
          <div className="border-t pt-4 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase">Account Status</span>
            <div className="text-sm font-semibold text-green-600 flex items-center gap-1 mt-1">
              🟢 Active Verified Account
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          
          {/* Wallet Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Available Wallet Balance</p>
                <h3 className="text-3xl font-black text-amber-400 mt-1">Rs. {user.walletBalance.toFixed(2)}</h3>
              </div>
              <span className="text-4xl">💰</span>
            </div>
            <PayHereForm />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              🎟️ My Purchased Tickets ({tickets.length})
            </h3>

            {!ticketsLoading && uniqueDates.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-5 border-b border-slate-100 scrollbar-none">
                {uniqueDates.map((date) => {
                  const isSelected = selectedDate === date;
                  const countByDate = tickets.filter((t) => t.drawDate === date).length;

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border flex items-center gap-2 ${
                        isSelected
                          ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      📅 {new Date(date).toLocaleDateString()}
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        isSelected ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-200 text-slate-600"
                      }`}>
                        {countByDate}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {ticketsLoading ? (
              <p className="text-sm text-slate-400 py-4 text-center">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500 font-medium">ඔබ තවමත් කිසිදු ටිකට්පතක් මිලදී ගෙන නැත.</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500 font-medium">මෙම දිනය සඳහා ටිකට්පත් කිසිවක් නැත.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                {filteredTickets.map((ticket) => (
                  <div key={ticket._id} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 p-5 rounded-xl relative overflow-hidden shadow-sm">
                    
                    {/* Ticket Side Badges */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-r border-amber-200"></div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-l border-amber-200"></div>
                    
                    <div className="pl-2">
                      <div className="flex justify-between items-center">
                        <span className="bg-slate-800 text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded tracking-wider">
                          {ticket.ticketNumber}
                        </span>
                        <span className="text-xs font-bold text-orange-600">Rs.{ticket.price}</span>
                      </div>

                      <div className="flex gap-1.5 my-3">
                        {ticket.luckyNumbers.map((num, idx) => (
                          <span key={idx} className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 text-slate-900 flex items-center justify-center font-black text-sm shadow-sm border border-amber-300">
                            {num}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-[11px] text-slate-500 border-t pt-2 mt-2 border-amber-200/60 flex justify-between">
                        <span>Draw Date: <span className="font-semibold text-slate-700">{new Date(ticket.drawDate).toLocaleDateString()}</span></span>
                        
                        <span className={`font-bold capitalize ${
                          ticket.status === "won" ? "text-emerald-600" : ticket.status === "lost" ? "text-rose-500" : "text-amber-600"
                        }`}>
                          • {ticket.status}
                        </span>
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;