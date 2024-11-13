require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 4000;

// Secure token from environment variable
const SECURE_TOKEN = process.env.SECURE_TOKEN;

// Middleware
app.use(bodyParser.text({ type: "text/plain", limit: "50mb" }));

// Function to check token
const checkToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === SECURE_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Get Endpoint
app.get("/", (req,res) => {
    res.send("Uplifted Render Server Up and running")
})

// Execute endpoint
app.post("/execute", checkToken, (req, res) => {
    const code = req.body;
    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        // Wrap the code in an async IIFE (Immediately Invoked Function Expression)
        const wrappedCode = `
            (async () => {
                ${code}
            })()
        `;
        
        // Execute the wrapped code and handle the promise
        eval(wrappedCode)
            .then(result => res.json({ result }))
            .catch(error => res.status(500).json({ error: error.message, trace: error.stack }));
    } catch (error) {
        res.status(500).json({ error: error.message, trace: error.stack });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});