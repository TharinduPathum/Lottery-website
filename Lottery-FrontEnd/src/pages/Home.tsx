import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

interface Ticket {
  _id: string;
  ticketNumber: string;
  luckyNumbers: number[];
  price: number;
  status: string;
  drawDate: string;
}

const Home = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { user, updateBalance } = useAuth(); // 👈 Global Context එකෙන් User සහ Balance Update කරන Function එක ගන්නවා
  const navigate = useNavigate();

  // 🔄 විකිණීමට ඇති ටිකට්ස් ටිකBackend එකෙන් ගන්නවා
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await API.get("/tickets/available");
        setTickets(response.data);
      } catch (error) {
        console.error("ටිකට්පත් ලබාගැනීමට නොහැකි විය:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 💳 ටිකට් එකක් මිලදී ගැනීමේ ප්‍රධාන Function එක
  const handleBuyClick = async (ticketId: string) => {
    // 1. යූසර් ලොග් වෙලා නැත්නම් ලොගින් පේජ් එකට හරවනවා
    if (!user) {
      alert("ටිකට්පතක් මිලදී ගැනීමට පෙර කරුණාකර පද්ධතියට ඇතුළු වන්න (Login).");
      navigate("/login");
      return;
    }

    try {
      // 2. Backend මිලදී ගැනීමේ API එකට Request එක යවනවා
      const response = await API.post("/tickets/buy", {
        userId: user.id,
        ticketId: ticketId,
      });

      // 3. සාර්ථක නම් Global Wallet Balance එක අප්ඩේට් කරනවා
      updateBalance(response.data.currentBalance);

      // 4. මිලදී ගත්තු ටිකට් එක UI එකේ තියෙන ටිකට් ලැයිස්තුවෙන් අයින් කරනවා
      setTickets(tickets.filter((t) => t._id !== ticketId));

      // 5. සාර්ථක මැසේජ් එකක් පෙන්වනවා
      setMessage({ type: "success", text: response.data.message });
      
      // තත්පර 4කින් මැසේජ් එක Hide කරනවා
      setTimeout(() => setMessage(null), 4000);

    } catch (error: any) {
      // මොකක් හරි අවුලක් ගියොත් (උදා: සල්ලි මදි නම්) ඒ Error මැසේජ් එක පෙන්වනවා
      setMessage({
        type: "error",
        text: error.response?.data?.message || "මිලදී ගැනීම අසාර්ථක විය!",
      });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 👤 උඩින්ම පේන Navbar කෑල්ල (User විස්තර සහ Wallet බැලන්ස් එක පෙන්වන්න) */}
        {user && (
          <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">
            <div>
              <span className="text-gray-600">ආයුබෝවන්,</span> <span className="font-bold text-gray-800">{user.name}</span>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold shadow-sm">
              💰 Wallet Balance: Rs. {user.walletBalance}/-
            </div>
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2">🍀 Digital Lottery Store</h1>
        <p className="text-center text-gray-600 mb-10">ඔබේ වාසනාවන්ත ලොතරැයි පත අදම තෝරාගන්න! ටිකට්පතක් රු. 100/- ක් පමණි.</p>

        {/* 🔔 Alert Messages පෙන්වන තැන */}
        {message && (
          <div className={`max-w-md mx-auto p-4 rounded-xl text-center font-semibold mb-6 shadow-md transition-all ${
            message.type === "success" ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {tickets.length === 0 ? (
          <p className="text-center text-xl text-gray-500">කණගාටුයි! දැනට විකිණීමට ටිකට්පත් නොමැත.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white border-2 border-dashed border-orange-400 rounded-xl p-6 shadow-lg relative overflow-hidden bg-gradient-to-br from-yellow-50 to-white">
                <div className="text-xs font-bold text-orange-600 tracking-wider mb-1">LOTTERY TICKET</div>
                <div className="text-2xl font-black text-gray-800 tracking-wide mb-3">{ticket.ticketNumber}</div>

                <div className="flex gap-2 mb-4">
                  {ticket.luckyNumbers.map((num, idx) => (
                    <span key={idx} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {num}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  📅 දිනුම් ඇදීම: <span className="font-semibold">{ticket.drawDate}</span>
                </div>

                <button 
                  onClick={() => handleBuyClick(ticket._id)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:from-orange-600 hover:to-amber-600 transition shadow-md"
                >
                  Buy Now (Rs. {ticket.price})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;