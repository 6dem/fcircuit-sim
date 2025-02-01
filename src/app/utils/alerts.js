import { hideElement, showElement } from "./show-hide-element.js"

export function showCustomAlert(message) {
    const alertBox = document.getElementById("custom-alert")
    const alertMessage = document.getElementById("custom-alert-message")
    const alertOkButton = document.getElementById("custom-alert-ok")

    alertMessage.innerHTML = message

    showElement(alertBox)
    // alertOkButton.onclick = null
    alertOkButton.onclick = () => {
        hideElement(alertBox)
    }
}
