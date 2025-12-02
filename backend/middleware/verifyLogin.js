const jwt = require("jsonwebtoken");

async function verifyUser(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    console.log(authorization);
    const token = authorization?.split(" ")[1] || req.cookies.token;
    console.log(token);
    if (!token) throw new Error("No token");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    // Return 401, not redirect
    console.log(error);
    return res.status(401).json({ message: "Not authenticated" });
  }
}

module.exports = verifyUser;
