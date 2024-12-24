import { generateCombinations } from "../utils/utils.js"
import { FunctionalElement, InputElement } from "./nodes.js"

class Circuit {
    constructor() {
        this.number = undefined
        this.format = undefined
        this.countInputs = 0
        this.countFE = 0
        this.instancesFE = {}
        this.outputsNums = []
        this.inputsNums = []
        this.delay = undefined

        this.allPaths = []
        this.depthsDict = {}
        this.xDepthsDict = {}
    }

    parseCircuit(jsonData, circuitNumber) {
        // Проверка, существует ли схема с таким номером
        const circuit = jsonData.find(
            (circuit) => circuit.number === circuitNumber
        )

        if (!circuit || circuit.format !== "fcircuit") {
            throw new Error(
                `Invalid format or circuit number: ${circuitNumber}`
            )
        }

        this.format = circuit.format
        this.number = circuit.number
        this.countInputs = circuit.countInputs
        this.countFE = circuit.countFE
        this.outputsNums = circuit.outputsNums

        for (let i = 1; i < this.countInputs + 1; i++) {
            this.inputsNums.push(i)
            this.instancesFE[i] = new InputElement(i)
        }

        for (let i = 0; i < circuit.countFE; i++) {
            let fe = circuit.instancesFE[i]
            this.instancesFE[fe.id] = new FunctionalElement(
                fe.mincode,
                fe.inputsFE,
                fe.id
            )
        }
        for (const instanceKey of Object.keys(this.instancesFE)) {
            const element = this.instancesFE[instanceKey]
            let invalidIndex
            if (element.index <= this.countInputs) {
                continue
            }
            let isValid = true

            // Проверяем каждый вход элемента
            for (const inputIndex of element.inputsFE) {
                if (!(inputIndex in this.instancesFE)) {
                    invalidIndex = inputIndex
                    isValid = false // Если входа нет в `instancesFE`, элемент некорректен
                    break
                }
            }

            if (!isValid) {
                throw new Error(`Invalid functional element: ${invalidIndex}`)
            }
        }
    }

    findAllRoots() {
        // Создаем множество всех вершин
        const allNodes = new Set(Object.keys(this.instancesFE).map(Number))

        // Удаляем из множества все вершины, которые являются входами
        for (const instance of Object.values(this.instancesFE)) {
            if (instance.index <= this.countInputs) {
                allNodes.delete(instance.index)
            } else {
                for (const inputIndex of instance.inputsFE) {
                    allNodes.delete(inputIndex)
                }
            }
        }
        // Оставшиеся вершины - это корни поддеревьев
        return Array.from(allNodes)
    }

    dfs(startFE, visited = new Set(), path = []) {
        // Добавляем текущий элемент в посещенные и в путь
        visited.add(startFE.index)
        path.push(startFE.index)

        // Если элемент является входом, добавляем текущий путь в список всех путей
        if (startFE.index <= this.countInputs) {
            this.allPaths.push([...path]) // Создаем копию пути
        } else {
            // Обходим все входные элементы
            for (const inputIndex of startFE.inputsFE) {
                const inputFE = this.instancesFE[inputIndex]
                if (!visited.has(inputFE.index)) {
                    this.dfs(inputFE, visited, path)
                }
            }
        }
        path.pop()
        visited.delete(startFE.index)
    }

    findAllPaths() {
        const roots = this.findAllRoots()
        const visited = new Set()

        for (const rootIndex of roots) {
            const rootFE = this.instancesFE[rootIndex]
            if (!visited.has(rootFE.index)) {
                this.dfs(rootFE, visited)
            }
        }
    }

    calculateDepth() {
        if (this.allPaths.length === 0) {
            throw new Error(`allPaths array is empty`)
        } else {
            const maxDepth =
                Math.max(...this.allPaths.map((path) => path.length)) - 1
            return maxDepth
        }
    }

    buildDepthsDict() {
        const depthsDict = {}

        if (this.allPaths.length === 0) {
            throw new Error(`allPaths array is empty`)
        }

        for (const path of this.allPaths) {
            for (let i = 0; i < path.length; i++) {
                const depth = path.length - 1 - i // Глубина элемента (обратный индекс)
                const feIndex = path[i]

                // Проверим, есть ли элемент уже на большей глубине
                let alreadyAdded = false
                for (const existingDepth in depthsDict) {
                    if (
                        existingDepth > depth &&
                        depthsDict[existingDepth].has(feIndex)
                    ) {
                        alreadyAdded = true
                        break
                    }
                }

                if (alreadyAdded) {
                    continue // Пропускаем добавление элемента на меньшую глубину
                }

                // Удаляем элемент из меньших глубин
                for (const existingDepth in depthsDict) {
                    if (
                        existingDepth < depth &&
                        depthsDict[existingDepth].has(feIndex)
                    ) {
                        depthsDict[existingDepth].delete(feIndex)
                    }
                }

                // Добавляем элемент на текущую глубину
                if (!depthsDict[depth]) {
                    depthsDict[depth] = new Set()
                }
                depthsDict[depth].add(feIndex)
            }
        }

        this.depthsDict = depthsDict
        return depthsDict
    }

    buildXDepthsDict() {
        const xDepthsDict = {}

        if (this.allPaths.length === 0) {
            throw new Error(`allPaths array is empty`)
        }

        for (const path of this.allPaths) {
            for (let i = 0; i < path.length; i++) {
                const depth = path.length - 1 - i // Глубина элемента (обратный индекс)
                const feIndex = path[i]

                if (!xDepthsDict[depth]) {
                    xDepthsDict[depth] = new Set() // Создаем множество для глубины, если его еще нет
                }

                xDepthsDict[depth].add(feIndex) // Добавляем элемент в множество глубины
            }
        }

        this.xDepthsDict = xDepthsDict
        return xDepthsDict
    }

    initializeCircuit(setNumber = 0) {
        if (
            setNumber < 0 ||
            setNumber > 2 ** this.countInputs - 1 ||
            isNaN(setNumber)
        ) {
            throw new Error(
                `set number must be in range 0..${2 ** this.countInputs - 1}`
            )
        }
        const combinations = generateCombinations(this.countInputs)
        let initialSet = combinations[setNumber]
        Object.keys(this.instancesFE)
            .slice(0, this.countInputs + 1) // Берем ключи входов схемы (от 0 до countInputs)
            .forEach((key, index) => {
                const inputElement = this.instancesFE[key]
                inputElement.outputValue = initialSet[index]
            })

        return initialSet
    }

    simulateCircuit(depthsDict) {
        const stateHistory = {} // Словарь, в котором храним состояния элементов на каждом шаге

        if (Object.keys(depthsDict).length === 0) {
            throw new Error("depths dict is empty")
        }

        // Перебираем все глубины в словаре depthsDict
        for (const depth in depthsDict) {
            if (depth === "0") continue // Пропускаем глубину 0, т.к. это входные элементы

            const feAtDepth = depthsDict[depth]
            const currentStates = {} // Состояния текущей глубины
            const temporaryResults = {} // Временные результаты вычислений

            // Для каждого функционального элемента на текущей глубине
            feAtDepth.forEach((feIndex) => {
                const fe = this.instancesFE[feIndex]

                // Проверяем, если элемент еще не вычислен
                if (fe.state !== "computed") {
                    const result = fe.computeFunction(this)

                    // Сохраняем результат во временное хранилище
                    temporaryResults[feIndex] = result

                    // Определяем состояние элемента на текущем шаге
                    currentStates[fe.index] = {
                        state: result === null ? "uncertain" : "computed",
                        outputValue: result,
                    }
                } else {
                    // Если элемент уже вычислен, записываем его текущее состояние
                    currentStates[fe.index] = {
                        state: fe.state,
                        outputValue: fe.outputValue,
                    }
                }
            })

            // Применяем временные результаты после обработки всей глубины
            for (const [feIndex, result] of Object.entries(temporaryResults)) {
                const fe = this.instancesFE[feIndex]

                if (result !== null) {
                    fe.state = "computed"
                    fe.outputValue = result
                } else {
                    fe.state = "uncertain"
                }
            }

            // Добавляем состояние на текущем шаге (глубине) в историю
            stateHistory[depth] = currentStates
        }

        // Возвращаем словарь состояний для каждой глубины
        return stateHistory
    }

    calculateDelay(stateHistory) {
        if (Object.keys(stateHistory).length === 0) {
            throw new Error("states dict is empty")
        }
        let circuitDelays = []
        const computedFE = new Set()
        for (const delay of Object.keys(stateHistory)) {
            for (const fe of Object.keys(stateHistory[delay])) {
                if (
                    stateHistory[delay][fe].state === "computed" &&
                    !computedFE.has(fe)
                ) {
                    this.instancesFE[fe].delayFE = delay
                    computedFE.add(fe)
                    if (this.outputsNums.includes(+fe)) {
                        circuitDelays.push(+delay)
                    }
                }
            }
        }
        const circuitDelay = Math.max(...circuitDelays)
        this.delay = circuitDelay
        return circuitDelay
    }
}

// Экспорт
export { Circuit }
