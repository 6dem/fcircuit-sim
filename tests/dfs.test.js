import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "../tests/mock-data.js"

describe("Circuit class DFS method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("find all paths in the 0 part of circuit", () => {
        const roots = circuit.findAllRoots()
        circuit.dfs(circuit.instancesFE[roots[0]])
        expect(circuit.allPaths).toEqual([
            [8, 5, 2],
            [8, 6, 1],
            [8, 6, 2],
            [8, 6, 3],
        ])
    })

    test("find all paths in the 1 part of circuit", () => {
        const roots = circuit.findAllRoots()
        circuit.dfs(circuit.instancesFE[roots[1]])
        expect(circuit.allPaths).toEqual([
            [9, 7, 4, 1],
            [9, 7, 4, 2],
            [9, 7, 5, 2],
            [9, 2],
        ])
    })

    test("find all paths in the 2 part of circuit", () => {
        const roots = circuit.findAllRoots()
        circuit.dfs(circuit.instancesFE[roots[2]])
        expect(circuit.allPaths).toEqual([
            [10, 3],
            [10, 2],
        ])
    })
})
