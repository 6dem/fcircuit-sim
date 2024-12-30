import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "./mock-data.js"

describe("Circuit class findAllPaths method", () => {
    let circuit

    beforeAll(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("find all paths in the circuit", () => {
        circuit.findAllPaths()
        expect(circuit.allPaths).toEqual([
            [8, 5, 2],
            [8, 6, 1],
            [8, 6, 2],
            [8, 6, 3],
            [9, 7, 4, 1],
            [9, 7, 4, 2],
            [9, 7, 5, 2],
            [9, 2],
            [10, 3],
            [10, 2],
        ])
    })
})
