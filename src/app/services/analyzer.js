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
        this.differenceDistributions = {
            depthDelay: [],
            depthSignDelay: [],
            delaySignDelay: [],
        }

        // тестовые запуски
        console.log(
            "🚀 ~ Analyzer ~ constructor ~ this.countMetricEquality():",
            this.countMetricEquality(["signDelay", "delay"], true)
        )
        console.log(
            `🚀 ~ Analyzer ~ constructor ~ compareMetricDominance(["signDelay", "delay"]):`,
            this.compareMetricDominance(["signDelay", "delay"])
        )
        console.log(
            "🚀 ~ Analyzer ~ constructor ~ this.checkSignificantChainsExistence():",
            this.checkSignificantChainsExistence()
        )
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

    calculateMetricDifferences() {
        const differences = this.calculateDifferences()

        const stats = {}

        Object.keys(differences).forEach((key) => {
            const values = differences[key]
            const mean = this.calculateMean(values)
            const variance = this.calculateVariance(values, mean)

            stats[key] = { values, mean, variance }
        })

        return stats
    }

    calculateDifferenceDistributions() {
        const differences = this.calculateDifferences()

        Object.keys(differences).forEach((key) => {
            const values = differences[key]
            const distribution = {}

            values.forEach((value) => {
                if (distribution[value]) {
                    distribution[value]++
                } else {
                    distribution[value] = 1
                }
            })

            this.differenceDistributions[key] = distribution
        })
    }

    calculateDifferences() {
        const differences = {
            depthDelay: [],
            depthSignDelay: [],
            delaySignDelay: [],
        }

        this.processedData.forEach((circuit) => {
            const depth = circuit.depth

            const delay = this.maxMetrics["delay"].get(circuit.number)
            const signDelay = this.maxMetrics["signDelay"].get(circuit.number)

            differences.depthDelay.push(depth - delay)
            differences.depthSignDelay.push(depth - signDelay)
            differences.delaySignDelay.push(delay - signDelay)
        })

        return differences
    }

    calculateMean(values) {
        const sum = values.reduce((acc, value) => acc + value, 0)
        return sum / values.length
    }

    calculateVariance(values, mean) {
        const sumOfSquares = values.reduce(
            (acc, value) => acc + Math.pow(value - mean, 2),
            0
        )
        return sumOfSquares / values.length
    }

    getCircuitMetricsBySet(circuitNumber) {
        const circuit = this.processedData.find(
            (c) => c.number === circuitNumber
        )
        if (!circuit) {
            throw new Error(`Circuit with number ${circuitNumber} not found`)
        }

        const result = {
            inputSets: [],
            depth: [],
            delay: [],
            signDelay: [],
        }

        circuit.setResults.forEach((set) => {
            result.inputSets.push(parseInt(set.inputSet, 2))
            result.depth.push(circuit.depth)
            result.delay.push(set.delay)
            result.signDelay.push(set.signDelay)
        })

        return result
    }

    countMetricEquality(
        metrics = ["depth", "delay", "signDelay"],
        equal = true
    ) {
        if (!Array.isArray(metrics) || metrics.length < 2) {
            throw new Error(
                "At least two metrics must be provided for comparison"
            )
        }

        let count = 0

        this.processedData.forEach((circuit) => {
            const values = metrics.map((metric) => {
                if (metric === "depth") return circuit.depth

                const maxMetric = this.maxMetrics[metric].get(circuit.number)
                if (!maxMetric)
                    throw new Error(
                        `Max metric for circuit ${circuit.number} and metric '${metric}' not found`
                    )
                return maxMetric
            })

            const allEqual = values.every((val) => val === values[0])

            if ((equal && allEqual) || (!equal && !allEqual)) {
                count++
            }
        })

        const total = this.processedData.length
        const percentage = (count / total) * 100

        return { count, total, percentage }
    }

    compareMetricDominance([metricA, metricB], perSet = false) {
        if (!Array.isArray(metricA) && typeof metricA === "string") {
            ;[metricA, metricB] = [metricA, metricB]
        }

        let count = 0
        let total = 0

        if (perSet) {
            this.processedData.forEach((circuit) => {
                circuit.setResults.forEach((res) => {
                    total++
                    if (res[metricA] > res[metricB]) count++
                })
            })
        } else {
            const maxA = this.maxMetrics[metricA]
            const maxB = this.maxMetrics[metricB]

            if (!(maxA instanceof Map) || !(maxB instanceof Map)) {
                throw new Error("One of the metric maps is invalid.")
            }

            for (const [circuitNumber, valueA] of maxA.entries()) {
                const valueB = maxB.get(circuitNumber)
                if (valueB === undefined) continue

                total++
                if (valueA > valueB) count++
            }
        }

        return {
            metricA,
            metricB,
            total,
            count,
            ratio: total ? count / total : 0,
        }
    }

    checkSignificantChainsExistence(perSet = false) {
        let count = 0
        let total = 0

        if (perSet) {
            this.processedData.forEach((circuit) => {
                circuit.setResults.forEach((res) => {
                    total++
                    if (res.signDelay === 0) count++
                })
            })
        } else {
            const signDelayMap = this.maxMetrics["signDelay"]
            if (!(signDelayMap instanceof Map)) {
                throw new Error("maxMetrics.signDelay must be a Map")
            }

            for (const value of signDelayMap.values()) {
                total++
                if (value === 0) count++
            }
        }

        return {
            total,
            count,
            ratio: total ? count / total : 0,
        }
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
