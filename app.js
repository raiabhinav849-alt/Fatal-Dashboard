// ============================================================
// FATAL QA DASHBOARD 2026 - OPTIMIZED VERSION
// ============================================================

const CSV_FILE = "./data/Fatal Dashboard 2026 - Fatal.csv";

let allData = [];
let filteredData = [];

let charts = {};

let currentPage = 1;
const ROWS_PER_PAGE = 25;


// ============================================================
// INITIAL LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadData();

    document
        .getElementById("resetFilters")
        .addEventListener("click", resetFilters);

    [
        "monthFilter",
        "statusFilter",
        "teamFilter",
        "auditorFilter",
        "tlFilter",
        "counselorFilter",
        "reasonFilter"
    ].forEach(id => {
        document.getElementById(id).addEventListener("change", applyFilters);
    });
});


// ============================================================
// LOAD CSV
// ============================================================

async function loadData() {

    try {

        const response = await fetch(CSV_FILE, {
            cache: "force-cache"
        });

        if (!response.ok) {
            throw new Error(
                `CSV could not be loaded. HTTP Status: ${response.status}`
            );
        }

        const csvText = await response.text();

        allData = parseCSV(csvText)
            .map(normalizeData)
            .filter(row => row);

        filteredData = [...allData];

        populateFilters();

        updateDashboard();

        console.log(`Loaded ${allData.length} records`);

    } catch (error) {

        console.error(error);

        showError(error.message);
    }
}


// ============================================================
// FAST NATIVE CSV PARSER
// No PapaParse required
// ============================================================

function parseCSV(text) {

    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && insideQuotes && next === '"') {
            value += '"';
            i++;
        }

        else if (char === '"') {
            insideQuotes = !insideQuotes;
        }

        else if (char === "," && !insideQuotes) {
            row.push(value);
            value = "";
        }

        else if ((char === "\n" || char === "\r") && !insideQuotes) {

            if (char === "\r" && next === "\n") {
                i++;
            }

            row.push(value);
            value = "";

            if (row.some(cell => cell.trim() !== "")) {
                rows.push(row);
            }

            row = [];
        }

        else {
            value += char;
        }
    }

    if (value !== "" || row.length > 0) {
        row.push(value);

        if (row.some(cell => cell.trim() !== "")) {
            rows.push(row);
        }
    }

    if (!rows.length) return [];

    const headers = rows[0].map(h => h.trim());

    return rows.slice(1).map(row => {

        const obj = {};

        headers.forEach((header, index) => {
            obj[header] = (row[index] || "").trim();
        });

        return obj;
    });
}


// ============================================================
// NORMALIZE DATA
// ============================================================

function normalizeData(row) {

    return {

        auditDate: cleanValue(row["Audit Date"]),

        callDate: cleanValue(row["Call Date"]),

        status: cleanStatus(row["Fatal or Warning"]),

        month: cleanMonth(row["Month"]),

        team: cleanValue(row["Team Type"]),

        auditor: cleanValue(row["Auditors Email Address"]),

        counselor: cleanValue(row["Counselor Email Id"]),

        tl: cleanValue(row["TL E-mail Id"]),

        reason: normalizeReason(row["Fatal reason"]),

        leadId: cleanValue(row["Lead Id"]),

        recording: cleanValue(row["Call recording link"]),

        durationMin: cleanValue(
            row["Duration of call (Min)"]
        ),

        durationSec: cleanValue(
            row["Duration of call (Secs)"]
        )
    };
}


// ============================================================
// CLEANING FUNCTIONS
// ============================================================

function cleanValue(value) {

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {
        return "Unknown";
    }

    return String(value).trim();
}


function cleanStatus(value) {

    const v = String(value || "")
        .trim()
        .toLowerCase();

    if (v.includes("fatal")) return "Fatal";

    if (v.includes("warning")) return "Warning";

    return "Unknown";
}


function cleanMonth(value) {

    const v = String(value || "").trim();

    if (!v) return "Unknown";

    return v;
}


// ============================================================
// REASON NORMALIZATION
// ============================================================

function normalizeReason(value) {

    const v = String(value || "")
        .trim()
        .toLowerCase();

    if (!v) return "Others";

    if (
        v.includes("blank call") ||
        v.includes("blank")
    ) {
        return "Blank Call";
    }

    if (
        v.includes("fee") ||
        v.includes("fees") ||
        v.includes("price")
    ) {
        return "Wrong Fee Explanation";
    }

    if (
        v.includes("wrong information") ||
        v.includes("wrong info") ||
        v.includes("incorrect information")
    ) {
        return "Wrong Information";
    }

    if (
        v.includes("center") ||
        v.includes("centre")
    ) {
        return "Center Related";
    }

    if (
        v.includes("rude") ||
        v.includes("abusive")
    ) {
        return "Rude / Abusive";
    }

    if (
        v.includes("misleading") ||
        v.includes("mislead")
    ) {
        return "Misleading Information";
    }

    return "Others";
}


// ============================================================
// FILTER POPULATION
// ============================================================

function populateFilters() {

    populateSelect(
        "monthFilter",
        uniqueValues("month"),
        "All Months"
    );

    populateSelect(
        "statusFilter",
        uniqueValues("status"),
        "All Status"
    );

    populateSelect(
        "teamFilter",
        uniqueValues("team"),
        "All Teams"
    );

    populateSelect(
        "auditorFilter",
        uniqueValues("auditor"),
        "All Auditors"
    );

    populateSelect(
        "tlFilter",
        uniqueValues("tl"),
        "All TLs"
    );

    populateSelect(
        "counselorFilter",
        uniqueValues("counselor"),
        "All Counselors"
    );

    populateSelect(
        "reasonFilter",
        uniqueValues("reason"),
        "All Reasons"
    );
}


function uniqueValues(key) {

    return [...new Set(
        allData
            .map(row => row[key])
            .filter(Boolean)
    )].sort((a, b) =>
        String(a).localeCompare(String(b))
    );
}


function populateSelect(id, values, defaultText) {

    const select = document.getElementById(id);

    select.innerHTML = "";

    const defaultOption = document.createElement("option");

    defaultOption.value = "All";
    defaultOption.textContent = defaultText;

    select.appendChild(defaultOption);

    values.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = formatName(value);

        select.appendChild(option);
    });
}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

    const month =
        document.getElementById("monthFilter").value;

    const status =
        document.getElementById("statusFilter").value;

    const team =
        document.getElementById("teamFilter").value;

    const auditor =
        document.getElementById("auditorFilter").value;

    const tl =
        document.getElementById("tlFilter").value;

    const counselor =
        document.getElementById("counselorFilter").value;

    const reason =
        document.getElementById("reasonFilter").value;


    filteredData = allData.filter(row => {

        return (

            (month === "All" || row.month === month) &&

            (status === "All" || row.status === status) &&

            (team === "All" || row.team === team) &&

            (auditor === "All" || row.auditor === auditor) &&

            (tl === "All" || row.tl === tl) &&

            (counselor === "All" || row.counselor === counselor) &&

            (reason === "All" || row.reason === reason)

        );
    });

    currentPage = 1;

    updateDashboard();
}


// ============================================================
// RESET
// ============================================================

function resetFilters() {

    [
        "monthFilter",
        "statusFilter",
        "teamFilter",
        "auditorFilter",
        "tlFilter",
        "counselorFilter",
        "reasonFilter"
    ].forEach(id => {

        document.getElementById(id).value = "All";

    });

    filteredData = [...allData];

    currentPage = 1;

    updateDashboard();
}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

    updateKPIs();

    renderTable();

    // Let KPI/table paint first.
    requestAnimationFrame(() => {

        renderCharts();

    });
}


// ============================================================
// KPI
// ============================================================

function updateKPIs() {

    const total = filteredData.length;

    const fatal = filteredData.filter(
        row => row.status === "Fatal"
    ).length;

    const warning = filteredData.filter(
        row => row.status === "Warning"
    ).length;

    const fatalRate =
        total > 0
            ? ((fatal / total) * 100).toFixed(1)
            : "0.0";


    document.getElementById("totalAudits").textContent =
        total.toLocaleString();

    document.getElementById("totalFatal").textContent =
        fatal.toLocaleString();

    document.getElementById("totalWarning").textContent =
        warning.toLocaleString();

    document.getElementById("fatalRate").textContent =
        `${fatalRate}%`;


    document.getElementById("uniqueAuditors").textContent =
        new Set(filteredData.map(r => r.auditor)).size;

    document.getElementById("uniqueCounselors").textContent =
        new Set(filteredData.map(r => r.counselor)).size;

    document.getElementById("uniqueTLs").textContent =
        new Set(filteredData.map(r => r.tl)).size;
}


// ============================================================
// GROUPING
// ============================================================

function groupBy(data, key) {

    const result = {};

    data.forEach(row => {

        const value = row[key] || "Unknown";

        result[value] = (result[value] || 0) + 1;

    });

    return result;
}


// ============================================================
// MONTH ORDER
// ============================================================

function sortMonths(data) {

    const monthOrder = [
        "Jan",
        "February",
        "Feb",
        "March",
        "Mar",
        "April",
        "Apr",
        "May",
        "June",
        "Jun",
        "July",
        "Jul",
        "August",
        "Aug",
        "September",
        "Sep",
        "October",
        "Oct",
        "November",
        "Nov",
        "December",
        "Dec"
    ];

    return Object.keys(data).sort((a, b) => {

        const ai = monthOrder.indexOf(a);
        const bi = monthOrder.indexOf(b);

        if (ai === -1 && bi === -1) {
            return a.localeCompare(b);
        }

        if (ai === -1) return 1;

        if (bi === -1) return -1;

        return ai - bi;
    });
}


// ============================================================
// CHART DEFAULTS
// ============================================================

function chartOptions(horizontal = false) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        transitions: {
            active: {
                animation: {
                    duration: 0
                }
            }
        },

        plugins: {

            legend: {
                position: "bottom"
            },

            tooltip: {
                animation: false
            }

        },

        scales: {

            x: {
                beginAtZero: true
            },

            y: {
                beginAtZero: true
            }

        },

        indexAxis: horizontal ? "y" : "x"
    };
}


// ============================================================
// DESTROY OLD CHART
// ============================================================

function destroyChart(name) {

    if (charts[name]) {

        charts[name].destroy();

        charts[name] = null;
    }
}


// ============================================================
// RENDER ALL CHARTS
// ============================================================

function renderCharts() {

    renderMonthlyTrend();

    renderStatusChart();

    renderReasonChart();

    renderTeamChart();

    renderAuditorChart();

    renderTLChart();

    renderCounselorChart();
}


// ============================================================
// MONTHLY TREND
// ============================================================

function renderMonthlyTrend() {

    destroyChart("monthly");

    const grouped = groupBy(filteredData, "month");

    const months = sortMonths(grouped);

    const values = months.map(
        month => grouped[month]
    );

    const ctx =
        document.getElementById("monthlyTrendChart");

    charts.monthly = new Chart(ctx, {

        type: "line",

        data: {

            labels: months,

            datasets: [{
                label: "Fatal Audits",

                data: values,

                tension: 0.2,

                fill: false
            }]
        },

        options: chartOptions()

    });
}


// ============================================================
// STATUS
// ============================================================

function renderStatusChart() {

    destroyChart("status");

    const fatal =
        filteredData.filter(r => r.status === "Fatal").length;

    const warning =
        filteredData.filter(r => r.status === "Warning").length;

    const ctx =
        document.getElementById("statusChart");

    charts.status = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [
                "Fatal",
                "Warning"
            ],

            datasets: [{
                data: [
                    fatal,
                    warning
                ]
            }]
        },

        options: chartOptions()

    });
}


// ============================================================
// REASON
// ============================================================

function renderReasonChart() {

    destroyChart("reason");

    const grouped = groupBy(filteredData, "reason");

    const sorted = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1]);

    const labels = sorted.map(x => x[0]);

    const values = sorted.map(x => x[1]);

    const ctx =
        document.getElementById("reasonChart");

    charts.reason = new Chart(ctx, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{
                label: "Fatal Count",

                data: values
            }]
        },

        options: chartOptions(true)

    });
}


// ============================================================
// TEAM
// ============================================================

function renderTeamChart() {

    destroyChart("team");

    const fatalData =
        filteredData.filter(r => r.status === "Fatal");

    const grouped = groupBy(fatalData, "team");

    const sorted = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1]);

    const ctx =
        document.getElementById("teamChart");

    charts.team = new Chart(ctx, {

        type: "bar",

        data: {

            labels: sorted.map(x => x[0]),

            datasets: [{
                label: "Fatal Count",

                data: sorted.map(x => x[1])
            }]
        },

        options: chartOptions()
    });
}


// ============================================================
// AUDITOR
// ============================================================

function renderAuditorChart() {

    destroyChart("auditor");

    const fatalData =
        filteredData.filter(r => r.status === "Fatal");

    const grouped = groupBy(fatalData, "auditor");

    const sorted = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    const ctx =
        document.getElementById("auditorChart");

    charts.auditor = new Chart(ctx, {

        type: "bar",

        data: {

            labels: sorted.map(
                x => formatName(x[0])
            ),

            datasets: [{
                label: "Fatal Count",

                data: sorted.map(x => x[1])
            }]
        },

        options: chartOptions(true)
    });
}


// ============================================================
// TL
// ============================================================

function renderTLChart() {

    destroyChart("tl");

    const fatalData =
        filteredData.filter(r => r.status === "Fatal");

    const grouped = groupBy(fatalData, "tl");

    const sorted = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    const ctx =
        document.getElementById("tlChart");

    charts.tl = new Chart(ctx, {

        type: "bar",

        data: {

            labels: sorted.map(
                x => formatName(x[0])
            ),

            datasets: [{
                label: "Fatal Count",

                data: sorted.map(x => x[1])
            }]
        },

        options: chartOptions(true)
    });
}


// ============================================================
// COUNSELOR
// ============================================================

function renderCounselorChart() {

    destroyChart("counselor");

    const fatalData =
        filteredData.filter(r => r.status === "Fatal");

    const grouped = groupBy(
        fatalData,
        "counselor"
    );

    const sorted = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    const ctx =
        document.getElementById("counselorChart");

    charts.counselor = new Chart(ctx, {

        type: "bar",

        data: {

            labels: sorted.map(
                x => formatName(x[0])
            ),

            datasets: [{
                label: "Fatal Count",

                data: sorted.map(x => x[1])
            }]
        },

        options: chartOptions(true)
    });
}


// ============================================================
// TABLE
// ============================================================

function renderTable() {

    const tbody =
        document.getElementById("dataTableBody");

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredData.length / ROWS_PER_PAGE
            )
        );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start =
        (currentPage - 1) * ROWS_PER_PAGE;

    const end =
        start + ROWS_PER_PAGE;

    const pageData =
        filteredData.slice(start, end);


    tbody.innerHTML = "";


    if (!pageData.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center py-4">
                    No records found
                </td>
            </tr>
        `;

        updatePagination(0, 0);

        return;
    }


    const fragment =
        document.createDocumentFragment();


    pageData.forEach(row => {

        const tr = document.createElement("tr");

        const statusClass =
            row.status === "Fatal"
                ? "text-danger fw-bold"
                : "text-warning fw-bold";


        tr.innerHTML = `

            <td>${escapeHTML(row.auditDate)}</td>

            <td class="${statusClass}">
                ${escapeHTML(row.status)}
            </td>

            <td>
                ${escapeHTML(formatName(row.auditor))}
            </td>

            <td>
                ${escapeHTML(formatName(row.counselor))}
            </td>

            <td>
                ${escapeHTML(formatName(row.tl))}
            </td>

            <td>
                ${escapeHTML(row.team)}
            </td>

            <td>
                ${escapeHTML(row.reason)}
            </td>

            <td>
                ${escapeHTML(row.leadId)}
            </td>

            <td>
                ${
                    row.recording !== "Unknown"
                        ? `
                        <a
                            href="${safeURL(row.recording)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-sm btn-outline-primary"
                        >
                            <i class="bi bi-play-circle"></i>
                            View
                        </a>
                        `
                        : "-"
                }
            </td>

        `;

        fragment.appendChild(tr);

    });


    tbody.appendChild(fragment);


    document.getElementById("tableCount").textContent =
        `${filteredData.length.toLocaleString()} Records`;


    updatePagination(
        currentPage,
        totalPages
    );
}


// ============================================================
// PAGINATION
// ============================================================

function updatePagination(page, totalPages) {

    let pagination =
        document.getElementById("paginationControls");


    if (!pagination) {

        pagination =
            document.createElement("div");

        pagination.id =
            "paginationControls";

        pagination.className =
            "d-flex justify-content-center align-items-center gap-2 p-3";


        const tableCard =
            document
                .getElementById("dataTableBody")
                .closest(".card");

        tableCard.appendChild(pagination);
    }


    if (!totalPages || totalPages <= 1) {

        pagination.innerHTML = "";

        return;
    }


    pagination.innerHTML = `

        <button
            class="btn btn-sm btn-outline-secondary"
            id="previousPage"
            ${page <= 1 ? "disabled" : ""}
        >
            <i class="bi bi-chevron-left"></i>
            Previous
        </button>

        <span class="small fw-semibold">
            Page ${page} of ${totalPages}
        </span>

        <button
            class="btn btn-sm btn-outline-secondary"
            id="nextPage"
            ${page >= totalPages ? "disabled" : ""}
        >
            Next
            <i class="bi bi-chevron-right"></i>
        </button>

    `;


    document
        .getElementById("previousPage")
        .addEventListener("click", () => {

            if (currentPage > 1) {

                currentPage--;

                renderTable();
            }

        });


    document
        .getElementById("nextPage")
        .addEventListener("click", () => {

            if (currentPage < totalPages) {

                currentPage++;

                renderTable();
            }

        });
}


// ============================================================
// FORMAT EMAIL / NAME
// ============================================================

function formatName(value) {

    if (!value || value === "Unknown") {
        return "Unknown";
    }

    const text = String(value).trim();

    if (!text.includes("@")) {
        return text;
    }

    const username =
        text.split("@")[0];

    return username
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// SAFE URL
// ============================================================

function safeURL(url) {

    try {

        const parsed =
            new URL(url);

        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {
            return parsed.href;
        }

    } catch (e) {}

    return "#";
}


// ============================================================
// ERROR
// ============================================================

function showError(message) {

    const errorBox =
        document.getElementById("dataError");

    const errorMessage =
        document.getElementById("dataErrorMessage");

    errorBox.classList.remove("d-none");

    errorMessage.textContent =
        `Error: ${message}`;
}
