import { AIG, Circuit, MIG } from "fcircuit-core"

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
