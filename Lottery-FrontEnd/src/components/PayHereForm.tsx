import { useState } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const PayHereForm = () => {
  const [amount, setAmount] = useState<number>(200); 
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("කරුණාකර පළමුව ලොග් වන්න!");
    if (amount < 100) return alert("අවම වශයෙන් රු. 100ක් වත් ටොප්-අප් කළ යුතුය!");

    setLoading(true);
    try {
      const orderId = "LOTO-" + Date.now(); 

      const response = await API.post("/payments/hash", { orderId, amount });
      const { hash, merchantId } = response.data;

      const NGROK_BASE_URL = "https://mustiest-samir-protoplasmatic.ngrok-free.dev"; 

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout"; 

      const fields: Record<string, string> = {
        merchant_id: merchantId,
        return_url: "http://localhost:5173/profile", 
        cancel_url: "http://localhost:5173/profile",
        notify_url: `${NGROK_BASE_URL}/api/payments/notify`, 
        order_id: orderId,
        items: "Lanka Lotto Wallet Top-up",
        amount: amount.toFixed(2),
        currency: "LKR",
        first_name: user.name,
        last_name: "Customer",
        email: user.email,
        phone: "0771234567",
        address: "Main Street",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hash,
        custom_1: user.id, 
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit(); 
    } catch (error) {
      console.error("Payment Error:", error);
      alert("පේමන්ට් එක ආරම්භ කිරීමට නොහැකි විය!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl shadow-inner">
      <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
        💳 Quick Wallet Top-up
      </h3>
      <p className="text-xs text-slate-500 mb-4">PayHere ආරක්ෂිත පියවර හරහා ඔබේ ක්‍රෙඩිට්/ඩෙබිට් කාඩ් පතෙන් මුදල් දමන්න.</p>
      
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ඇතුළත් කරන මුදල (LKR)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">Rs.</span>
            <input 
              type="number" min="100" required value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
            />
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black py-2.5 rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow md:text-sm uppercase tracking-wider"
        >
          {loading ? "Processing..." : "Proceed to Pay"}
        </button>
      </form>
    </div>
  );
};

export default PayHereForm;