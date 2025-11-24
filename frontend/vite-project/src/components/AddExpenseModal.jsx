import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || "https://splitzy-1.onrender.com";

export default function AddExpenseModal({ user, groupId, onClose, onExpenseAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(groupId || '');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsRes, groupsRes] = await Promise.all([
          axios.get(`${API_URL}/api/friends`, { withCredentials: true }),
          axios.get(`${API_URL}/api/groups`, { withCredentials: true })
        ]);
        setFriends(friendsRes.data);
        setGroups(groupsRes.data);
      } catch (err) {
        setError("Could not load friends or groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (selectedGroup) {
      const group = groups.find(g => g._id === selectedGroup);
      if (group) {
        const memberIds = group.members.map(member => member._id).filter(id => id !== user._id);
        setSelectedFriends(memberIds);
      }
    } else {
      setSelectedFriends([]);
    }
  }, [selectedGroup, groups, user]);

  const handleFriendToggle = (friendId) => {
    if (!selectedGroup) {
      setSelectedFriends(prev => 
        prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
      );
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return setError('Please enter a valid amount.');
    }
    
    // ✨ --- REFACTORED LOGIC --- ✨
    let participantIds = [];
    if (selectedGroup) {
        const group = groups.find(g => g._id === selectedGroup);
        if (group) {
            participantIds = group.members.map(member => member._id);
        }
    } else {
        participantIds = [...selectedFriends, user._id];
    }

    const finalParticipantIds = [...new Set(participantIds)];
    const numberOfParticipants = finalParticipantIds.length;

    if (numberOfParticipants === 0) {
      return setError('Please select at least one participant.');
    }

    const share = parseFloat((numericAmount / numberOfParticipants).toFixed(2));
    
    const participants = finalParticipantIds.map(id => ({ user: id, share }));

    const totalCalculatedShare = participants.reduce((sum, p) => sum + p.share, 0);
    const remainder = numericAmount - totalCalculatedShare;
    if (remainder !== 0 && participants.length > 0) {
      participants[0].share = parseFloat((participants[0].share + remainder).toFixed(2));
    }
    
    const payload = {
      description,
      amount: numericAmount,
      category,
      participants,
      group: selectedGroup || null
    };
    
    try {
      const res = await axios.post(`${API_URL}/api/expenses`, payload, { withCredentials: true });
      //const res2 = await axios.post(`${API_URL}/api/expenses/create`, payload, { withCredentials: true });
      onExpenseAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-white"
      >
        <h2 className="text-2xl font-bold mb-6 text-teal-400">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          <input type="number" step="0.01" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none">
            {['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Other'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none">
            <option value="">Split with individual friends...</option>
            {groups.map(group => <option key={group._id} value={group._id}>{group.name}</option>)}
          </select>
          
          {/* ✨ UX IMPROVEMENT: Conditionally show friend list or group summary */}
          <div>
            <h3 className="mb-2 font-semibold">Participants:</h3>
            <div className="max-h-32 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-2">
              {loading ? <p className="text-gray-400">Loading...</p> : (
                selectedGroup ? (
                  groups.find(g => g._id === selectedGroup)?.members.map(member => (
                    <div key={member._id} className="flex items-center space-x-3 p-2 text-gray-400">
                      <input type="checkbox" checked readOnly className="w-5 h-5 accent-teal-500" />
                      <span>{member.name}</span>
                    </div>
                  ))
                ) : (
                  friends.map(friend => (
                    <label key={friend._id} className="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-gray-600">
                      <input type="checkbox" checked={selectedFriends.includes(friend._id)} onChange={() => handleFriendToggle(friend._id)} className="w-5 h-5 accent-teal-500" />
                      <span>{friend.name}</span>
                    </label>
                  ))
                )
              )}
            </div>
             {!selectedGroup && <p className="text-xs text-gray-400 mt-1">You are automatically included in the split.</p>}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-600 rounded-xl font-semibold hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-teal-500 rounded-xl font-semibold hover:bg-teal-600">Add Expense</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}