import { MaxHeap } from "../../utils/max-heap.js"

class Analyzer {
    constructor(data) {
        this.validateInput(data)
        this.processedData = data
        this.maxMetrics = this.calculateAllMaxMetrics()
        this.minCircuits = {
            delay: { minimalCircuits: [] },
            signDelay: { minimalCircuits: [] },
        }
        this.metricDistributions = {
            depth: [],
            delay: [],
            signDelay: [],
        }
        this.calculateMetricDistributions()
    }

    calculateMaxMetric(circuit, metric) {
        let max = -Infinity
        for (const res of circuit.setResults) {
            if (res[metric] > max) max = res[metric]
        }
        return max
    }

    calculateAllMaxMetrics(metrics = ["delay", "signDelay"]) {
        if (!Array.isArray(metrics) || metrics.length === 0) {
            throw new Error("Metrics must be a non-empty array")
        }

        const result = {}

        metrics.forEach((metric) => {
            const metricMap = new Map()
            this.processedData.forEach((circuit) => {
                const max = this.calculateMaxMetric(circuit, metric)
                metricMap.set(circuit.number, max)
            })
            result[metric] = metricMap
        })

        return result
    }

    findMinimalCircuits(metrics, limit) {
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

            this.processedData.forEach((circuit) => {
                const maxMetric = this.maxMetrics[metric].get(circuit.number)

                heap.push({
                    number: circuit.number,
                    metric: maxMetric,
                    depth: circuit.depth,
                })
            })

            this.minCircuits[metric].minimalCircuits = heap.getSorted()
        })
    }

    calculateMetricDistributions(metrics = ["depth", "delay", "signDelay"]) {
        const result = {}

        metrics.forEach((metric) => {
            const counter = new Map()

            this.processedData.forEach((circuit) => {
                const value =
                    metric === "depth"
                        ? circuit.depth
                        : this.maxMetrics[metric].get(circuit.number)

                counter.set(value, (counter.get(value) || 0) + 1)
            })

            result[metric] = Array.from(counter.entries())
                .map(([value, count]) => ({ value, count }))
                .sort((a, b) => a.value - b.value)
        })

        this.metricDistributions = result
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
}

export { Analyzer }
