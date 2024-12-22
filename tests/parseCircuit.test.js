import { Circuit } from "../src/classes/circuit.js"
import { invalidInputFE, mockData } from "../tests/mockData.js"

describe("Circuit class parseCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
    })

    test("parses a valid fcircuit format", () => {
        circuit.parseCircuit(mockData, 1)

        expect(circuit.format).toBe("fcircuit")
        expect(circuit.number).toBe(1)
        expect(circuit.countInputs).toBe(3)
        expect(circuit.countFE).toBe(7)
        expect(circuit.outputsNums).toEqual([9])
        expect(circuit.inputsNums).toEqual([1, 2, 3])
        expect(Object.keys(circuit.instancesFE)).toHaveLength(10)
        expect(circuit.instancesFE[4].mincode).toBe(1)
        expect(circuit.instancesFE[6].inputsFE).toEqual([1, 2, 3])
    })

    test("throws error for invalid circuit number", () => {
        expect(() => circuit.parseCircuit(mockData, 2)).toThrow(
            "Invalid format or circuit number: 2"
        )
    })

    test("throws error for invalid format", () => {
        const invalidFormat = [{ format: "unknown", number: 1 }]
        expect(() => circuit.parseCircuit(invalidFormat, 1)).toThrow(
            "Invalid format or circuit number: 1"
        )
    })

    test("throws error for invalid input FE", () => {
        expect(() => circuit.parseCircuit(invalidInputFE, 1)).toThrow(
            "Invalid functional element: 12"
        )
    })
})
