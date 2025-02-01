import { appState, setState } from "../app.js"
import { removeHoverEffect } from "../modules/visualization.js"
import { disableButton, enableButton } from "./disable-enable-btn.js"
import { hideElement, showElement } from "./show-hide-element.js"

const inputField = document.getElementById("input-set")
const visualizationSection = document.getElementById("visualization-section")
const increaseButton = document.getElementById("button--increase")
const decreaseButton = document.getElementById("button--decrease")
const visualPerformButton = document.getElementById("visual-perform-button")
const playButton = document.getElementById("play-button")
const leftArrowButton = document.getElementById("arrow-button-left")
const rightArrowButton = document.getElementById("arrow-button-right")
const setResultsElement = document.getElementById("set-results")
const resultsButton = document.getElementById("button--results")
const resultsSection = document.getElementById("results-section")
const tableContainer = document.getElementById("table-wrapper")

function fullReset() {
    setState({
        circuitIndex: 0,
        sliderPosition: 0,
        processedData: [],
        currentSchemes: [],
        loadedSchemes: [],
        scrollLoading: false,
        currentSchemeIndex: 0,
    })

    tableContainer.scrollTop = 0
    circuitReset()
    showElement(leftArrowButton)
    showElement(rightArrowButton)
    hideElement(visualizationSection)
    hideElement(resultsSection)
}

function circuitReset() {
    const circuitDataLocal = appState.jsonData[appState.circuitIndex]
    setState({
        circuitData: circuitDataLocal,
        numberOfInputs: circuitDataLocal.countInputs,
        circuitResultData: null,
    })
    inputField.value = "0".repeat(appState.numberOfInputs)

    setState({ inputSet: parseInt(inputField.value, 2) })

    disableButton(increaseButton)
    disableButton(decreaseButton)
    disableButton(resultsButton)
    disableButton(playButton)
    enableButton(visualPerformButton)
    visualPerformButton.textContent = "Perform"
    setResultsElement.innerHTML = ""
    setResultsElement.classList.remove("error")
    removeHoverEffect(inputField)
}

export { circuitReset, fullReset }
