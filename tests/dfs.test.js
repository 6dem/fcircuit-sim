import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "../tests/mock-data.js"

describe("Circuit class DFS method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("find all paths in the 0 part of fcircuit", () => {
        const roots = circuit.findAllRoots()
        circuit.dfs(circuit.instancesFE[roots[0]])
        expect(circuit.allPaths).toEqual([
            [8, 5, 2],
            [8, 6, 1],
            [8, 6, 2],
            [8, 6, 3],
        ])
    })

    test("find all paths in the 1 part of fcircuit", () => {
        const roots = circuit.findAllRoots()
        circuit.dfs(circuit.instancesFE[roots[1]])
        expect(circuit.allPaths).toEqual([
            [9, 7, 4, 1],
            [9, 7, 4, 2],
            [9, 7, 5, 2],
            [9, 2],
        ])
    })

    test("find all paths in the 2 part of fcircuit", () => {
        const roots = circuit.findAllRoots()
        circuit.dfs(circuit.instancesFE[roots[2]])
        expect(circuit.allPaths).toEqual([
            [10, 3],
            [10, 2],
        ])
    })
})

describe("MIG class DFS method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
    })

    test("find all paths in the MIG", () => {
        const roots = circuit.findAllRoots()
        circuit.dfs(circuit.instancesFE[roots[0]])
        expect(circuit.allPaths).toEqual([
            [13, 9, 0],
            [13, 9, 2],
            [13, 9, 11, 5],
            [13, 9, 11, 4],
            [13, 9, 11, 3],
            [13, 10, 5],
            [13, 10, 7, 1],
            [13, 10, 7, 11, 5],
            [13, 10, 7, 11, 4],
            [13, 10, 7, 11, 3],
            [13, 10, 7, 0],
            [13, 10, 8, 3],
            [13, 10, 8, 6, 0],
            [13, 10, 8, 6, 2],
            [13, 10, 8, 6, 5],
            [13, 10, 8, 1],
            [13, 12, 1],
            [13, 12, 6, 0],
            [13, 12, 6, 2],
            [13, 12, 6, 5],
            [13, 12, 4],
        ])
    })
})
