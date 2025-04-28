import { MaxHeap } from "../../utils/max-heap.js"

class Analyzer {
    constructor(data) {
        this.validateInput(data)
        this.processedData = data
        this.maxMetrics = this.calculateAllMaxMetrics()
    }

    calculateMaxMetric(circuit, metric) {
        let max = -Infinity
        for (const res of circuit.setResults) {
            if (res[metric] > max) max = res[metric]
        }
        return max
    }

    calculateAllMaxMetrics(
        metrics = ["delay", "signDelay"],
        processedData = this.processedData
    ) {
        if (!Array.isArray(metrics) || metrics.length === 0) {
            throw new Error("Metrics must be a non-empty array")
        }

        const result = {}

        metrics.forEach((metric) => {
            const metricMap = new Map()
            processedData.forEach((circuit) => {
                const max = this.calculateMaxMetric(circuit, metric)
                metricMap.set(circuit.number, max)
            })
            result[metric] = metricMap
        })

        return result
    }

    findMinimalCircuits(
        metrics,
        limit,
        maxMetrics = this.maxMetrics,
        processedData = this.processedData
    ) {
        if (!Number.isInteger(limit) || limit < 1) {
            throw new Error("Limit must be a positive integer")
        }
        if (!Array.isArray(metrics)) {
            throw new Error("Metrics is not an array")
        }
        if (!metrics || !metrics.length) {
            throw new Error("Metrics array is empty")
        }
        const minCircuits = {
            delay: { minimalCircuits: [] },
            signDelay: { minimalCircuits: [] },
        }
        metrics.forEach((metric) => {
            const heap = new MaxHeap(limit)

            processedData.forEach((circuit) => {
                const maxMetric = maxMetrics[metric].get(circuit.number)

                heap.push({
                    number: circuit.number,
                    metric: maxMetric,
                    depth: circuit.depth,
                })
            })

            minCircuits[metric].minimalCircuits = heap.getSorted()
        })
        return minCircuits
    }

    calculateMetricDistributions(
        metrics = ["depth", "delay", "signDelay"],
        processedData = this.processedData
    ) {
        const metricDistributions = {}

        metrics.forEach((metric) => {
            const counter = new Map()

            processedData.forEach((circuit) => {
                const value =
                    metric === "depth"
                        ? circuit.depth
                        : this.maxMetrics[metric].get(circuit.number)

                counter.set(value, (counter.get(value) || 0) + 1)
            })

            metricDistributions[metric] = Array.from(counter.entries())
                .map(([value, count]) => ({ value, count }))
                .sort((a, b) => a.value - b.value)
        })

        return metricDistributions
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
        const differenceDistributions = {
            depthDelay: [],
            depthSignDelay: [],
            delaySignDelay: [],
        }

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

            differenceDistributions[key] = distribution
        })
        return differenceDistributions
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

    getCircuitMetricsBySet(circuitNumber, circuitsData = this.processedData) {
        const circuit = circuitsData.find((c) => c.number === circuitNumber)
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
        equal = true,
        perSet = false
    ) {
        if (!Array.isArray(metrics) || metrics.length < 2) {
            throw new Error(
                "At least two metrics must be provided for comparison"
            )
        }

        let count = 0
        let total = 0

        this.processedData.forEach((circuit) => {
            if (perSet) {
                circuit.setResults.forEach((res) => {
                    const values = metrics.map((metric) => {
                        if (metric === "depth") return circuit.depth
                        if (!(metric in res))
                            throw new Error(
                                `Metric '${metric}' not found in set results`
                            )
                        return res[metric]
                    })

                    const allEqual = values.every((val) => val === values[0])

                    total++
                    if ((equal && allEqual) || (!equal && !allEqual)) {
                        count++
                    }
                })
            } else {
                const values = metrics.map((metric) => {
                    if (metric === "depth") return circuit.depth

                    const maxMetric = this.maxMetrics[metric].get(
                        circuit.number
                    )
                    if (maxMetric === undefined)
                        throw new Error(
                            `Max metric for circuit ${circuit.number} and metric '${metric}' not found`
                        )
                    return maxMetric
                })

                const allEqual = values.every((val) => val === values[0])

                total++
                if ((equal && allEqual) || (!equal && !allEqual)) {
                    count++
                }
            }
        })

        const ratio = total ? count / total : 0

        return { count, total, ratio }
    }

    compareMetricDominance([metricA, metricB], perSet = false) {
        let count = 0
        let total = 0

        if (perSet) {
            const isMetricADepth = metricA === "depth"
            const isMetricBDepth = metricB === "depth"

            for (const circuit of this.processedData) {
                for (const res of circuit.setResults) {
                    total++
                    count +=
                        (isMetricADepth ? circuit.depth : res[metricA]) >
                        (isMetricBDepth ? circuit.depth : res[metricB])
                            ? 1
                            : 0
                }
            }
        } else {
            const maxA = metricA === "depth" ? null : this.maxMetrics[metricA]
            const maxB = metricB === "depth" ? null : this.maxMetrics[metricB]

            if (
                (metricA !== "depth" && !(maxA instanceof Map)) ||
                (metricB !== "depth" && !(maxB instanceof Map))
            ) {
                throw new Error("One of the metric maps is invalid.")
            }

            const circuitMap = new Map(
                this.processedData.map((c, i) => [c.number, i])
            )
            const circuits = new Set([
                ...(metricA !== "depth" ? maxA.keys() : []),
                ...(metricB !== "depth" ? maxB.keys() : []),
            ])

            for (const cn of circuits) {
                const idx = circuitMap.get(cn)
                if (idx === undefined) continue

                const circuit = this.processedData[idx]
                const valueA =
                    metricA === "depth" ? circuit.depth : maxA?.get(cn)
                const valueB =
                    metricB === "depth" ? circuit.depth : maxB?.get(cn)

                if (valueA === undefined || valueB === undefined) continue

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
