import { appState } from "../app.js"
import { showCustomAlert } from "../utils/alerts.js"
import { disableButton, enableButton } from "../utils/disable-enable-btn.js"
import { hideElement, showElement } from "../utils/show-hide-element.js"
import { handleCircuitNumberClick } from "./visualization.js"

const analyzationMain = document.getElementById("analyzation-main")
const analyzeCheckbox = document.getElementById("checkbox-arrow")
const analyzeAttachButton = document.getElementById("analyze-attach-button")
const analyzeResetButton = document.getElementById("analyze-reset-button")
const minCircuitsButton = document.getElementById("min-circuits-button")
const minCircuitsContainer = document.getElementById("min-circuits-content")
const delayMinContainer = document.getElementById("delay-min-container")
const signDelayMinContainer = document.getElementById(
    "sign-delay-min-container"
)
const countInputElement = document.getElementById("input-count")
const delayCheckbox = document.getElementById("delay-metric-checkbox")
const signDelayCheckbox = document.getElementById("sign-metric-checkbox")
const metricDistrWrapper = document.getElementById(
    "metric-distribution-wrapper"
)
const metricDistrButton = document.getElementById("metric-distribution-button")
const diffDistrWrapper = document.getElementById(
    "difference-distribution-wrapper"
)
const diffDistrButton = document.getElementById(
    "difference-distribution-button"
)

function handleAnalyzeCheckboxChange(event) {
    const isChecked = event.target.checked
    if (isChecked) {
        showElement(analyzationMain)
        addCountInputListener()
        addDelayCheckboxListener()
        addSignDelayCheckboxListener()
        addAnalyzationResetListener()
    } else {
        hideElement(analyzationMain)
        removeCountInputListener()
        removeDelayCheckboxListener()
        removeSignDelayCheckboxListener()
        removeAnalyzationResetListener()
    }
}

function addAnalyzationResetListener() {
    analyzeResetButton.addEventListener("click", handleAnalyzeResetClick)
}

function removeAnalyzationResetListener() {
    analyzeResetButton.addEventListener("click", handleAnalyzeResetClick)
}

function handleAnalyzeResetClick() {
    enableButton(analyzeAttachButton)
    analyzeAttachButton.style.boxShadow = null
    showElement(analyzeAttachButton)

    clearAnalyzeContents()
    if (appState.processedData.length) {
        enableAnalyzeButtons()
    }
}

function addAnalyzeCheckboxListener() {
    analyzeCheckbox.addEventListener("change", handleAnalyzeCheckboxChange)
}

function removeAnalyzeCheckboxListener() {
    analyzeCheckbox.removeEventListener("change", handleAnalyzeCheckboxChange)
}

function addAnalyzeListeners() {
    minCircuitsButton.addEventListener("click", handleMinCircuitsClick)
    metricDistrButton.addEventListener("click", handleMetricDistrClick)
    diffDistrButton.addEventListener("click", handleDiffDistrClick)
}

function removeAnalyzeListeners() {
    minCircuitsButton.removeEventListener("click", handleMinCircuitsClick)
    metricDistrButton.removeEventListener("click", handleMetricDistrClick)
    diffDistrButton.removeEventListener("click", handleDiffDistrClick)
}

function enableAnalyzeButtons() {
    enableButton(minCircuitsButton)
    enableButton(metricDistrButton)
    enableButton(diffDistrButton)
}

function disableAnalyzeButtons() {
    disableButton(minCircuitsButton)
    disableButton(metricDistrButton)
    disableButton(diffDistrButton)
}

function clearAnalyzeContents() {
    clearMinTables()
    clearMetricDistrCharts()
    clearDiffDistrCharts()
}

function updateMinCircuitsButtonState() {
    const value = parseInt(countInputElement.value, 10)
    let hasMetricsSelected =
        (delayCheckbox.checked &&
            appState.analyzer?.minCircuits?.delay?.minimalCircuits?.length !==
                value) ||
        (signDelayCheckbox.checked &&
            appState.analyzer?.minCircuits?.signDelay?.minimalCircuits
                ?.length !== value)

    const hasData = appState.analyzer?.processedData?.length > 0

    if (hasMetricsSelected && hasData) {
        enableButton(minCircuitsButton)
    } else {
        disableButton(minCircuitsButton)
    }
}

function handleCountInputChange() {
    const value = parseInt(countInputElement.value, 10)
    if (Number.isInteger(value) && value >= 1) {
        updateMinCircuitsButtonState()
    } else {
        disableButton(minCircuitsButton)
    }
}

function addCountInputListener() {
    countInputElement.addEventListener("input", handleCountInputChange)
}

function removeCountInputListener() {
    countInputElement.removeEventListener("input", handleCountInputChange)
}

function addDelayCheckboxListener() {
    delayCheckbox.addEventListener("change", updateMinCircuitsButtonState)
}

function removeDelayCheckboxListener() {
    delayCheckbox.removeEventListener("change", updateMinCircuitsButtonState)
}

function addSignDelayCheckboxListener() {
    signDelayCheckbox.addEventListener("change", updateMinCircuitsButtonState)
}

function removeSignDelayCheckboxListener() {
    signDelayCheckbox.addEventListener("change", updateMinCircuitsButtonState)
}

function handleMinCircuitsClick() {
    // Получаем и проверяем количество
    let count = parseInt(countInputElement.value, 10)
    if (isNaN(count) || count < 1) {
        countInputElement.value = 1
        showCustomAlert("Enter an integer at least 1.")
        return
    }

    // Формируем массив выбранных метрик
    const selectedMetrics = []
    if (delayCheckbox.checked) selectedMetrics.push("delay")
    if (signDelayCheckbox.checked) selectedMetrics.push("signDelay")

    if (selectedMetrics.length === 0) {
        showCustomAlert("Choose at least one metric.")
        return
    }

    // Запускаем анализ
    appState.analyzer.findMinimalCircuits(selectedMetrics, count)
    renderMinimalCircuitsTables(appState.analyzer.minCircuits)
    showElement(minCircuitsContainer)
    disableButton(minCircuitsButton)
}

function renderMinimalCircuitsTables(metricsData) {
    clearMinTables()

    const delayTableWrapper = document.createElement("div")
    delayTableWrapper.classList.add("analyze-table-wrapper")

    const signDelayTableWrapper = document.createElement("div")
    signDelayTableWrapper.classList.add("analyze-table-wrapper")

    for (const [metricName, data] of Object.entries(metricsData)) {
        if (!data.minimalCircuits.length) continue

        const title = document.createElement("h3")
        title.classList.add("metrics-title")
        title.textContent = `Minimal ${metricName} circuits`

        const container =
            metricName === "delay" ? delayMinContainer : signDelayMinContainer
        const wrapper =
            metricName === "delay" ? delayTableWrapper : signDelayTableWrapper

        container.appendChild(title)
        container.appendChild(wrapper)

        const table = document.createElement("table")
        table.classList.add("metrics-table")

        const thead = document.createElement("thead")
        thead.innerHTML = `
            <tr>
                <th>Number</th>
                <th>Metric value</th>
                <th>Depth</th>
            </tr>
        `
        table.appendChild(thead)

        const tbody = document.createElement("tbody")

        data.minimalCircuits.forEach((circuit) => {
            const row = document.createElement("tr")

            const numberCell = document.createElement("td")
            numberCell.textContent = circuit.number
            numberCell.style.cursor = "pointer"
            numberCell.addEventListener("click", async () => {
                await handleCircuitNumberClick(circuit.number)
            })

            const metricCell = document.createElement("td")
            metricCell.textContent = circuit.metric

            const depthCell = document.createElement("td")
            depthCell.textContent = circuit.depth

            row.appendChild(numberCell)
            row.appendChild(metricCell)
            row.appendChild(depthCell)

            tbody.appendChild(row)
        })

        table.appendChild(tbody)
        wrapper.appendChild(table)
    }
}

function clearMinTables() {
    const delayMinContainer = document.getElementById("delay-min-container")
    const signDelayMinContainer = document.getElementById(
        "sign-delay-min-container"
    )

    ;[delayMinContainer, signDelayMinContainer].forEach((container) => {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    })
}

function clearMetricDistrCharts() {
    const chartDom = document.getElementById("metric-distribution")
    if (!chartDom) return

    const chartInstance = echarts.getInstanceByDom(chartDom)
    if (chartInstance) {
        chartInstance.dispose()
    }

    chartDom.innerHTML = ""
    hideElement(document.getElementById("metric-distribution-wrapper"))
}

function renderMetricDistributionsChart() {
    const distributions = appState.analyzer.metricDistributions
    const chartDom = document.getElementById("metric-distribution")
    const myChart = echarts.init(chartDom)

    const allValuesSet = new Set()
    for (const metricName in distributions) {
        distributions[metricName].forEach((item) => {
            allValuesSet.add(item.value)
        })
    }
    const allValues = Array.from(allValuesSet).sort((a, b) => a - b)

    const colorPalette = ["#3b267b", "#eeedff", "#2e335a"]

    const series = Object.keys(distributions).map((metricName, index) => {
        const valueToCountMap = new Map()
        distributions[metricName].forEach((item) => {
            valueToCountMap.set(item.value, item.count)
        })

        const data = allValues.map((value) => valueToCountMap.get(value) || 0)

        return {
            name: metricName,
            type: "bar",
            emphasis: { focus: "series" },
            itemStyle: {
                color: colorPalette[index % colorPalette.length],
            },
            data: data,
        }
    })

    const option = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
        },
        legend: {
            textStyle: {
                color: "#ffffff",
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
        },
        xAxis: [
            {
                type: "category",
                data: allValues.map((value) => value.toString()),
                axisLabel: {
                    color: "#ffffff",
                },
            },
        ],
        yAxis: [
            {
                type: "value",
                axisLabel: {
                    color: "#ffffff",
                },
            },
        ],
        series: series,
    }

    myChart.setOption(option)
    window.addEventListener("resize", function () {
        myChart.resize()
    })
}

function handleMetricDistrClick() {
    showElement(metricDistrWrapper)
    appState.analyzer.calculateMetricDistributions()
    renderMetricDistributionsChart()
    disableButton(metricDistrButton)
}

function clearDiffDistrCharts() {
    const chartDom = document.getElementById("difference-distribution")
    if (!chartDom) return

    const chartInstance = echarts.getInstanceByDom(chartDom)
    if (chartInstance) {
        chartInstance.dispose()
    }

    chartDom.innerHTML = ""
    hideElement(document.getElementById("difference-distribution-wrapper"))
}

function handleDiffDistrClick() {
    showElement(diffDistrWrapper)
    appState.analyzer.calculateDifferenceDistributions()
    renderDifferenceDistributionChart()
    disableButton(diffDistrButton)
}

function renderDifferenceDistributionChart() {
    function formatMetricName(rawName) {
        const mappings = {
            depthDelay: "depth-delay",
            depthSignDelay: "depth-signDelay",
            delaySignDelay: "delay-signDelay",
        }
        return mappings[rawName] || rawName
    }
    const chartDom = document.getElementById("difference-distribution")
    if (!chartDom) return

    const existingChart = echarts.getInstanceByDom(chartDom)
    if (existingChart) {
        existingChart.dispose()
    }

    const myChart = echarts.init(chartDom)

    const data = appState.analyzer.differenceDistributions

    const allValuesSet = new Set()
    const series = []

    for (const metricName in data) {
        const entries = data[metricName]
        for (const value in entries) {
            allValuesSet.add(value)
        }
    }

    const allValues = Array.from(allValuesSet).sort((a, b) => a - b)

    for (const metricName in data) {
        const entries = data[metricName]
        const seriesData = allValues.map((value) => entries[value] || 0)

        series.push({
            name: formatMetricName(metricName),
            type: "bar",
            emphasis: { focus: "series" },
            data: seriesData,
        })
    }

    const option = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
        },
        legend: {
            textStyle: { color: "#ffffff" },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            data: allValues.map((v) => v.toString()),
            axisLabel: { color: "#ffffff" },
        },
        yAxis: {
            type: "value",
            axisLabel: { color: "#ffffff" },
        },
        color: ["#3b267b", "#eeedff", "#2e335a"],
        series: series,
    }

    myChart.setOption(option)
    window.addEventListener("resize", function () {
        myChart.resize()
    })
}

export {
    addAnalyzeCheckboxListener,
    addAnalyzeListeners,
    clearAnalyzeContents,
    disableAnalyzeButtons,
    enableAnalyzeButtons,
    removeAnalyzeListeners,
}
