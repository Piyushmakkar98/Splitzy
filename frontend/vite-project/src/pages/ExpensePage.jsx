import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import AddExpenseModal from '../components/AddExpenseModal';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ExpensesPage() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, expensesRes] = await Promise.all([
          axios.get(`${API_URL}/api/profile`, { withCredentials: true }),
          axios.get(`${API_URL}/api/expenses`, { withCredentials: true })
        ]);
        setUser(profileRes.data);
        setExpenses(expensesRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to fetch data.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  if (loading) return <div className="bg-gray-900 text-white h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (error) return <div className="bg-gray-900 text-white h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      {/* Sidebar JSX Directly Included */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col">
        {user && (
          <div className="flex flex-col items-center mb-8">
            <img src={user.profilePic || "https://via.placeholder.com/80"} alt="User Avatar" className="w-16 h-16 rounded-full mb-2" />
            <h2 className="font-semibold">{user.name}</h2>
          </div>
        )}
        <nav className="space-y-2 flex-1">
          {["Dashboard", "Expenses", "Groups", "Settlements", "Settings"].map((text) => (
            <Link
              key={text}
              to={`/${text.toLowerCase()}`}
              className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 ${
                text === "Expenses" ? 'bg-gray-800 text-teal-400 font-semibold' : ''
              }`}
            >
              {text}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-sm text-gray-400">Splitzy © 2025</div>
      </aside>

      {/* Main Content for Expenses */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-teal-400">All Expenses</h1>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-teal-500 text-white rounded-xl font-semibold shadow-lg hover:bg-teal-600 transition-colors duration-200"
            >
              + Add Expense
            </motion.button>
          </div>

          {/* ✨ --- THIS IS THE LINE TO UPDATE --- ✨ */}
          {/* Replaced 'space-y-4' with responsive grid classes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {expenses.length > 0 ? (
              expenses.map((exp) => {
                const myShare = exp.participants.find(p => p.user._id === user._id)?.share || 0;
                
                return (
                  <div key={exp._id} className="bg-gray-800 p-4 rounded-xl shadow-lg flex justify-between items-center transition-transform hover:scale-[1.02]">
                    <div className="flex items-center">
                      <div className="text-3xl mr-5 p-3 bg-gray-700 rounded-lg">{exp.category === 'Food' ? '🍕' : exp.category === 'Travel' ? '✈️' : exp.category === 'Shopping' ? '🛍️' : exp.category === 'Bills' ? '🧾' : '💸'}</div>
                      <div>
                        <p className="font-semibold text-white text-lg">{exp.description}</p>
                        <p className="text-sm text-gray-400">
                          Paid by <span className="font-medium text-gray-300">{exp.paidBy.name}</span> on {new Date(exp.createdAt).toLocaleDateString()}
                          {exp.group && ` in group "${exp.group.name}"`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-blue-400">{formatCurrency(exp.amount)}</p>
                      <p className="text-sm text-teal-400">Your Share: {formatCurrency(myShare)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10 bg-gray-800 rounded-xl">
                <p className="text-gray-400">You haven't recorded any expenses yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {isModalOpen && (
        <AddExpenseModal 
          user={user}
          onClose={() => setIsModalOpen(false)} 
          onExpenseAdded={handleExpenseAdded} 
        />
      )}
    </div>
  );
}