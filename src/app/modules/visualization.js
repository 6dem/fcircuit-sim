import {
    parseCircuitStructure,
    processCircuit,
} from "../../services/visual-process-circuit.js"
import { appState, setState } from "../app.js"
import { Visualizer } from "../services/visualizer.js"
import { disableButton, enableButton } from "../utils/disable-enable-btn.js"
import { handleFileReadError } from "../utils/file-reader-error.js"
import { circuitReset } from "../utils/reset.js"
import { hideElement, showElement } from "../utils/show-hide-element.js"
import { checkFileType } from "./fileHandlers.js"

const fileInput = document.getElementById("file-upload")
const visualizeButton = document.getElementById("visualize-button")
const inputField = document.getElementById("input-set")
const visualizationSection = document.getElementById("visualization-section")
const increaseButton = document.getElementById("button--increase")
const decreaseButton = document.getElementById("button--decrease")

const visualPerformButton = document.getElementById("visual-perform-button")
const playButton = document.getElementById("play-button")
const circuitNumberElement = document.querySelector(".circuit-number")
const progressSliderElement = document.querySelector(".progress-slider")
const progressBarElement = document.querySelector(".progress-bar")
const leftArrowButton = document.getElementById("arrow-button-left")
const rightArrowButton = document.getElementById("arrow-button-right")
const setResultsElement = document.getElementById("set-results")
const resultsButton = document.getElementById("button--results")
const tableBodyVisualElement = document.querySelector(
    "#results-table--visual tbody"
)
const tableWrapper = document.getElementById("table-wrapper--visual")

const modalInfoElement = document.getElementById("modal-info")
const modalOverlayElement = document.getElementById("modal-overlay")
const modalCloseButton = document.getElementById("modal-close")

const duration = document.getElementById("duration__input")
const visualContainer = document.getElementById("visualization-container")

function handleFileRead(event) {
    try {
        const jsonDataLocal = JSON.parse(event.target.result)

        if (!Array.isArray(jsonDataLocal)) {
            throw new Error("The JSON data is not an array")
        }

        setState({
            jsonData: jsonDataLocal,
            circuitsCount: jsonDataLocal.length,
            circuitData: jsonDataLocal[appState.circuitIndex],
            circuitNumber: jsonDataLocal[appState.circuitIndex].number,
            numberOfInputs: jsonDataLocal[appState.circuitIndex].countInputs,
        })

        removeEventListeners()

        updateUIOnFileLoad()
        setupEventListeners()

        showElement(visualizationSection)
        showCircuit()
        removeVisualizeListener()
        disableButton(visualizeButton)
    } catch (error) {
        handleFileReadError(error)
    }
}

function resetCircuit() {
    appState.visualizer.resetCanvas()
    console.log(appState.visualizer)
}

function showCircuit() {
    try {
        const depthDict = parseCircuitStructure(
            appState.jsonData,
            appState.circuitIndex
        )
        setState({
            visualizer: new Visualizer(
                visualContainer,
                appState.circuitData,
                depthDict
            ),
        })
        appState.visualizer.buildCircuit()
    } catch {
        appState.visualizer.showError()
    }
}

function updateUIOnFileLoad() {
    updateCircuitNumber()
    updateSliderSettings()
    resetBinaryInput()
    toggleArrowButtons()
}

function updateSliderSettings() {
    const sliderWidthLocal = (1 / appState.circuitsCount) * 100
    const realSliderWidthLocal = Math.max(sliderWidthLocal, 10)
    setState({
        sliderWidth: sliderWidthLocal,
        realSliderWidth: realSliderWidthLocal,
    })
    progressSliderElement.style.width = `${realSliderWidthLocal}%`
    updateSliderPosition()
}

function toggleArrowButtons() {
    if (appState.circuitsCount === 1) {
        hideElement(leftArrowButton)
        hideElement(rightArrowButton)
    }
}

function resetBinaryInput() {
    let binaryValue = "0".repeat(appState.numberOfInputs)
    inputField.value = binaryValue
    setState({ inputSet: parseInt(inputField.value, 2) })
}

function updateSliderPosition() {
    progressSliderElement.style.left = `${Math.min(
        100 - appState.realSliderWidth,
        appState.sliderPosition
    )}%`
}

function updateCircuitNumber() {
    circuitNumberElement.textContent = appState.circuitNumber
}

function increaseBinary() {
    let binaryValue = (parseInt(inputField.value, 2) + 1)
        .toString(2)
        .padStart(appState.numberOfInputs, "0")
    if (binaryValue.length > appState.numberOfInputs) {
        binaryValue = "0".repeat(appState.numberOfInputs)
    }
    inputField.value = binaryValue
}

function decreaseBinary() {
    let binaryValue = (parseInt(inputField.value, 2) - 1)
        .toString(2)
        .padStart(appState.numberOfInputs, "0")
    if (binaryValue.includes("-")) {
        binaryValue = "1".repeat(appState.numberOfInputs)
    }
    inputField.value = binaryValue
}

function handleVisualizeClick() {
    const file = fileInput.files[0]
    if (file) {
        try {
            checkFileType(file)
        } catch {
            return
        }

        const reader = new FileReader()
        reader.onload = handleFileRead
        reader.readAsText(file)
    }
}

function handleInputClick() {
    resetBinaryInput()
    updateSetResults(appState.circuitResultData)
    appState.visualizer.initializeCircuit(
        appState.inputSet,
        appState.circuitData.countInputs
    )
}

function handleIncreaseClick() {
    increaseBinary()
    setState({ inputSet: parseInt(inputField.value, 2) })
    appState.visualizer.initializeCircuit(
        appState.inputSet,
        appState.circuitData.countInputs
    )
    updateSetResults(appState.circuitResultData)
}

function handleDecreaseClick() {
    decreaseBinary()
    setState({ inputSet: parseInt(inputField.value, 2) })
    appState.visualizer.initializeCircuit(
        appState.inputSet,
        appState.circuitData.countInputs
    )
    updateSetResults(appState.circuitResultData)
}

function handleLeftArrowClick() {
    const circuitIndexLocal =
        (appState.circuitIndex - 1 + appState.circuitsCount) %
        appState.circuitsCount

    setState({
        circuitIndex: circuitIndexLocal,
        sliderPosition: circuitIndexLocal * appState.sliderWidth,
        circuitNumber: appState.jsonData[circuitIndexLocal].number,
    })
    updateSliderPosition()
    updateCircuitNumber()
    circuitReset()
    resetCircuit()
    showCircuit()
}

function handleRightArrowClick() {
    const circuitIndexLocal =
        (appState.circuitIndex + 1) % appState.circuitsCount

    setState({
        circuitIndex: circuitIndexLocal,
        sliderPosition: circuitIndexLocal * appState.sliderWidth,
        circuitNumber: appState.jsonData[circuitIndexLocal].number,
    })
    updateSliderPosition()
    updateCircuitNumber()
    circuitReset()
    resetCircuit()
    showCircuit()
}

function setupEventListeners() {
    increaseButton.addEventListener("click", handleIncreaseClick)
    decreaseButton.addEventListener("click", handleDecreaseClick)
    leftArrowButton.addEventListener("click", handleLeftArrowClick)
    rightArrowButton.addEventListener("click", handleRightArrowClick)
    addVisualPerformListener()
}

function removeEventListeners() {
    inputField.removeEventListener("click", handleInputClick)
    increaseButton.removeEventListener("click", handleIncreaseClick)
    decreaseButton.removeEventListener("click", handleDecreaseClick)
    leftArrowButton.removeEventListener("click", handleLeftArrowClick)
    rightArrowButton.removeEventListener("click", handleRightArrowClick)
    removeVisualPerformListener()
}

function addVisualizeListener() {
    visualizeButton.addEventListener("click", handleVisualizeClick)
}

function removeVisualizeListener() {
    visualizeButton.removeEventListener("click", handleVisualizeClick)
}

function handleProcessCircuit(event) {
    try {
        const jsonDataLocal = JSON.parse(event.target.result)

        if (!Array.isArray(jsonDataLocal)) {
            throw new Error("The JSON data is not an array")
        }

        setState({
            jsonData: jsonDataLocal,
            circuitResultData: processCircuit(
                jsonDataLocal,
                appState.circuitIndex
            ),
        })
        appState.visualizer.initializeCircuit(
            appState.inputSet,
            appState.circuitData.countInputs
        )

        console.log(appState)
        removeModalEventListeners()

        updateSetResults(appState.circuitResultData)
        inputField.addEventListener("click", handleInputClick)
        applyHoverEffect(inputField)
        enableButton(increaseButton)
        enableButton(decreaseButton)
        enableButton(resultsButton)
        addModalEventListeners()
        enableButton(playButton)

        disableButton(visualPerformButton)
        visualPerformButton.textContent = "Performed"
    } catch (error) {
        return
    }
    console.log(
        "🚀 ~ handleProcessCircuit ~ appState.circuitResultData:",
        appState.circuitResultData
    )
}

function handleVisualPerformClick() {
    const file = fileInput.files[0]
    if (file) {
        try {
            checkFileType(file)
        } catch {
            return
        }
        const reader = new FileReader()
        reader.onload = handleProcessCircuit
        reader.readAsText(file)
    }
}

function addVisualPerformListener() {
    visualPerformButton.addEventListener("click", handleVisualPerformClick)
}

function removeVisualPerformListener() {
    visualPerformButton.removeEventListener("click", handleVisualPerformClick)
}

function updateSetResults(resultData) {
    setResultsElement.innerHTML = ""
    try {
        setResultsElement.appendChild(
            createListItem("Depth:", resultData.depth)
        )
        setResultsElement.appendChild(
            createListItem(
                "Delay:",
                resultData.setResults[appState.inputSet].delay
            )
        )
        setResultsElement.appendChild(
            createListItem(
                "Sign Delay:",
                resultData.setResults[appState.inputSet].signDelay
            )
        )
        const outputs = Object.keys(
            resultData.setResults[appState.inputSet].outputValue
        )
        const output = outputs[0]
        setResultsElement.appendChild(
            createListItem(
                "Output Value:",
                resultData.setResults[appState.inputSet].outputValue[output]
            )
        )
    } catch (error) {
        setResultsElement.classList.add("error")

        setResultsElement.innerHTML = `<li>Invalid circuit</li>`
        throw new Error(`${error.message}`)
    }

    function createListItem(label, value) {
        const li = document.createElement("li")
        li.innerHTML = `<span>${label}</span> ${value}`
        return li
    }
}

function updateVisualTable(circuitResultData) {
    tableBodyVisualElement.innerHTML = ""
    modalInfoElement.innerHTML = ""

    const numberInfo = document.createElement("p")
    numberInfo.textContent = `number: ${circuitResultData.number}`

    const depthInfo = document.createElement("p")
    depthInfo.textContent = `depth: ${circuitResultData.depth}`

    // Добавляем строки в modalInfoElement
    modalInfoElement.appendChild(numberInfo)
    modalInfoElement.appendChild(depthInfo)

    circuitResultData.setResults.forEach((result) => {
        const row = document.createElement("tr")
        const outputs = Object.keys(result.outputValue)
        const output = outputs[0]

        row.innerHTML = `
            <td style="padding-top: 10px">${result.inputSet}</td>
            <td style="padding-top: 10px">${result.outputValue[output]}</td>
            <td style="padding-top: 10px">${result.delay}</td>
            <td style="padding-top: 10px">${result.signDelay}</td>
        `

        tableBodyVisualElement.appendChild(row)
    })
}

function openModal() {
    showElement(modalOverlayElement)
    updateVisualTable(appState.circuitResultData)
    showElement(tableWrapper)
}

function closeModal() {
    hideElement(modalOverlayElement)
    hideElement(tableWrapper)
}

function handleOverlayClick(e) {
    if (e.target === modalOverlayElement) {
        closeModal()
    }
}

function addModalEventListeners() {
    resultsButton.addEventListener("click", openModal)
    modalCloseButton.addEventListener("click", closeModal)
    modalOverlayElement.addEventListener("click", handleOverlayClick)
}

function removeModalEventListeners() {
    resultsButton.removeEventListener("click", openModal)
    modalCloseButton.removeEventListener("click", closeModal)
    modalOverlayElement.removeEventListener("click", handleOverlayClick)
}

function applyHoverEffect(inputField) {
    inputField.removeEventListener("mouseover", addHoverStyles)
    inputField.removeEventListener("mouseout", removeHoverStyles)

    inputField.addEventListener("mouseover", addHoverStyles)
    inputField.addEventListener("mouseout", removeHoverStyles)
}

function addHoverStyles() {
    inputField.style.border = "2px solid var(--color-white)"
    inputField.style.cursor = "pointer"
}

function removeHoverStyles() {
    inputField.style.border = ""
    inputField.style.cursor = ""
}

function removeHoverEffect(inputField) {
    inputField.removeEventListener("mouseover", addHoverStyles)
    inputField.removeEventListener("mouseout", removeHoverStyles)

    inputField.style.border = ""
    inputField.style.cursor = ""
}

export {
    addVisualizeListener,
    removeHoverEffect,
    removeVisualizeListener,
    resetCircuit,
}
