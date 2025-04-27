import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class calculateDepth method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        const circuitMap = new Map()
        mockData.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 1)
    })

    test("empty paths array", () => {
        expect(() => circuit.calculateDepth([])).toThrow(
            "allPaths array is empty"
        )
    })

    test("calculate fcircuit depth", () => {
        const allPaths = circuit.findAllPaths()
        const depth = circuit.calculateDepth(allPaths)
        expect(depth).toEqual(3)
    })
})

describe("MIG class calculateDepth method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        const circuitMap = new Map()
        mockMIG.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 23839913)
    })

    test("calculate MIG depth", () => {
        const allPaths = circuit.findAllPaths()
        const depth = circuit.calculateDepth(allPaths)
        expect(depth).toEqual(4)
    })
})
