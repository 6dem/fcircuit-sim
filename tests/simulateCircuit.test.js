import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "../tests/mockData.js"

describe("Circuit class simulateCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
        circuit.findAllPaths()
    })

    test("empty depths dict", () => {
        expect(() => circuit.simulateCircuit(circuit.depthsDict)).toThrow(
            "depths dict is empty"
        )
        expect(() => circuit.simulateCircuit(circuit.xDepthsDict)).toThrow(
            "depths dict is empty"
        )
    })

    test("simulate on depths dict", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(2)
        expect(circuit.simulateCircuit(circuit.xDepthsDict)).toEqual({
            1: {
                4: { state: "computed", outputValue: 0 },
                5: { state: "computed", outputValue: 0 },
                6: { state: "computed", outputValue: 0 },
                9: { state: "computed", outputValue: 1 },
                10: { state: "computed", outputValue: 1 },
            },
            2: {
                7: { state: "computed", outputValue: 0 },
                8: { state: "computed", outputValue: 0 },
            },
            3: { 9: { state: "computed", outputValue: 1 } },
        })
    })

    test("simulate on extended depths dict", () => {
        circuit.buildDepthsDict()
        circuit.initializeCircuit(2)
        expect(circuit.simulateCircuit(circuit.depthsDict)).toEqual({
            1: {
                4: { state: "computed", outputValue: 0 },
                5: { state: "computed", outputValue: 0 },
                6: { state: "computed", outputValue: 0 },
                10: { state: "computed", outputValue: 1 },
            },
            2: {
                7: { state: "computed", outputValue: 0 },
                8: { state: "computed", outputValue: 0 },
            },
            3: { 9: { state: "computed", outputValue: 1 } },
        })
    })
})
