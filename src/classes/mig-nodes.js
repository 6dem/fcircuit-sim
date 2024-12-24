import { generateCombinations } from "../utils/utils.js"
import { FunctionalElement, Vertex } from "./nodes.js"

class ZeroElement extends Vertex {
    constructor(index) {
        super(index)
        this.outputValue = 0
    }
}

class MajorityInvertElement extends FunctionalElement {
    constructor(inputs, index, inverses) {
        super(23, inputs, index)
        this.inverses = inverses
    }

    computeFunction(circuit) {
        let inputValues = new Array(this.numInputs).fill(null)
        const tempValues = []
        const nullIndices = []
        for (let i = 0; i < this.numInputs; i++) {
            let inputNum = this.inputsFE[i]
            let inputFE = circuit.instancesFE[inputNum]
            inputValues[i] = inputFE.outputValue

            if (inputFE.outputValue === null) {
                nullIndices.push(i)
            }

            tempValues[i] =
                inputFE.outputValue === null
                    ? inputFE.outputValue
                    : inputFE.outputValue ^ this.inverses[i] // ^ - XOR
        }

        // Создаем список всех возможных комбинаций для индексов null
        const combinations = generateCombinations(nullIndices.length)

        let results = new Set() // Множество для хранения уникальных результатов вычислений функции
        combinations.forEach((combination) => {
            // Подставляем значения из комбинации на место null
            nullIndices.forEach((index, i) => {
                tempValues[index] = combination[i]
            })

            // Переводим mincode в двоичное число и заполняем ведущими нулями
            const binaryMincode = this.mincode
                .toString(2)
                .padStart(2 ** this.numInputs, "0")

            // Находим индекс в двоичном представлении и переводим его в десятичное число
            const binaryIndex = parseInt(tempValues.join(""), 2)

            // Получаем значение из mincode по индексу
            const outputValue = parseInt(binaryMincode[binaryIndex], 10)

            results.add(outputValue)
        })

        // Если все результаты одинаковы(множество размера 1), возвращаем значение
        return results.size === 1 ? [...results][0] : null
    }
}

export { MajorityInvertElement, ZeroElement }
