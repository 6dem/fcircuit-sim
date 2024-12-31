import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class buildXDepthsDict method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("empty paths array", () => {
        expect(() => circuit.buildXDepthsDict()).toThrow(
            "allPaths array is empty"
        )
    })

    test("build extended depths dict", () => {
        circuit.findAllPaths()
        const depth = circuit.buildXDepthsDict()
        expect(depth).toEqual({
            0: new Set([2, 1, 3]),
            1: new Set([5, 6, 4, 9, 10]),
            2: new Set([8, 7]),
            3: new Set([9]),
        })
    })
})

describe("MIG class buildXDepthsDict method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
    })

    test("empty paths array", () => {
        expect(() => circuit.buildXDepthsDict()).toThrow(
            "allPaths array is empty"
        )
    })

    test("build extended depths dict", () => {
        circuit.findAllPaths()
        const depth = circuit.buildXDepthsDict()
        expect(depth).toEqual({
            0: new Set([0, 2, 5, 4, 3, 1]),
            1: new Set([9, 11, 10, 7, 8, 6, 12]),
            2: new Set([13, 9, 10, 7, 8, 12]),
            3: new Set([13, 10]),
            4: new Set([13]),
        })
    })
})
