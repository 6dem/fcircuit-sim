import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "../tests/mockData.js"

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