import { appState } from "../app.js"
import { showCustomAlert } from "../utils/alerts.js"
import { disableButton, enableButton } from "../utils/disable-enable-btn.js"
import { hideElement, showElement } from "../utils/show-hide-element.js"
import { handleCircuitNumberClick } from "./visualization.js"

const analyzationMain = document.getElementById("analyzation-main")
const analyzeCheckbox = document.getElementById("checkbox-arrow")
const analyzeAttachButton = document.getElementById("analyze-attach-button")
const minCircuitsButton = document.getElementById("min-circuits-button")
const minCircuitsContainer = document.getElementById("min-circuits-content")
const delayMinContainer = document.getElementById("delay-min-container")
const signDelayMinContainer = document.getElementById(
    "sign-delay-min-container"
)
const countInputElement = document.getElementById("input-count")
const delayCheckbox = document.getElementById("delay-metric-checkbox")
const signDelayCheckbox = document.getElementById("sign-metric-checkbox")

function handleAnalyzeCheckboxChange(event) {
    const isChecked = event.target.checked
    if (isChecked) {
        showElement(analyzationMain)
        addCountInputListener()
        addDelayCheckboxListener()
        addSignDelayCheckboxListener()
    } else {
        hideElement(analyzationMain)
        removeCountInputListener()
        removeDelayCheckboxListener()
        removeSignDelayCheckboxListener()
    }
}

function addAnalyzeCheckboxListener() {
    analyzeCheckbox.addEventListener("change", handleAnalyzeCheckboxChange)
}

function removeAnalyzeCheckboxListener() {
    analyzeCheckbox.removeEventListener("change", handleAnalyzeCheckboxChange)
}

function updateMinCircuitsButtonState(isCountConst = true) {
    let hasMetricsSelected =
        (delayCheckbox.checked &&
            !appState.analyzer?.metrics?.delay?.minimalCircuits?.length > 0) ||
        (signDelayCheckbox.checked &&
            !appState.analyzer?.metrics?.signDelay?.minimalCircuits?.length > 0)
    if (!isCountConst) {
        hasMetricsSelected = delayCheckbox.checked || signDelayCheckbox.checked
    }
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
        updateMinCircuitsButtonState(false)
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

function addMinCircuitsListener() {
    minCircuitsButton.addEventListener("click", handleMinCircuitsClick)
}

function removeMinCircuitsListener() {
    minCircuitsButton.removeEventListener("click", handleMinCircuitsClick)
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
    appState.analyzer.analyzeMetrics(selectedMetrics, count)
    renderMinimalCircuitsTables(appState.analyzer.metrics)
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
        title.textContent = `Minimal ${metricName} schemes`

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

export {
    addAnalyzeCheckboxListener,
    addMinCircuitsListener,
    clearMinTables,
    removeMinCircuitsListener,
}
