import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "./mock-data.js"

describe("Circuit class initializeCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("invalid set namber", () => {
        expect(() => circuit.initializeCircuit(-1)).toThrow(
            "set number must be in range 0..7"
        )
        expect(() => circuit.initializeCircuit(12)).toThrow(
            "set number must be in range 0..7"
        )
        expect(() => circuit.initializeCircuit("NaN")).toThrow(
            "set number must be in range 0..7"
        )
        expect(() => circuit.initializeCircuit(NaN)).toThrow(
            "set number must be in range 0..7"
        )
    })

    test("initialize full 0s set", () => {
        circuit.initializeCircuit()
        for (let i = 1; i < circuit.countInputs + 1; i++) {
            expect(circuit.instancesFE[i].outputValue).toEqual(0)
        }
    })

    test("initialize full 1s set", () => {
        circuit.initializeCircuit(7)
        for (let i = 1; i < circuit.countInputs + 1; i++) {
            expect(circuit.instancesFE[i].outputValue).toEqual(1)
        }
    })
})
