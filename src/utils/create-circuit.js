import { AIG } from "../classes/aig.js"
import { Circuit } from "../classes/circuit.js"
import { MIG } from "../classes/mig.js"

export function createCircuit(format) {
    switch (format) {
        case "fcircuit":
            return new Circuit()
        case "mig":
            return new MIG()
        case "aig":
            return new AIG()
        default:
            throw new Error(`Unknown format: ${format}`)
    }
}
