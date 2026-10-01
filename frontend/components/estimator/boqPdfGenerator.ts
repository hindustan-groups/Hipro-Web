import { CalculationResult, EstimatorState } from "./types";
import { TIERS, CITIES, FLOOR_CONFIGS } from "./constants";
import { formatIndianCurrency, formatIndianNumber } from "./calculateEstimate";

export function generateAndPrintBOQ(
  state: EstimatorState,
  result: CalculationResult,
  clientData: { name: string; phone: string; email?: string; location?: string }
) {
  const tierConfig = TIERS[state.tier];
  const cityConfig = CITIES.find((c) => c.name === state.city) || CITIES[0];
  const floorConfig = FLOOR_CONFIGS.find((f) => f.id === state.floors) || FLOOR_CONFIGS[1];
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const refId = `HP-EST-${Math.floor(100000 + Math.random() * 900000)}`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to open and print your itemized BOQ document.");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Engineering BOQ & Cost Estimate - Hindustan Projects (${refId})</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #D9232A;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #0F2C59;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      margin: 0;
    }
    .brand-sub {
      font-size: 9.5px;
      color: #D9232A;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .company-meta {
      text-align: right;
      font-size: 9.5px;
      color: #475569;
      line-height: 1.35;
    }
    .doc-badge {
      display: inline-block;
      background: #0F2C59;
      color: #ffffff;
      padding: 3px 8px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .info-card {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      background: #f8fafc;
    }
    .card-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0F2C59;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 10px;
    }
    .row-label {
      color: #64748b;
    }
    .row-value {
      font-weight: 600;
      color: #0f172a;
    }
    .price-banner {
      background: #0F2C59;
      color: #ffffff;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.85;
    }
    .price-amount {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
    }
    .price-sub {
      font-size: 10px;
      opacity: 0.8;
      text-align: right;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10px;
    }
    th {
      background: #f1f5f9;
      color: #0F2C59;
      text-align: left;
      padding: 6px 8px;
      border-bottom: 1.5px solid #cbd5e1;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9px;
    }
    td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .sec-title {
      font-size: 11px;
      font-weight: 800;
      color: #0F2C59;
      text-transform: uppercase;
      margin-top: 12px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sec-title::before {
      content: "";
      width: 4px;
      height: 12px;
      background: #D9232A;
      display: inline-block;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      margin-bottom: 14px;
      background: #f8fafc;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
    }
    .spec-item {
      font-size: 9.5px;
    }
    .spec-name {
      font-weight: 700;
      color: #334155;
    }
    .spec-val {
      color: #64748b;
    }
    .footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #64748b;
    }
    .terms {
      font-size: 8.5px;
      color: #64748b;
      margin-bottom: 10px;
      line-height: 1.35;
    }
    @media print {
      .no-print {
        display: none !important;
      }
    }
    .print-bar {
      position: sticky;
      top: 0;
      background: #fef08a;
      border-bottom: 1px solid #facc15;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 600;
      font-size: 12px;
    }
    .btn-print {
      background: #0F2C59;
      color: white;
      border: none;
      padding: 6px 14px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 11px;
    }
  </style>
</head>
<body>

  <div class="print-bar no-print">
    <span>Itemized BOQ Estimate Ready for Print / PDF Export</span>
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 class="brand-title">Hindustan Projects</h1>
      <div class="brand-sub">HiPRO Engineering & Turnkey Construction</div>
      <div style="font-size: 9.5px; color: #475569; margin-top: 4px;">
        ISO 9001:2015 Certified Civil Engineering & Turnkey Contracting
      </div>
    </div>
    <div class="company-meta">
      <div class="doc-badge">Itemized Cost Estimate & BOQ</div>
      <div><strong>Ref No:</strong> ${refId}</div>
      <div><strong>Date:</strong> ${today}</div>
      <div><strong>HQ:</strong> Bhopal Ganj, Bhilwara, Rajasthan 311001</div>
      <div><strong>Direct:</strong> +91 75970 00601 | info@hindustanprojects.in</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="info-card">
      <div class="card-title">Client & Location Profile</div>
      <div class="row"><span class="row-label">Client Name:</span> <span class="row-value">${clientData.name || "Client Estimate"}</span></div>
      <div class="row"><span class="row-label">Phone / WhatsApp:</span> <span class="row-value">${clientData.phone || "Verified Contact"}</span></div>
      <div class="row"><span class="row-label">Project Site City:</span> <span class="row-value">${state.city}, Rajasthan</span></div>
      <div class="row"><span class="row-label">City Logistics Multiplier:</span> <span class="row-value">${cityConfig.multiplier}× (${cityConfig.tag})</span></div>
    </div>

    <div class="info-card">
      <div class="card-title">Civil Scope & Space Metrics</div>
      <div class="row"><span class="row-label">Plot Area:</span> <span class="row-value">${formatIndianNumber(state.plotArea)} sq.ft (${Math.round(state.plotArea / 9)} Gaj)</span></div>
      <div class="row"><span class="row-label">Structure Floors:</span> <span class="row-value">${floorConfig.label} (${floorConfig.desc})</span></div>
      <div class="row"><span class="row-label">Basement Option:</span> <span class="row-value">${state.basement === "none" ? "None" : state.basement === "half" ? "Half Basement (~" + result.basementArea + " sqft)" : "Full Basement (~" + result.basementArea + " sqft)"}</span></div>
      <div class="row"><span class="row-label">Total Built-Up Area:</span> <span class="row-value" style="color: #D9232A; font-weight: 800;">${formatIndianNumber(result.builtUpArea)} sq.ft</span></div>
    </div>
  </div>

  <div class="price-banner">
    <div>
      <div class="price-label">Estimated Total Project Budget (${state.tier} Package)</div>
      <div class="price-amount">${formatIndianCurrency(result.totalCost)}</div>
      <div style="font-size: 10px; opacity: 0.9; margin-top: 2px;">
        Indicative Range: ${formatIndianCurrency(result.costMin)} – ${formatIndianCurrency(result.costMax)}
      </div>
    </div>
    <div class="price-sub">
      <div>Effective Unit Rate: <strong>₹${result.effectiveRatePerSqft} / sq.ft</strong></div>
      <div>Construction Timeline: <strong>${result.timelineMonths}</strong></div>
      <div>Structural Warranty: <strong>${tierConfig.specs.warranty}</strong></div>
    </div>
  </div>

  <div class="sec-title">Stage-Wise Civil & Finishing Cost Distribution</div>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Construction Stage</th>
        <th style="width: 15%;">Share (%)</th>
        <th style="width: 25%;">Approx Stage Amount</th>
        <th style="width: 25%;">Key Deliverables</th>
      </tr>
    </thead>
    <tbody>
      ${result.stages.map((st) => `
        <tr>
          <td><strong>${st.name}</strong></td>
          <td>${st.percentage}%</td>
          <td style="font-weight: 700; color: #0F2C59;">${formatIndianCurrency(st.amount)}</td>
          <td style="color: #64748b; font-size: 9px;">${st.description}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="sec-title">Estimated Engineering Bill of Materials (BOM)</div>
  <table>
    <thead>
      <tr>
        <th>Primary Material</th>
        <th>Estimated Quantity</th>
        <th>Recommended Brands</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Structural Cement (Grade 43/53)</strong></td>
        <td><strong>${formatIndianNumber(result.materials.cementBags)} Bags</strong></td>
        <td>${tierConfig.specs.cement}</td>
      </tr>
      <tr>
        <td><strong>Reinforcement Steel (Fe550D TMT)</strong></td>
        <td><strong>${result.materials.steelTonnes} Metric Tonnes</strong></td>
        <td>${tierConfig.specs.steel}</td>
      </tr>
      <tr>
        <td><strong>Masonry Bricks / AAC Blocks</strong></td>
        <td><strong>${formatIndianNumber(result.materials.bricksCount)} Units</strong></td>
        <td>${tierConfig.specs.masonry}</td>
      </tr>
      <tr>
        <td><strong>Sand / Coarse M-Sand</strong></td>
        <td><strong>${formatIndianNumber(result.materials.sandCuFt)} Cu. Ft.</strong></td>
        <td>Double-washed zone-II structural sand</td>
      </tr>
      <tr>
        <td><strong>Aggregate (10mm & 20mm)</strong></td>
        <td><strong>${formatIndianNumber(result.materials.aggregateCuFt)} Cu. Ft.</strong></td>
        <td>Machine crushed basalt/granite aggregate</td>
      </tr>
      <tr>
        <td><strong>Paint & Waterproof Coatings</strong></td>
        <td><strong>${formatIndianNumber(result.materials.paintLiters)} Liters</strong></td>
        <td>${tierConfig.specs.paint}</td>
      </tr>
    </tbody>
  </table>

  <div class="sec-title">${tierConfig.name} Package Specification Highlights</div>
  <div class="specs-grid">
    <div class="spec-item"><span class="spec-name">Flooring:</span> <span class="spec-val">${tierConfig.specs.flooring}</span></div>
    <div class="spec-item"><span class="spec-name">Bathroom:</span> <span class="spec-val">${tierConfig.specs.bathroom}</span></div>
    <div class="spec-item"><span class="spec-name">Electrical:</span> <span class="spec-val">${tierConfig.specs.electrical}</span></div>
    <div class="spec-item"><span class="spec-name">Doors:</span> <span class="spec-val">${tierConfig.specs.doors}</span></div>
    <div class="spec-item"><span class="spec-name">Windows:</span> <span class="spec-val">${tierConfig.specs.windows}</span></div>
    <div class="spec-item"><span class="spec-name">Exterior Elevation:</span> <span class="spec-val">${tierConfig.specs.elevation}</span></div>
  </div>

  <div class="terms">
    <strong>Terms & Engineering Notes:</strong>
    1. This estimate is an engineering preliminary calculation based on regional construction standards, architectural bye-laws and current raw material indices in Rajasthan.
    2. Final contract pricing is fixed under our Guaranteed Fixed-Price Agreement following soil investigation and architectural layout finalization.
    3. Hindustan Projects operates on milestone-based escrow payments, with zero payment advances ahead of physical stage execution.
  </div>

  <div class="footer">
    <div>
      <div><strong>Hindustan Projects (HiPRO) Engineering Division</strong></div>
      <div>Bhopal Ganj, Bhilwara | Contact: +91 75970 00601 | info@hindustanprojects.in</div>
    </div>
    <div style="text-align: right;">
      <div>Generated automatically via HiPRO Intelligent Estimator v2.0</div>
      <div>Verified by Hindustan Projects Structural & Cost Engineering Team</div>
    </div>
  </div>

  <script>
    window.addEventListener("load", () => {
      // Auto trigger print dialogue after rendering
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
