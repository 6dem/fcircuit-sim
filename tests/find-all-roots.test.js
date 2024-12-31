import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class findAllRoots method", () => {
    let circuit

    beforeAll(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("find all roots in the fcircuit", () => {
        const roots = circuit.findAllRoots()
        expect(roots).toEqual([8, 9, 10])
    })
})

describe("MIG class findAllRoots method", () => {
    let circuit

    beforeAll(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
    })

    test("find all roots in the MIG", () => {
        const roots = circuit.findAllRoots()
        expect(roots).toEqual([13])
    })
})
