
const scanForm = document.getElementById("scanForm");
const urlInput = document.getElementById("url");
const scanBtn = document.getElementById("scanBtn");
const scanBtnText = document.getElementById("scanBtnText");
const scanMessage = document.getElementById("scanMessage");

const gaugeProgress = document.getElementById("gaugeProgress");
const gaugeScore = document.getElementById("gaugeScore");
const gaugeRating = document.getElementById("gaugeRating");
const scoreLabel = document.getElementById("scoreLabel");

const checkedValue = document.getElementById("checkedValue");
const presentValue = document.getElementById("presentValue");
const findingValue = document.getElementById("findingValue");
const scanStatus = document.getElementById("scanStatus");

const emptyState = document.getElementById("emptyState");
const tableWrap = document.getElementById("tableWrap");
const headerTableBody = document.getElementById("headerTableBody");

const detailsEmpty = document.getElementById("detailsEmpty");
const detailsList = document.getElementById("detailsList");

const targetInfo = document.getElementById("targetInfo");
const httpInfo = document.getElementById("httpInfo");
const scanFooter = document.getElementById("scanFooter");

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 54;

function setMessage(message, type = "") {
  scanMessage.textContent = message;
  scanMessage.className = `scan-message ${type}`.trim();
}

function getScoreColor(score) {
  if (score >= 75) return "#3ce5a1";
  if (score >= 50) return "#ffc857";
  return "#ff647c";
}

function updateGauge(score, rating) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = GAUGE_CIRCUMFERENCE * (1 - safeScore / 100);
  const color = getScoreColor(safeScore);

  gaugeScore.textContent = safeScore;
  gaugeRating.textContent = rating || "Unknown";
  gaugeRating.style.color = color;
  gaugeProgress.style.stroke = color;
  gaugeProgress.style.strokeDasharray = String(GAUGE_CIRCUMFERENCE);
  gaugeProgress.style.strokeDashoffset = String(offset);

  scoreLabel.textContent =
    safeScore >= 90
      ? "Strong security header configuration."
      : safeScore >= 75
        ? "Good baseline. Review remaining findings."
        : safeScore >= 50
          ? "Several improvements are recommended."
          : safeScore >= 25
            ? "Important security gaps need attention."
            : "Critical: review missing or weak security headers.";
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "present" || value === "pass") {
    return "present";
  }

  if (value === "weak" || value === "warning") {
    return "weak";
  }

  return "missing";
}

function normalizeRisk(risk) {
  const value = String(risk || "High").toLowerCase();

  if (value === "low") return "low";
  if (value === "medium" || value === "moderate") return "medium";
  if (value === "critical") return "critical";

  return "high";
}

function makeBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;

  return badge;
}

function addCell(row, content) {
  const cell = document.createElement("td");

  if (content instanceof Node) {
    cell.appendChild(content);
  } else {
    cell.textContent =
      content == null || content === ""
        ? "Not provided"
        : String(content);
  }

  row.appendChild(cell);

  return cell;
}

function renderHeaderTable(headers) {
  headerTableBody.replaceChildren();

  headers.forEach((item) => {
    const row = document.createElement("tr");

    // Header name and description
    const nameCell = document.createElement("td");
    const name = document.createElement("div");

    name.className = "header-name";
    name.textContent = item.header || "Unknown header";

    nameCell.appendChild(name);

    if (item.description) {
      const description = document.createElement("div");

      description.className = "header-description";
      description.textContent = item.description;

      nameCell.appendChild(description);
    }

    row.appendChild(nameCell);

    // Header status
    const status = normalizeStatus(item.status);

    const statusText =
      status === "present"
        ? "Present"
        : status === "weak"
          ? "Weak"
          : "Missing";

    addCell(
      row,
      makeBadge(statusText, `status-badge status-${status}`)
    );

    // Risk level
    const risk = normalizeRisk(item.risk);
    const riskText = risk.charAt(0).toUpperCase() + risk.slice(1);

    addCell(
      row,
      makeBadge(riskText, `risk-badge risk-${risk}`)
    );

    // Observed header value
    addCell(row, item.value || "Not detected");

    headerTableBody.appendChild(row);
  });

  emptyState.classList.add("hidden");
  tableWrap.classList.remove("hidden");
}

function createDetailBlock(title, text) {
  const block = document.createElement("div");
  block.className = "detail-block";

  const heading = document.createElement("h4");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent =
    text || "No additional information available.";

  block.append(heading, paragraph);

  return block;
}

function renderDetails(headers) {
  detailsList.replaceChildren();

  const findings = headers.filter(
    (item) => normalizeStatus(item.status) !== "present"
  );

  if (findings.length === 0) {
    detailsEmpty.textContent =
      "No missing or weak headers were detected by these checks. " +
      "This does not guarantee that the website is fully secure.";

    detailsEmpty.classList.remove("hidden");
    detailsList.classList.add("hidden");

    return;
  }

  findings.forEach((item) => {
    const status = normalizeStatus(item.status);
    const risk = normalizeRisk(item.risk);

    const card = document.createElement("article");
    card.className = "finding-card";

    // Finding heading
    const head = document.createElement("div");
    head.className = "finding-card-head";

    const headingWrap = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = item.header || "Unknown header";

    const subtitle = document.createElement("p");
    subtitle.textContent =
      status === "missing"
        ? "This response did not include the expected header."
        : "This header was detected, but its value may need improvement.";

    headingWrap.append(heading, subtitle);

    // Status and risk badges
    const badges = document.createElement("div");

    badges.append(
      makeBadge(
        status === "missing" ? "Missing" : "Weak",
        `status-badge status-${status}`
      ),
      document.createTextNode(" "),
      makeBadge(
        `${risk.charAt(0).toUpperCase()}${risk.slice(1)} risk`,
        `risk-badge risk-${risk}`
      )
    );

    head.append(headingWrap, badges);

    // Finding details
    const body = document.createElement("div");
    body.className = "finding-card-body";

    body.append(
      createDetailBlock(
        "Why it matters",
        item.impact || item.description
      ),
      createDetailBlock(
        "Recommended action",
        item.recommendation
      )
    );

    // Example configuration, if supplied by the backend
    if (item.fixExample) {
      const exampleBlock = document.createElement("div");
      exampleBlock.className = "detail-block";

      const exampleHeading = document.createElement("h4");
      exampleHeading.textContent = "Example configuration";

      const code = document.createElement("code");
      code.className = "fix-code";
      code.textContent = item.fixExample;

      exampleBlock.append(exampleHeading, code);
      body.appendChild(exampleBlock);
    }

    // Observed value
    const valueBlock = createDetailBlock(
      "Observed value",
      item.value || "Header not detected in the response."
    );

    body.appendChild(valueBlock);

    card.append(head, body);
    detailsList.appendChild(card);
  });

  detailsEmpty.classList.add("hidden");
  detailsList.classList.remove("hidden");
}

function showScanResults(data) {
  const headers = Array.isArray(data.headers) ? data.headers : [];
  const score = Number(data.score) || 0;
  const rating = data.rating || "Unknown";

  const present = headers.filter(
    (item) => normalizeStatus(item.status) === "present"
  ).length;

  const findings = headers.filter(
    (item) => normalizeStatus(item.status) !== "present"
  ).length;

  // Update the security score gauge
  updateGauge(score, rating);

  // Update dashboard statistics
  checkedValue.textContent = data.checked ?? headers.length;
  presentValue.textContent = data.present ?? present;
  findingValue.textContent = data.findings ?? findings;

  // Update scan status
  scanStatus.textContent = "SCAN COMPLETE";
  scanStatus.style.color = "#3ce5a1";

  // Update target and HTTP information
  targetInfo.textContent = data.url || urlInput.value;

  httpInfo.textContent = data.statusCode
    ? `HTTP ${data.statusCode}`
    : "Response received";

  scanFooter.textContent = new Date().toLocaleString();

  // Render the results
  renderHeaderTable(headers);
  renderDetails(headers);
}

scanForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const targetURL = urlInput.value.trim();

  if (!targetURL) {
    setMessage("Please enter a website URL.", "error");
    return;
  }

  // Show loading state
  scanBtn.disabled = true;
  scanBtnText.textContent = "Scanning website...";
  scanStatus.textContent = "SCANNING";
  scanStatus.style.color = "#36d9f5";

  setMessage(
    "Requesting the website and analyzing its response headers..."
  );

  try {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: targetURL
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message ||
        data.error ||
        `Scan failed (HTTP ${response.status}).`
      );
    }

    // Display scan results
    showScanResults(data);

    setMessage("Scan completed successfully.", "success");
  } catch (error) {
    setMessage(
      error.message ||
      "Unable to complete the scan. Check the server terminal.",
      "error"
    );

    scanStatus.textContent = "SCAN FAILED";
    scanStatus.style.color = "#ff647c";
  } finally {
    // Restore the scan button
    scanBtn.disabled = false;
    scanBtnText.textContent = "Run Security Scan →";
  }
});
