const SECURITY_HEADERS = [
  {
    name: "Content-Security-Policy",
    weight: 25,
    description: "Controls which sources a browser may load content from.",
    impact:
      "Without a suitable Content Security Policy, certain cross-site scripting (XSS) attacks can be harder to contain. A policy that allows unsafe sources may provide weaker protection.",
    recommendation:
      "Define a policy that allows only the scripts, styles, images, and other resources your application needs. Test it before enforcing it on a live site.",
    fixExample:
      "Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
    evaluate(value) {
      if (!value) return "Missing";

      const lower = value.toLowerCase();

      if (
        lower.includes("unsafe-eval") ||
        lower.includes("default-src *") ||
        lower.includes("script-src *")
      ) {
        return "Weak";
      }

      if (lower.includes("unsafe-inline")) {
        return "Weak";
      }

      return "Present";
    }
  },
  {
    name: "Strict-Transport-Security",
    weight: 20,
    description: "Tells browsers to use HTTPS for future connections.",
    impact:
      "When a site is HTTPS-enabled but does not set HSTS, browsers may be more vulnerable to certain downgrade or first-connection attacks.",
    recommendation:
      "For HTTPS websites, configure an appropriate max-age. Add includeSubDomains only when all relevant subdomains support HTTPS.",
    fixExample:
      "Strict-Transport-Security: max-age=31536000",
    evaluate(value, isHttps) {
      if (!value || !isHttps) return "Missing";

      const match = value.match(/max-age\s*=\s*(\d+)/i);
      if (!match || Number(match[1]) < 15552000) return "Weak";

      return "Present";
    }
  },
  {
    name: "X-Frame-Options",
    weight: 15,
    description: "Helps control whether a page can be embedded in frames.",
    impact:
      "If sensitive pages can be embedded by an untrusted site, users may be exposed to clickjacking attacks.",
    recommendation:
      "Use DENY or SAMEORIGIN when suitable for your application. A CSP frame-ancestors directive is the modern, flexible alternative.",
    fixExample: "X-Frame-Options: SAMEORIGIN",
    evaluate(value) {
      if (!value) return "Missing";

      const normalized = value.trim().toUpperCase();
      return ["DENY", "SAMEORIGIN"].includes(normalized)
        ? "Present"
        : "Weak";
    }
  },
  {
    name: "X-Content-Type-Options",
    weight: 15,
    description: "Prevents browsers from guessing a response's content type.",
    impact:
      "Without nosniff, some browsers may interpret content differently from the declared MIME type, potentially increasing risk when content is served incorrectly.",
    recommendation:
      "Set the header to nosniff and make sure your server returns the correct Content-Type for each resource.",
    fixExample: "X-Content-Type-Options: nosniff",
    evaluate(value) {
      if (!value) return "Missing";

      return value.trim().toLowerCase() === "nosniff"
        ? "Present"
        : "Weak";
    }
  },
  {
    name: "Referrer-Policy",
    weight: 10,
    description: "Controls how much referrer information is sent to other sites.",
    impact:
      "A permissive policy can disclose URL information to other origins. URLs sometimes contain sensitive query parameters.",
    recommendation:
      "Use a privacy-conscious policy that fits your application. strict-origin-when-cross-origin is a common baseline.",
    fixExample: "Referrer-Policy: strict-origin-when-cross-origin",
    evaluate(value) {
      if (!value) return "Missing";

      const allowed = [
        "no-referrer",
        "same-origin",
        "strict-origin",
        "strict-origin-when-cross-origin",
        "no-referrer-when-downgrade",
        "origin",
        "origin-when-cross-origin",
        "unsafe-url",
        "strict-origin-when-cross-origin"
      ];

      const policies = value.split(",").map((part) => part.trim().toLowerCase());
      const finalPolicy = policies[policies.length - 1];

      if (!allowed.includes(finalPolicy)) return "Weak";
      if (finalPolicy === "unsafe-url") return "Weak";

      return "Present";
    }
  },
  {
    name: "Permissions-Policy",
    weight: 10,
    description: "Restricts browser features such as camera, microphone, and geolocation.",
    impact:
      "Without an appropriate policy, browser features may remain available to documents where they are not needed. This header is one layer of browser feature control, not a replacement for permissions or application checks.",
    recommendation:
      "Disable features your application does not use, and allow required features only for intended origins.",
    fixExample:
      "Permissions-Policy: camera=(), microphone=(), geolocation=()",
    evaluate(value) {
      if (!value) return "Missing";
      if (value.trim().length < 3) return "Weak";
      return "Present";
    }
  },
  {
    name: "Cross-Origin-Opener-Policy",
    weight: 5,
    description: "Controls whether a document shares a browsing context group with cross-origin documents.",
    impact:
      "Depending on the application, a missing or unsuitable policy may leave some cross-origin window interactions available that the site would prefer to isolate.",
    recommendation:
      "Consider same-origin when your application can support it. Test authentication popups, payment flows, and other cross-origin integrations first.",
    fixExample: "Cross-Origin-Opener-Policy: same-origin",
    evaluate(value) {
      if (!value) return "Missing";

      const allowed = [
        "same-origin",
        "same-origin-allow-popups",
        "noopener-allow-popups"
      ];

      return allowed.includes(value.trim().toLowerCase())
        ? "Present"
        : "Weak";
    }
  }
];

function analyzeHeaders(headers = {}, isHttps = false) {
  const normalizedHeaders = {};

  for (const [name, value] of Object.entries(headers)) {
    normalizedHeaders[name.toLowerCase()] = String(value);
  }

  let score = 0;

  const results = SECURITY_HEADERS.map((check) => {
    const value = normalizedHeaders[check.name.toLowerCase()] || "";
    const status = check.evaluate(value, isHttps);

    let points = 0;

    if (status === "Present") {
      points = check.weight;
    } else if (status === "Weak") {
      points = Math.round(check.weight * 0.4);
    }


    let risk;

    if (status === "Present") {
      risk = "Low";
    } else if (status === "Weak") {
      risk = check.weight >= 20 ? "High" : "Medium";
    } else {
      risk = check.weight >= 20 ? "High" : "Medium";
    }

    // HSTS has no protection on a plain HTTP connection.
    if (check.name === "Strict-Transport-Security" && !isHttps) {
      points = 0;
      risk = "High";
    }
    score += points;

    return {
      header: check.name,
      status,
      risk,
      value,
      points,
      weight: check.weight,
      description: check.description,
      impact: check.impact,
      recommendation: check.recommendation,
      fixExample: check.fixExample
    };
  });

  // Keep the score bounded to 0–100.
  score = Math.max(0, Math.min(100, score));

  let rating;

  if (score >= 90) rating = "Excellent";
  else if (score >= 75) rating = "Good";
  else if (score >= 50) rating = "Moderate";
  else if (score >= 25) rating = "Poor";
  else rating = "Critical";

  const present = results.filter((item) => item.status === "Present").length;
  const findings = results.filter((item) => item.status !== "Present").length;

  return {
    score,
    rating,
    checked: results.length,
    present,
    findings,
    results
  };
}

module.exports = { analyzeHeaders };