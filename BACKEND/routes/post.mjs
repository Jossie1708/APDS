import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import checkauth from "../check-auth.mjs";

const router = express.Router();

router.get("/transactions", checkauth, async (req, res) => {
    try {
        // Log the authenticated user
        console.log("Authenticated user:", req.user);

        const collection = await db.collection("posts");
        const query = { user: req.user.username };

        // Log the query being made
        console.log("Querying transactions for user:", req.user.username);

        const results = await collection.find(query).toArray();
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching transactions:", error.message);
        console.error(error.stack);  // This will log the stack trace
        res.status(500).json({ error: "Failed to fetch transactions." });
    }
});


// Create a new transaction.
router.post("/upload", checkauth, async (req, res) => {
    try {
        const newDocument = {
            user: req.user.username,
            amount: req.body.amount,
            currency: req.body.currency,
            provider: req.body.provider,
            accountNumber: req.body.accountNumber,
            swiftCode: req.body.swiftCode,
        };
        const collection = await db.collection("posts");
        const result = await collection.insertOne(newDocument);
        res.status(201).json({ message: "Transaction created successfully", transactionId: result.insertedId });
    } catch (error) {
        console.error("Error uploading transaction:", error);
        res.status(500).json({ error: "Failed to upload transaction." });
    }
});

// Update a transaction by id
router.patch("/:id", checkauth, async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id), user: req.user.username };
        const updates = {
            $set: {
                amount: req.body.amount,
                currency: req.body.currency,
                provider: req.body.provider,
                accountNumber: req.body.accountNumber,
                swiftCode: req.body.swiftCode,
            }
        };
        const collection = await db.collection("posts");
        const result = await collection.updateOne(query, updates);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Transaction not found or not modified." });
        }
        
        res.status(200).json({ message: "Transaction updated successfully." });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ error: "Failed to update transaction." });
    }
});

// Get a single record by id
router.get("/:id", async (req, res) => {
    try {
        const collection = await db.collection("posts");
        const query = { _id: new ObjectId(req.params.id) };
        const result = await collection.findOne(query);

        if (!result) {
            return res.status(404).json({ error: "Post not found." });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ error: "Failed to fetch post." });
    }
});

// Delete a transaction
router.delete("/transactions/:id", checkauth, async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id), user: req.user.username };
        const collection = await db.collection("posts");
        const result = await collection.deleteOne(query);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Transaction not found." });
        }

        res.status(200).json({ message: "Transaction deleted successfully." });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: "Failed to delete transaction." });
    }
});

export default router;
