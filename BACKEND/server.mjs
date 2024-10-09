import https from "https";
import http from "http";
import fs from "fs";
import posts from "./routes/post.mjs";
import users from "./routes/user.mjs";
import express from "express";
import cors from "cors";
import listEndpoints from 'express-list-endpoints';

const HTTPS_PORT = 3000;
const HTTP_PORT = 80; // Typically used for HTTP redirection to HTTPS
const app = express();

const options = {
    key: fs.readFileSync('keys/privatekey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

// Middleware
app.use(cors());
app.use(express.json());

// CORS and Header Configuration
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

// Routes
app.use("/post", posts);
app.use("/user", users);

// HTTPS Server
const httpsServer = https.createServer(options, app);
httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on https://localhost:${HTTPS_PORT}`);
    console.log(listEndpoints(app));
});