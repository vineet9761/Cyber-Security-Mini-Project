
const express = require("express");
const path = require("node:path");

const scannerRoute = require("./routes/scanner");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON requests with a small size limit.
app.use(express.json({ limit: "10kb" }));

// Serve the frontend.
app.use(express.static(path.join(__dirname, "public")));

// API route.
app.use("/api", scannerRoute);

// Handle malformed JSON.
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request."
        });
    }

    next(error);
});

// Start server.
app.listen(PORT, () => {
    console.log("-------------------------------------------");
    console.log(" SecureScan - HTTP Security Header Analyzer");
    console.log("-------------------------------------------");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Status: Ready");
});
