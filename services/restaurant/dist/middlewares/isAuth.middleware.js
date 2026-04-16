import jwt from "jsonwebtoken";
const isAuth = async (req, res, next) => {
    try {
        const internalKey = req.headers["x-internal-key"];
        if (internalKey && internalKey === process.env.INTERNAL_SERVICE_KEY) {
            return next(); // 🔥 bypass JWT completely
        }
        //check header for login token
        const authHeader = req.headers?.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please Login - No Auth Header",
            });
            return;
        }
        //extracting token from the header
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login - No Bearer Token",
            });
            return;
        }
        //verifying the extracted token
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Please Login - Invalid Token",
            });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        res.status(500).json({
            message: "Please Login - Jwt Error",
        });
    }
};
export default isAuth;
export const isSeller = (req, res, next) => {
    const user = req.user;
    if (user && user.role !== "seller") {
        res.status(401).json({ message: "Only sellers can perform this action" });
        return;
    }
    next();
};
