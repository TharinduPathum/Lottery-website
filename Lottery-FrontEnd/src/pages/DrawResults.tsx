import React, { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client"; // 🔌 real-time වැඩේට socket.io ගත්තා

// Backend එක රන් වෙන URL එක මෙතනට දෙන්න (උදා: http://localhost:5000)
const SOCKET_SERVER_URL = "http://localhost:5000"; 

interface DrawHistory {
  _id: string;
  winningNumbers: number[];
  drawDate: string;
  summary: {
    checkedTickets: number;
    totalWinners: number;
    totalPayout: string;
    breakdown: {
      count5000: number; count1000: number; count500: number; count200: number; count100: number;
    };
  };
}

const DrawResults = () => {
  const { user } = useAuth();
  const [draws, setDraws] = useState<DrawHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ⏳ Countdown States
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 🔴 Real-time Live Draw States
  const [isLiveDrawing, setIsLiveDrawing] = useState<boolean>(false);
  const [liveCurrentBallIdx, setLiveCurrentBallIdx] = useState<number | null>(null);
  const [liveShufflingNumbers, setLiveShufflingNumbers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [liveFinalNumbers, setLiveFinalNumbers] = useState<number[]>([]);

  // 🔄 1. ඩේටා Fetch කිරීම සහ Socket.io සෙට් කිරීම
  useEffect(() => {
    fetchPastDraws();

    // Socket සන්නිවේදනය ආරම්භ කිරීම
    const socket = io(SOCKET_SERVER_URL);

    // 🔮 Admin ඇදීම පටන් ගත් විට
    socket.on("draw-started", () => {
      setIsLiveDrawing(true);
      setLiveFinalNumbers([]);
      setLiveCurrentBallIdx(0);
    });

    // 🔮 බෝල කරකැවෙන රියල්-ටයිම් ඩේටා අප්ඩේට් එක
    socket.on("ball-shuffling", (data: { ballIdx: number; shufflingNumbers: number[] }) => {
      setLiveCurrentBallIdx(data.ballIdx);
      setLiveShufflingNumbers(data.shufflingNumbers);
    });

    // 🔮 බෝලයක් Lock වූ විට
    socket.on("ball-locked", (data: { finalNumbers: number[] }) => {
      setLiveFinalNumbers(data.finalNumbers);
    });

    // 🔮 ඇදීම සම්පූර්ණයෙන්ම අවසන් වූ විට
    socket.on("draw-finished", () => {
      setIsLiveDrawing(false);
      setLiveCurrentBallIdx(null);
      fetchPastDraws(); // අලුත් රිසල්ට් එක ලිස්ට් එකට ගන්න රිෆ්‍රෙෂ් කරනවා
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPastDraws = () => {
    API.get("/tickets/draw-results")
      .then((res) => setDraws(res.data))
      .catch((err) => console.error("Error fetching draw results:", err))
      .finally(() => setLoading(false));
  };

  // 📅 2. සෑම මසකම 25 වනදා රාත්‍රී 10 ට ටාගට් එක හදන Countdown ලොජික් එක
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth();

      // ටාගට් එක: මේ මාසේ 25 රෑ 10:00:00
      let targetDate = new Date(year, month, 25, 22, 0, 0);

      // මේ මාසේ 25 පහුවෙලා නම්, ඊළඟ මාසේ 25 ටාගට් කරනවා
      if (now >= targetDate) {
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
        targetDate = new Date(year, month, 25, 22, 0, 0);
      }

      const difference = targetDate.getTime() - now.getTime();

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days: d, hours: h, minutes: m, seconds: s });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  const latestDraw = draws[0];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 👤 Navbar Component */}
        {user && (
          <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">
            <div>
              <span className="text-gray-600">ආයුබෝවන්,</span> <span className="font-bold text-gray-800">{user.name}</span>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold shadow-sm text-sm">
              💰 Wallet Balance: Rs. {user.walletBalance}/-
            </div>
          </div>
        )}

        {/* Header Title */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">🏆 Official Draw Results</h1>
          <p className="text-gray-600">ලොතරැයි ප්‍රතිඵල සහ සජීවී ඇදීමේ මධ්‍යස්ථානය</p>
        </div>

        {/* 🔴 3. REAL-TIME LIVE DRAW PANEL (ඇඩ්මින් ලයිව් ඇදීම කරද්දී විතරක් මේක උඩින්ම මැජික් එකක් වගේ පේනවා) */}
        {isLiveDrawing ? (
          <div className="bg-white border-2 border-red-500 rounded-2xl p-6 text-center shadow-xl animate-pulse bg-gradient-to-br from-red-50 to-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
              <span className="text-sm font-black text-red-600 tracking-widest uppercase">LIVE DRAW IN PROGRESS</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">ප්‍රධාන මධ්‍යස්ථානයේ සිට සජීවීව අංක තේරීම සිදු වෙමින් පවතී...</p>

            {/* Live Shuffling Balls */}
            <div className="flex justify-center gap-3 md:gap-4 my-6">
              {liveShufflingNumbers.map((num, idx) => {
                const isShuffling = liveCurrentBallIdx === idx;
                const isLocked = liveFinalNumbers.length > idx;

                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-black transition-all border-2 shadow-md ${
                      isShuffling
                        ? "bg-orange-500 text-white border-orange-300 animate-bounce scale-110"
                        : isLocked
                        ? "bg-blue-600 text-white border-blue-400"
                        : "bg-gray-100 text-gray-400 border-gray-300"
                    }`}
                  >
                    {isLocked ? liveFinalNumbers[idx] : isShuffling ? num : "?"}
                  </div>
                );
              })}
            </div>
            <p className="text-sm font-bold text-gray-700 animate-pulse mt-2">
              🔮 බෝල අංක {(liveCurrentBallIdx ?? 0) + 1} කැරකෙමින් පවතී...
            </p>
          </div>
        ) : (
          /* ⏳ 4. NEXT DRAW COUNTDOWN TIMER (ලයිව් ඇදීමක් නැති සාමාන්‍ය වෙලාවට මේක පේනවා) */
          <div className="bg-white border-2 border-dashed border-orange-400 rounded-2xl p-6 text-center shadow-lg bg-gradient-to-br from-amber-50 to-white">
            <div className="text-xs font-bold text-orange-600 tracking-wider mb-2 uppercase">⏳ Next Official Draw Countdown</div>
            <p className="text-xs text-gray-500 mb-4">සෑම මසකම 25 වනදා රාත්‍රී 10:00 ට මීළඟ මහා දිනුම් ඇදීම සජීවීව සිදු කෙරේ.</p>
            
            {/* Countdown Blocks */}
            <div className="flex justify-center gap-4 text-gray-800">
              <div className="bg-white px-3 py-2 border rounded-xl shadow-sm min-w-[60px]">
                <span className="text-2xl font-black block text-blue-600">{countdown.days}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Days</span>
              </div>
              <div className="bg-white px-3 py-2 border rounded-xl shadow-sm min-w-[60px]">
                <span className="text-2xl font-black block text-blue-600">{countdown.hours}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Hours</span>
              </div>
              <div className="bg-white px-3 py-2 border rounded-xl shadow-sm min-w-[60px]">
                <span className="text-2xl font-black block text-blue-600">{countdown.minutes}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Mins</span>
              </div>
              <div className="bg-white px-3 py-2 border rounded-xl shadow-sm min-w-[60px]">
                <span className="text-2xl font-black block text-orange-500">{countdown.seconds}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Secs</span>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 5. LATEST DRAW RESULT (අන්තිමටම ඇදුණු ප්‍රතිඵලය) */}
        {latestDraw && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
            <div className="text-xs font-bold text-blue-600 tracking-wider mb-1 uppercase">Latest Draw Results History</div>
            <div className="text-xs text-gray-500 mb-4 font-medium">
              📅 අවසන් වරට ඇද්දේ: <span className="font-bold text-gray-700">{new Date(latestDraw.drawDate).toLocaleString()}</span>
            </div>

            <div className="flex justify-center gap-3 md:gap-4 my-6">
              {latestDraw.winningNumbers.map((num, idx) => (
                <div key={idx} className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                  {num}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-5 mt-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase block font-bold">Checked</span>
                <span className="text-base font-black text-gray-800">{latestDraw.summary.checkedTickets}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block font-bold">Winners</span>
                <span className="text-base font-black text-orange-600">{latestDraw.summary.totalWinners}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block font-bold">Total Payout</span>
                <span className="text-base font-black text-green-600">{latestDraw.summary.totalPayout}</span>
              </div>
            </div>
          </div>
        )}

        {/* 📜 6. PAST DRAWS HISTORY (පරණ ඉතිහාසය) */}
        {draws.length > 1 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-gray-700 text-xs uppercase tracking-wider pl-1">📜 Past Draw History ({draws.length - 1})</h3>
            <div className="grid grid-cols-1 gap-3">
              {draws.slice(1).map((draw) => (
                <div key={draw._id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-800">📅 {new Date(draw.drawDate).toLocaleDateString()}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Winners: <span className="text-orange-600 font-bold">{draw.summary.totalWinners}</span> | Payout: <span className="text-green-600 font-bold">{draw.summary.totalPayout}</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {draw.winningNumbers.map((num, i) => (
                      <span key={i} className="w-8 h-8 rounded-full bg-gray-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-gray-200">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DrawResults;