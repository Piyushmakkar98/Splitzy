const User = require("../models/User.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// A helper function for cookie options
const getCookieOptions = () => {
    // JWT and cookie will now both expire in 2 hours
    const twoHours = 2 * 60 * 60 * 1000;
    return {
        httpOnly: true,
        // ✨ 'secure' flag is now always false for development
        secure: true,
        sameSite: 'none', // Helps mitigate CSRF attacks
        maxAge: twoHours
    };
};

const registerAccount = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Input Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
             return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        // 3. Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // 5. Create JWT
        const token = jwt.sign(
            { id: newUser._id, name: newUser.name, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        // 6. Set cookie with synchronized expiration
        res.cookie("token", token, getCookieOptions());

        // 7. Respond
        res.status(201).json({ 
            message: "User created successfully", 
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Input Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2. Find user
        const user = await User.findOne({ email }).select("+password");

        // 3. Check user and password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4. Create JWT
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        // 5. Set cookie with synchronized expiration
        res.cookie("token", token, getCookieOptions());

        // 6. Respond
        res.status(200).json({ 
            message: "User login successful", 
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during login" });
    }
}

module.exports = { registerAccount, loginAccount };