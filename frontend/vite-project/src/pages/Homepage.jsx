// src/pages/Homepage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = "Splitzy | Welcome";
  }, []);

  return (
    <div className="relative flex items-center justify-center h-screen
      bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden text-white">

      {/* Optional animated particle background */}
      <div className="absolute inset-0">
        {/* Can add tsparticles or CSS animation here later */}
      </div>

      {!show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-semibold text-gray-400 z-10"
        >
          Loading...
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center text-center px-6 z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Hero Heading */}
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to <span className="text-teal-400">Splitzy</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Effortlessly track, split, and settle expenses with friends and family.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-teal-500 text-white rounded-2xl font-semibold text-lg shadow-xl hover:bg-teal-600 transition-all"
            onClick={() => navigate("/login")}
          >
            Begin
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default Homepage;