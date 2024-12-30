import { Circuit } from "../src/classes/circuit.js"
import { mockData } from "./mock-data.js"

describe("FunctionalElement class computeFunction method", () => {
    let circuit

    beforeAll(() => {
        circuit = new Circuit()
        circuit.parseCircuit(mockData, 1)
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

    test("full circuit computation", () => {
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
