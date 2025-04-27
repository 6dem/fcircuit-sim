import { Circuit } from "../src/classes/circuit.js"
import { MIG } from "../src/classes/mig.js"
import { mockData, mockMIG } from "./mock-data.js"

describe("FunctionalElement class computeFunction method", () => {
    let circuit

    beforeAll(() => {
        circuit = new Circuit()
        const circuitMap = new Map()
        mockData.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 1)
    })

    test("default computation 0 set", () => {
        circuit.initializeCircuit()
        let fe
        let outputValue

        fe = circuit.instancesFE["4"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["5"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(1)

        fe = circuit.instancesFE["6"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["9"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["10"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)
    })

    test("default computation 2nd set", () => {
        circuit.initializeCircuit(2)
        let fe
        let outputValue

        fe = circuit.instancesFE["4"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["5"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["6"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["9"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(1)

        fe = circuit.instancesFE["10"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(1)
    })

    test("null case", () => {
        circuit.initializeCircuit()
        let fe
        let outputValue

        fe = circuit.instancesFE["7"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["8"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["9"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)
    })

    test("full fcircuit computation", () => {
        circuit.initializeCircuit()

        for (const feKey of Object.keys(circuit.instancesFE)) {
            if (circuit.instancesFE[feKey].index <= circuit.countInputs) {
                continue
            }
            const fe = circuit.instancesFE[feKey]
            const outputValue = fe.computeFunction(circuit)
            expect([0, 1, null]).toContain(outputValue) // Все элементы должны быть либо 0, либо 1, либо null
        }
    })
})

describe("MajorityInvertElement class computeFunction method", () => {
    let circuit

    beforeAll(() => {
        circuit = new MIG()
        const circuitMap = new Map()
        mockMIG.forEach((circuit) => {
            circuitMap.set(circuit.number, circuit)
        })
        circuit.parseCircuit(circuitMap, 23839913)
    })

    test("default computation 0 set", () => {
        circuit.initializeCircuit()
        let fe
        let outputValue

        fe = circuit.instancesFE["6"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["7"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["8"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["9"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["10"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["11"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["12"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)
    })

    test("default computation 5th set", () => {
        circuit.initializeCircuit(5)
        let fe
        let outputValue

        fe = circuit.instancesFE["6"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["7"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["8"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(1)

        fe = circuit.instancesFE["9"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["10"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)

        fe = circuit.instancesFE["11"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)

        fe = circuit.instancesFE["12"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(0)
    })

    test("null case", () => {
        circuit.initializeCircuit()
        let fe
        let outputValue

        fe = circuit.instancesFE["13"]
        outputValue = fe.computeFunction(circuit)
        expect(outputValue).toEqual(null)
    })

    test("full mig computation", () => {
        circuit.initializeCircuit()

        for (const feKey of Object.keys(circuit.instancesFE)) {
            if (circuit.instancesFE[feKey].index <= circuit.countInputs) {
                continue
            }
            const fe = circuit.instancesFE[feKey]
            const outputValue = fe.computeFunction(circuit)
            expect([0, 1, null]).toContain(outputValue) // Все элементы должны быть либо 0, либо 1, либо null
        }
    })
})
