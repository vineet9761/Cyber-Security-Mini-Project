const express = require("express");
const router = express.Router();

const { validateURL } = require("../utils/validator");
const { analyzeHeaders } = require("../services/headerAnalyzer");

router.post("/scan", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid website URL."
      });
    }

    const validation = await validateURL(url);

    // Support validators that return either true or a result object.
    if (
      validation === false ||
      (validation && typeof validation === "object" &&
        validation.valid === false)
    ) {
      return res.status(400).json({
        success: false,
        message: validation.message || "This URL is not allowed."
      });
    }

    const targetURL = new URL(url);

    const response = await fetch(targetURL.toString(), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "SecureScan/1.0",
        "Accept": "text/html,application/xhtml+xml,*/*"
      }
    });

    if (response.status >= 300 && response.status < 400) {
      return res.status(422).json({
        success: false,
        message: "The website returned a redirect. Try scanning its final destination URL."
      });
    }

    const headers = Object.fromEntries(response.headers.entries());

    const analysis = analyzeHeaders(
      headers,
      targetURL.protocol === "https:"
    );

    return res.json({
      success: true,
      url: targetURL.toString(),
      statusCode: response.status,
      score: analysis.score,
      rating: analysis.rating,
      checked: analysis.checked,
      present: analysis.present,
      findings: analysis.findings,
      headers: analysis.results
    });
  } catch (error) {
    // Print the underlying error for debugging.
    console.error("[SecureScan] Scan failed:", error);
    console.error("Error message:", error.message);
    console.error("Error cause:", error.cause);
    console.error("Error code:", error.cause?.code);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "The website took too long to respond. Try again."
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to fetch the website. Check the server terminal for details."
    });
  }
});

module.exports = router;