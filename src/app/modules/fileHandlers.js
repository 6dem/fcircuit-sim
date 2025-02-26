import { setState } from "../app.js"
import { showCustomAlert } from "../utils/alerts.js"
import { disableButton, enableButton } from "../utils/disable-enable-btn.js"
import { handleFileReadError } from "../utils/file-reader-error.js"
import { fullReset } from "../utils/reset.js"
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
const fileNameDisplay = document.getElementById("file-name")
const visualizeButton = document.getElementById("visualize-button")
const performButton = document.getElementById("perform-button")

function handleAttachClick() {
    fileInputElement.click()
}

async function handleFileChange() {
    const file = fileInputElement.files[0]

    if (!file) {
        fileNameDisplay.textContent = "No file chosen"
        disableButton(performButton)
        disableButton(visualizeButton)
        return
    }

    removeVisualizeListener()
    removePerformEventListener()

    fileNameDisplay.textContent = file.name

    try {
        const jsonDataLocal = await validateJsonFile(file)
        setState({ jsonData: jsonDataLocal })
        fullReset()

        enableButton(performButton)
        enableButton(visualizeButton)

        addVisualizeListener()
        addPerformEventListener()
    } catch (error) {
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
}

function removeFileEventListeners() {
    attachButton.removeEventListener("click", handleAttachClick)
    fileInputElement.removeEventListener("change", handleFileChange)
}

export { addFileEventListeners, checkFileType }
