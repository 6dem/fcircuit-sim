import { createCircuit } from "../utils/create-circuit.js"
import { formatJson } from "../utils/format-json.js"

let cancelProcessing = false // Флаг для досрочной остановки

export function stopProcessing() {
    cancelProcessing = true // Устанавливаем флаг для остановки обработки
}

export function processAllCircuits(jsonData) {
    if (!Array.isArray(jsonData)) {
        throw new Error("The JSON data is not an array")
    }
    if (!jsonData || !jsonData.length) {
        throw new Error("The JSON data is empty")
    }

    const resultData = []
    const errorData = [] // Массив для ошибок
    let processedCircuits = 0

    for (const circuitData of jsonData) {
        if (cancelProcessing) {
            break // Прерываем выполнение при установке флага
        }

        let circuit
        const sets = 2 ** circuitData.countInputs
        const format = circuitData.format
        let depth
        const setResults = []
        circuit = createCircuit(format)
        circuit.parseCircuit(jsonData, +circuitData.number)
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        depth = circuit.calculateDepth(allPaths)

        try {
            for (let set = 0; set < sets; set++) {
                if (cancelProcessing) {
                    break // Прерываем выполнение при установке флага
                }

                let stateHistory = {}

                circuit = createCircuit(format)
                circuit.parseCircuit(jsonData, +circuitData.number)
                circuit.initializeCircuit(set)
                stateHistory = circuit.simulateCircuit(xDepthsDict)
                const outputValues = circuit.calculateOutput()
                const delay = circuit.calculateDelay(stateHistory)
                const [signChains, fullStrPath] =
                    circuit.searchSignChains(allPaths)
                const signDelay = circuit.calculateSignDelay(signChains)

                setResults.push({
                    inputSet: set
                        .toString(2)
                        .padStart(circuit.countInputs, "0"),
                    outputValue: outputValues,
                    delay: delay,
                    signDelay: signDelay,
                })
            }

            const result = {
                number: circuitData.number,
                depth: depth,
                setResults: setResults,
            }

            resultData.push(result)
            processedCircuits++
        } catch (error) {
            console.error(
                `Error processing circuit ${circuitData.number}:`,
                error
            )
            errorData.push({
                number: circuitData.number,
                error: `Error: ${error.message}`, // Добавляем информацию об ошибке для этой схемы
            })
        }
    }

    // Возвращаем только успешно обработанные данные и передаем errorData для отображения ошибок
    return { resultData: formatJson(resultData), errorData: errorData }
}
