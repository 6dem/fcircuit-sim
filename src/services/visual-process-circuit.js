import { createCircuit } from "../utils/create-circuit.js"

export function processCircuit(jsonData, circuitIndex) {
    if (!Array.isArray(jsonData)) {
        throw new Error("The JSON data is not an array")
    }
    if (!jsonData || !jsonData.length) {
        throw new Error("The JSON data is empty")
    }
    if (circuitIndex == null) {
        throw new Error("The circuit index was not transmitted")
    }
    if (circuitIndex > jsonData.length) {
        throw new Error("Invalid circuit index")
    }

    const circuitData = jsonData[circuitIndex]

    try {
        let circuit
        let depth
        const setResults = []
        let stateHistory = {}
        const sets = 2 ** circuitData.countInputs
        const format = circuitData.format
        for (let set = 0; set < sets; set++) {
            circuit = createCircuit(format)
            circuit.parseCircuit(jsonData, +circuitData.number)
            const allPaths = circuit.findAllPaths()
            const xDepthsDict = circuit.buildXDepthsDict(allPaths)
            depth = circuit.calculateDepth(allPaths)

            circuit.initializeCircuit(set)
            stateHistory = circuit.simulateCircuit(xDepthsDict)
            const outputValues = circuit.calculateOutput()
            const delay = circuit.calculateDelay(stateHistory)
            const [signChains, fullStrPath] = circuit.searchSignChains(allPaths)
            const signDelay = circuit.calculateSignDelay(signChains)

            setResults.push({
                inputSet: set.toString(2).padStart(circuit.countInputs, "0"),
                outputValue: outputValues,
                delay: delay,
                signDelay: signDelay,
                signChains: fullStrPath,
                stateHistory: stateHistory,
            })
        }

        const result = {
            number: circuitData.number,
            depth: depth,
            setResults: setResults,
        }

        return result
    } catch (error) {
        console.error(`Error processing circuit ${circuitData.number}:`, error)
        return {
            number: circuitData.number,
            error: `Error: ${error.message}`,
        }
    }
}

export function parseCircuitStructure(jsonData, circuitIndex) {
    if (!Array.isArray(jsonData)) {
        throw new Error("The JSON data is not an array")
    }

    const circuitData = jsonData[circuitIndex]

    let circuit
    const format = circuitData.format

    try {
        circuit = createCircuit(format)
        circuit.parseCircuit(jsonData, +circuitData.number)
        const allPaths = circuit.findAllPaths()
        const depthsDict = circuit.buildDepthsDict(allPaths)
        return depthsDict
    } catch (error) {
        console.error(`Error processing circuit ${circuitData.number}:`, error)
        return {
            number: circuitData.number,
            error: `Error: ${error.message}`,
        }
    }
}
