// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import MonthlyExpenseChart from "../components/MonthlyExpenseChart";
import CategoryExpenseChart from "../components/CategoryExpenseChart";
import AddExpenseModal from "../components/AddExpenseModal";
import { io } from "socket.io-client";
import { socket } from "../socket";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Dashboard() {
  const [dashboardState, setDashboardState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!dashboardState.data?.profile?._id) return;
  
    socket.auth = { userId: dashboardState.data.profile._id };
    socket.connect();
  
    socket.on("connect", () => {
      console.log("🔥 Socket Connected!", socket.id);
    });
  
    socket.on("expense_notification", (data) => {
      console.log("📩 Notification received:", data);
      toast.success(`${data.message} ₹${data.amount}`);
    });
  
    return () => {
      socket.off("expense_notification");
    };
  }, [dashboardState.data]);

  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setDashboardState(prev => ({ ...prev, loading: true }));
      const [dashboardRes, monthlyRes, categoryRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard`, { withCredentials: true }),
        axios.get(`${API_URL}/api/monthly-expenses`, { withCredentials: true }),
        axios.get(`${API_URL}/api/category-expenses`, { withCredentials: true }),
      ]);

      setDashboardState({
        data: dashboardRes.data,
        loading: false,
        error: null,
      });
      setMonthlyChartData(monthlyRes.data);
      setCategoryChartData(categoryRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Error fetching data:", err);
        setDashboardState({
          data: null,
          loading: false,
          error: err.message,
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleExpenseAdded = () => {
    fetchData(); // Refresh all dashboard data after adding an expense
  };

  const { data, loading, error } = dashboardState;

  if (loading)
    return <p className="p-6 text-white text-center">Loading your dashboard...</p>;
  if (error)
    return <p className="p-6 text-red-500 text-center">Error: {error}</p>;

  const formatCurrency = (amount) => {
    return amount
      .toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace("₹", "₹");
  };


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <img
            src={data.profile.profilePic || `https://i.pravatar.cc/80?u=${data.profile.id}`}
            alt="User Avatar"
            className="w-16 h-16 rounded-full mb-2"
          />
          <h2 className="font-semibold">{data.profile.username}</h2>
        </div>
        <nav className="space-y-2 flex-1">
          {["Dashboard", "Expenses", "Groups", "Settlements", "Settings"].map(
            (text) => (
              <Link
                key={text}
                to={`/${text.toLowerCase()}`}
                className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${
                  text === "Dashboard" ? "bg-gray-800 text-teal-400 font-semibold" : ""
                }`}
              >
                {text}
              </Link>
            )
          )}
        </nav>
        <div className="mt-auto text-sm text-gray-400">Splitzy © 2025</div>
      </aside>

      {/* Main Content */}
      <motion.main
        className="flex-1 p-4 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-2xl shadow-2xl">
            <h3 className="text-sm text-gray-400">Total Spent</h3>
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(data.totalSpent)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-2xl shadow-2xl">
            <h3 className="text-sm text-gray-400">You Owe</h3>
            <p className="text-3xl font-bold text-red-400">
              {formatCurrency(data.pending.toPay)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-2xl shadow-2xl">
            <h3 className="text-sm text-gray-400">Owed To You</h3>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(data.pending.toReceive)}
            </p>
          </div>
        </div>

        {/* Pending Settlements + Recent Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl h-full">
            <h3 className="text-xl font-bold mb-4 text-teal-400">
              Pending Settlements
            </h3>
            <ul className="space-y-3 text-base">
              <li className="flex justify-between items-center">
                <span>To Pay</span>
                <span className="text-red-400 font-semibold">
                  {formatCurrency(data.pending.toPay)}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span>To Receive</span>
                <span className="text-green-400 font-semibold">
                  {formatCurrency(data.pending.toReceive)}
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-teal-400">
              Recent Expenses
            </h3>
            <ul className="space-y-3 text-base flex-1 overflow-y-auto pr-2">
              {data.recentExpenses.length > 0 ? (
                data.recentExpenses.map((exp) => (
                  <li
                    key={exp._id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="mr-3">{exp.icon || "💸"}</span>
                      <span>{exp.description}</span>
                    </div>
                    <span className="font-semibold text-blue-400">
                      {formatCurrency(exp.amount)}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">No recent expenses found.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-teal-400">Quick Actions</h3>
          <div className="flex space-x-4">
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold shadow-lg hover:bg-teal-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              + Add Expense
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-700 text-teal-400 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Settle Up
            </motion.button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-[2]">
          <div className="bg-gray-800 p-4 rounded-2xl shadow-2xl h-full flex flex-col">
            <h4 className="text-xl font-bold mb-2 text-center text-teal-400">
              Monthly Spending
            </h4>
            <div className="flex-1">
              <MonthlyExpenseChart data={monthlyChartData} />
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-2xl shadow-2xl h-full flex flex-col">
            <h4 className="text-xl font-bold mb-2 text-center text-teal-400">
              Spending by Category
            </h4>
            <div className="flex-1">
              <CategoryExpenseChart data={categoryChartData} />
            </div>
          </div>
        </div>
      </motion.main>
      
      {isModalOpen && (
        <AddExpenseModal 
          user={data.profile}
          onClose={() => setIsModalOpen(false)} 
          onExpenseAdded={handleExpenseAdded} 
        />
      )}
    </div>
  );
}