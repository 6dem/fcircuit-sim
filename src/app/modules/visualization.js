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
const animateButtonsWrapper = document.getElementById("animate-buttons-wrapper")
const pauseButton = document.getElementById("pause-button")
const playButton = document.getElementById("play-button")
const restartButton = document.getElementById("restart-button")
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
            duration: 1,
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
        console.log("appState", appState)
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
    const shift =
        appState.circuitIndex === appState.circuitsCount - 1 &&
        appState.circuitsCount !== 1
            ? 0.013
            : 0
    progressSliderElement.style.left = `calc(${Math.min(
        100 - appState.realSliderWidth,
        appState.sliderPosition
    )}% + ${shift}px)`
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
    resetCircuit()
    removeAnimateControls()
    enableButton(playButton)
    resetBinaryInput()
    showCircuit()
    appState.visualizer.initializeCircuit(
        appState.inputSet,
        appState.circuitData.countInputs
    )
    updateSetResults(appState.circuitResultData)
}

function handleIncreaseClick() {
    resetCircuit()
    removeAnimateControls()
    enableButton(playButton)
    increaseBinary()
    setState({ inputSet: parseInt(inputField.value, 2) })
    showCircuit()
    appState.visualizer.initializeCircuit(
        appState.inputSet,
        appState.circuitData.countInputs
    )
    updateSetResults(appState.circuitResultData)
}

function handleDecreaseClick() {
    resetCircuit()
    removeAnimateControls()
    enableButton(playButton)
    decreaseBinary()
    setState({ inputSet: parseInt(inputField.value, 2) })
    showCircuit()
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
    removeAnimateControls()
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
    removeAnimateControls()
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
    addDurationInputListener()
}

function removeEventListeners() {
    removePlayListener()
    removeAnimateControls()
    inputField.removeEventListener("click", handleInputClick)
    increaseButton.removeEventListener("click", handleIncreaseClick)
    decreaseButton.removeEventListener("click", handleDecreaseClick)
    leftArrowButton.removeEventListener("click", handleLeftArrowClick)
    rightArrowButton.removeEventListener("click", handleRightArrowClick)
    removeVisualPerformListener()
    removeDurationInputListener()
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

        removeModalEventListeners()

        updateSetResults(appState.circuitResultData)
        inputField.addEventListener("click", handleInputClick)
        applyHoverEffect(inputField)
        enableButton(increaseButton)
        enableButton(decreaseButton)
        enableButton(resultsButton)
        addModalEventListeners()
        enableButton(playButton)
        addPlayListener()

        disableButton(visualPerformButton)
        visualPerformButton.textContent = "Performed"
    } catch (error) {
        return
    }
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

function handleDurationInput() {
    let value = duration.value.replace(",", ".")
    if (!/^\d*\.?\d?$/.test(value)) {
        value = value.slice(0, -1)
    }

    let num = parseFloat(value)
    if (isNaN(num)) return

    if (num < 0) num = 0
    if (num > 10) num = 10

    duration.value = num.toFixed(value.includes(".") ? 1 : 0)

    setState({ duration: +duration.value })
}

function addDurationInputListener() {
    duration.addEventListener("input", handleDurationInput)
}

function removeDurationInputListener() {
    duration.removeEventListener("input", handleDurationInput)
}

function handlePauseButton() {
    disableButton(pauseButton)
    hideElement(pauseButton)
    enableButton(playButton)
    showElement(playButton)
}

function addPauseListener() {
    pauseButton.addEventListener("click", handlePauseButton)
}
function removePauseListener() {
    pauseButton.removeEventListener("click", handlePauseButton)
}

function handlePlayButton() {
    resetCircuit()
    showCircuit()
    appState.visualizer.initializeCircuit(
        appState.inputSet,
        appState.circuitData.countInputs
    )
    appState.visualizer.animateCircuit(
        appState.circuitResultData.setResults[appState.inputSet].stateHistory,
        appState.duration
    )
    disableButton(playButton)
    hideElement(playButton)
    setupAnimateControls()
}

function setupAnimateControls() {
    playButton.style.padding = "0"
    showElement(pauseButton)
    enableButton(pauseButton)
    addPauseListener()
    showElement(restartButton)
    addRestartListener()
}

function removeAnimateControls() {
    showElement(playButton)
    animateButtonsWrapper.style.width = "134px"
    playButton.style.padding = "5px 40px"
    hideElement(pauseButton)
    disableButton(pauseButton)
    removePauseListener()
    hideElement(restartButton)
    removeRestartListener()
}

function addPlayListener() {
    playButton.addEventListener("click", handlePlayButton)
}

function removePlayListener() {
    playButton.removeEventListener("click", handlePlayButton)
}

function handleRestartButton() {
    resetCircuit()
    showCircuit()
    appState.visualizer.initializeCircuit(
        appState.inputSet,
        appState.circuitData.countInputs
    )
    appState.visualizer.animateCircuit(
        appState.circuitResultData.setResults[appState.inputSet].stateHistory,
        appState.duration
    )
}

function addRestartListener() {
    restartButton.addEventListener("click", handleRestartButton)
}

function removeRestartListener() {
    restartButton.removeEventListener("click", handleRestartButton)
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

function createInfoElement(label, value) {
    const container = document.createElement("div")
    const labelElement = document.createElement("span")
    labelElement.textContent = label
    labelElement.style.fontWeight = "700"

    const valueElement = document.createElement("span")
    valueElement.textContent = value

    container.appendChild(labelElement)
    container.appendChild(valueElement)

    return container
}

function updateVisualTable(circuitResultData) {
    tableBodyVisualElement.innerHTML = ""
    modalInfoElement.innerHTML = ""

    const numberInfo = createInfoElement("Number: ", circuitResultData.number)
    const depthInfo = createInfoElement("Depth: ", circuitResultData.depth)

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
