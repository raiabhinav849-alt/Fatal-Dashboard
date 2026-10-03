let rawData = [];
let filteredData = [];

let charts = {};


// ==========================================
// LOAD CSV
// ==========================================

Papa.parse(
    "data/Fatal Dashboard 2026 - Fatal.csv",
    {

        download: true,

        header: true,

        skipEmptyLines: true,

        complete: function(results) {

            rawData = results.data;

            normalizeData();

            populateFilters();

            updateDashboard();

        },

        error: function(error) {

            console.error("CSV loading error:", error);

            alert(
                "Unable to load the Fatal CSV file."
            );

        }

    }
);


// ==========================================
// NORMALIZE DATA
// ==========================================

function normalizeData() {

    rawData = rawData.map(row => {

        return {

            ...row,

            status:
                cleanStatus(
                    row["Fatal or Warning"]
                ),

            reason:
                normalizeReason(
                    row["Fatal reason"]
                ),

            month:
                cleanValue(row["Month"]),

            team:
                cleanValue(row["Team Type"]),

            auditor:
                cleanValue(
                    row["Auditors Email Address"]
                ),

            counselor:
                cleanValue(
                    row["Counselor Email Id"]
                ),

            tl:
                cleanValue(
                    row["TL E-mail Id"]
                )

        };

    });

}


// ==========================================
// CLEAN STATUS
// ==========================================

function cleanStatus(value) {

    if (!value) return "";

    value =
        String(value)
        .trim()
        .toLowerCase();

    if (value.includes("fatal"))
        return "Fatal";

    if (value.includes("warning"))
        return "Warning";

    return value;

}


// ==========================================
// CLEAN VALUE
// ==========================================

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


// ==========================================
// NORMALIZE FATAL REASONS
// ==========================================

function normalizeReason(value) {

    if (!value)
        return "Unknown";

    let reason =
        String(value)
        .trim()
        .toLowerCase();


    // BLANK CALL

    if (
        reason.includes("blank call") ||
        reason.includes("entire call is blank")
    ) {

        return "Blank Call";

    }


    // WRONG FEE

    if (
        reason.includes("wrong fee") ||
        reason.includes("wrong fees") ||
        reason.includes("fee explanation")
    ) {

        return "Wrong Fee";

    }


    // WRONG INFORMATION

    if (
        reason.includes("wrong info") ||
        reason.includes("wrong information") ||
        reason.includes("incorrect information")
    ) {

        return "Wrong Information";

    }


    // CENTER

    if (
        reason.includes("center availability")
    ) {

        return "Center Availability";

    }


    // RUDE

    if (
        reason.includes("rude") ||
        reason.includes("abusive")
    ) {

        return "Rude / Abusive Behaviour";

    }


    return "Others";

}


// ==========================================
// FILTER OPTIONS
// ==========================================

function populateFilters() {

    populateSelect(
        "monthFilter",
        "month"
    );

    populateSelect(
        "teamFilter",
        "team"
    );

    populateSelect(
        "auditorFilter",
        "auditor"
    );

    populateSelect(
        "tlFilter",
        "tl"
    );

    populateSelect(
        "counselorFilter",
        "counselor"
    );

    populateSelect(
        "reasonFilter",
        "reason"
    );

}


// ==========================================
// POPULATE SELECT
// ==========================================

function populateSelect(
    elementId,
    property
) {

    const select =
        document.getElementById(
            elementId
        );


    const values =
        [
            ...new Set(
                rawData
                .map(row => row[property])
                .filter(Boolean)
            )
        ]
        .sort();


    values.forEach(value => {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;

        option.textContent = value;

        select.appendChild(option);

    });

}


// ==========================================
// APPLY FILTERS
// ==========================================

function applyFilters() {

    const month =
        document.getElementById(
            "monthFilter"
        ).value;


    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const team =
        document.getElementById(
            "teamFilter"
        ).value;


    const auditor =
        document.getElementById(
            "auditorFilter"
        ).value;


    const tl =
        document.getElementById(
            "tlFilter"
        ).value;


    const counselor =
        document.getElementById(
            "counselorFilter"
        ).value;


    const reason =
        document.getElementById(
            "reasonFilter"
        ).value;


    filteredData =
        rawData.filter(row => {


            if (
                month !== "ALL" &&
                row.month !== month
            )
                return false;


            if (
                status !== "ALL" &&
                row.status !== status
            )
                return false;


            if (
                team !== "ALL" &&
                row.team !== team
            )
                return false;


            if (
                auditor !== "ALL" &&
                row.auditor !== auditor
            )
                return false;


            if (
                tl !== "ALL" &&
                row.tl !== tl
            )
                return false;


            if (
                counselor !== "ALL" &&
                row.counselor !== counselor
            )
                return false;


            if (
                reason !== "ALL" &&
                row.reason !== reason
            )
                return false;


            return true;

        });


    updateDashboard();

}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    if (!filteredData.length) {

        filteredData = [...rawData];

    }


    updateKPIs();

    updateCharts();

    updateTable();

}


// ==========================================
// KPI
// ==========================================

function updateKPIs() {

    const total =
        filteredData.length;


    const fatal =
        filteredData.filter(
            x => x.status === "Fatal"
        ).length;


    const warning =
        filteredData.filter(
            x => x.status === "Warning"
        ).length;


    const fatalRate =
        total
            ? ((fatal / total) * 100).toFixed(1)
            : 0;


    document.getElementById(
        "totalAudits"
    ).textContent = total;


    document.getElementById(
        "totalFatal"
    ).textContent = fatal;


    document.getElementById(
        "totalWarning"
    ).textContent = warning;


    document.getElementById(
        "fatalRate"
    ).textContent =
        fatalRate + "%";


    document.getElementById(
        "uniqueAuditors"
    ).textContent =
        unique("auditor");


    document.getElementById(
        "uniqueCounselors"
    ).textContent =
        unique("counselor");


    document.getElementById(
        "uniqueTLs"
    ).textContent =
        unique("tl");

}


function unique(property) {

    return new Set(
        filteredData
        .map(x => x[property])
        .filter(
            x =>
                x &&
                x !== "Unknown"
        )
    ).size;

}


// ==========================================
// GROUP DATA
// ==========================================

function groupBy(
    data,
    property
) {

    const result = {};

    data.forEach(row => {

        const key =
            row[property] ||
            "Unknown";


        result[key] =
            (result[key] || 0) + 1;

    });


    return result;

}


// ==========================================
// MONTH ORDER
// ==========================================

const monthOrder = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];


// ==========================================
// UPDATE CHARTS
// ==========================================

function updateCharts() {

    createMonthlyChart();

    createStatusChart();

    createReasonChart();

    createTeamChart();

    createAuditorChart();

    createTLChart();

    createCounselorChart();

}


// ==========================================
// MONTHLY TREND
// ==========================================

function createMonthlyChart() {

    const fatalByMonth = {};

    const warningByMonth = {};


    filteredData.forEach(row => {

        const month = row.month;


        if (
            row.status === "Fatal"
        ) {

            fatalByMonth[month] =
                (fatalByMonth[month] || 0) + 1;

        }


        if (
            row.status === "Warning"
        ) {

            warningByMonth[month] =
                (warningByMonth[month] || 0) + 1;

        }

    });


    const labels =
        monthOrder.filter(
            month =>
                fatalByMonth[month] ||
                warningByMonth[month]
        );


    renderChart(
        "monthlyTrend",
        "line",
        labels,
        [
            {
                label: "Fatal",
                data: labels.map(
                    m => fatalByMonth[m] || 0
                ),
                tension: .3
            },
            {
                label: "Warning",
                data: labels.map(
                    m => warningByMonth[m] || 0
                ),
                tension: .3
            }
        ]
    );

}


// ==========================================
// STATUS CHART
// ==========================================

function createStatusChart() {

    const data =
        groupBy(
            filteredData,
            "status"
        );


    renderChart(
        "statusChart",
        "doughnut",
        Object.keys(data),
        [
            {
                data:
                    Object.values(data)
            }
        ]
    );

}


// ==========================================
// REASON CHART
// ==========================================

function createReasonChart() {

    const data =
        groupBy(
            filteredData.filter(
                x =>
                    x.status === "Fatal"
            ),
            "reason"
        );


    const sorted =
        Object.entries(data)
        .sort(
            (a,b) =>
                b[1] - a[1]
        )
        .slice(0, 12);


    renderChart(
        "reasonChart",
        "bar",
        sorted.map(x => x[0]),
        [
            {
                label: "Fatal Count",
                data: sorted.map(x => x[1])
            }
        ],
        true
    );

}


// ==========================================
// TEAM CHART
// ==========================================

function createTeamChart() {

    const data =
        groupBy(
            filteredData.filter(
                x =>
                    x.status === "Fatal"
            ),
            "team"
        );


    renderChart(
        "teamChart",
        "bar",
        Object.keys(data),
        [
            {
                label: "Fatal Count",
                data:
                    Object.values(data)
            }
        ]
    );

}


// ==========================================
// AUDITOR
// ==========================================

function createAuditorChart() {

    const data =
        groupBy(
            filteredData.filter(
                x =>
                    x.status === "Fatal"
            ),
            "auditor"
        );


    const sorted =
        Object.entries(data)
        .sort(
            (a,b) =>
                b[1] - a[1]
        )
        .slice(0, 15);


    renderChart(
        "auditorChart",
        "bar",
        sorted.map(x => x[0]),
        [
            {
                label: "Fatal Count",
                data:
                    sorted.map(x => x[1])
            }
        ],
        true
    );

}


// ==========================================
// TL
// ==========================================

function createTLChart() {

    const data =
        groupBy(
            filteredData.filter(
                x =>
                    x.status === "Fatal"
            ),
            "tl"
        );


    const sorted =
        Object.entries(data)
        .sort(
            (a,b) =>
                b[1] - a[1]
        )
        .slice(0, 15);


    renderChart(
        "tlChart",
        "bar",
        sorted.map(x => x[0]),
        [
            {
                label: "Fatal Count",
                data:
                    sorted.map(x => x[1])
            }
        ],
        true
    );

}


// ==========================================
// COUNSELOR
// ==========================================

function createCounselorChart() {

    const data =
        groupBy(
            filteredData.filter(
                x =>
                    x.status === "Fatal"
            ),
            "counselor"
        );


    const sorted =
        Object.entries(data)
        .sort(
            (a,b) =>
                b[1] - a[1]
        )
        .slice(0, 20);


    renderChart(
        "counselorChart",
        "bar",
        sorted.map(x => x[0]),
        [
            {
                label: "Fatal Count",
                data:
                    sorted.map(x => x[1])
            }
        ],
        true
    );

}


// ==========================================
// CHART RENDERER
// ==========================================

function renderChart(
    id,
    type,
    labels,
    datasets,
    horizontal = false
) {

    if (charts[id]) {

        charts[id].destroy();

    }


    const ctx =
        document
        .getElementById(id)
        .getContext("2d");


    charts[id] =
        new Chart(
            ctx,
            {

                type: type,

                data: {

                    labels: labels,

                    datasets: datasets

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    indexAxis:
                        horizontal
                            ? "y"
                            : "x",

                    plugins: {

                        legend: {

                            labels: {

                                color:
                                    "#e5e7eb"

                            }

                        }

                    },

                    scales:
                        type === "doughnut"
                            ? {}
                            : {

                                x: {

                                    ticks: {
                                        color:
                                            "#94a3b8"
                                    },

                                    grid: {
                                        color:
                                            "#1e293b"
                                    }

                                },

                                y: {

                                    ticks: {
                                        color:
                                            "#94a3b8"
                                    },

                                    grid: {
                                        color:
                                            "#1e293b"
                                    }

                                }

                            }

                }

            }
        );

}


// ==========================================
// DATA TABLE
// ==========================================

function updateTable() {

    const tbody =
        document.getElementById(
            "dataTable"
        );


    tbody.innerHTML = "";


    filteredData
        .slice(0, 100)
        .forEach(row => {

            const tr =
                document.createElement(
                    "tr"
                );


            const statusClass =
                row.status === "Fatal"
                    ? "badge-fatal"
                    : "badge-warning";


            tr.innerHTML = `

                <td>
                    ${row["Audit Date"] || "-"}
                </td>

                <td>
                    <span class="badge ${statusClass}">
                        ${row.status}
                    </span>
                </td>

                <td>
                    ${row.auditor}
                </td>

                <td>
                    ${row.counselor}
                </td>

                <td>
                    ${row.tl}
                </td>

                <td>
                    ${row.team}
                </td>

                <td>
                    ${row.reason}
                </td>

                <td>
                    ${row["Lead Id"] || "-"}
                </td>

                <td>

                    ${
                        row["Call recording link"]
                        ?
                        `<a
                            class="record-link"
                            href="${row["Call recording link"]}"
                            target="_blank">
                            Open
                        </a>`
                        :
                        "-"
                    }

                </td>

            `;


            tbody.appendChild(tr);

        });


    document.getElementById(
        "recordCount"
    ).textContent =
        filteredData.length +
        " records";

}


// ==========================================
// FILTER EVENTS
// ==========================================

[
    "monthFilter",
    "statusFilter",
    "teamFilter",
    "auditorFilter",
    "tlFilter",
    "counselorFilter",
    "reasonFilter"

].forEach(id => {

    document
        .getElementById(id)
        .addEventListener(
            "change",
            applyFilters
        );

});


// ==========================================
// RESET
// ==========================================

document
    .getElementById(
        "resetFilters"
    )
    .addEventListener(
        "click",
        function() {

            document
                .querySelectorAll(
                    ".form-select"
                )
                .forEach(
                    select =>
                        select.value = "ALL"
                );


            filteredData =
                [...rawData];


            updateDashboard();

        }
    );
