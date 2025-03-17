import { addFileEventListeners } from "./modules/fileHandlers.js"
import { initKeyboardControls } from "./modules/keyboard-controls.js"

const appState = {
    jsonData: null,
    circuitsCount: 0,
    circuitIndex: 0,
    circuitData: null,
    circuitNumber: 0,
    numberOfInputs: 0,
    inputSet: 0,
    circuitResultData: null,
    sliderPosition: 0,
    sliderWidth: 0,
    realSliderWidth: 0,
    processedData: [],
    currentSchemes: [],
    currentSchemeIndex: 0,
    loadedSchemes: [],
    scrollLoading: false,
}

function setState(newState) {
    Object.assign(appState, newState)
}

function initApp() {
    addFileEventListeners()
    initKeyboardControls()
}

export { appState, initApp, setState }
