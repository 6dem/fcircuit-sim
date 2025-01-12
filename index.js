import { processAllCircuits } from "./src/services/process-circuits.js"

const fileInput = document.getElementById("file-upload")
const attachButton = document.getElementById("attach-file-button")
const performButton = document.getElementById("perform-button")
const fileNameDisplay = document.getElementById("file-name")
const tableContainer = document.getElementById("table-wrapper")
const tableBody = document.querySelector("#results-table tbody")
const saveButton = document.getElementById("save-button")
const stopButton = document.getElementById("stopButton")

let jsonData = null
let processedData = []
let currentSchemes = [] // Схемы, которые отображаются в таблице
let loadedSchemes = [] // Все загруженные схемы
let scrollLoading = false // Чтобы не запускать несколько загрузок одновременно

const initialSchemeCount = 4
let currentSchemeIndex = 0

attachButton.addEventListener("click", () => {
    fileInput.click()
})

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]
    if (file) {
        fileNameDisplay.textContent = file.name
        performButton.disabled = false
    }
})

performButton.addEventListener("click", async () => {
    const file = fileInput.files[0]
    if (file) {
        const fileType = file.type
        if (fileType !== "application/json") {
            showCustomAlert("The uploaded file must be a JSON file.")
            return
        }
        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                jsonData = JSON.parse(event.target.result)

                if (!Array.isArray(jsonData)) {
                    throw new Error("The JSON data is not an array")
                }

                stopButton.style.display = "inline-block"
                let { resultData, errorData } = await processAllCircuits(
                    jsonData
                )
                resultData = JSON.parse(resultData)
                processedData = resultData
                loadedSchemes = resultData

                currentSchemes = processedData.slice(0, 4)
                currentSchemeIndex = 4
                updateTable()

                displayErrors(errorData)

                stopButton.style.display = "none"
            } catch (error) {
                // Ошибка парсинга JSON или неправильная структура
                console.error("Error:", error)
                if (error instanceof SyntaxError) {
                    showCustomAlert(
                        "There was an error parsing the file.<br>Please ensure the JSON is correctly formatted."
                    )
                } else {
                    showCustomAlert(
                        `Invalid file format or structure: ${error.message}`
                    )
                }
            }
        }
        reader.readAsText(file)
    }
})

tableContainer.addEventListener("scroll", () => {
    const nearBottom =
        tableContainer.scrollHeight - tableContainer.scrollTop <=
        tableContainer.clientHeight + 10
    const nearTop = tableContainer.scrollTop <= 105

    if (nearBottom) {
        loadMoreSchemes() // При прокрутке вниз загружаем новые схемы
    } else if (nearTop) {
        loadPreviousSchemes() // При прокрутке вверх загружаем старые схемы
    }
})

saveButton.addEventListener("click", () => {
    const resultStr = `[${processedData
        .map((item) => JSON.stringify(item))
        .join(",\n")}]`
    const blob = new Blob([resultStr], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "result-data.json" // Название файла
    link.click()
})

stopButton.addEventListener("click", stopProcessing)

function loadMoreSchemes() {
    if (scrollLoading || currentSchemeIndex >= loadedSchemes.length) return
    scrollLoading = true

    const nextSchemes = loadedSchemes.slice(
        currentSchemeIndex,
        currentSchemeIndex + 2
    )
    currentSchemes = [...currentSchemes.slice(-2), ...nextSchemes] // Добавляем новые схемы

    currentSchemeIndex += 2 // Увеличиваем индекс

    updateTable("down") // Обновляем таблицу
    scrollLoading = false
}

// Загружаем старые схемы вверх
function loadPreviousSchemes() {
    if (scrollLoading || currentSchemeIndex <= 4) return
    scrollLoading = true

    const prevSchemes = loadedSchemes.slice(
        currentSchemeIndex - 6,
        currentSchemeIndex - 4
    )
    currentSchemes = [...prevSchemes, ...currentSchemes.slice(0, 2)] // Добавляем старые схемы
    currentSchemeIndex -= 2 // Уменьшаем индекс
    updateTable("up") // Обновляем таблицу
    scrollLoading = false
}

function updateTable(direction) {
    const scrollTop = tableContainer.scrollTop // Сохраняем текущую позицию прокрутки

    tableBody.innerHTML = "" // Очищаем таблицу перед добавлением данных

    currentSchemes.forEach((entry) => {
        entry.setResults.forEach((result) => {
            const row = document.createElement("tr")
            const outputs = Object.keys(result.outputValue)
            const output = outputs[0]

            if (+result.inputSet === 0) {
                row.innerHTML = `
                    <td style="padding-top: 25px">${entry.number}</td>
                    <td style="padding-top: 25px">${entry.depth}</td>
                    <td style="padding-top: 25px">${result.inputSet}</td>
                    <td style="padding-top: 25px">${result.outputValue[output]}</td>
                    <td style="padding-top: 25px">${result.delay}</td>
                    <td style="padding-top: 25px">${result.signDelay}</td>
                `
            } else {
                row.innerHTML = `
                    <td> </td>
                    <td> </td>
                    <td>${result.inputSet}</td>
                    <td>${result.outputValue[output]}</td>
                    <td>${result.delay}</td>
                    <td>${result.signDelay}</td>
                `
            }

            tableBody.appendChild(row)
        })
    })

    tableContainer.style.display = "block"
    saveButton.style.display = "inline-block"

    // Восстанавливаем позицию прокрутки, чтобы не произошло смещения
    if (direction === "down") {
        tableContainer.scrollTop =
            tableContainer.scrollHeight / 2 - tableContainer.clientHeight + 40
    } else if (direction === "up") {
        tableContainer.scrollTop = tableContainer.scrollHeight / 2 + 50
    }
}

function displayErrors(errorData) {
    const errorContainer = document.getElementById("error-container")
    errorContainer.innerHTML = "" // Очищаем контейнер перед добавлением новых ошибок

    errorData.forEach((error) => {
        const errorDiv = document.createElement("div")
        errorDiv.innerHTML = `
        <p><strong>Circuit ${error.number}:</strong> ${error.error}</p>
        `
        errorContainer.appendChild(errorDiv)
    })

    errorContainer.style.display = errorData.length ? "block" : "none" // Показываем блок, если есть ошибки
}

function stopProcessing() {
    cancelProcessing = true
    stopButton.style.display = "none"
    showCustomAlert("Processing was canceled.")
}

function showCustomAlert(message) {
    const alertBox = document.getElementById("custom-alert")
    const alertMessage = document.getElementById("custom-alert-message")
    const alertOkButton = document.getElementById("custom-alert-ok")

    alertMessage.innerHTML = message

    alertBox.classList.remove("hidden")

    alertOkButton.onclick = () => {
        alertBox.classList.add("hidden")
    }
}
