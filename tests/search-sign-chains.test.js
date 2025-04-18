import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("Circuit class searchSignChains method", () => {
    let circuit

    beforeEach(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
    })

    test("empty argument", () => {
        expect(() => circuit.searchSignChains([])).toThrow(
            "method searchSignChains: allPaths array is empty"
        )
    })

    test("search significant chains on 2nd set | depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const depthsDict = circuit.buildDepthsDict(allPaths)
        circuit.initializeCircuit(2)
        circuit.simulateCircuit(depthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(signChains).toEqual([
            [8, 5, 2],
            [8, 6, 1],
            [8, 6, 3],
            [9, 2],
            [10, 2],
        ])
    })

    test("search significant chains on 2nd set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit(2)
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(signChains).toEqual([
            [8, 5, 2],
            [8, 6, 1],
            [8, 6, 3],
            [9, 2],
            [10, 2],
        ])
    })

    test("search significant chains on 0 set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit()
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(signChains).toEqual([
            [8, 5, 2],
            [9, 7, 5, 2],
            [10, 3],
            [10, 2],
        ])
    })
})

describe("MIG class searchSignChains method", () => {
    let circuit

    beforeEach(() => {
        circuit = new MIG()
        circuit.parseCircuit(mockMIG, 23839913)
        circuit.findAllPaths()
    })

    test("empty argument", () => {
        const stateHistory = {}
        expect(() => circuit.searchSignChains([])).toThrow(
            "method searchSignChains: allPaths array is empty"
        )
    })

    test("search significant chains on 2nd set | depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const depthsDict = circuit.buildDepthsDict(allPaths)
        circuit.initializeCircuit(2)
        circuit.simulateCircuit(depthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(signChains).toEqual([
            [13, 9, 0],
            [13, 9, 2],
            [13, 10, 5],
            [13, 10, 8, 1],
        ])
    })

    test("search significant chains on 0 set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit()
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(signChains).toEqual([])
    })

    test("search significant chains on 18th set | extended depths dict", () => {
        const allPaths = circuit.findAllPaths()
        const xDepthsDict = circuit.buildXDepthsDict(allPaths)
        circuit.initializeCircuit(18)
        circuit.simulateCircuit(xDepthsDict)
        const [signChains, _] = circuit.searchSignChains(allPaths)
        expect(signChains).toEqual([
            [13, 9, 0],
            [13, 9, 2],
            [13, 12, 1],
            [13, 12, 4],
        ])
    })
})
