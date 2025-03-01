import { jsonData } from "../../draft-data.js"

class Analizator {
    constructor(data) {
        this.processedData = data
        this.totalCircuits = data.length
        this.minimalCircuitsByDelay = []
        this.minimalCircuitsBySignDelay = []
        this.maxMetrics = { delay: [], signDelay: [] }
        this.findMinimalCircuits("delay")
        this.findMinimalCircuits("signDelay")
    }

    findMinimalCircuits(metric) {
        if (!["delay", "signDelay"].includes(metric)) {
            throw new Error("Метрика должна быть 'delay' или 'signDelay'")
        }

        const metricGroups = {}
        let minMaxMetric = Infinity

        // Группируем схемы по maxMetric и находим минимальное значение
        const circuitsWithMaxMetric = this.processedData.map((circuit) => {
            const maxMetric = Math.max(
                ...circuit.setResults.map((res) => res[metric])
            )
            if (!metricGroups[maxMetric]) metricGroups[maxMetric] = []
            metricGroups[maxMetric].push({
                number: circuit.number,
                maxMetric,
            })
            minMaxMetric = Math.min(minMaxMetric, maxMetric)
            return { number: circuit.number, maxMetric }
        })

        this.maxMetrics[metric] = circuitsWithMaxMetric

        // Определяем максимальное значение ключа в группах, чтобы избежать бесконечного цикла
        const maxMetricKey = Math.max(...Object.keys(metricGroups).map(Number))
        const minimalCircuits = []
        let currentMetric = minMaxMetric

        while (minimalCircuits.length < 8 && currentMetric <= maxMetricKey) {
            if (metricGroups[currentMetric]) {
                minimalCircuits.push(...metricGroups[currentMetric])
            }
            currentMetric++
        }

        if (metric === "delay") {
            this.minimalCircuitsByDelay = minimalCircuits.slice(0, 8)
        } else {
            this.minimalCircuitsBySignDelay = minimalCircuits.slice(0, 8)
        }
    }
}

const analizator = new Analizator(jsonData)

console.log("Минимальные схемы по delay:", analizator.minimalCircuitsByDelay)
console.log(
    "Минимальные схемы по signDelay:",
    analizator.minimalCircuitsBySignDelay
)
console.log("Максимальные метрики:", analizator.maxMetrics)
