import { writeFileSync } from "node:fs"
import { Circuit } from "../classes/circuit.js"
import { MIG } from "../classes/mig.js"
import { formatJson } from "../utils/format-json.js"

let format

export function processAllCircuits(jsonData) {
    const results = []

    if (!Array.isArray(jsonData)) {
        console.error("The JSON data is not an array")
        return
    }

    for (const circuitData of jsonData) {
        let circuit
        const sets = 2 ** circuitData.countInputs
        format = circuitData.format
        let depth
        let setResults = []
        console.dir(circuitData, { depth: null })
        try {
            for (let set = 0; set < sets; set++) {
                switch (format) {
                    case "fcircuit":
                        circuit = new Circuit()
                        break
                    case "mig":
                        circuit = new MIG()
                        break
                }
                // Создаем новый экземпляр для каждой схемы
                circuit.parseCircuit(jsonData, +circuitData.number)

                circuit.findAllPaths()
                circuit.buildXDepthsDict()
                depth = circuit.calculateDepth()

                let stateHistory = {}
                circuit.initializeCircuit(set)
                stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
                const outputValues = circuit.calculateOutput()
                const delay = circuit.calculateDelay(stateHistory)

                // Сохраняем данные по конкретному входному набору
                setResults.push({
                    inputSet: set
                        .toString(2)
                        .padStart(circuit.countInputs, "0"),
                    outputValue: outputValues,
                    delay: delay,
                })
            }
            // Собираем результаты
            results.push({
                number: circuitData.number,
                depth: depth,
                setResults: setResults,
            })

            console.log(
                `Simulation for circuit ${circuitData.number} completed.`
            )
        } catch (error) {
            console.error(
                `Error processing circuit ${circuitData.number}: ${error}`
            )
        }
    }

    // Записываем результаты в новый JSON файл
    writeFileSync(
        `./circuit-results/${format}-results.json`,
        formatJson(results),
        "utf-8"
    )
    console.log("All circuits processed and results saved to circuit-results")
}
