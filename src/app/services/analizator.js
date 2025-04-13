import { MaxHeap } from "../../utils/max-heap.js"

class Analizator {
    constructor(data, options = {}) {
        const { limit = 8 } = options
        this.validateInput(data, limit)
        this.processedData = data
        this.limit = limit
        this.metrics = {
            delay: { minimalCircuits: [], maxMetrics: [] },
            signDelay: { minimalCircuits: [], maxMetrics: [] },
        }
        this.analyzeMetrics()
    }

    analyzeMetrics() {
        ;["delay", "signDelay"].forEach((metric) => {
            const heap = new MaxHeap(this.limit)
            const maxMetrics = []

            this.processedData.forEach((circuit) => {
                const maxMetric = this.calculateMaxMetric(circuit, metric)
                maxMetrics.push({
                    number: circuit.number,
                    maxMetric,
                })

                heap.push({
                    number: circuit.number,
                    metric: maxMetric,
                    depth: circuit.depth,
                })
            })

            this.metrics[metric].minimalCircuits = heap.getSorted()
            this.metrics[metric].maxMetrics = maxMetrics
        })
    }

    validateInput(data, limit) {
        if (!Number.isInteger(limit) || limit < 1) {
            throw new Error("Limit must be a positive integer")
        }

        if (!Array.isArray(data)) {
            throw new Error("Input data must be an array")
        }

        // Validate each property
        data.forEach((circuit, i) => {
            if (typeof circuit?.number !== "number") {
                throw new Error(
                    `Circuit at index ${i} must have a numeric "number" property`
                )
            }

            if (!Array.isArray(circuit?.setResults)) {
                throw new Error(
                    `Circuit at index ${i} must have an array "setResults"`
                )
            }

            circuit.setResults.forEach((res, j) => {
                if (
                    typeof res?.delay !== "number" ||
                    typeof res?.signDelay !== "number"
                ) {
                    throw new Error(
                        `Result at circuit[${i}].setResults[${j}] must have numeric "delay" and "signDelay"`
                    )
                }
            })
        })

        return true
    }

    calculateMaxMetric(circuit, metric) {
        let max = -Infinity
        for (const res of circuit.setResults) {
            if (res[metric] > max) max = res[metric]
        }
        return max
    }
}

export { Analizator }
