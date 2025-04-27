import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class initializeCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        const circuitMap = new Map()
        mockData.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 1)
    })

    test("invalid set number", () => {
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

describe("MIG class initializeCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        const circuitMap = new Map()
        mockMIG.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 23839913)
    })

    test("invalid set number", () => {
        expect(() => circuit.initializeCircuit(-1)).toThrow(
            "set number must be in range 0..31"
        )
        expect(() => circuit.initializeCircuit(32)).toThrow(
            "set number must be in range 0..31"
        )
        expect(() => circuit.initializeCircuit("NaN")).toThrow(
            "set number must be in range 0..31"
        )
        expect(() => circuit.initializeCircuit(NaN)).toThrow(
            "set number must be in range 0..31"
        )
    })

    test("initialize full 0s set", () => {
        circuit.initializeCircuit()
        for (let i = 1; i < circuit.countInputs + 1; i++) {
            expect(circuit.instancesFE[i].outputValue).toEqual(0)
        }
    })

    test("initialize full 1s set", () => {
        circuit.initializeCircuit(31)
        for (let i = 1; i < circuit.countInputs + 1; i++) {
            expect(circuit.instancesFE[i].outputValue).toEqual(1)
        }
    })
})
