import { AndInvertElement } from "./aig-nodes.js"
import { IG } from "./ig.js"
import { InputElement } from "./nodes.js"

class AIG extends IG {
    constructor() {
        super()
        this.outputInversion
    }

    validateCircuit(circuit, circuitNumber) {
        if (!circuit || circuit.format !== "aig") {
            throw new Error(
                `Invalid format or circuit number: ${circuitNumber}`
            )
        }
    }

    creatingElements(circuit) {
        for (let i = 1; i < this.countInputs + 1; i++) {
            this.inputsNums.push(i)
            this.instancesFE[i] = new InputElement(i)
        }

        for (let i = 0; i < circuit.countFE; i++) {
            let fe = circuit.instancesFE[i]
            this.instancesFE[fe.id] = new AndInvertElement(
                fe.inputsFE,
                fe.id,
                fe.inverses
            )
        }
    }
}

export { AIG }
