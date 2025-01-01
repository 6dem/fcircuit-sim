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

export { MajorityInvertElement, ZeroElement }
