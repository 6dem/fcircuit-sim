import { generateCombinations } from "../utils/utils.js"
import { Circuit } from "./circuit.js"
import { MajorityInvertElement, ZeroElement } from "./mig-nodes.js"
import { InputElement } from "./nodes.js"

class MIG extends Circuit {
    constructor() {
        super()
        this.outputInversion
    }

    parseCircuit(jsonData, circuitNumber) {
        // Проверка, существует ли схема с таким номером
        const circuit = jsonData.find(
            (circuit) => circuit.number === circuitNumber
        )

        if (!circuit || circuit.format !== "mig") {
            throw new Error(
                `Invalid format or circuit number: ${circuitNumber}`
            )
        }

        this.format = circuit.format
        this.number = circuit.number
        this.countInputs = circuit.countInputs
        this.countFE = circuit.countFE
        this.outputsNums = circuit.output
        this.outputInversion = circuit.inversion

        this.instancesFE[0] = new ZeroElement(0)

        for (let i = 1; i < this.countInputs + 1; i++) {
            this.inputsNums.push(i)
            this.instancesFE[i] = new InputElement(i)
        }

        for (let i = 0; i < circuit.countFE; i++) {
            let fe = circuit.instancesFE[i]
            this.instancesFE[fe.id] = new MajorityInvertElement(
                fe.inputsFE,
                fe.id,
                fe.inverses
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
            .slice(1, this.countInputs + 1) // Берем ключи входов схемы (от (пропускаем ZeroElement)1 до countInputs)
            .forEach((key, index) => {
                const inputElement = this.instancesFE[key]
                inputElement.outputValue = initialSet[index]
            })

        return initialSet
    }
}

export { MIG }
