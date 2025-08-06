import * as echarts from "echarts"
import { aigAnalysisData } from "../../../analysis-results/aig-analysis-results.js"
import { migAnalysisData } from "../../../analysis-results/mig-analysis-results.js"
import { appState, setState } from "../app.js"
import { Analyzer } from "../services/analyzer.js"
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
const signDelayMinContainer = document.getElementById("sign-delay-min-container")
const countInputElement = document.getElementById("input-count")
const delayCheckbox = document.getElementById("delay-metric-checkbox")
const signDelayCheckbox = document.getElementById("sign-metric-checkbox")
const metricDistrWrapper = document.getElementById("metric-distribution-wrapper")
const metricDistrButton = document.getElementById("metric-distribution-button")
const diffDistrWrapper = document.getElementById("difference-distribution-wrapper")
const diffDistrButton = document.getElementById("difference-distribution-button")
const raceLineWrapper = document.getElementById("metric-race-line-wrapper")
const raceLineButton = document.getElementById("race-line-button")
const numberInputElement = document.getElementById("input-number")
const analyzeSuggestion = document.getElementById("analyze-suggestions")
const statisticTableWrapper = document.getElementById("statistic-table-wrapper")
const statisticButton = document.getElementById("statistic-button")

const radioContainer = document.getElementById("radio-container")
let selectedRadio = document.querySelector('input[name="radio__tabs"]:checked')

function handleAnalyzeCheckboxChange(event) {
    const isChecked = event.target.checked
    if (isChecked) {
        showElement(analyzationMain)
        addCountInputListener()
        addDelayCheckboxListener()
        addSignDelayCheckboxListener()
        addAnalyzationResetListener()
        radioContainer.addEventListener("change", handleRadioChange)
    } else {
        hideElement(analyzationMain)
        removeCountInputListener()
        removeDelayCheckboxListener()
        removeSignDelayCheckboxListener()
        removeAnalyzationResetListener()
        radioContainer.removeEventListener("change", handleRadioChange)
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
    raceLineButton.addEventListener("click", handleRaceLineClick)
    numberInputElement.addEventListener("input", handleNumberInput)
    statisticButton.addEventListener("click", handleStatisticClick)
}

function removeAnalyzeListeners() {
    minCircuitsButton.removeEventListener("click", handleMinCircuitsClick)
    metricDistrButton.removeEventListener("click", handleMetricDistrClick)
    diffDistrButton.removeEventListener("click", handleDiffDistrClick)
    raceLineButton.removeEventListener("click", handleRaceLineClick)
    numberInputElement.removeEventListener("input", handleNumberInput)
    statisticButton.removeEventListener("click", handleStatisticClick)
}

function enableAnalyzeButtons() {
    enableButton(minCircuitsButton)
    enableButton(metricDistrButton)
    enableButton(diffDistrButton)
    enableButton(raceLineButton)
    enableButton(statisticButton)
}

function disableAnalyzeButtons() {
    disableButton(minCircuitsButton)
    disableButton(metricDistrButton)
    disableButton(diffDistrButton)
    disableButton(raceLineButton)
    disableButton(statisticButton)
}

function clearAnalyzeContents() {
    clearMinTables()
    clearMetricDistrCharts()
    clearDiffDistrCharts()
    clearRaceLineCharts()
    clearStatisticTable()
}

function updateMinCircuitsButtonState() {
    const value = parseInt(countInputElement.value, 10)
    let hasMetricsSelected =
        (delayCheckbox.checked && appState.analyzer?.minCircuits?.delay?.minimalCircuits?.length !== value) ||
        (signDelayCheckbox.checked && appState.analyzer?.minCircuits?.signDelay?.minimalCircuits?.length !== value)

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
    let minCircuits

    if (selectedRadio.id === "radio-1") {
        minCircuits = appState.analyzer.findMinimalCircuits(selectedMetrics, count)
    } else if (selectedRadio.id === "radio-2") {
        const processedData = aigAnalysisData.minCircuits.delay
        const maxMetrics = appState.analyzer.calculateAllMaxMetrics(undefined, processedData)
        minCircuits = appState.analyzer.findMinimalCircuits(selectedMetrics, count, maxMetrics, processedData)
    } else if (selectedRadio.id === "radio-3") {
        const circuitList = migAnalysisData.minCircuits.delay

        migAnalysisData.minCircuits.signDelay.forEach((circuit) => {
            const exists = circuitList.some((existingCircuit) => existingCircuit.number === circuit.number)
            if (!exists) {
                circuitList.push(circuit)
            }
        })
        const maxMetrics = appState.analyzer.calculateAllMaxMetrics(undefined, circuitList)
        minCircuits = appState.analyzer.findMinimalCircuits(selectedMetrics, count, maxMetrics, circuitList)
    }

    setState({
        analysisData: {
            minCircuits: minCircuits,
        },
    })
    renderMinimalCircuitsTables(appState.analysisData.minCircuits)
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

        const container = metricName === "delay" ? delayMinContainer : signDelayMinContainer
        const wrapper = metricName === "delay" ? delayTableWrapper : signDelayTableWrapper

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
    const signDelayMinContainer = document.getElementById("sign-delay-min-container")

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

function renderMetricDistributionsChart(distributions) {
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
        title: {
            text: `Distribution of metrics`,
            left: "center",
            textStyle: {
                color: "#ffffff",
            },
        },
        toolbox: {
            show: true,
            backgroundColor: "#48319d",
            right: 10,
            top: 10,
            feature: {
                saveAsImage: {
                    title: "Save as png",
                    backgroundColor: "#626683",
                    iconStyle: {
                        borderColor: "#ffffff",
                    },
                    emphasis: {
                        iconStyle: {
                            borderColor: "#eeedff",
                        },
                    },
                },
            },
        },
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
        },
        legend: {
            top: 30,
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
                    formatter: function (value) {
                        return Number.isInteger(value) ? value : ""
                    },
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

    let metricDistribution

    if (selectedRadio.id === "radio-1") {
        metricDistribution = appState.analyzer.calculateMetricDistributions()
    } else if (selectedRadio.id === "radio-2") {
        metricDistribution = aigAnalysisData.metricDistribution
    } else if (selectedRadio.id === "radio-3") {
        metricDistribution = migAnalysisData.metricDistribution
    }

    setState({
        analysisData: {
            metricDistributions: metricDistribution,
        },
    })
    renderMetricDistributionsChart(appState.analysisData.metricDistributions)
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

    let diffDistribution

    if (selectedRadio.id === "radio-1") {
        diffDistribution = appState.analyzer.calculateDifferenceDistributions()
    } else if (selectedRadio.id === "radio-2") {
        diffDistribution = aigAnalysisData.diffDistribution
    } else if (selectedRadio.id === "radio-3") {
        diffDistribution = migAnalysisData.diffDistribution
    }

    setState({
        analysisData: {
            diffDistribution: diffDistribution,
        },
    })
    renderDifferenceDistributionChart(appState.analysisData.diffDistribution)
    disableButton(diffDistrButton)
}

function renderDifferenceDistributionChart(data) {
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
        title: {
            text: "Distribution of metrics differences",
            left: "center",
            textStyle: {
                color: "#ffffff",
            },
        },
        toolbox: {
            show: true,
            backgroundColor: "#48319d",
            right: 10,
            top: 10,
            feature: {
                saveAsImage: {
                    title: "Save as png",
                    backgroundColor: "#626683",
                    iconStyle: {
                        borderColor: "#ffffff",
                    },
                    emphasis: {
                        iconStyle: {
                            borderColor: "#eeedff",
                        },
                    },
                },
            },
        },
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
        },
        legend: {
            top: 30,
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
            axisLabel: {
                color: "#ffffff",
                formatter: function (value) {
                    return Number.isInteger(value) ? value : ""
                },
            },
        },
        color: ["#3b267b", "#eeedff", "#2e335a"],
        series: series,
    }

    myChart.setOption(option)
    window.addEventListener("resize", function () {
        myChart.resize()
    })
}

function clearRaceLineCharts() {
    const chartDom = document.getElementById("metric-race-line")
    if (!chartDom) return

    const chartInstance = echarts.getInstanceByDom(chartDom)
    if (chartInstance) {
        chartInstance.dispose()
    }

    chartDom.innerHTML = ""
    hideElement(document.getElementById("metric-race-line-wrapper"))
}

function handleNumberInput() {
    hideElement(analyzeSuggestion)
    const query = numberInputElement.value.trim()
    analyzeSuggestion.innerHTML = ""

    if (query.length < 1) return

    let matches

    if (selectedRadio.id === "radio-1") {
        matches = appState.processedData.filter((circuit) => circuit.number.toString().includes(query))
    } else if (selectedRadio.id === "radio-2") {
        matches = aigAnalysisData.minCircuits.delay.filter((circuit) => circuit.number.toString().includes(query))
    } else if (selectedRadio.id === "radio-3") {
        const circuitList = migAnalysisData.minCircuits.delay

        migAnalysisData.minCircuits.signDelay.forEach((circuit) => {
            const exists = circuitList.some((existingCircuit) => existingCircuit.number === circuit.number)
            if (!exists) {
                circuitList.push(circuit)
            }
        })

        matches = circuitList.filter((circuit) => circuit.number.toString().includes(query))
    }
    const fragment = document.createDocumentFragment()

    matches.slice(0, 10).forEach((match) => {
        const li = document.createElement("li")
        li.textContent = match.number

        li.addEventListener("mousedown", () => {
            numberInputElement.value = match.number
            analyzeSuggestion.innerHTML = ""
        })

        fragment.appendChild(li)
    })

    analyzeSuggestion.appendChild(fragment)
    if (analyzeSuggestion.children.length > 0) {
        enableButton(raceLineButton)
        showElement(analyzeSuggestion)
    }
}

function handleRaceLineClick() {
    const number = parseInt(numberInputElement.value, 10)

    if (isNaN(number)) {
        showCustomAlert("Invalid number")
        return
    }

    const circuitExists = appState.processedData.some((circuit) => circuit.number === number)

    if (!circuitExists && selectedRadio.id === "radio-1") {
        showCustomAlert("There are no circuits with such a number")
        return
    }

    showElement(raceLineWrapper)

    let circuitMetrics

    if (selectedRadio.id === "radio-1") {
        circuitMetrics = appState.analyzer.getCircuitMetricsBySet(number)
    } else if (selectedRadio.id === "radio-2") {
        circuitMetrics = appState.analyzer.getCircuitMetricsBySet(
            number,
            aigAnalysisData.minCircuits.delay.concat(aigAnalysisData.minCircuits.signDelay)
        )
    } else if (selectedRadio.id === "radio-3") {
        const circuitList = migAnalysisData.minCircuits.delay

        migAnalysisData.minCircuits.signDelay.forEach((circuit) => {
            const exists = circuitList.some((existingCircuit) => existingCircuit.number === circuit.number)
            if (!exists) {
                circuitList.push(circuit)
            }
        })
        circuitMetrics = appState.analyzer.getCircuitMetricsBySet(number, circuitList)
    }

    setState({
        analysisData: {
            circuitMetrics: circuitMetrics,
        },
    })
    renderRaceLineChart(appState.analysisData.circuitMetrics, number)
    disableButton(raceLineButton)
}

function renderRaceLineChart(metrics, circuitNumber) {
    const chartDom = document.getElementById("metric-race-line")
    if (!chartDom) return

    const existingChart = echarts.getInstanceByDom(chartDom)
    if (existingChart) {
        existingChart.dispose()
    }

    const myChart = echarts.init(chartDom)

    const dataset = [
        ["InputSet", "signDelay", "delay", "depth"],
        ...metrics.inputSets.map((inputSet, index) => [
            inputSet,
            metrics.signDelay[index],
            metrics.delay[index],
            metrics.depth[index],
        ]),
    ]

    const metricNames = ["signDelay", "delay", "depth"]
    const colors = ["#3b267b", "#eeedff", "#2e335a"]

    const seriesList = metricNames.map((metricName, idx) => ({
        type: "line",
        showSymbol: false,
        name: metricName,
        endLabel: {
            show: true,
            formatter: function (params) {
                return `${metricName}: ${params.value[idx + 1]}`
            },
            color: "#ffffff",
        },
        labelLayout: {
            moveOverlap: "shiftY",
        },
        emphasis: {
            focus: "series",
        },
        lineStyle: {
            color: colors[idx],
            width: 3,
        },
        itemStyle: {
            color: colors[idx],
        },
        encode: {
            x: 0,
            y: idx + 1,
            label: [idx + 1],
            itemName: 0,
            tooltip: [idx + 1],
        },
    }))

    const option = {
        toolbox: {
            show: true,
            backgroundColor: "#48319d",
            right: 10,
            top: 10,
            feature: {
                saveAsImage: {
                    title: "Save as png",
                    backgroundColor: "#626683",
                    iconStyle: {
                        borderColor: "#ffffff",
                    },
                    emphasis: {
                        iconStyle: {
                            borderColor: "#eeedff",
                        },
                    },
                },
            },
        },
        animationDuration: 10000,
        backgroundColor: "transparent",
        dataset: {
            source: dataset,
        },
        title: {
            text: `Metrics for circuit №${circuitNumber}`,
            left: "center",
            textStyle: {
                color: "#ffffff",
            },
        },
        tooltip: {
            order: "valueDesc",
            trigger: "axis",
        },
        xAxis: {
            type: "category",
            name: "Input Set",
            nameLocation: "middle",
            nameGap: 40,
            nameTextStyle: {
                color: "#ffffff",
                padding: [10, 0, 0, 0],
                fontSize: 14,
            },
            axisLabel: {
                color: "#ffffff",
                fontSize: 12,
            },
            axisLine: {
                lineStyle: {
                    color: "#ffffff",
                },
            },
        },
        yAxis: {
            name: "Metric Value",
            axisLabel: {
                color: "#ffffff",
                formatter: function (value) {
                    return Number.isInteger(value) ? value : ""
                },
            },
            axisLine: {
                lineStyle: {
                    color: "#ffffff",
                },
            },
        },
        grid: {
            left: 20,
            right: 80,
            bottom: 60,
            containLabel: true,
        },

        series: seriesList,
    }

    myChart.setOption(option)
    window.addEventListener("resize", function () {
        myChart.resize()
    })
}

function handleStatisticClick() {
    disableButton(statisticButton)
    const analyzer = appState.analyzer
    let indicators
    if (selectedRadio.id === "radio-1") {
        indicators = [
            {
                label: "No Significant Chains",
                byCircuit: analyzer.checkSignificantChainsExistence(false),
                bySet: analyzer.checkSignificantChainsExistence(true),
            },
            {
                label: "Sign Delay > Delay",
                byCircuit: analyzer.compareMetricDominance(["signDelay", "delay"], false),
                bySet: analyzer.compareMetricDominance(["signDelay", "delay"], true),
            },
            {
                label: "Sign Delay < Delay",
                byCircuit: analyzer.compareMetricDominance(["delay", "signDelay"], false),
                bySet: analyzer.compareMetricDominance(["delay", "signDelay"], true),
            },
            {
                label: "Sign Delay < Depth",
                byCircuit: analyzer.compareMetricDominance(["depth", "signDelay"], false),
                bySet: analyzer.compareMetricDominance(["depth", "signDelay"], true),
            },
            {
                label: "Delay < Depth",
                byCircuit: analyzer.compareMetricDominance(["depth", "delay"], false),
                bySet: analyzer.compareMetricDominance(["depth", "delay"], true),
            },
            {
                label: "All Metrics Equal",
                byCircuit: analyzer.countMetricEquality(["depth", "delay", "signDelay"], true),
                bySet: analyzer.countMetricEquality(["depth", "delay", "signDelay"], true, true),
            },
            {
                label: "All Metrics Unequal",
                byCircuit: analyzer.countMetricEquality(["depth", "delay", "signDelay"], false),
                bySet: analyzer.countMetricEquality(["depth", "delay", "signDelay"], false, true),
            },
        ]
    } else if (selectedRadio.id === "radio-2") {
        indicators = aigAnalysisData.indicators
    } else if (selectedRadio.id === "radio-3") {
        indicators = migAnalysisData.indicators
    }
    setState({ analysisData: { indicators } })
    renderStatisticTable(appState.analysisData.indicators)
    showElement(statisticTableWrapper)
}

function clearStatisticTable() {
    const container = document.getElementById("statistic-table-container")

    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
}

function renderStatisticTable(indicators) {
    clearStatisticTable()

    const table = document.createElement("table")
    table.classList.add("statistic-table")

    // Заголовок
    const thead = document.createElement("thead")
    thead.innerHTML = `
        <tr>
            <th rowspan="2">Indicator</th>
            <th colspan="2">Values</th>
        </tr>
        <tr>
            <th>By Circuits</th>
            <th>By Input Sets</th>
        </tr>
    `
    table.appendChild(thead)

    // Тело таблицы
    const tbody = document.createElement("tbody")

    indicators.forEach((item) => {
        const row = document.createElement("tr")

        const labelCell = document.createElement("td")
        labelCell.textContent = item.label

        const circuitValueCell = document.createElement("td")
        const setValueCell = document.createElement("td")

        circuitValueCell.textContent = `${item.byCircuit.count} (${(item.byCircuit.ratio * 100).toFixed(2)}%)`
        setValueCell.textContent = `${item.bySet.count} (${(item.bySet.ratio * 100).toFixed(2)}%)`

        row.appendChild(labelCell)
        row.appendChild(circuitValueCell)
        row.appendChild(setValueCell)

        tbody.appendChild(row)
    })

    table.appendChild(tbody)

    // Вставляем таблицу в контейнер
    const container = document.getElementById("statistic-table-container")
    container.appendChild(table)
}

function handleRadioChange(event) {
    selectedRadio = event.target
    clearAnalyzeContents()
    if (appState.processedData.length && selectedRadio.id === "radio-1") {
        enableAnalyzeButtons()
    }
    if (!appState.processedData.length && selectedRadio.id === "radio-1") {
        disableAnalyzeButtons()
    }

    if (selectedRadio.id === "radio-2") {
        if (appState.analyzer == null) {
            setState({
                analyzer: new Analyzer(aigAnalysisData.minCircuits.delay),
            })
        }
    }
    if (selectedRadio.id === "radio-3") {
        if (appState.analyzer == null) {
            const circuitList = migAnalysisData.minCircuits.delay

            migAnalysisData.minCircuits.signDelay.forEach((circuit) => {
                const exists = circuitList.some((existingCircuit) => existingCircuit.number === circuit.number)
                if (!exists) {
                    circuitList.push(circuit)
                }
            })
            setState({
                analyzer: new Analyzer(circuitList),
            })
        }
    }
    if (selectedRadio.id === "radio-2" || selectedRadio.id === "radio-3") {
        addAnalyzeListeners()
        addAnalyzeListeners()
        enableAnalyzeButtons()
    }
}

export {
    addAnalyzeCheckboxListener,
    addAnalyzeListeners,
    clearAnalyzeContents,
    disableAnalyzeButtons,
    enableAnalyzeButtons,
    removeAnalyzeListeners
}

