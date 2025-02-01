function hideElement(element) {
    element.classList.add("hidden")
}

function showElement(element) {
    element.classList.remove("hidden")
}

export { hideElement, showElement }
