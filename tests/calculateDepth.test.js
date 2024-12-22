import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "../tests/mockData.js"

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

    test("calculate circuit depth", () => {
        circuit.findAllPaths()
        const depth = circuit.calculateDepth()
        expect(depth).toEqual(3)
    })
})
