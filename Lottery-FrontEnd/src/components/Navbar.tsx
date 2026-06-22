import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth() as any;
  const navigate = useNavigate();

  const handleLogout = async () => {
  await logoutUser(); 
  
  navigate("/login"); 
  
  
};

  const isAdmin = user && user.roles && user.roles.includes("admin");

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        
       
        <Link 
          to={isAdmin ? "/admin" : "/"} 
          className="text-xl font-black tracking-wider text-amber-400 flex items-center gap-2"
        >
          🍀 LANKA-LOTTO
          {isAdmin && (
            <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-widest">
              Admin Mode
            </span>
          )}
        </Link>

        {/* 🔗 Navigation Links Section */}
        <div className="flex items-center gap-6">
          
          {isAdmin ? (
            
            <div className="flex items-center gap-6">
              <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition font-bold text-sm">
                📊 Admin Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            
            <>
              <Link to="/" className="hover:text-amber-400 transition font-medium">Home</Link>
              <Link to="/results" className="hover:text-amber-400 transition font-medium">Draw Results</Link>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-2 text-sm">
                    🧑 My Profile (Rs. {user.walletBalance})
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="hover:text-amber-400 transition text-sm font-medium">Login</Link>
                  <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-4 rounded-lg text-sm transition">
                    Register
                  </Link>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;