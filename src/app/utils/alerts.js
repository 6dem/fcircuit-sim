import { hideElement, showElement } from "./show-hide-element.js"

export function showCustomAlert(message) {
    const alertBox = document.getElementById("custom-alert")
    const alertMessage = document.getElementById("custom-alert-message")
    const alertOkButton = document.getElementById("custom-alert-ok")
    const extra = document.getElementById("custom-alert-extra")
    const downloadButton = document.getElementById("custom-alert-download")

    alertMessage.innerHTML = message

    showElement(alertBox)
    alertOkButton.onclick = () => {
        hideElement(extra)
        hideElement(downloadButton)
        hideElement(alertBox)
    }
}
