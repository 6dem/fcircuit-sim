import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class calculateDelay method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
        circuit.findAllPaths()
    })

    test("empty depths dict", () => {
        const stateHistory = {}
        expect(() => circuit.calculateDelay(stateHistory)).toThrow(
            "states dict is empty"
        )
    })

    test("calculate delay on 2nd set | depths dict", () => {
        circuit.buildDepthsDict()
        circuit.initializeCircuit(2)
        const stateHistory = circuit.simulateCircuit(circuit.depthsDict)
        expect(circuit.calculateDelay(stateHistory)).toEqual(3)
    })

    test("calculate delay on 2nd set | extended depths dict", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(2)
        const stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateDelay(stateHistory)).toEqual(1)
    })

    test("calculate delay on 0 set | extended depths dict", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit()
        const stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateDelay(stateHistory)).toEqual(3)
    })
})

describe("MIG class calculateDelay method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
        circuit.findAllPaths()
    })

    test("empty depths dict", () => {
        const stateHistory = {}
        expect(() => circuit.calculateDelay(stateHistory)).toThrow(
            "states dict is empty"
        )
    })

    test("calculate delay on 2nd set | depths dict", () => {
        circuit.buildDepthsDict()
        circuit.initializeCircuit(2)
        const stateHistory = circuit.simulateCircuit(circuit.depthsDict)
        expect(circuit.calculateDelay(stateHistory)).toEqual(4)
    })

    test("calculate delay on 0 set | extended depths dict", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit()
        const stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateDelay(stateHistory)).toEqual(4)
    })

    test("calculate delay on 18th set | extended depths dict", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(18)
        const stateHistory = circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateDelay(stateHistory)).toEqual(2)
    })
})
