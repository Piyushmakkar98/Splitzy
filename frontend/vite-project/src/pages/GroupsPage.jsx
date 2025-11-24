import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import CreateGroupModal from '../components/CreateGroupModal';

const API_URL = import.meta.env.VITE_API_URL || "https://splitzy-1.onrender.com";

export default function GroupsPage() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, groupsRes] = await Promise.all([
          axios.get(`${API_URL}/api/profile`, { withCredentials: true }),
          axios.get(`${API_URL}/api/groups`, { withCredentials: true })
        ]);
        setUser(profileRes.data);
        setGroups(groupsRes.data);
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
  
  const handleGroupCreated = (newGroup) => {
    setGroups(prevGroups => [newGroup, ...prevGroups]);
  };

  if (loading) return <div className="bg-gray-900 text-white h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (error) return <div className="bg-gray-900 text-white h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      {/* Sidebar */}
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
                text === "Groups" ? 'bg-gray-800 text-teal-400 font-semibold' : ''
              }`}
            >
              {text}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-sm text-gray-400">Splitzy © 2025</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-teal-400">Your Groups</h1>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-teal-500 text-white rounded-xl font-semibold shadow-lg hover:bg-teal-600 transition-colors duration-200"
            >
              + Create New Group
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length > 0 ? (
              groups.map((group) => (
                <Link to={`/groups/${group._id}`} key={group._id}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-gray-800 p-6 rounded-2xl shadow-lg h-48 flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">{group.name}</h2>
                      <p className="text-sm text-gray-400">{group.members.length} members</p>
                      {/* ✨ ADD THIS LINE to display the creation date */}
                      <p className="text-xs text-gray-500 mt-1">
                        Created on: {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 5).map(member => (
                        <img key={member._id} className="w-8 h-8 rounded-full border-2 border-gray-700" src={`https://i.pravatar.cc/40?u=${member._id}`} alt={member.name} />
                      ))}
                      {group.members.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold border-2 border-gray-700">
                          +{group.members.length - 5}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-gray-800 rounded-xl">
                <p className="text-gray-400">You're not a part of any groups yet.</p>
                <p className="text-gray-500 text-sm mt-2">Click "Create New Group" to get started!</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {isModalOpen && (
        <CreateGroupModal 
          onClose={() => setIsModalOpen(false)} 
          onGroupCreated={handleGroupCreated} 
        />
      )}
    </div>
  );
}