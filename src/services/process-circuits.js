import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { Circuit } from "../classes/circuit.js"
import { MIG } from "../classes/mig.js"
import { formatJson } from "../utils/format-json.js"

export function processAllCircuits(jsonData) {
    if (!Array.isArray(jsonData)) {
        console.error("The JSON data is not an array")
        return
    }

    const BATCH_SIZE = 10000 // Количество схем, которое будем записывать за один раз

    const buffer = [] // Буфер для промежуточных результатов
    let processedCircuits = 0
    let filePath

    try {
        for (const circuitData of jsonData) {
            let circuit
            const sets = 2 ** circuitData.countInputs
            const format = circuitData.format
            let depth
            const setResults = []

            filePath = `./circuit-results/${format}-results.json`

            try {
                for (let set = 0; set < sets; set++) {
                    switch (format) {
                        case "fcircuit":
                            circuit = new Circuit()
                            break
                        case "mig":
                            circuit = new MIG()
                            break
                        default:
                            console.error(`Unknown format: ${format}`)
                            continue
                    }

                    circuit.parseCircuit(jsonData, +circuitData.number)
                    circuit.findAllPaths()
                    circuit.buildXDepthsDict()
                    depth = circuit.calculateDepth(circuit.allPaths)

                    let stateHistory = {}
                    circuit.initializeCircuit(set)
                    stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
                    const outputValues = circuit.calculateOutput()
                    const delay = circuit.calculateDelay(stateHistory)
                    const signChains = circuit.searchSignChains(
                        circuit.allPaths
                    )
                    const signDelay = circuit.calculateSignDelay(signChains)

                    // Сохраняем данные по конкретному входному набору
                    setResults.push({
                        inputSet: set
                            .toString(2)
                            .padStart(circuit.countInputs, "0"),
                        outputValue: outputValues,
                        delay: delay,
                        signDelay: signDelay,
                    })
                }

                // Собираем результаты для конкретной схемы
                const result = {
                    number: circuitData.number,
                    depth: depth,
                    setResults: setResults,
                }

                buffer.push(result)
                // Если буфер переполнен, записываем его в файл и очищаем
                if (buffer.length >= BATCH_SIZE) {
                    appendToFile(filePath, buffer)
                    buffer.length = 0 // Очищаем буфер
                }

                processedCircuits++
                console.log(`Processed: ${processedCircuits}\r`)
            } catch (error) {
                console.error(
                    `Error processing circuit ${circuitData.number}: ${error}`
                )
            }
        }
        // Записываем оставшиеся данные из буфера, если они есть
        if (buffer.length > 0) {
            appendToFile(filePath, buffer)
        }
    } catch (error) {
        console.error("Unexpected error during processing:", error)
    }

    // Функция добавления данных в файл
    function appendToFile(filePath, data) {
        const existingData = existsSync(filePath)
            ? JSON.parse(readFileSync(filePath, "utf-8"))
            : []
        existingData.push(...data)
        writeFileSync(filePath, formatJson(existingData), "utf-8")
    }
}
