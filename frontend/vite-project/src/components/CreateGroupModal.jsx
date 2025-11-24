// src/components/CreateGroupModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || "https://splitzy-1.onrender.com";

export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const [name, setName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/friends`, { withCredentials: true });
        setFriends(res.data);
      } catch (err) {
        setError("Could not load friends list.");
      }
    };
    fetchFriends();
  }, []);

  const handleFriendToggle = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name) return setError("Group name is required.");
    if (selectedFriends.length === 0) return setError("Please select at least one member.");

    try {
      const res = await axios.post(`${API_URL}/api/groups`, 
        { name, memberIds: selectedFriends },
        { withCredentials: true }
      );
      onGroupCreated(res.data); // Notify the parent page
      onClose(); // Close the modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-white"
      >
        <h2 className="text-2xl font-bold mb-6 text-teal-400">Create New Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          
          <div>
            <h3 className="mb-2 font-semibold">Add Members:</h3>
            <div className="max-h-40 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-2">
              {friends.map(friend => (
                <label key={friend._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-600 rounded">
                  <input type="checkbox" checked={selectedFriends.includes(friend._id)} onChange={() => handleFriendToggle(friend._id)} className="w-5 h-5 accent-teal-500" />
                  <span>{friend.name} ({friend.email})</span>
                </label>
              ))}
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-600 rounded-xl font-semibold hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-teal-500 rounded-xl font-semibold hover:bg-teal-600">Create Group</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}