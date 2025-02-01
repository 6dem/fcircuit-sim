import { showCustomAlert } from "./alerts.js"

export function handleFileReadError(error) {
    console.error("Error:", error)
    if (error instanceof SyntaxError) {
        showCustomAlert(
            "There was an error parsing the file.<br>Please ensure the JSON is correctly formatted."
        )
    } else {
        showCustomAlert(`Invalid file format or structure: ${error.message}`)
    }
}
