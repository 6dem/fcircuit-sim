import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "../tests/mockData.js"

describe("Circuit class findAllRoots method", () => {
    let circuit

    beforeAll(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("find all roots in the circuit", () => {
        const roots = circuit.findAllRoots()
        expect(roots).toEqual([8, 9, 10])
    })
})
