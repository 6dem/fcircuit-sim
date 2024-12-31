import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class calculateDepth method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("empty paths array", () => {
        expect(() => circuit.calculateDepth()).toThrow(
            "allPaths array is empty"
        )
    })

    test("calculate fcircuit depth", () => {
        circuit.findAllPaths()
        const depth = circuit.calculateDepth()
        expect(depth).toEqual(3)
    })
})

describe("MIG class calculateDepth method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
    })

    test("calculate MIG depth", () => {
        circuit.findAllPaths()
        const depth = circuit.calculateDepth()
        expect(depth).toEqual(4)
    })
})
