import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import AdminRoute from "../components/AdminRoute";
import AdminDashboard from "../pages/AdminDashboard";
import DrawResults from "../pages/DrawResults";
import AdminTransactions from "../pages/AdminTransactions";


// ඊළඟ පියවරවල් වලදී මේ පිටු දෙක හදමු, දැනට නිකන් තියන්න 👇
// const Results = () => <div className="p-8">Draw Results Page (Coming Soon...)</div>;

function App() {
  return (
    <Router>
      {/* 👑 Navbar එක මෙතනින් දැම්මම හැම පිටුවකම උඩින්ම ස්ථිරව පේනවා */}
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/results" element={<DrawResults />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;