import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class calculateSignDelay method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
        circuit.findAllPaths()
    })

    test("calculate sign delay on 2nd set | depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const depthsDict = circuit.buildDepthsDict(allPaths)
        circuit.initializeCircuit(2)
        circuit.simulateCircuit(depthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(circuit.calculateSignDelay(signChains)).toEqual(1)
    })

    test("calculate sign delay on 2nd set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit(2)
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(circuit.calculateSignDelay(signChains)).toEqual(1)
    })

    test("calculate sign delay on 0 set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit()
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(circuit.calculateSignDelay(signChains)).toEqual(3)
    })
})

describe("MIG class calculateSignDelay method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
        circuit.findAllPaths()
    })

    test("calculate sign delay on 2nd set | depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const depthsDict = circuit.buildDepthsDict(allPaths)
        circuit.initializeCircuit(2)
        circuit.simulateCircuit(depthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(circuit.calculateSignDelay(signChains)).toEqual(3)
    })

    test("calculate sign delay on 0 set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit()
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(circuit.calculateSignDelay(signChains)).toEqual(0)
    })

    test("calculate sign delay on 18th set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit(18)
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(circuit.calculateSignDelay(signChains)).toEqual(2)
    })
})
