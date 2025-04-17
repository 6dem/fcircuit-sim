import { setState } from "../app.js"
import { Analyzer } from "../services/analyzer.js"
import { showCustomAlert } from "../utils/alerts.js"
import { disableButton, enableButton } from "../utils/disable-enable-btn.js"
import { handleFileReadError } from "../utils/file-reader-error.js"
import { fullReset } from "../utils/reset.js"
import { hideElement, showElement } from "../utils/show-hide-element.js"
import {
    addShadowAnimation,
    removeShadowAnimation,
} from "../utils/toggleShadowAnimation.js"
import {
    addMinCircuitsListener,
    clearMinTables,
    removeMinCircuitsListener,
} from "./analyzation.js"
import {
    addPerformEventListener,
    removePerformEventListener,
} from "./results.js"
import {
    addVisualizeListener,
    removeVisualizeListener,
} from "./visualization.js"

const fileInputElement = document.getElementById("file-upload")
const attachButton = document.getElementById("attach-file-button")
const loadSampleButton = document.getElementById("load-sample-button")
const fileLoader = document.getElementById("code-loader")
const fileError = document.getElementById("file-error")
const fileName = document.getElementById("file-name")
const visualizeButton = document.getElementById("visualize-button")
const performButton = document.getElementById("perform-button")
const analyzeAttachButton = document.getElementById("analyze-attach-button")
const analyzeFileInputElement = document.getElementById("analyze-file-upload")
const minCircuitsButton = document.getElementById("min-circuits-button")

function showLoader() {
    hideElement(fileName)
    hideElement(fileError)
    showElement(fileLoader)
}

function hideLoader() {
    hideElement(fileLoader)
    showElement(fileName)
}

function showError() {
    hideElement(fileLoader)
    hideElement(fileName)
    showElement(fileError)
}

function handleAttachClick() {
    fileInputElement.click()
}

function handleAnalizeAttachClick() {
    analyzeFileInputElement.click()
}

async function handleSampleClick() {
    try {
        showLoader()
        const response = await fetch(
            "circuit-descriptions/fcircuit-aig-mig.json"
        )

        if (!response.ok) throw new Error("Ошибка загрузки файла")

        const fileContent = await response.blob()
        const file = new File([fileContent], "sample.json", {
            type: "application/json",
        })

        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)

        const fileInput = document.getElementById("file-upload")
        fileInput.files = dataTransfer.files

        fileInput.dispatchEvent(new Event("change"))
    } catch (error) {
        showError()
    }
}

async function handleFileChange() {
    const file = fileInputElement.files[0]

    if (!file) {
        fileName.textContent = "No file chosen"
        disableButton(performButton)
        disableButton(visualizeButton)
        return
    }

    removeVisualizeListener()
    removePerformEventListener()

    try {
        showLoader()
        const jsonDataLocal = await validateJsonFile(file)
        setState({ jsonData: jsonDataLocal })
        fullReset()

        enableButton(performButton)
        enableButton(visualizeButton)
        enableButton(analyzeAttachButton)
        showElement(analyzeAttachButton)

        addVisualizeListener()
        addPerformEventListener()
        fileName.textContent = file.name
        hideLoader()
    } catch (error) {
        showError()
        handleFileReadError(error)
    }
}

async function handleAnalizeFileChange() {
    analyzeAttachButton.style.boxShadow = ""
    const file = analyzeFileInputElement.files[0]

    if (!file) {
        disableButton(minCircuitsButton)
        return
    }

    clearMinTables()
    removeMinCircuitsListener()

    try {
        addShadowAnimation(analyzeAttachButton)
        const resultDataLocal = await validateJsonFile(file)
        const analyzer = new Analyzer(resultDataLocal)

        setState({ processedData: resultDataLocal, analyzer })

        enableButton(minCircuitsButton)
        addMinCircuitsListener()

        removeShadowAnimation(analyzeAttachButton)
        analyzeAttachButton.style.boxShadow =
            "inset 1px 1px 1px 0 var(--color-white-25), 5px 4px 10px var(--color-white-50)"
    } catch (error) {
        removeShadowAnimation(analyzeAttachButton)
        handleFileReadError(error)
    }
}

async function validateJsonFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
            try {
                const jsonData = JSON.parse(event.target.result)

                if (!Array.isArray(jsonData)) {
                    throw new Error("The JSON data is not an array")
                }

                resolve(jsonData)
            } catch (error) {
                reject(error)
            }
        }

        reader.onerror = () => reject(new Error("Error reading file"))

        reader.readAsText(file)
    })
}

function checkFileType(file) {
    const fileType = file.type
    if (fileType !== "application/json") {
        showCustomAlert("The uploaded file must be a JSON file.")
        throw new Error("The uploaded file must be a JSON file.")
    } else {
        return
    }
}

function addFileEventListeners() {
    attachButton.addEventListener("click", handleAttachClick)
    fileInputElement.addEventListener("change", handleFileChange)
    loadSampleButton.addEventListener("click", handleSampleClick)
    analyzeAttachButton.addEventListener("click", handleAnalizeAttachClick)
    analyzeFileInputElement.addEventListener("change", handleAnalizeFileChange)
}

function removeFileEventListeners() {
    attachButton.removeEventListener("click", handleAttachClick)
    fileInputElement.removeEventListener("change", handleFileChange)
    loadSampleButton.removeEventListener("click", handleSampleClick)
}

export { addFileEventListeners, checkFileType }
