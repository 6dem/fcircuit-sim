const countInputElement = document.getElementById("input-count")

export function updateCountInput(circuitCount, limit = 10) {
    countInputElement.max = circuitCount
    if (circuitCount < limit) {
        countInputElement.value = circuitCount
    }
}
