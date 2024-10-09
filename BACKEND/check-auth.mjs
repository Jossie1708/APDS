import jwt from "jsonwebtoken";

const checkauth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Get the token from the Authorization header
        const decoded = jwt.verify(token, "this_secret_should_be_longer_than_it_is"); // Verify the token

        // Attach the user's information to the request object
        req.user = { username: decoded.username }; // Assuming your JWT contains the username

        next(); // Pass control to the next middleware/handler
    } catch (error) {
        console.error("Token verification error:", error); // Log the error
        res.status(401).json({
            message: "Token invalid", // Send an error response
        });
    }
};

export default checkauth;
