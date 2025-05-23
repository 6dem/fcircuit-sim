import {
    parseCircuitStructure,
    processCircuit,
} from "../../services/visual-process-circuit.js"
import { appState, setState } from "../app.js"
import { Visualizer } from "../services/visualizer.js"
import { showCustomAlert } from "../utils/alerts.js"
import { setCheckboxUnchecked } from "../utils/check-uncheck.js"
import { disableButton, enableButton } from "../utils/disable-enable-btn.js"
import { handleFileReadError } from "../utils/file-reader-error.js"
import { removeHoverClass } from "../utils/hover-element.js"
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
const progressSliderElement = document.querySelector(".progress-slider")
const circuitInput = document.getElementById("circuitInput")
const suggestions = document.getElementById("suggestions")
const signCheckbox = document.getElementById("sign-checkbox")
const indexCheckbox = document.getElementById("index-checkbox")
const signCheckboxWrapper = document.getElementById("sign-checkbox-wrapper")
const indexCheckboxWrapper = document.getElementById("index-checkbox-wrapper")
const circuitFormat = document.getElementById("circuit-format")
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

        setupEventListeners()
        updateUIOnFileLoad()

        showElement(visualizationSection)
        showCircuit()
        showCircuitFormat()
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
        const visualizerInstance = new Visualizer(
            visualContainer,
            appState.circuitData,
            depthDict,
            indexCheckbox.checked
        )
        const proxiedVisualizer = new Proxy(visualizerInstance, {
            set(target, property, value) {
                target[property] = value

                if (property === "isAnimationComplete" && value === true) {
                    disableButton(pauseButton)
                    const signChains =
                        appState.circuitResultData?.setResults[
                            appState.inputSet
                        ].signChains
                    let isEmpty
                    if (signChains) {
                        isEmpty = Object.keys(signChains).length === 0
                    }
                    if (!isEmpty) {
                        enableButton(signCheckbox)
                    }
                }
                return true
            },
        })
        setState({
            visualizer: proxiedVisualizer,
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
    const newFontSize = realSliderWidthLocal < 20 ? 16 : 20
    progressSliderElement.style.width = `${realSliderWidthLocal}%`
    circuitInput.style.fontSize = `${newFontSize}px`
    updateSliderPosition()
}

function showCircuitFormat() {
    circuitFormat.textContent = `${appState.circuitData.format}`
}

function handleSignCheckboxChange(event) {
    const isChecked = event.target.checked
    if (isChecked) {
        appState.visualizer.showSignChains(
            appState.circuitResultData.setResults[appState.inputSet].signChains
        )
    } else {
        appState.visualizer.hideSignChains(
            appState.circuitResultData.setResults[appState.inputSet].signChains
        )
    }
}

function addSignCheckboxListener() {
    if (signCheckbox) {
        signCheckbox.addEventListener("change", handleSignCheckboxChange)
    }
}

function removeSignCheckboxListener() {
    if (signCheckbox) {
        signCheckbox.removeEventListener("change", handleSignCheckboxChange)
    }
}

function addIndexCheckboxListener() {
    if (indexCheckbox) {
        indexCheckbox.addEventListener("change", handleIndexCheckboxChange)
    }
}

function removeIndexCheckboxListener() {
    if (indexCheckbox) {
        indexCheckbox.removeEventListener("change", handleIndexCheckboxChange)
    }
}

function handleIndexCheckboxChange(event) {
    const isChecked = event.target.checked
    if (isChecked) {
        appState.visualizer.showIndexes()
    } else {
        appState.visualizer.hideIndexes()
    }
}

function toggleArrowButtons() {
    if (appState.circuitsCount === 1) {
        hideElement(leftArrowButton)
        hideElement(rightArrowButton)
        disableButton(circuitInput)
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
    circuitInput.placeholder = appState.circuitNumber
    circuitInput.value = appState.circuitNumber
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
    return new Promise((resolve, reject) => {
        const file = fileInput.files[0]
        if (!file) return reject("No file")

        try {
            checkFileType(file)
        } catch (e) {
            return reject("Invalid file type")
        }

        const reader = new FileReader()
        reader.onload = function (event) {
            handleFileRead(event)
            resolve()
        }
        reader.onerror = function () {
            reject("File read error")
        }

        reader.readAsText(file)
    })
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
    setCheckboxUnchecked(signCheckbox)
    disableButton(signCheckbox)
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
    setCheckboxUnchecked(signCheckbox)
    disableButton(signCheckbox)
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

function toggleCircuit(circuitIndexLocal) {
    setState({
        circuitIndex: circuitIndexLocal,
        sliderPosition: circuitIndexLocal * appState.sliderWidth,
        circuitNumber: appState.jsonData[circuitIndexLocal].number,
    })
    inputField.removeEventListener("click", handleInputClick)
    updateSliderPosition()
    updateCircuitNumber()
    setCheckboxUnchecked(signCheckbox)
    disableButton(signCheckbox)
    removeAnimateControls()
    circuitReset()
    resetCircuit()
    showCircuit()
    showCircuitFormat()
}

function handleLeftArrowClick() {
    const circuitIndexLocal =
        (appState.circuitIndex - 1 + appState.circuitsCount) %
        appState.circuitsCount

    toggleCircuit(circuitIndexLocal)
}

function handleRightArrowClick() {
    const circuitIndexLocal =
        (appState.circuitIndex + 1) % appState.circuitsCount

    toggleCircuit(circuitIndexLocal)
}

function handleCircuitIndexInput() {
    const query = circuitInput.value.trim()
    suggestions.innerHTML = ""

    if (query.length < 1) return

    const matches = appState.jsonData.filter((circuit) =>
        circuit.number.toString().includes(query)
    )

    const fragment = document.createDocumentFragment()

    matches.slice(0, 10).forEach((match) => {
        const li = document.createElement("li")
        li.textContent = match.number

        li.addEventListener("click", () => {
            circuitInput.value = match.number
            suggestions.innerHTML = ""

            const circuitIndex = appState.jsonData.findIndex(
                (circuit) => circuit.number === match.number
            )

            toggleCircuit(circuitIndex)
        })

        fragment.appendChild(li)
    })

    suggestions.appendChild(fragment)
}

async function handleCircuitNumberClick(circuitNumber) {
    if (!appState.jsonData?.length) {
        showCustomAlert("No file with the circuits description")
        return
    }

    const circuitIndex = appState.jsonData.findIndex(
        (circuit) => circuit.number === circuitNumber
    )

    if (circuitIndex === -1) {
        showCustomAlert("The circuits description file is wrong")
        return
    }

    try {
        await handleVisualizeClick()
        toggleCircuit(circuitIndex)
        visualizationSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    } catch (error) {
        showCustomAlert(error)
    }
}

function addCircuitInputListener() {
    enableButton(circuitInput)
    circuitInput.addEventListener("input", handleCircuitIndexInput)
    document.addEventListener("click", closeSuggestion)
}

function removeCircuitInputListener() {
    circuitInput.removeEventListener("input", handleCircuitIndexInput)
    document.removeEventListener("click", closeSuggestion)
}

function closeSuggestion(e) {
    if (!e.target.closest(".circuit-search")) {
        suggestions.innerHTML = ""
    }
}

function setupEventListeners() {
    disableButton(signCheckbox)
    setTimeout(() => {
        removeHoverClass(signCheckboxWrapper)
        removeHoverClass(indexCheckboxWrapper)
    }, 500)
    addSignCheckboxListener()
    addIndexCheckboxListener()
    increaseButton.addEventListener("click", handleIncreaseClick)
    decreaseButton.addEventListener("click", handleDecreaseClick)
    leftArrowButton.addEventListener("click", handleLeftArrowClick)
    rightArrowButton.addEventListener("click", handleRightArrowClick)
    addCircuitInputListener()
    addVisualPerformListener()
    addDurationInputListener()
}

function removeEventListeners() {
    removePlayListener()
    removeAnimateControls()
    removeSignCheckboxListener()
    removeIndexCheckboxListener()
    inputField.removeEventListener("click", handleInputClick)
    increaseButton.removeEventListener("click", handleIncreaseClick)
    decreaseButton.removeEventListener("click", handleDecreaseClick)
    leftArrowButton.removeEventListener("click", handleLeftArrowClick)
    rightArrowButton.removeEventListener("click", handleRightArrowClick)
    removeCircuitInputListener()
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
    appState.visualizer.stopAnimation()
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
    if (!appState.visualizer.currentAnimation) {
        resetCircuit()
        showCircuit()
        appState.visualizer.initializeCircuit(
            appState.inputSet,
            appState.circuitData.countInputs
        )
        appState.visualizer.animateCircuit(
            appState.circuitResultData.setResults[appState.inputSet]
                .stateHistory,
            appState.duration
        )
    } else {
        appState.visualizer.currentAnimation.start()
    }
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
    appState.visualizer.setField("isRestart", true)
    hideElement(playButton)
    disableButton(playButton)
    disableButton(signCheckbox)
    setCheckboxUnchecked(signCheckbox)
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
    showElement(pauseButton)
    enableButton(pauseButton)
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
    handleCircuitNumberClick,
    removeHoverEffect,
    removeVisualizeListener,
    resetCircuit,
    toggleCircuit,
}
