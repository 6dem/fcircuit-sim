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

        try {
            for (let set = 0; set < sets; set++) {
                if (cancelProcessing) {
                    break // Прерываем выполнение при установке флага
                }

                circuit = createCircuit(format)
                circuit.parseCircuit(jsonData, +circuitData.number)
                circuit.findAllPaths()
                circuit.buildXDepthsDict()
                depth = circuit.calculateDepth(circuit.allPaths)

                let stateHistory = {}
                circuit.initializeCircuit(set)
                stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
                const outputValues = circuit.calculateOutput()
                const delay = circuit.calculateDelay(stateHistory)
                const signChains = circuit.searchSignChains(circuit.allPaths)
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
