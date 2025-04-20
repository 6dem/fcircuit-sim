import { processAllCircuits } from "../../services/process-circuits.js"

self.onmessage = function (e) {
    const jsonData = e.data
    try {
        const { resultData, errorData } = processAllCircuits(jsonData)
        self.postMessage({ resultData, errorData })
    } catch (error) {
        self.postMessage({ error: error.message })
    }
}
