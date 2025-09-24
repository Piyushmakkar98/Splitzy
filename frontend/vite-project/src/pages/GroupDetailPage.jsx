import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import AddExpenseModal from '../components/AddExpenseModal';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, groupRes] = await Promise.all([
          axios.get(`${API_URL}/api/profile`, { withCredentials: true }),
          axios.get(`${API_URL}/api/groups/${groupId}`, { withCredentials: true })
        ]);
        setUser(profileRes.data);
        setGroup(groupRes.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        } else {
          setError("Failed to fetch group details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, navigate]);

  const handleExpenseAdded = (newExpense) => {
    setGroup(prevGroup => ({
      ...prevGroup,
      expenses: [newExpense, ...prevGroup.expenses]
    }));
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  if (loading) return <div className="bg-gray-900 text-white h-screen flex items-center justify-center"><p>Loading Group...</p></div>;
  if (error) return <div className="bg-gray-900 text-white h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      <aside className="w-64 bg-gray-900 p-6 flex flex-col">
        {user && <div className="flex flex-col items-center mb-8"><img src={user.profilePic || "https://via.placeholder.com/80"} alt="User Avatar" className="w-16 h-16 rounded-full mb-2" /><h2 className="font-semibold">{user.name}</h2></div>}
        <nav className="space-y-2 flex-1">{["Dashboard", "Expenses", "Groups", "Settlements", "Settings"].map((text) => (<Link key={text} to={`/${text.toLowerCase()}`} className={`flex items-center p-3 rounded-lg hover:bg-gray-700 ${text === "Groups" ? 'bg-gray-800 text-teal-400 font-semibold' : ''}`}>{text}</Link>))}</nav>
        <div className="mt-auto text-sm text-gray-400">Splitzy © 2025</div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-teal-400">{group.name}</h1>
            <motion.button onClick={() => setIsModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-teal-500 text-white rounded-xl font-semibold shadow-lg hover:bg-teal-600">
              + Add Expense to Group
            </motion.button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-2xl shadow-lg mb-6">
            <h2 className="text-xl font-bold text-teal-400 mb-4">Members</h2>
            <div className="flex flex-wrap gap-4">
              {group.members.map(member => (
                <div key={member._id} className="flex items-center bg-gray-700 p-2 rounded-lg">
                  <img src={member.profilePic || `https://i.pravatar.cc/40?u=${member._id}`} alt={member.name} className="w-8 h-8 rounded-full mr-3" />
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-teal-400 mb-4">Group Expenses</h2>
            <div className="space-y-4">
              {group.expenses.length > 0 ? group.expenses.map(exp => (
                <div key={exp._id} className="bg-gray-800 p-4 rounded-xl shadow-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white text-lg">{exp.description}</p>
                    <p className="text-sm text-gray-400">Paid by <span className="font-medium text-gray-300">{exp.paidBy.name}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-blue-400">{formatCurrency(exp.amount)}</p>
                  </div>
                </div>
              )) : <p className="text-center text-gray-500 p-4">No expenses have been added to this group yet.</p>}
            </div>
          </div>
        </motion.div>
      </main>
      
      {isModalOpen && <AddExpenseModal user={user} groupId={groupId} onClose={() => setIsModalOpen(false)} onExpenseAdded={handleExpenseAdded} />}
    </div>
  );
}