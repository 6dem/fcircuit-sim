import { MaxHeap } from "../../utils/max-heap.js"

class Analyzer {
    constructor(data) {
        this.validateInput(data)
        this.processedData = data
        this.metrics = {
            delay: { minimalCircuits: [], maxMetrics: [] },
            signDelay: { minimalCircuits: [], maxMetrics: [] },
        }
    }

    analyzeMetrics(metrics, limit) {
        if (!Number.isInteger(limit) || limit < 1) {
            throw new Error("Limit must be a positive integer")
        }
        if (!Array.isArray(metrics)) {
            throw new Error("Metrics is not an array")
        }
        if (!metrics || !metrics.length) {
            throw new Error("Metrics array is empty")
        }
        metrics.forEach((metric) => {
            const heap = new MaxHeap(limit)
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

    validateInput(data) {
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

export { Analyzer }
