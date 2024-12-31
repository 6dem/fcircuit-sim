import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class calculateOutput method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
        circuit.findAllPaths()
    })

    test("exception", () => {
        expect(() => circuit.calculateOutput()).toThrow(
            "output value has not been calculated yet"
        )
    })

    test("calculate output on 0 set", () => {
        circuit.buildDepthsDict()
        circuit.initializeCircuit(0)
        circuit.simulateCircuit(circuit.depthsDict)
        expect(circuit.calculateOutput()).toEqual({ 9: 1 })
    })

    test("calculate output on 2nd set", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(2)
        circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateOutput()).toEqual({ 9: 1 })
    })

    test("calculate output on 5th set", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(5)
        circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateOutput()).toEqual({ 9: 1 })
    })
})

describe("MIG class calculateOutput method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
        circuit.findAllPaths()
    })

    test("exception", () => {
        expect(() => circuit.calculateOutput()).toThrow(
            "output value has not been calculated yet"
        )
    })

    test("calculate output on 0 set", () => {
        circuit.buildDepthsDict()
        circuit.initializeCircuit(0)
        circuit.simulateCircuit(circuit.depthsDict)
        expect(circuit.calculateOutput()).toEqual({ 13: 0 })
    })

    test("calculate output on 7th set", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(7)
        circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateOutput()).toEqual({ 13: 1 })
    })

    test("calculate output on 18th set", () => {
        circuit.buildXDepthsDict()
        circuit.initializeCircuit(18)
        circuit.simulateCircuit(circuit.xDepthsDict)
        expect(circuit.calculateOutput()).toEqual({ 13: 0 })
    })
})
