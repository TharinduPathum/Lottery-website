import React, { useState, useEffect } from "react";
import API from "../api/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DrawResult {
  message: string;
  summary: {
    checkedTickets: number;
    totalWinners: number;
    totalPayout: string;
    breakdown: {
      count5000: number;
      count1000: number;
      count500: number;
      count200: number;
      count100: number;
    };
  };
}

const AdminDraw = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBallIdx, setCurrentBallIdx] = useState<number | null>(null);
  const [finalNumbers, setFinalNumbers] = useState<number[]>([]);
  const [shufflingNumbers, setShufflingNumbers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [resultSummary, setResultSummary] = useState<DrawResult | null>(null);

  const generateRandomWinningNumbers = (): number[] => {
    const numbers: number[] = [];
    while (numbers.length < 5) {
      const r = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(r)) numbers.push(r);
    }
    return numbers;
  };

  const startLiveDraw = async () => {
    setIsDrawing(true);
    setResultSummary(null);
    setFinalNumbers([]);
    
    const generatedWinningCombination = generateRandomWinningNumbers();
    
    for (let ballIdx = 0; ballIdx < 5; ballIdx++) {
      setCurrentBallIdx(ballIdx);
      
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          setShufflingNumbers((prev) => {
            const copy = [...prev];
            copy[ballIdx] = Math.floor(Math.random() * 49) + 1; 
            return copy;
          });
        }, 60); 

        
        setTimeout(() => {
          clearInterval(interval);
          setShufflingNumbers((prev) => {
            const copy = [...prev];
            copy[ballIdx] = generatedWinningCombination[ballIdx];
            return copy;
          });
          setFinalNumbers((prev) => [...prev, generatedWinningCombination[ballIdx]]);
          resolve();
        }, 1500);
      });
    }

    
    try {
      const response = await API.post("/tickets/draw", {
        winningNumbers: generatedWinningCombination,
      });
      setResultSummary(response.data); 
    } catch (error) {
      console.error("Draw error:", error);
      alert("Error processing the draw in backend.");
    } finally {
      setIsDrawing(false);
      setCurrentBallIdx(null);
    }
  };

  const downloadPDFReport = () => {
    if (!resultSummary) return;

    try {
     
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(245, 158, 11); 
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("LANKA LOTTERY SYSTEM", 14, 22);

      // Subtitle
      doc.setTextColor(148, 163, 184); 
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Official Automated Draw Execution & Winners Report", 14, 30);

      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DRAW SPECIFICATIONS", 14, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const today = new Date();
      doc.text(`Draw ID: LOTT-DRAW-${today.toISOString().slice(0, 10)}-${Math.floor(1000 + Math.random() * 9000)}`, 14, 63);
      doc.text(`Execution Date/Time: ${today.toLocaleString()}`, 14, 70);
      doc.text(`Status: Verification Successful / Official Released`, 14, 77);

      
      doc.setFillColor(245, 158, 11);
      doc.rect(14, 85, 182, 12, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`OFFICIAL DRAWN NUMBERS:   [   ${finalNumbers.join("   -   ")}   ]`, 20, 92);

     
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PARTICIPATION & PAYOUT SUMMARY", 14, 112);

      
      autoTable(doc, {
        startY: 117,
        head: [["Description / Metric", "System Value"]],
        body: [
          ["Total Sold Tickets Checked", resultSummary.summary.checkedTickets.toString()],
          ["Total Winning Tickets Identified", resultSummary.summary.totalWinners.toString()],
          ["- Rs. 5,000.00 Jackpot Winners (Match 5)", resultSummary.summary.breakdown.count5000.toString()],
          ["- Rs. 1,000.00 Tier 2 Winners (Match 4)", resultSummary.summary.breakdown.count1000.toString()],
          ["- Rs. 500.00 Tier 3 Winners (Match 3)", resultSummary.summary.breakdown.count500.toString()],
          ["- Rs. 200.00 Tier 4 Winners (Match 2)", resultSummary.summary.breakdown.count200.toString()],
          ["- Rs. 100.00 Tier 5 Winners (Match 1)", resultSummary.summary.breakdown.count100.toString()],
          ["Total Calculated Prize Payout", resultSummary.summary.totalPayout],
        ],
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        theme: "striped",
        styles: { font: "helvetica", fontSize: 10 }
      });

      const autoTableInfo = (doc as any).lastAutoTable;
      const finalY = autoTableInfo && autoTableInfo.finalY ? autoTableInfo.finalY + 30 : 185;

      doc.setDrawColor(203, 213, 225); // Line color
      doc.line(14, finalY, 75, finalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Authorized Draw Officer", 14, finalY + 5);

      doc.line(135, finalY, 196, finalY);
      doc.text("Automated System Auditor", 135, finalY + 5);

      doc.save(`Lottery_Draw_Report_${today.toISOString().slice(0, 10)}.pdf`);

    } catch (error) {
      console.error("PDF Generation Failed:", error);
      alert("PDF එක සෑදීමේදී දෝෂයක් ඇති විය. Console එක පරීක්ෂා කරන්න.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        
        <h1 className="text-3xl font-black text-amber-400 tracking-wide uppercase">
          🎰 Official Live Lottery Draw 🎰
        </h1>
        <p className="text-slate-400 text-sm mt-1">ලොතරැයිය සජීවීව ඇදීමේ මධ්‍යස්ථානය</p>

        
        <div className="flex justify-center gap-4 my-10">
          {shufflingNumbers.map((num, idx) => {
            const isCurrentlyShuffling = currentBallIdx === idx;
            const isLocked = finalNumbers.length > idx;

            return (
              <div
                key={idx}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-2 transition-all duration-300 shadow-lg ${
                  isCurrentlyShuffling
                    ? "bg-orange-500 border-orange-300 animate-bounce scale-110"
                    : isLocked
                    ? "bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-600"
                }`}
              >
                {shufflingNumbers[idx] || "?"}
              </div>
            );
          })}
        </div>

        
        {!isDrawing && !resultSummary && (
          <button
            onClick={startLiveDraw}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-10 py-4 rounded-xl text-lg shadow-lg active:scale-95 transition-transform"
          >
            START LIVE DRAW (ලොතරැයිය අදින්න)
          </button>
        )}

        {isDrawing && (
          <p className="text-amber-400 font-bold animate-pulse text-lg">
            🔮 බෝල අංක {(currentBallIdx ?? 0) + 1} කැරකෙමින් පවතී. කරුණාකර රැඳී සිටින්න...
          </p>
        )}

        
        {resultSummary && (
          <div className="mt-6 bg-slate-950/60 border border-emerald-500/30 p-6 rounded-2xl text-left animate-fadeIn">
            <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
              ✅ ඇදීමේ වාර්තාව (Draw Execution Report)
            </h3>
            
            
            <div className="grid grid-cols-3 gap-4 text-center mt-2">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase block">Checked Tickets</span>
                <span className="text-xl font-bold text-slate-200">{resultSummary.summary.checkedTickets}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase block">Total Winners</span>
                <span className="text-xl font-bold text-amber-400">{resultSummary.summary.totalWinners}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase block">Total Payout</span>
                <span className="text-xl font-bold text-emerald-400">{resultSummary.summary.totalPayout}</span>
              </div>
            </div>

            
            <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2 text-sm text-slate-300">
              <p className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">🎯 Prize Breakdown Tiers:</p>
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">🏆 Rs. 5,000.00 Prizes (Match 5):</span>
                <span className="font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs">{resultSummary.summary.breakdown.count5000} Tickets</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">🥈 Rs. 1,000.00 Prizes (Match 4):</span>
                <span className="font-black text-slate-200 bg-slate-200/10 px-2 py-0.5 rounded text-xs">{resultSummary.summary.breakdown.count1000} Tickets</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">🥉 Rs. 500.00 Prizes (Match 3):</span>
                <span className="font-black text-slate-300 bg-slate-300/10 px-2 py-0.5 rounded text-xs">{resultSummary.summary.breakdown.count500} Tickets</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">🎫 Rs. 200.00 Prizes (Match 2):</span>
                <span className="font-black text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded text-xs">{resultSummary.summary.breakdown.count200} Tickets</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">🎫 Rs. 100.00 Prizes (Match 1):</span>
                <span className="font-black text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded text-xs">{resultSummary.summary.breakdown.count100} Tickets</span>
              </div>
            </div>

            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={downloadPDFReport}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold py-3 px-4 rounded-xl text-center transition-all shadow-md"
              >
                📥 Download PDF Report
              </button>
              <button 
                onClick={() => setResultSummary(null)}
                className="bg-slate-900 border border-slate-800 text-slate-400 text-sm font-bold py-3 px-6 rounded-xl text-center hover:bg-slate-800 transition-colors"
              >
                Reset
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDraw;