// src/pages/Settlements.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

export default function Settlements() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [profile, setProfile] = useState(null);

  const navigate = useNavigate();

  const fetchBalances = async () => {
    try {
      setLoading(true);

      const [settlementsRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/settlements`, { withCredentials: true }),
        axios.get(`${API_URL}/api/profile`, { withCredentials: true }),
      ]);

      setBalances(settlementsRes.data);
      setProfile(profileRes.data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/login");
      setError("Failed to load settlements");
      setLoading(false);
    }
  };

  const handlePayNow = async (friend, amount) => {
    if (processing) return;
    setProcessing(true);

    await axios.post(
      `${API_URL}/settlements/pay`,
      {
        friend,
        amount: Math.abs(amount),
      },
      { withCredentials: true }
    );

    await fetchBalances();
    setProcessing(false);
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const formatCurrency = (amount) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  if (loading)
    return <p className="p-6 text-center text-gray-200">Loading settlements...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <img
            src={profile?.profilePic || `https://i.pravatar.cc/80?u=${profile?._id}`}
            alt="User Avatar"
            className="w-16 h-16 rounded-full mb-2"
          />
          <h2 className="font-semibold">{profile?.name || "User"}</h2>
        </div>

        <nav className="space-y-2 flex-1">
          {["Dashboard", "Expenses", "Groups", "Settlements", "Settings"].map((text) => (
            <Link
              key={text}
              to={`/${text.toLowerCase()}`}
              className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${
                text === "Settlements" ? "bg-gray-800 text-teal-400 font-semibold" : ""
              }`}
            >
              {text}
            </Link>
          ))}
        </nav>

        <div className="mt-auto text-sm text-gray-400">Splitzy © 2025</div>
      </aside>

      {/* Main Content */}
      <motion.main
        className="flex-1 p-6 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-teal-400 mb-6">Settlements</h1>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl space-y-4">
          {balances.length === 0 ? (
            <p className="text-center text-gray-400">All settled. No pending balances.</p>
          ) : (
            <ul className="space-y-4">
              {balances.map((b) => (
                <motion.li
                  key={b._id}
                  className="flex justify-between items-center bg-gray-900 p-4 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div>
                    <h3 className="font-bold text-lg text-white">{b.friendName || "Friend"}</h3>
                    <p
                      className={`font-semibold ${
                        b.balance < 0 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {b.balance < 0
                        ? `You owe ${formatCurrency(Math.abs(b.balance))}`
                        : `${formatCurrency(b.balance)} owed to you`}
                    </p>
                  </div>

                  {b.balance < 0 && (
                    <motion.button
                      onClick={() => handlePayNow(b._id, b.balance)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 bg-teal-500 text-white font-semibold rounded-xl shadow-lg hover:bg-teal-600 transition-all"
                      disabled={processing}
                    >
                      Pay Now
                    </motion.button>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.main>
    </div>
  );
}
