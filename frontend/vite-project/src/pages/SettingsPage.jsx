// src/pages/SettingsPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initial data fetch for profile and friends
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, friendsRes] = await Promise.all([
          axios.get(`${API_URL}/api/profile`, { withCredentials: true }),
          axios.get(`${API_URL}/api/friends`, { withCredentials: true })
        ]);
        setUser(profileRes.data);
        setFriends(friendsRes.data);
        setName(profileRes.data.name);
        setProfilePic(profileRes.data.profilePic || '');
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);
  
  // Effect for handling user search with debouncing
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      axios.get(`${API_URL}/api/users/search?q=${searchQuery}`, { withCredentials: true })
        .then(res => setSearchResults(res.data))
        .catch(err => console.error("Search error", err));
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/api/profile`, { name, profilePic }, { withCredentials: true });
      setUser(prev => ({ ...prev, ...res.data }));
      alert("Profile updated!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      await axios.post(`${API_URL}/api/friends`, { friendId }, { withCredentials: true });
      // Refresh friends list after adding
      const res = await axios.get(`${API_URL}/api/friends`, { withCredentials: true });
      setFriends(res.data);
      setSearchQuery(''); // Clear search
    } catch (err) {
      alert("Failed to add friend.");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      try {
        await axios.delete(`${API_URL}/api/friends/${friendId}`, { withCredentials: true });
        setFriends(prev => prev.filter(f => f._id !== friendId));
      } catch (err) {
        alert("Failed to remove friend.");
      }
    }
  };

  if (loading) return <div className="bg-gray-900 text-white h-screen flex items-center justify-center"><p>Loading Settings...</p></div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      <aside className="w-64 bg-gray-900 p-6 flex flex-col">
        {user && (
          <div className="flex flex-col items-center mb-8">
            <img src={user.profilePic || "https://via.placeholder.com/80"} alt="User Avatar" className="w-16 h-16 rounded-full mb-2" />
            <h2 className="font-semibold">{user.name}</h2>
          </div>
        )}
        <nav className="space-y-2 flex-1">
          {["Dashboard", "Expenses", "Groups", "Settlements", "Settings"].map((text) => (
            <Link key={text} to={`/${text.toLowerCase()}`} className={`flex items-center p-3 rounded-lg hover:bg-gray-700 ${text === "Settings" ? 'bg-gray-800 text-teal-400 font-semibold' : ''}`}>
              {text}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-sm text-gray-400">Splitzy © 2025</div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-teal-400 mb-6">Settings</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* --- Update Profile Section --- */}
              <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl mb-8">
                <h2 className="text-xl font-bold text-teal-400 mb-4">Update Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  <input type="text" placeholder="Profile Picture URL" value={profilePic} onChange={e => setProfilePic(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  <button type="submit" className="px-5 py-2 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600">Save Changes</button>
                </form>
              </div>

              {/* --- Add Friend Section --- */}
              <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl">
                <h2 className="text-xl font-bold text-teal-400 mb-4">Add New Friend</h2>
                <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map(result => (
                    <div key={result._id} className="flex justify-between items-center bg-gray-700 p-2 rounded-lg">
                      <span>{result.name} ({result.email})</span>
                      <button onClick={() => handleAddFriend(result._id)} className="px-3 py-1 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600">+</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column --- Friend List Section --- */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold text-teal-400 mb-4">Your Friends</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {friends.length > 0 ? friends.map(friend => (
                  <div key={friend._id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center">
                      <img src={friend.profilePic || `https://i.pravatar.cc/40?u=${friend._id}`} alt={friend.name} className="w-8 h-8 rounded-full mr-3" />
                      <span>{friend.name}</span>
                    </div>
                    <button onClick={() => handleRemoveFriend(friend._id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">Remove</button>
                  </div>
                )) : <p className="text-gray-400">You haven't added any friends yet.</p>}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}