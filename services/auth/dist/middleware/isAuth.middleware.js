import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        //check header for login token from Jwt
        const authHeader = req.headers?.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please Login -  No auth header",
            });
            return;
        }
        //extracting token from the header
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login -  No bearer token",
            });
            return;
        }
        //verifying the extracting token
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Please Login -  Invalid Token",
            });
            return;
        }
        //sending user values to controller or next middleware
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        res.status(500).json({
            message: "JWT verification failed",
        });
    }
};
