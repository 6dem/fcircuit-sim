import { FunctionalElement, Vertex } from "./nodes.js"

class ZeroElement extends Vertex {
    constructor(index) {
        super(index)
        this.outputValue = 0
    }
}

class InvertElement extends FunctionalElement {
    constructor(mincode, inputs, index, inverses) {
        super(mincode, inputs, index)
        this.inverses = inverses
    }

    getInputValues(circuit) {
        const inputValues = []
        const nullIndices = []
        for (let i = 0; i < this.numInputs; i++) {
            let inputNum = this.inputsFE[i]
            let inputFE = circuit.instancesFE[inputNum]
            inputValues[i] =
                inputFE.outputValue === null
                    ? inputFE.outputValue
                    : inputFE.outputValue ^ this.inverses[i]

            if (inputFE.outputValue === null) {
                nullIndices.push(i)
            }
        }
        return [inputValues, nullIndices]
    }
}

export { InvertElement, ZeroElement }
