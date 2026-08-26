# 🛡️ HTTP Security Header Analyzer

A full-stack web application designed to scan, evaluate, and score the HTTP security headers of any website. Built with **Node.js**, **Express**, and **Vanilla JS**, this tool provides web developers and cybersecurity enthusiasts with instant insights into web application security posture based on industry header guidelines.

---

## ✨ Features

- **🌐 Automated Header Inspection**: Fetches and inspects live HTTP response headers from any public target URL.
- **📊 Weighted Security Scoring**: Calculates a dynamic security score (0–100) based on header importance and OWASP best practices.
- **🏷️ Rating Classification**: Categorizes overall website header security into 5 distinct tiers (*Excellent*, *Good*, *Moderate*, *Poor*, *Critical*).
- **📝 Detailed Analysis & Guidance**: Highlights present vs. missing security headers with explanations of their protective mechanisms.
- **🔍 Input Validation**: Built-in URL validation ensuring only valid `http://` or `https://` endpoints are scanned.
- **🎨 Modern Dark UI**: Sleek dark-mode interface designed for high contrast and readability.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express.js (v5), Native Fetch API |
| **Frontend** | HTML5, Modern CSS3, JavaScript (ES6+) |
| **Utilities** | Custom URL validator, Modular header analysis engine |

---

## 📁 Project Structure

```text
Cyber-Security-Mini-Project/
├── public/
│   ├── index.html        # Main user interface structure
│   ├── style.css         # Dark theme styling and layout
│   └── script.js         # Client-side form handling and AJAX request rendering
├── routes/
│   └── scanner.js        # Express router handling POST /api/scan requests
├── services/
│   └── headerAnalyzer.js # Security header evaluation engine & scoring logic
├── utils/
│   └── validator.js      # URL format and protocol validation helper
├── package.json          # Node.js project metadata and dependencies
├── server.js             # Express application initialization and static server
└── README.md             # Project documentation
```

---

## 🛡️ Security Headers Analyzed

The analyzer checks for 7 critical HTTP security headers, assigning scores based on their risk mitigation weights:

| Security Header | Weight | Description & Protection |
| :--- | :---: | :--- |
| **Content-Security-Policy (CSP)** | `25` | Prevents Cross-Site Scripting (XSS), data injection, and malicious script execution. |
| **Strict-Transport-Security (HSTS)** | `20` | Enforces HTTPS connections and prevents SSL stripping / man-in-the-middle attacks. |
| **X-Frame-Options** | `15` | Defends against Clickjacking by controlling whether the site can be embedded in `<frame>` or `<iframe>`. |
| **X-Content-Type-Options** | `15` | Disables MIME-sniffing, forcing browsers to respect declared Content-Type headers. |
| **Referrer-Policy** | `10` | Restricts sensitive URL path and parameter information sent via `Referer` headers. |
| **Permissions-Policy** | `10` | Restricts access to browser APIs and device features (camera, microphone, geolocation). |
| **Cross-Origin-Opener-Policy (COOP)** | `5` | Isolates browsing contexts to prevent cross-origin popups from accessing window objects. |

---

## 📈 Rating Scale

The calculated cumulative score determines the site's security rating:

| Score Range | Rating | Evaluation |
| :---: | :---: | :--- |
| **90 – 100** | 🟢 **Excellent** | Comprehensive header protection active. |
| **75 – 89** | 🔵 **Good** | Solid security baseline; minor non-critical headers missing. |
| **50 – 74** | 🟡 **Moderate** | Basic headers present, but vulnerable to key attacks like XSS or Clickjacking. |
| **25 – 49** | 🟠 **Poor** | Missing multiple essential security headers. |
| **0 – 24** | 🔴 **Critical** | Almost no security headers configured; high risk. |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher recommended)
- **npm** (comes bundled with Node.js)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd Cyber-Security-Mini-Project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   node server.js
   ```

4. **Access the application**:
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 📡 API Documentation

### `POST /api/scan`

Scans a given target URL and returns header analysis results.

#### Request Body
```json
{
  "url": "https://example.com"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "url": "https://example.com",
  "statusCode": 200,
  "score": 85,
  "rating": "Good",
  "headers": [
    {
      "header": "Content-Security-Policy",
      "status": "Present",
      "value": "default-src 'self'",
      "weight": 25,
      "description": "Helps prevent Cross-site Scripting (XSS) and other code injection attacks."
    },
    {
      "header": "Strict-Transport-Security",
      "status": "Missing",
      "value": null,
      "weight": 20,
      "description": "Forces browsers to use HTTPS instead of HTTP."
    }
  ]
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Only HTTP and HTTPS URLs are allowed."
}
```

---

## 📄 License

Distributed under the ISC License.
