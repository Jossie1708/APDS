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
router.post("/signup", async (req, res) => {
    try {
        const password = await bcrypt.hash(req.body.password, 10); // Ensure to await this
        let newDocument = {
            fullName: req.body.fullName,
            idNumber: req.body.idNumber,
            accountNumber: req.body.accountNumber,
            password: password // Already a string
        };
        let collection = await db.collection("users");
        let result = await collection.insertOne(newDocument);
        console.log("User  created:", newDocument); // Debug: Log the new user
        res.status(201).json({ message: "User  created successfully" }); // Send a message with a 201 status
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user." });
    }
});


// Login
router.post("/login", bruteforce.prevent, async (req, res) => {
    const { username, accountNumber, password } = req.body;
    console.log("Attempting login for:", username); // Debug: Log the attempted login

    try {
        const collection = await db.collection("users");
        const user = await collection.findOne({ username, accountNumber });

        // Check if user exists
        if (!user) {
            console.error("User  not found"); // Debug
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.error("Password mismatch"); // Debug
            return res.status(401).json({ message: "Authentication failed" });
        } else {
            // Generate a JWT token
            const token = jwt.sign({ username: user.username }, "this_secret_should_be_longer_than_it_is", { expiresIn: "1h" });
            console.log("Authentication successful, token generated:", token); // Debug
            res.status(200).json({ message: "Authentication successful", token: token, username: user.username });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});


export default router;
