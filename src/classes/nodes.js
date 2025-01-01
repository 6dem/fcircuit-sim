import { generateCombinations } from "../utils/generate-combinations.js"

class Vertex {
    constructor(index, outputValue = null) {
        this.index = index
        this.outputValue = outputValue
    }
}

class InputElement extends Vertex {
    constructor(index) {
        super(index)
    }
}

class FunctionalElement extends Vertex {
    constructor(mincode, inputs, index) {
        super(index)
        this.mincode = mincode
        this.inputsFE = inputs
        this.numInputs = inputs.length
        this.state = "not computed" // "not computed" -> "uncertain"/"computed"
        this.delayFE = undefined
    }

    getInputValues(circuit) {
        const inputValues = []
        const nullIndices = []
        for (let i = 0; i < this.numInputs; i++) {
            let inputNum = this.inputsFE[i]
            let inputFE = circuit.instancesFE[inputNum]
            inputValues[i] = inputFE.outputValue

            if (inputFE.outputValue === null) {
                nullIndices.push(i)
            }
        }
        return [inputValues, nullIndices]
    }

    computeFunction(circuit, inputValues) {
        let nullIndices = []

        if (inputValues) {
            // Если передан массив inputValues, создаем nullIndices на основе этого массива
            nullIndices = inputValues
                .map((value, index) => (value === null ? index : -1))
                .filter((index) => index !== -1)
        } else {
            // Если передан только circuit, получаем входные данные через getInputValues
            ;[inputValues, nullIndices] = this.getInputValues(circuit)
        }

        // Создаем список всех возможных комбинаций для индексов null
        const combinations = generateCombinations(nullIndices.length)

        let results = new Set() // Множество для хранения уникальных результатов вычислений функции
        combinations.forEach((combination) => {
            // Подставляем значения из комбинации на место null
            nullIndices.forEach((index, i) => {
                inputValues[index] = combination[i]
            })

            // Переводим mincode в двоичное число и заполняем ведущими нулями
            const binaryMincode = this.mincode
                .toString(2)
                .padStart(2 ** this.numInputs, "0")

            // Находим индекс в двоичном представлении и переводим его в десятичное число
            const binaryIndex = parseInt(inputValues.join(""), 2)

            // Получаем значение из mincode по индексу
            const outputValue = parseInt(binaryMincode[binaryIndex], 2)

            results.add(outputValue)
        })

        // Если все результаты одинаковы(множество размера 1), возвращаем значение, иначе null
        return results.size === 1 ? [...results][0] : null
    }
}

// Экспорт
export { FunctionalElement, InputElement, Vertex }
