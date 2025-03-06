import { Circuit } from "./circuit.js"

class IG extends Circuit {
    constructor() {
        super()
        this.outputInversion
    }

    validateCircuit(circuit, circuitNumber) {
        throw new Error("Method validateCircuit must be implemented.")
    }

    parseCircuit(jsonData, circuitNumber) {
        const circuit = super.parseCircuit(jsonData, circuitNumber)

        this.outputNums = circuit.output
        this.outputInversion = circuit.inversion
    }

    creatingElements(circuit) {
        throw new Error("Method creatingElements must be implemented.")
    }

    calculateOutput() {
        const outputIndex = this.outputNums[0]
        if (this.instancesFE[outputIndex].outputValue == null) {
            throw new Error("output value has not been calculated yet")
        }
        this.outputValues[outputIndex] =
            this.instancesFE[outputIndex].outputValue ^ this.outputInversion

        return this.outputValues
    }
}

export { IG }
