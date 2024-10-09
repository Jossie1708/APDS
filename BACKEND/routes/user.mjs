import express from 'express';
import db from "../db/conn.mjs"; // Connecting to the database
import { ObjectId  } from 'mongodb';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

const router = express.Router();

var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

// Sign up
router.post("/register", async (req, res) => {
    try {
        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log("Hashed password:", hashedPassword);
        // Create the new user document with `username`
        const newDocument = {
            username: req.body.username, // Use `username` consistently
            idNumber: req.body.idNumber,
            accountNumber: req.body.accountNumber,
            password: hashedPassword
        };

        // Insert the new user into the database
        let collection = await db.collection("users");
        await collection.insertOne(newDocument);
        console.log("User created:", newDocument);
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user." });
    }
});




router.post("/login", bruteforce.prevent, async (req, res) => {
    const { username, accountNumber, password } = req.body;
    console.log("Attempting login for:", username);
    
    try {
        const collection = await db.collection("users");
        const user = await collection.findOne({ username, accountNumber });

        if (!user) {
            console.error("User not found");
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Log the hashed password from the database and the plain text password from the request
        console.log("User password hash from DB:", user.password);
        console.log("Password from request body:", password);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.error("Password mismatch");
            return res.status(401).json({ message: "Authentication failed" });
        }

        const token = jwt.sign({ username: user.username }, "this_secret_should_be_longer_than_it_is", { expiresIn: "1h" });
        console.log("Authentication successful, token generated:", token);
        res.status(200).json({ message: "Authentication successful", token, username: user.username });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});




export default router;
