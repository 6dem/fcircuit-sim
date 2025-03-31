import { createCircuit } from "../utils/create-circuit.js"

export function processCircuit(jsonData, circuitIndex) {
    if (!Array.isArray(jsonData)) {
        throw new Error("The JSON data is not an array")
    }

    const circuitData = jsonData[circuitIndex]

    let circuit
    const sets = 2 ** circuitData.countInputs
    const format = circuitData.format
    let depth
    const setResults = []
    let stateHistory = {}

    try {
        for (let set = 0; set < sets; set++) {
            circuit = createCircuit(format)
            circuit.parseCircuit(jsonData, +circuitData.number)
            circuit.findAllPaths()
            circuit.buildXDepthsDict()
            depth = circuit.calculateDepth(circuit.allPaths)

            circuit.initializeCircuit(set)
            stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
            const outputValues = circuit.calculateOutput()
            const delay = circuit.calculateDelay(stateHistory)
            const [signChains, fullStrPath] = circuit.searchSignChains(
                circuit.allPaths
            )
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
        circuit.findAllPaths()
        return circuit.buildDepthsDict()
    } catch (error) {
        console.error(`Error processing circuit ${circuitData.number}:`, error)
        return {
            number: circuitData.number,
            error: `Error: ${error.message}`,
        }
    }
}
