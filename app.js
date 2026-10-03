// ============================================================
// FATAL QA DASHBOARD 2026
// Complete Dashboard JavaScript
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let rawData = [];
let filteredData = [];

const charts = {};


// ============================================================
// CSV FILE LOCATION
// ============================================================

const CSV_FILE =
    "./data/Fatal Dashboard 2026 - Fatal.csv";


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadData();

        setupFilterEvents();

    }
);


// ============================================================
// LOAD CSV
// ============================================================

async function loadData() {

    try {

        console.log(
            "Loading CSV:",
            CSV_FILE
        );


        const response =
            await fetch(CSV_FILE);


        if (!response.ok) {

            throw new Error(
                "CSV could not be loaded. HTTP Status: " +
                response.status
            );

        }


        const csvText =
            await response.text();


        console.log(
            "CSV downloaded successfully."
        );


        Papa.parse(
            csvText,
            {

                header: true,

                skipEmptyLines: true,


                complete:
                    function (results) {

                        console.log(
                            "CSV rows:",
                            results.data.length
                        );


                        console.log(
                            "CSV headers:",
                            results.meta.fields
                        );


                        if (
                            !results.data ||
                            results.data.length === 0
                        ) {

                            showError(
                                "CSV file was loaded but contains no data."
                            );

                            return;

                        }


                        rawData =
                            results.data;


                        normalizeData();


                        filteredData =
                            [...rawData];


                        populateFilters();


                        updateDashboard();


                        hideLoadingMessage();

                    },


                error:
                    function (error) {

                        console.error(
                            "PapaParse error:",
                            error
                        );


                        showError(
                            "Unable to read the CSV file."
                        );

                    }

            }
        );

    }


    catch (error) {

        console.error(
            "DATA LOAD ERROR:",
            error
        );


        showError(

            "Unable to load the CSV file.<br><br>" +

            "<b>Check that your repository has:</b><br>" +

            "<code>data/Fatal Dashboard 2026 - Fatal.csv</code><br><br>" +

            "Error: " +
            error.message

        );

    }

}


// ============================================================
// ERROR MESSAGE
// ============================================================

function showError(message) {

    const errorBox =
        document.getElementById(
            "dataError"
        );


    if (!errorBox) {

        return;

    }


    errorBox.innerHTML =

        "<strong>⚠️ Data Loading Error</strong>" +

        "<br><br>" +

        message;


    errorBox.style.display =
        "block";

}


// ============================================================
// HIDE ERROR
// ============================================================

function hideLoadingMessage() {

    const errorBox =
        document.getElementById(
            "dataError"
        );


    if (errorBox) {

        errorBox.style.display =
            "none";

    }

}


// ============================================================
// NORMALIZE DATA
// ============================================================

function normalizeData() {

    rawData =
        rawData.map(

            function (row) {

                return {

                    ...row,

                    status:
                        cleanStatus(
                            row[
                                "Fatal or Warning"
                            ]
                        ),


                    month:
                        cleanMonth(
                            row["Month"]
                        ),


                    team:
                        cleanValue(
                            row["Team Type"]
                        ),


                    auditor:
                        cleanValue(
                            row[
                                "Auditors Email Address"
                            ]
                        ),


                    counselor:
                        cleanValue(
                            row[
                                "Counselor Email Id"
                            ]
                        ),


                    tl:
                        cleanValue(
                            row[
                                "TL E-mail Id"
                            ]
                        ),


                    reason:
                        normalizeReason(
                            row[
                                "Fatal reason"
                            ]
                        )

                };

            }

        );

}


// ============================================================
// CLEAN STATUS
// ============================================================

function cleanStatus(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "Unknown";

    }


    const text =
        String(value)
        .trim()
        .toLowerCase();


    if (
        text === "fatal" ||
        text.includes("fatal")
    ) {

        return "Fatal";

    }


    if (
        text === "warning" ||
        text.includes("warning")
    ) {

        return "Warning";

    }


    return "Unknown";

}


// ============================================================
// CLEAN VALUE
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


// ============================================================
// CLEAN MONTH
// ============================================================

function cleanMonth(value) {

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {

        return "Unknown";

    }


    const text =
        String(value)
        .trim();


    return text.charAt(0).toUpperCase() +
           text.slice(1).toLowerCase();

}


// ============================================================
// NORMALIZE FATAL REASON
// ============================================================

function normalizeReason(value) {

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {

        return "Unknown";

    }


    const text =
        String(value)
        .trim()
        .toLowerCase();


    // BLANK CALL

    if (
        text.includes("blank call") ||
        text.includes("entire call") ||
        text.includes("call is blank")
    ) {

        return "Blank Call";

    }


    // WRONG FEE

    if (
        text.includes("wrong fee") ||
        text.includes("wrong fees") ||
        text.includes("fee explanation") ||
        text.includes("incorrect fee")
    ) {

        return "Wrong Fee";

    }


    // WRONG INFORMATION

    if (
        text.includes("wrong info") ||
        text.includes("wrong information") ||
        text.includes("incorrect information")
    ) {

        return "Wrong Information";

    }


    // CENTER RELATED

    if (
        text.includes("center") &&
        (
            text.includes("wrong") ||
            text.includes("incorrect") ||
            text.includes("availability")
        )
    ) {

        return "Center Related";

    }


    // RUDE / ABUSIVE

    if (
        text.includes("rude") ||
        text.includes("abusive") ||
        text.includes("misbehav")
    ) {

        return "Rude / Abusive Behaviour";

    }


    // MISLEADING INFORMATION

    if (
        text.includes("mislead") ||
        text.includes("misguid")
    ) {

        return "Misleading Information";

    }


    return "Others";

}


// ============================================================
// FILTER OPTIONS
// ============================================================

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


// ============================================================
// POPULATE SELECT
// ============================================================

function populateSelect(
    elementId,
    property
) {

    const select =
        document.getElementById(
            elementId
        );


    if (!select) {

        return;

    }


    const values =
        Array.from(

            new Set(

                rawData
                    .map(
                        function (row) {

                            return row[property];

                        }
                    )
                    .filter(
                        function (value) {

                            return (
                                value &&
                                value !== "Unknown"
                            );

                        }
                    )

            )

        );


    values.sort(
        function (a, b) {

            return String(a)
                .localeCompare(
                    String(b)
                );

        }
    );


    values.forEach(

        function (value) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                value;


            option.textContent =
                value;


            select.appendChild(
                option
            );

        }

    );

}


// ============================================================
// FILTER EVENTS
// ============================================================

function setupFilterEvents() {

    const filters = [

        "monthFilter",
        "statusFilter",
        "teamFilter",
        "auditorFilter",
        "tlFilter",
        "counselorFilter",
        "reasonFilter"

    ];


    filters.forEach(

        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.addEventListener(
                    "change",
                    applyFilters
                );

            }

        }

    );


    const resetButton =
        document.getElementById(
            "resetFilters"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetFilters
        );

    }

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

    const month =
        getFilterValue(
            "monthFilter"
        );


    const status =
        getFilterValue(
            "statusFilter"
        );


    const team =
        getFilterValue(
            "teamFilter"
        );


    const auditor =
        getFilterValue(
            "auditorFilter"
        );


    const tl =
        getFilterValue(
            "tlFilter"
        );


    const counselor =
        getFilterValue(
            "counselorFilter"
        );


    const reason =
        getFilterValue(
            "reasonFilter"
        );


    filteredData =
        rawData.filter(

            function (row) {

                if (
                    month !== "ALL" &&
                    row.month !== month
                ) {

                    return false;

                }


                if (
                    status !== "ALL" &&
                    row.status !== status
                ) {

                    return false;

                }


                if (
                    team !== "ALL" &&
                    row.team !== team
                ) {

                    return false;

                }


                if (
                    auditor !== "ALL" &&
                    row.auditor !== auditor
                ) {

                    return false;

                }


                if (
                    tl !== "ALL" &&
                    row.tl !== tl
                ) {

                    return false;

                }


                if (
                    counselor !== "ALL" &&
                    row.counselor !== counselor
                ) {

                    return false;

                }


                if (
                    reason !== "ALL" &&
                    row.reason !== reason
                ) {

                    return false;

                }


                return true;

            }

        );


    updateDashboard();

}


// ============================================================
// GET FILTER VALUE
// ============================================================

function getFilterValue(id) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "ALL";

    }


    return element.value;

}


// ============================================================
// RESET FILTERS
// ============================================================

function resetFilters() {

    const filters = [

        "monthFilter",
        "statusFilter",
        "teamFilter",
        "auditorFilter",
        "tlFilter",
        "counselorFilter",
        "reasonFilter"

    ];


    filters.forEach(

        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.value =
                    "ALL";

            }

        }

    );


    filteredData =
        [...rawData];


    updateDashboard();

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

    updateKPIs();

    updateCharts();

    updateTable();

}


// ============================================================
// UPDATE KPIs
// ============================================================

function updateKPIs() {

    const total =
        filteredData.length;


    const fatal =
        filteredData.filter(

            function (row) {

                return row.status === "Fatal";

            }

        ).length;


    const warning =
        filteredData.filter(

            function (row) {

                return row.status === "Warning";

            }

        ).length;


    const fatalRate =
        total > 0
            ? ((fatal / total) * 100)
                .toFixed(1)
            : "0.0";


    setText(
        "totalAudits",
        total
    );


    setText(
        "totalFatal",
        fatal
    );


    setText(
        "totalWarning",
        warning
    );


    setText(
        "fatalRate",
        fatalRate + "%"
    );


    setText(
        "uniqueAuditors",
        getUniqueCount(
            "auditor"
        )
    );


    setText(
        "uniqueCounselors",
        getUniqueCount(
            "counselor"
        )
    );


    setText(
        "uniqueTLs",
        getUniqueCount(
            "tl"
        )
    );

}


// ============================================================
// SET TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// UNIQUE COUNT
// ============================================================

function getUniqueCount(
    property
) {

    return new Set(

        filteredData
            .map(
                function (row) {

                    return row[property];

                }
            )
            .filter(

                function (value) {

                    return (
                        value &&
                        value !== "Unknown"
                    );

                }

            )

    ).size;

}


// ============================================================
// UPDATE ALL CHARTS
// ============================================================

function updateCharts() {

    createMonthlyChart();

    createStatusChart();

    createReasonChart();

    createTeamChart();

    createAuditorChart();

    createTLChart();

    createCounselorChart();

}


// ============================================================
// GROUP DATA
// ============================================================

function groupBy(
    data,
    property
) {

    const result = {};


    data.forEach(

        function (row) {

            const key =
                row[property] ||
                "Unknown";


            result[key] =
                (
                    result[key] ||
                    0
                ) + 1;

        }

    );


    return result;

}


// ============================================================
// MONTH ORDER
// ============================================================

const MONTH_ORDER = [

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
    "December",
    "Unknown"

];


// ============================================================
// MONTHLY TREND
// ============================================================

function createMonthlyChart() {

    const fatal =
        {};

    const warning =
        {};


    filteredData.forEach(

        function (row) {

            const month =
                row.month;


            if (
                row.status === "Fatal"
            ) {

                fatal[month] =
                    (
                        fatal[month] ||
                        0
                    ) + 1;

            }


            if (
                row.status === "Warning"
            ) {

                warning[month] =
                    (
                        warning[month] ||
                        0
                    ) + 1;

            }

        }

    );


    const labels =
        MONTH_ORDER.filter(

            function (month) {

                return (
                    fatal[month] ||
                    warning[month]
                );

            }

        );


    renderChart(

        "monthlyTrend",

        "line",

        labels,

        [

            {

                label: "Fatal",

                data:
                    labels.map(
                        function (month) {

                            return (
                                fatal[month] ||
                                0
                            );

                        }
                    ),

                tension: 0.3

            },


            {

                label: "Warning",

                data:
                    labels.map(
                        function (month) {

                            return (
                                warning[month] ||
                                0
                            );

                        }
                    ),

                tension: 0.3

            }

        ]

    );

}


// ============================================================
// STATUS CHART
// ============================================================

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


// ============================================================
// FATAL REASON CHART
// ============================================================

function createReasonChart() {

    const fatalData =
        filteredData.filter(

            function (row) {

                return row.status === "Fatal";

            }

        );


    const data =
        groupBy(
            fatalData,
            "reason"
        );


    const sorted =
        Object.entries(data)
        .sort(

            function (a, b) {

                return b[1] - a[1];

            }

        )
        .slice(0, 12);


    renderChart(

        "reasonChart",

        "bar",

        sorted.map(
            function (item) {

                return item[0];

            }
        ),

        [

            {

                label:
                    "Fatal Count",

                data:
                    sorted.map(
                        function (item) {

                            return item[1];

                        }
                    )

            }

        ],

        true

    );

}


// ============================================================
// TEAM CHART
// ============================================================

function createTeamChart() {

    const fatalData =
        filteredData.filter(

            function (row) {

                return row.status === "Fatal";

            }

        );


    const data =
        groupBy(
            fatalData,
            "team"
        );


    const sorted =
        Object.entries(data)
        .sort(

            function (a, b) {

                return b[1] - a[1];

            }

        );


    renderChart(

        "teamChart",

        "bar",

        sorted.map(
            function (item) {

                return item[0];

            }
        ),

        [

            {

                label:
                    "Fatal Count",

                data:
                    sorted.map(
                        function (item) {

                            return item[1];

                        }
                    )

            }

        ],

        true

    );

}


// ============================================================
// AUDITOR CHART
// ============================================================

function createAuditorChart() {

    const fatalData =
        filteredData.filter(

            function (row) {

                return row.status === "Fatal";

            }

        );


    const data =
        groupBy(
            fatalData,
            "auditor"
        );


    const sorted =
        Object.entries(data)
        .sort(

            function (a, b) {

                return b[1] - a[1];

            }

        )
        .slice(0, 15);


    renderChart(

        "auditorChart",

        "bar",

        sorted.map(
            function (item) {

                return formatName(
                    item[0]
                );

            }
        ),

        [

            {

                label:
                    "Fatal Count",

                data:
                    sorted.map(
                        function (item) {

                            return item[1];

                        }
                    )

            }

        ],

        true

    );

}


// ============================================================
// TL CHART
// ============================================================

function createTLChart() {

    const fatalData =
        filteredData.filter(

            function (row) {

                return row.status === "Fatal";

            }

        );


    const data =
        groupBy(
            fatalData,
            "tl"
        );


    const sorted =
        Object.entries(data)
        .sort(

            function (a, b) {

                return b[1] - a[1];

            }

        )
        .slice(0, 15);


    renderChart(

        "tlChart",

        "bar",

        sorted.map(
            function (item) {

                return formatName(
                    item[0]
                );

            }
        ),

        [

            {

                label:
                    "Fatal Count",

                data:
                    sorted.map(
                        function (item) {

                            return item[1];

                        }
                    )

            }

        ],

        true

    );

}


// ============================================================
// COUNSELOR CHART
// ============================================================

function createCounselorChart() {

    const fatalData =
        filteredData.filter(

            function (row) {

                return row.status === "Fatal";

            }

        );


    const data =
        groupBy(
            fatalData,
            "counselor"
        );


    const sorted =
        Object.entries(data)
        .sort(

            function (a, b) {

                return b[1] - a[1];

            }

        )
        .slice(0, 25);


    renderChart(

        "counselorChart",

        "bar",

        sorted.map(
            function (item) {

                return formatName(
                    item[0]
                );

            }
        ),

        [

            {

                label:
                    "Fatal Count",

                data:
                    sorted.map(
                        function (item) {

                            return item[1];

                        }
                    )

            }

        ],

        true

    );

}


// ============================================================
// GENERIC CHART RENDERER
// ============================================================

function renderChart(

    id,

    type,

    labels,

    datasets,

    horizontal = false

) {

    const canvas =
        document.getElementById(
            id
        );


    if (!canvas) {

        return;

    }


    if (charts[id]) {

        charts[id].destroy();

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    charts[id] =
        new Chart(

            ctx,

            {

                type:
                    type,


                data:
                    {

                        labels:
                            labels,

                        datasets:
                            datasets

                    },


                options:
                    {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,


                        indexAxis:
                            horizontal
                                ? "y"
                                : "x",


                        plugins:
                            {

                                legend:
                                    {

                                        labels:
                                            {

                                                color:
                                                    "#e5e7eb"

                                            }

                                    }

                            },


                        scales:
                            type === "doughnut"
                                ? {}

                                :

                                {

                                    x:
                                        {

                                            ticks:
                                                {

                                                    color:
                                                        "#94a3b8"

                                                },

                                            grid:
                                                {

                                                    color:
                                                        "#1e293b"

                                                }

                                        },


                                    y:
                                        {

                                            ticks:
                                                {

                                                    color:
                                                        "#94a3b8"

                                                },

                                            grid:
                                                {

                                                    color:
                                                        "#1e293b"

                                                }

                                        }

                                }

                    }

            }

        );

}


// ============================================================
// FORMAT EMAIL AS NAME
// ============================================================

function formatName(
    value
) {

    if (
        !value ||
        value === "Unknown"
    ) {

        return "Unknown";

    }


    if (
        !String(value)
        .includes("@")
    ) {

        return value;

    }


    let name =
        String(value)
        .split("@")[0];


    name =
        name.replace(
            /[0-9]+$/g,
            ""
        );


    name =
        name.replace(
            /[._-]+/g,
            " "
        );


    name =
        name
            .split(" ")
            .filter(
                function (word) {

                    return word.length > 0;

                }
            )
            .map(
                function (word) {

                    return (
                        word.charAt(0)
                        .toUpperCase() +
                        word
                            .slice(1)
                            .toLowerCase()
                    );

                }
            )
            .join(" ");


    return name;

}


// ============================================================
// UPDATE DATA TABLE
// ============================================================

function updateTable() {

    const tbody =
        document.getElementById(
            "dataTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    const rowsToShow =
        filteredData.slice(
            0,
            100
        );


    rowsToShow.forEach(

        function (row) {

            const tr =
                document.createElement(
                    "tr"
                );


            const statusClass =
                row.status === "Fatal"
                    ? "badge-fatal"
                    : "badge-warning";


            const recording =
                row[
                    "Call recording link"
                ];


            const recordingHTML =
                recording
                    ?

                    `<a
                        class="record-link"
                        href="${escapeHTML(recording)}"
                        target="_blank"
                        rel="noopener noreferrer">
                        Open
                     </a>`

                    :

                    "-";


            tr.innerHTML = `

                <td>
                    ${escapeHTML(
                        row["Audit Date"] || "-"
                    )}
                </td>


                <td>

                    <span
                        class="badge ${statusClass}">

                        ${escapeHTML(
                            row.status
                        )}

                    </span>

                </td>


                <td>
                    ${escapeHTML(
                        formatName(
                            row.auditor
                        )
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        formatName(
                            row.counselor
                        )
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        formatName(
                            row.tl
                        )
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        row.team
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        row.reason
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        row["Lead Id"] || "-"
                    )}
                </td>


                <td>
                    ${recordingHTML}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }

    );


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (recordCount) {

        recordCount.textContent =
            filteredData.length +
            " records";

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// END
// ============================================================

console.log(
    "Fatal QA Dashboard JavaScript loaded."
);
