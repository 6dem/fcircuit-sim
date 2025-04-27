import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import {
    invalidInputFE,
    invalidInputMIE,
    mockData,
    mockMIG,
} from "../tests/mock-data.js"

describe("Circuit class parseCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
    })

    test("parses a valid fcircuit format", () => {
        const circuitMap = new Map()
        mockData.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 1)

        expect(circuit.format).toBe("fcircuit")
        expect(circuit.number).toBe(1)
        expect(circuit.countInputs).toBe(3)
        expect(circuit.countFE).toBe(7)
        expect(circuit.outputNums).toEqual([9])
        expect(circuit.inputsNums).toEqual([1, 2, 3])
        expect(Object.keys(circuit.instancesFE)).toHaveLength(10)
        expect(circuit.instancesFE[4].mincode).toBe(1)
        expect(circuit.instancesFE[6].inputsFE).toEqual([1, 2, 3])
    })

    test("throws error for invalid circuit number", () => {
        const circuitMap = new Map()
        mockData.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        expect(() => circuit.parseCircuit(circuitMap, 2)).toThrow(
            "Invalid format or circuit number: 2"
        )
    })

    test("throws error for invalid format", () => {
        const invalidFormat = [{ format: "unknown", number: 1 }]
        const circuitMap = new Map()
        invalidFormat.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        expect(() => circuit.parseCircuit(circuitMap, 1)).toThrow(
            "Invalid format or circuit number: 1"
        )
    })

    test("throws error for invalid input FE", () => {
        const circuitMap = new Map()
        invalidInputFE.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        expect(() => circuit.parseCircuit(circuitMap, 1)).toThrow(
            "Invalid input index (12) of a functional element (9)"
        )
    })
})

describe("MIG class parseCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
    })

    test("parses a valid mig format", () => {
        const circuitMap = new Map()
        mockMIG.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 23839913)

        expect(circuit.format).toBe("mig")
        expect(circuit.number).toBe(23839913)
        expect(circuit.countInputs).toBe(5)
        expect(circuit.countFE).toBe(8)
        expect(circuit.outputInversion).toBe(1)
        expect(circuit.outputNums).toEqual([13])
        expect(circuit.inputsNums).toEqual([1, 2, 3, 4, 5])
        expect(Object.keys(circuit.instancesFE)).toHaveLength(14)
        expect(circuit.instancesFE[13].mincode).toBe(23)
        expect(circuit.instancesFE[6].inputsFE).toEqual([0, 2, 5])
        expect(circuit.instancesFE[11].inverses).toEqual([1, 0, 0])
    })

    test("throws error for invalid mig number", () => {
        const circuitMap = new Map()
        mockMIG.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        expect(() => circuit.parseCircuit(circuitMap, 1703)).toThrow(
            "Invalid format or circuit number: 1703"
        )
    })

    test("throws error for invalid format", () => {
        const invalidFormat = [{ format: "unknown", number: 1703 }]
        const circuitMap = new Map()
        invalidFormat.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        expect(() => circuit.parseCircuit(circuitMap, 1703)).toThrow(
            "Invalid format or circuit number: 1703"
        )
    })

    test("throws error for invalid input FE", () => {
        const circuitMap = new Map()
        invalidInputMIE.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        expect(() => circuit.parseCircuit(circuitMap, 23839913)).toThrow(
            "Invalid input index (15) of a functional element (11)"
        )
    })
})
