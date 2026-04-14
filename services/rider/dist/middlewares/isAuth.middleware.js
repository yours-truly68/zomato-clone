import jwt from "jsonwebtoken";
const isAuth = async (req, res, next) => {
    try {
        //check header for login token
        const authHeader = req.headers?.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please Login - No Auth Header",
            });
            return;
        }
        //verifying the extracted token
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login - No Bearer Token",
            });
            return;
        }
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
    if (user && user.role === "seller") {
        res.status(403).json({
            message: "Access Denied - Sellers are not allowed to perform this action",
        });
        return;
    }
    next();
};
