import { appState, setState } from "../app.js"
import { Analyzer } from "../services/analyzer.js"
import { disableButton } from "../utils/disable-enable-btn.js"
import { handleFileReadError } from "../utils/file-reader-error.js"
import { hideElement, showElement } from "../utils/show-hide-element.js"
import { updateCountInput } from "../utils/update-count-input.js"
import {
    addAnalyzeListeners,
    enableAnalyzeButtons,
    removeAnalyzeListeners,
} from "./analyzation.js"
import { checkFileType } from "./fileHandlers.js"

const fileInput = document.getElementById("file-upload")
const performButton = document.getElementById("perform-button")

const resultsSection = document.getElementById("results-section")
const tableContainer = document.getElementById("table-wrapper")
const tableBody = document.querySelector("#results-table tbody")
const saveButton = document.getElementById("save-button")
const analyzeAttachButton = document.getElementById("analyze-attach-button")
const minCircuitsButton = document.getElementById("min-circuits-button")

function handlePerformClick() {
    const file = fileInput.files[0]
    if (file) {
        try {
            checkFileType(file)
        } catch {
            return
        }
        const reader = new FileReader()
        reader.onload = handleFileLoad
        reader.readAsText(file)
    }
}

async function handleFileLoad(event) {
    try {
        const jsonDataLocal = JSON.parse(event.target.result)

        if (!Array.isArray(jsonDataLocal)) {
            throw new Error("The JSON data is not an array")
        }

        setState({ jsonData: jsonDataLocal })

        const worker = new Worker(new URL("../services/process-worker.js", import.meta.url), {
            type: "module",
        })

        const result = await new Promise((resolve, reject) => {
            worker.onmessage = (event) => resolve(event.data)
            worker.onerror = (error) => reject(error)
            worker.postMessage(jsonDataLocal)
        })

        const { resultData: rawResultData, errorData } = result
        const resultData = JSON.parse(rawResultData)
        const analyzer = new Analyzer(resultData)

        setState({
            processedData: resultData,
            loadedSchemes: resultData,
            currentSchemes: resultData.slice(0, 4),
            currentSchemeIndex: 4,
            analyzer,
        })

        updateCountInput(resultData.length)
        disableButton(analyzeAttachButton)
        hideElement(analyzeAttachButton)
        enableAnalyzeButtons()
        removeAnalyzeListeners()
        addAnalyzeListeners()

        removeSaveListener()
        removeTableScrollListener()

        showElement(resultsSection)
        updateTable()

        addTableScrollListener()
        addSaveListener()

        displayErrors(errorData)
        removePerformEventListener()
        disableButton(performButton)
    } catch (error) {
        handleFileReadError(error)
    }
}

function addPerformEventListener() {
    performButton.addEventListener("click", handlePerformClick)
}

function removePerformEventListener() {
    performButton.removeEventListener("click", handlePerformClick)
}

function displayErrors(errorData) {
    const errorContainer = document.getElementById("error-container")
    errorContainer.innerHTML = ""

    errorData.forEach((error) => {
        const errorDiv = document.createElement("div")
        errorDiv.innerHTML = `
        <p><strong>Circuit ${error.number}:</strong> ${error.error}</p>
        `
        errorContainer.appendChild(errorDiv)
    })

    errorData.length ? showElement(errorContainer) : hideElement(errorContainer)
}

function addTableScrollListener() {
    tableContainer.addEventListener("scroll", handleTableScroll)
}

function removeTableScrollListener() {
    tableContainer.removeEventListener("scroll", handleTableScroll)
}

function handleTableScroll() {
    const nearBottom =
        tableContainer.scrollHeight - tableContainer.scrollTop <=
        tableContainer.clientHeight + 10
    const nearTop = tableContainer.scrollTop <= 105

    if (nearBottom) {
        loadMoreSchemes() // При прокрутке вниз загружаем новые схемы
    } else if (nearTop) {
        loadPreviousSchemes() // При прокрутке вверх загружаем старые схемы
    }
}

function addSaveListener() {
    saveButton.addEventListener("click", handleSaveClick)
}

function removeSaveListener() {
    saveButton.removeEventListener("click", handleSaveClick)
}

function handleSaveClick() {
    const resultStr = `[${appState.processedData
        .map((item) => JSON.stringify(item))
        .join(",\n")}]`
    const blob = new Blob([resultStr], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "result-data.json" // Название файла
    link.click()
}

function loadMoreSchemes() {
    if (
        appState.scrollLoading ||
        appState.currentSchemeIndex >= appState.loadedSchemes.length
    )
        return
    setState({ scrollLoading: true })

    const nextSchemes = appState.loadedSchemes.slice(
        appState.currentSchemeIndex,
        appState.currentSchemeIndex + 2
    )
    const updatedSchemes = [
        ...appState.currentSchemes.slice(-2),
        ...nextSchemes,
    ]
    const updatedIndex = appState.currentSchemeIndex + 2

    setState({
        currentSchemes: updatedSchemes,
        currentSchemeIndex: updatedIndex,
    })

    updateTable("down")
    setState({ scrollLoading: false })
}

function loadPreviousSchemes() {
    if (appState.scrollLoading || appState.currentSchemeIndex <= 4) return
    setState({ scrollLoading: true })

    const prevSchemes = appState.loadedSchemes.slice(
        appState.currentSchemeIndex - 6,
        appState.currentSchemeIndex - 4
    )
    const updatedSchemes = [
        ...prevSchemes,
        ...appState.currentSchemes.slice(0, 2),
    ]
    const updatedIndex = appState.currentSchemeIndex - 2

    setState({
        currentSchemes: updatedSchemes,
        currentSchemeIndex: updatedIndex,
    })
    updateTable("up")
    setState({ scrollLoading: false })
}

function updateTable(direction) {
    tableBody.innerHTML = "" // Очищаем таблицу перед добавлением данных

    appState.currentSchemes.forEach((entry) => {
        entry.setResults.forEach((result) => {
            const row = document.createElement("tr")
            const outputs = Object.keys(result.outputValue)
            const output = outputs[0]

            if (+result.inputSet === 0) {
                row.innerHTML = `
                    <td>${entry.number}</td>
                    <td>${entry.depth}</td>
                    <td>${result.inputSet}</td>
                    <td>${result.outputValue[output]}</td>
                    <td>${result.delay}</td>
                    <td>${result.signDelay}</td>
                `
            } else {
                row.innerHTML = `
                    <td> </td>
                    <td> </td>
                    <td>${result.inputSet}</td>
                    <td>${result.outputValue[output]}</td>
                    <td>${result.delay}</td>
                    <td>${result.signDelay}</td>
                `
            }

            tableBody.appendChild(row)
        })
    })

    showElement(tableContainer)
    showElement(saveButton)

    // Восстанавливаем позицию прокрутки, чтобы не произошло смещения
    if (direction === "down") {
        tableContainer.scrollTop =
            tableContainer.scrollHeight / 2 - tableContainer.clientHeight + 40
    } else if (direction === "up") {
        tableContainer.scrollTop = tableContainer.scrollHeight / 2 + 50
    }
}

export { addPerformEventListener, removePerformEventListener }

