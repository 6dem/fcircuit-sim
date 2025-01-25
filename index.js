import { processAllCircuits } from "./src/services/process-circuits.js"
import { processCircuit } from "./src/services/visual-process-circuit.js"
import {} from "./src/services/visualizer.js"

const fileInput = document.getElementById("file-upload")
const attachButton = document.getElementById("attach-file-button")
const visualizeButton = document.getElementById("visualize-button")
const performButton = document.getElementById("perform-button")
const fileNameDisplay = document.getElementById("file-name")
const visualizationSection = document.getElementById("visualization-section")
const increaseButton = document.getElementById("button--increase")
const decreaseButton = document.getElementById("button--decrease")
const inputField = document.getElementById("input-set")
const visualPerformButton = document.getElementById("visual-perform-button")
const playButton = document.getElementById("play-button")
const circuitNumberElement = document.querySelector(".circuit-number")
const progressSliderElement = document.querySelector(".progress-slider")
const progressBarElement = document.querySelector(".progress-bar")
const leftArrowButton = document.querySelector(".arrow-button.left")
const rightArrowButton = document.querySelector(".arrow-button.right")
const setResultsElement = document.getElementById("set-results")
const modalInfo = document.getElementById("modal-info")
const resultsButton = document.getElementById("button--results")
const resultsSection = document.getElementById("results-section")
const tableContainer = document.getElementById("table-wrapper")
const tableBody = document.querySelector("#results-table tbody")
const tableBodyVisual = document.querySelector("#results-table--visual tbody")
const saveButton = document.getElementById("save-button")
// const stopButton = document.getElementById("stopButton")

let inputSet = parseInt(inputField.value, 2)
let circuitResultData
let jsonData
let circuitData
let numberOfInputs
let circuitNumber
let circuitsCount
let circuitIndex = 0

let sliderWidth
let realSliderWidth
let sliderPosition = 0

let processedData = []
let currentSchemes = [] // Схемы, которые отображаются в таблице
let loadedSchemes = [] // Все загруженные схемы
let scrollLoading = false // Чтобы не запускать несколько загрузок одновременно

let currentSchemeIndex = 0

attachButton.addEventListener("click", () => {
    fileInput.click()
})

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]
    if (file) {
        fileNameDisplay.textContent = file.name
        performButton.disabled = false
        visualizeButton.disabled = false
    } else {
        fileNameDisplay.textContent = "No file chosen"
        performButton.disabled = true
        visualizeButton.disabled = true
    }
    fullReset()
})

visualizeButton.addEventListener("click", async () => {
    const file = fileInput.files[0]
    if (file) {
        try {
            checkFile(file)
        } catch {
            return
        }
        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                jsonData = JSON.parse(event.target.result)

                if (!Array.isArray(jsonData)) {
                    throw new Error("The JSON data is not an array")
                }

                circuitsCount = jsonData.length
                if (circuitsCount === 1) {
                    leftArrowButton.style.display = "none"
                    rightArrowButton.style.display = "none"
                }
                circuitNumber = jsonData[circuitIndex].number
                updateCircuitNumber()

                circuitData = jsonData[circuitIndex]
                numberOfInputs = circuitData.countInputs

                // Устанавливаем начальное значение (столько нулей, сколько входов)
                let binaryValue = "0".repeat(numberOfInputs)
                inputField.value = binaryValue

                sliderWidth = (1 / circuitsCount) * 100
                realSliderWidth = Math.max(sliderWidth, 5)
                progressSliderElement.style.width = `${realSliderWidth}%`
                updateSliderPosition()

                // Функция для увеличения значения
                function increaseBinary() {
                    binaryValue = (parseInt(inputField.value, 2) + 1)
                        .toString(2)
                        .padStart(numberOfInputs, "0")
                    if (binaryValue.length > numberOfInputs) {
                        binaryValue = "0".repeat(numberOfInputs) // Цикличность
                    }
                    inputField.value = binaryValue
                }

                // Функция для уменьшения значения
                function decreaseBinary() {
                    binaryValue = (parseInt(inputField.value, 2) - 1)
                        .toString(2)
                        .padStart(numberOfInputs, "0")
                    if (binaryValue.includes("-")) {
                        binaryValue = "1".repeat(numberOfInputs) // Цикличность
                    }
                    inputField.value = binaryValue
                }

                // Сброс значения при клике на поле ввода
                inputField.addEventListener("click", () => {
                    binaryValue = "0".repeat(numberOfInputs)
                    inputField.value = binaryValue
                    inputSet = parseInt(inputField.value, 2)
                    updateSetResults(circuitResultData)
                })

                increaseButton.addEventListener("click", () => {
                    increaseBinary()
                    inputSet = parseInt(inputField.value, 2)
                    updateSetResults(circuitResultData)
                })
                decreaseButton.addEventListener("click", () => {
                    decreaseBinary()
                    inputSet = parseInt(inputField.value, 2)
                    updateSetResults(circuitResultData)
                })

                leftArrowButton.addEventListener("click", async () => {
                    circuitIndex =
                        (circuitIndex - 1 + circuitsCount) % circuitsCount
                    sliderPosition = circuitIndex * sliderWidth
                    updateSliderPosition()
                    circuitNumber = jsonData[circuitIndex].number
                    updateCircuitNumber()
                    circuitReset()
                })

                rightArrowButton.addEventListener("click", async () => {
                    circuitIndex = (circuitIndex + 1) % circuitsCount
                    sliderPosition = circuitIndex * sliderWidth
                    updateSliderPosition()
                    circuitNumber = jsonData[circuitIndex].number
                    updateCircuitNumber()
                    circuitReset()
                })

                visualizationSection.style.display = "flex"
            } catch (error) {
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

visualPerformButton.addEventListener("click", async () => {
    const file = fileInput.files[0]
    if (file) {
        try {
            checkFile(file)
        } catch {
            return
        }
        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                jsonData = JSON.parse(event.target.result)

                if (!Array.isArray(jsonData)) {
                    throw new Error("The JSON data is not an array")
                }

                circuitResultData = processCircuit(jsonData, circuitIndex)
                updateSetResults(circuitResultData)
                applyHoverEffect(inputField)
                increaseButton.disabled = false
                decreaseButton.disabled = false
                resultsButton.disabled = false
                playButton.disabled = false

                visualPerformButton.disabled = true
                visualPerformButton.textContent = "Performed"
            } catch (error) {
                return
            }
        }
        reader.readAsText(file)
    }
})

const modalOverlay = document.getElementById("modal-overlay")
const modalCloseButton = document.getElementById("modal-close")

// Открыть модальное окно
resultsButton.addEventListener("click", () => {
    modalOverlay.style.display = "flex" // Показать модальное окно
    updateVisualTable(circuitResultData)
})

// Закрыть модальное окно
modalCloseButton.addEventListener("click", () => {
    modalOverlay.style.display = "none" // Скрыть модальное окно
})

// Закрыть модальное окно при клике на затемненный фон
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = "none" // Скрыть модальное окно
    }
})

performButton.addEventListener("click", async () => {
    const file = fileInput.files[0]
    if (file) {
        try {
            checkFile(file)
        } catch {
            return
        }
        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                jsonData = JSON.parse(event.target.result)

                if (!Array.isArray(jsonData)) {
                    throw new Error("The JSON data is not an array")
                }

                // stopButton.style.display = "inline-block"
                let { resultData, errorData } = await processAllCircuits(
                    jsonData
                )
                resultData = JSON.parse(resultData)
                processedData = resultData
                loadedSchemes = resultData

                currentSchemes = processedData.slice(0, 4)
                currentSchemeIndex = 4
                resultsSection.style.display = "block"
                updateTable()

                displayErrors(errorData)

                // stopButton.style.display = "none"
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

// stopButton.addEventListener("click", stopProcessing)

function fullReset() {
    circuitIndex = 0
    sliderPosition = 0
    circuitReset()
    leftArrowButton.style.display = "block"
    rightArrowButton.style.display = "block"
    visualizationSection.style.display = "none"
    resultsSection.style.display = "none"
    processedData = []
    currentSchemes = [] // Схемы, которые отображаются в таблице
    loadedSchemes = [] // Все загруженные схемы
    scrollLoading = false // Чтобы не запускать несколько загрузок одновременно
    currentSchemeIndex = 0
}

function circuitReset() {
    circuitData = jsonData[circuitIndex]
    numberOfInputs = circuitData.countInputs
    inputField.value = "0".repeat(numberOfInputs)
    inputSet = parseInt(inputField.value, 2)
    setResultsElement.classList.remove("error")
    removeHoverEffect(inputField)
    increaseButton.disabled = true
    decreaseButton.disabled = true
    resultsButton.disabled = true
    playButton.disabled = true
    visualPerformButton.disabled = false
    visualPerformButton.textContent = "Perform"
    setResultsElement.innerHTML = ""
    circuitResultData = null
}

function updateCircuitNumber() {
    circuitNumberElement.textContent = circuitNumber
}

function updateSliderPosition() {
    progressSliderElement.style.left = `${Math.min(
        100 - realSliderWidth,
        sliderPosition
    )}%`
    console.log(
        "circuitIndex:",
        circuitIndex,
        "circuitsCount:",
        circuitsCount,
        "sliderPosition:",
        sliderPosition
    )
    console.log("sliderWidth", sliderWidth)
}

function updateSetResults(resultData) {
    setResultsElement.innerHTML = ""
    try {
        setResultsElement.appendChild(
            createListItem("Depth:", resultData.depth)
        )
        setResultsElement.appendChild(
            createListItem("Delay:", resultData.setResults[inputSet].delay)
        )
        setResultsElement.appendChild(
            createListItem(
                "Sign Delay:",
                resultData.setResults[inputSet].signDelay
            )
        )
        const outputs = Object.keys(resultData.setResults[inputSet].outputValue)
        const output = outputs[0]
        setResultsElement.appendChild(
            createListItem(
                "Output Value:",
                resultData.setResults[inputSet].outputValue[output]
            )
        )
    } catch (error) {
        setResultsElement.classList.add("error")

        setResultsElement.innerHTML = `<li>Invalid circuit</li>`
        throw new Error(`${error.message}`)
    }

    function createListItem(label, value) {
        const li = document.createElement("li")
        li.innerHTML = `<span>${label}</span> ${value}`
        return li
    }
}

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

function updateVisualTable(circuitResultData) {
    tableBodyVisual.innerHTML = "" // Очищаем таблицу перед добавлением данных
    modalInfo.innerHTML = ""

    const numberInfo = document.createElement("p")
    numberInfo.textContent = `number: ${circuitResultData.number}`

    const depthInfo = document.createElement("p")
    depthInfo.textContent = `depth: ${circuitResultData.depth}`

    // Добавляем строки в modalInfo
    modalInfo.appendChild(numberInfo)
    modalInfo.appendChild(depthInfo)

    circuitResultData.setResults.forEach((result) => {
        const row = document.createElement("tr")
        const outputs = Object.keys(result.outputValue)
        const output = outputs[0]

        row.innerHTML = `
            <td style="padding-top: 10px">${result.inputSet}</td>
            <td style="padding-top: 10px">${result.outputValue[output]}</td>
            <td style="padding-top: 10px">${result.delay}</td>
            <td style="padding-top: 10px">${result.signDelay}</td>
        `

        tableBodyVisual.appendChild(row)
    })
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

// function stopProcessing() {
//     cancelProcessing = true
//     stopButton.style.display = "none"
//     showCustomAlert("Processing was canceled.")
// }
function applyHoverEffect(inputField) {
    // Убираем старые обработчики, чтобы избежать дублирования
    inputField.removeEventListener("mouseover", addHoverStyles)
    inputField.removeEventListener("mouseout", removeHoverStyles)

    // Добавляем новые обработчики событий
    inputField.addEventListener("mouseover", addHoverStyles)
    inputField.addEventListener("mouseout", removeHoverStyles)
}

function addHoverStyles() {
    inputField.style.border = "2px solid var(--color-white)"
    inputField.style.cursor = "pointer"
}

function removeHoverStyles() {
    inputField.style.border = ""
    inputField.style.cursor = ""
}

function removeHoverEffect(inputField) {
    // Убираем обработчики событий
    inputField.removeEventListener("mouseover", addHoverStyles)
    inputField.removeEventListener("mouseout", removeHoverStyles)

    // Убираем стили
    inputField.style.border = ""
    inputField.style.cursor = ""
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

function checkFile(file) {
    const fileType = file.type
    if (fileType !== "application/json") {
        showCustomAlert("The uploaded file must be a JSON file.")
        return error
    } else {
        return
    }
}
