import { generateCombinations } from "../utils/generate-combinations.js"
import { FunctionalElement, InputElement } from "./nodes.js"

class Circuit {
    constructor() {
        this.number = undefined
        this.format = undefined
        this.countInputs = 0
        this.countFE = 0
        this.instancesFE = {}
        this.outputNums = []
        this.inputsNums = []
        this.outputValues = {}
        this.depth = undefined
        this.delay = undefined
        this.signDelay = undefined

        this.allPaths = []
        this.depthsDict = {}
        this.xDepthsDict = {}
    }

    validateCircuit(circuit, circuitNumber) {
        if (!circuit || circuit.format !== "fcircuit") {
            throw new Error(
                `Invalid format or circuit number: ${circuitNumber}`
            )
        }
    }

    parseCircuit(jsonData, circuitNumber) {
        const circuit = jsonData.find(
            (circuit) => circuit.number === circuitNumber
        )

        this.validateCircuit(circuit, circuitNumber)

        this.format = circuit.format
        this.number = circuit.number
        this.countInputs = circuit.countInputs
        this.countFE = circuit.countFE
        this.outputNums = circuit.outputNums

        this.creatingElements(circuit)

        for (const instanceKey of Object.keys(this.instancesFE)) {
            const element = this.instancesFE[instanceKey]
            let invalidIndex
            if (element.index <= this.countInputs) {
                continue
            }
            let isValid = true

            // Проверяем каждый вход элемента
            for (const inputIndex of element.inputsFE) {
                if (
                    !(inputIndex in this.instancesFE) ||
                    inputIndex === element.index
                ) {
                    invalidIndex = inputIndex
                    isValid = false // Если входа нет в `instancesFE`, элемент некорректен
                    break
                }
            }

            if (!isValid) {
                throw new Error(
                    `Invalid input index (${invalidIndex}) of a functional element (${element.index})`
                )
            }
        }
        return circuit
    }

    creatingElements(circuit) {
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

        // Инициализируем массив для накопления путей
        let paths = []

        // Если элемент является входом, сохраняем копию текущего пути
        if (startFE.index <= this.countInputs) {
            paths.push([...path])
        } else {
            // Иначе рекурсивно обходим все входящие элементы
            for (const inputIndex of startFE.inputsFE) {
                const inputFE = this.instancesFE[inputIndex]
                if (!visited.has(inputFE.index)) {
                    // Рекурсивный вызов возвращает массив путей, который мы объединяем
                    paths = paths.concat(this.dfs(inputFE, visited, path))
                }
            }
        }

        // Откатываем изменения: удаляем текущий узел из пути и множества посещенных
        path.pop()
        visited.delete(startFE.index)

        return paths
    }

    findAllPaths() {
        const roots = this.findAllRoots()
        let allPaths = []

        // Обходим все корневые элементы и объединяем пути
        for (const rootIndex of roots) {
            const rootFE = this.instancesFE[rootIndex]
            allPaths = allPaths.concat(this.dfs(rootFE))
        }
        return allPaths
    }

    calculateDepth(allPaths) {
        if (allPaths.length === 0) {
            throw new Error(`allPaths array is empty`)
        } else {
            const maxDepth =
                Math.max(...allPaths.map((path) => path.length)) - 1
            return maxDepth
        }
    }

    buildDepthsDict(allPaths) {
        const depthsDict = {}

        if (allPaths.length === 0) {
            throw new Error(`allPaths array is empty`)
        }

        for (const path of allPaths) {
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

        return depthsDict
    }

    buildXDepthsDict(allPaths) {
        const xDepthsDict = {}

        if (allPaths.length === 0) {
            throw new Error(`allPaths array is empty`)
        }

        for (const path of allPaths) {
            for (let i = 0; i < path.length; i++) {
                const depth = path.length - 1 - i // Глубина элемента (обратный индекс)
                const feIndex = path[i]

                if (!xDepthsDict[depth]) {
                    xDepthsDict[depth] = new Set() // Создаем множество для глубины, если его еще нет
                }

                xDepthsDict[depth].add(feIndex) // Добавляем элемент в множество глубины
            }
        }

        return xDepthsDict
    }

    initializeCircuit(setNumber = 0) {
        return this._initializeCircuitInternal(setNumber, 0)
    }

    _initializeCircuitInternal(setNumber, sliceStart) {
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
            .slice(sliceStart, this.countInputs + 1)
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

    calculateOutput() {
        const outputElements = Object.values(this.instancesFE).filter(
            (element) => this.outputNums.includes(element.index)
        )

        outputElements.forEach((fe) => {
            const feIndex = fe.index
            if (this.instancesFE[feIndex].outputValue == null) {
                throw new Error("output value has not been calculated yet")
            }
            this.outputValues[feIndex] = this.instancesFE[feIndex].outputValue
        })

        return this.outputValues
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
                    if (this.outputNums.includes(+fe)) {
                        circuitDelays.push(+delay)
                    }
                }
            }
        }

        const circuitDelay = Math.max(...circuitDelays)
        this.delay = circuitDelay
        return circuitDelay
    }

    searchSignChains(allPaths) {
        const checkDuplicate = (
            dupInpElements,
            feIndex,
            dict,
            key,
            fePos,
            inputIndex
        ) => {
            if (!dupInpElements.has(feIndex)) {
                return false
            }
            const array = dict[key]

            return array.some(
                (innerArray) =>
                    innerArray.length > fePos &&
                    innerArray[fePos] === inputIndex
            )
        }

        if (allPaths.length === 0) {
            throw new Error(`method searchSignChains: allPaths array is empty`)
        }

        const processedPaths = {}
        const signChains = []
        const fullStrPaths = {}
        const dupInpElements = new Set()
        allPaths.forEach((path) => {
            if (!this.outputNums.includes(path[0])) {
                return
            }
            const strPath = path.join("-")
            const forwardStrPath = [...path].reverse().join("-")
            let relevantArr
            if (strPath in processedPaths) {
                relevantArr = processedPaths[strPath].length
                processedPaths[strPath].push([])
            } else {
                relevantArr = 0
                processedPaths[strPath] = [[]]
            }
            let significant = false
            const fullPath = []
            for (const feIndex of path) {
                if (feIndex <= this.countInputs) continue

                const fePos = path.indexOf(feIndex)
                let oldInputValues = []
                let newInputValues = []
                const fe = this.instancesFE[feIndex]
                if (new Set(fe.inputsFE).size !== fe.inputsFE.length) {
                    dupInpElements.add(feIndex)
                }
                oldInputValues = fe.getInputValues(this)[0]
                newInputValues = [...oldInputValues]

                for (
                    let inputNumber = 0;
                    inputNumber < fe.inputsFE.length;
                    inputNumber++
                ) {
                    if (
                        path[fePos + 1] === fe.inputsFE[inputNumber] &&
                        !checkDuplicate(
                            dupInpElements,
                            feIndex,
                            processedPaths,
                            strPath,
                            fePos,
                            +inputNumber
                        )
                    ) {
                        fullPath.push(
                            `${fe.inputsFE[inputNumber]}-${inputNumber}-${fe.index}`
                        )

                        processedPaths[strPath][relevantArr].push(+inputNumber)
                        newInputValues[inputNumber] =
                            1 - oldInputValues[inputNumber]
                        const originalOutput = fe.outputValue
                        const newOutput = fe.computeFunction(
                            null,
                            newInputValues
                        )
                        if (originalOutput !== newOutput) {
                            significant = true
                        } else {
                            significant = false
                            return
                        }
                        break
                    }
                }
            }
            if (significant) {
                if (!fullStrPaths[forwardStrPath]) {
                    fullStrPaths[forwardStrPath] = []
                }
                fullStrPaths[forwardStrPath].push(fullPath.reverse().join("_"))

                signChains.push(path)
            }
        })
        return [signChains, fullStrPaths]
    }

    calculateSignDelay(signChains) {
        if (signChains.length === 0) {
            return 0
        }
        const signDelay = this.calculateDepth(signChains)
        return signDelay
    }
}

export { Circuit }
