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
        for (let i = 0; i < this.numInputs; i++) {
            let inputNum = this.inputsFE[i]
            let inputFE = circuit.instancesFE[inputNum]
            inputValues[i] = inputFE.outputValue

            tempValues[i] =
                inputFE.outputValue === null
                    ? inputFE.outputValue
                    : this.inverses[i] - inputFE.outputValue
        }

        // console.log(`${this.index} : ${inputValues}`)
        // console.log(`${this.index} : ${tempValues}`)

        const nullIndices = inputValues
            .filter((value, index) => value === null)
            .map((value, index) => index) // Получаем индексы null в inputValues

        //FIXME: Объединение проходов двух циклов по InputValues

        // Создаем список всех возможных комбинаций для индексов null
        const combinations = generateCombinations(nullIndices.length)

        let results = new Set() // Множество для хранения уникальных результатов вычислений функции
        combinations.forEach((combination) => {
            // Создаем копию inputValues, чтобы не изменять оригинальный массив
            // const tempValues = [...inputValues]

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

        // console.log(
        //     `Элемент: ${this.index} | Входы ${inputValues} | Результат: ${
        //         [...results][0]
        //     }`
        // )

        // Если все результаты одинаковы, возвращаем значение
        return results.size === 1 ? [...results][0] : null
    }
}

export { MajorityInvertElement, ZeroElement }
