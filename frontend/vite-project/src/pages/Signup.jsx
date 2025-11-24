import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://splitzy-1.onrender.com/signup",
        { name, email, password },
        { withCredentials: true } // sends/receives cookies
      );

      // Success → redirect
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen
      bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden text-white">
      
      <motion.div
        className="flex flex-col items-center text-center px-6 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96">
          <h1 className="text-3xl font-bold mb-6 text-center text-teal-400">Create an Account</h1>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-lg text-white bg-gray-700 placeholder-gray-400 border border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-lg text-white bg-gray-700 placeholder-gray-400 border border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-lg text-white bg-gray-700 placeholder-gray-400 border border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-teal-500 text-white rounded-2xl font-semibold text-lg shadow-xl 
                         hover:bg-teal-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Sign Up
            </motion.button>
          </form>
          
          <p className="mt-6 text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
