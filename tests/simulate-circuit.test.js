import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "../tests/mock-data.js"

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

    test("simulate on extended depths dict", () => {
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

    test("simulate on depths dict", () => {
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

describe("MIG class simulateCircuit method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
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

    test("simulate mig on extended depths dict (5th set)", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(5)
        expect(circuit.simulateCircuit(circuit.xDepthsDict)).toEqual({
            1: {
                6: { state: "computed", outputValue: 0 },
                7: { state: "uncertain", outputValue: null },
                8: { state: "computed", outputValue: 1 },
                9: { state: "computed", outputValue: 0 },
                10: { state: "uncertain", outputValue: null },
                11: { state: "computed", outputValue: 0 },
                12: { state: "computed", outputValue: 0 },
            },
            2: {
                7: { state: "computed", outputValue: 1 },
                8: { state: "computed", outputValue: 1 },
                9: { state: "computed", outputValue: 0 },
                10: { state: "uncertain", outputValue: null },
                12: { state: "computed", outputValue: 0 },
                13: { state: "uncertain", outputValue: null },
            },
            3: {
                10: { state: "computed", outputValue: 1 },
                13: { state: "uncertain", outputValue: null },
            },
            4: { 13: { state: "computed", outputValue: 1 } },
        })
    })

    test("simulate  mig on depths dict (2nd set)", () => {
        circuit.buildDepthsDict()
        circuit.initializeCircuit(2)
        expect(circuit.simulateCircuit(circuit.depthsDict)).toEqual({
            1: {
                6: { state: "computed", outputValue: 0 },
                11: { state: "computed", outputValue: 1 },
            },
            2: {
                7: { state: "computed", outputValue: 0 },
                8: { state: "computed", outputValue: 1 },
                9: { state: "computed", outputValue: 0 },
                12: { state: "computed", outputValue: 0 },
            },
            3: { 10: { state: "computed", outputValue: 1 } },
            4: { 13: { state: "computed", outputValue: 1 } },
        })
    })
})
