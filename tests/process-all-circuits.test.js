import { processAllCircuits } from "../src/services/process-circuits.js"
import { mockAIG, mockData, mockMIG } from "../tests/mock-data.js"

describe("processAllCircuits function", () => {
    test("invalid input", () => {
        expect(() => processAllCircuits()).toThrow(
            "The JSON data is not an array"
        )
        expect(() => processAllCircuits([])).toThrow("The JSON data is empty")
    })

    test("process fcircuit-mig-aig", () => {
        const expectedOutput = {
            resultData:
                "[\n" +
                "  {\n" +
                '    "number": 1,\n' +
                '    "depth": 3,\n' +
                '    "setResults": [\n' +
                '        {"inputSet":"000","outputValue":{"9":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"001","outputValue":{"9":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"010","outputValue":{"9":1},"delay":1,"signDelay":2},\n' +
                '        {"inputSet":"011","outputValue":{"9":1},"delay":1,"signDelay":2},\n' +
                '        {"inputSet":"100","outputValue":{"9":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"101","outputValue":{"9":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"110","outputValue":{"9":1},"delay":1,"signDelay":2},\n' +
                '        {"inputSet":"111","outputValue":{"9":1},"delay":1,"signDelay":0}\n' +
                "    ]\n" +
                "  },\n" +
                "  {\n" +
                '    "number": 23839913,\n' +
                '    "depth": 4,\n' +
                '    "setResults": [\n' +
                '        {"inputSet":"00000","outputValue":{"13":0},"delay":4,"signDelay":0},\n' +
                '        {"inputSet":"00001","outputValue":{"13":0},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"00010","outputValue":{"13":0},"delay":4,"signDelay":3},\n' +
                '        {"inputSet":"00011","outputValue":{"13":0},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"00100","outputValue":{"13":0},"delay":3,"signDelay":2},\n' +
                '        {"inputSet":"00101","outputValue":{"13":0},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"00110","outputValue":{"13":0},"delay":3,"signDelay":2},\n' +
                '        {"inputSet":"00111","outputValue":{"13":1},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"01000","outputValue":{"13":0},"delay":4,"signDelay":3},\n' +
                '        {"inputSet":"01001","outputValue":{"13":1},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"01010","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"01011","outputValue":{"13":0},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"01100","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"01101","outputValue":{"13":0},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"01110","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"01111","outputValue":{"13":1},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"10000","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"10001","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"10010","outputValue":{"13":0},"delay":2,"signDelay":2},\n' +
                '        {"inputSet":"10011","outputValue":{"13":0},"delay":2,"signDelay":2},\n' +
                '        {"inputSet":"10100","outputValue":{"13":0},"delay":4,"signDelay":3},\n' +
                '        {"inputSet":"10101","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"10110","outputValue":{"13":0},"delay":2,"signDelay":0},\n' +
                '        {"inputSet":"10111","outputValue":{"13":0},"delay":2,"signDelay":2},\n' +
                '        {"inputSet":"11000","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"11001","outputValue":{"13":0},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"11010","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"11011","outputValue":{"13":0},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"11100","outputValue":{"13":1},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"11101","outputValue":{"13":0},"delay":3,"signDelay":3},\n' +
                '        {"inputSet":"11110","outputValue":{"13":0},"delay":4,"signDelay":4},\n' +
                '        {"inputSet":"11111","outputValue":{"13":1},"delay":3,"signDelay":3}\n' +
                "    ]\n" +
                "  },\n" +
                "  {\n" +
                '    "number": 5736,\n' +
                '    "depth": 5,\n' +
                '    "setResults": [\n' +
                '        {"inputSet":"00000","outputValue":{"15":0},"delay":5,"signDelay":0},\n' +
                '        {"inputSet":"00001","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"00010","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"00011","outputValue":{"15":1},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"00100","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"00101","outputValue":{"15":1},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"00110","outputValue":{"15":1},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"00111","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01000","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01001","outputValue":{"15":1},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01010","outputValue":{"15":1},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01011","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01100","outputValue":{"15":1},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01101","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01110","outputValue":{"15":0},"delay":5,"signDelay":5},\n' +
                '        {"inputSet":"01111","outputValue":{"15":0},"delay":5,"signDelay":0},\n' +
                '        {"inputSet":"10000","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"10001","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"10010","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"10011","outputValue":{"15":0},"delay":1,"signDelay":1},\n' +
                '        {"inputSet":"10100","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"10101","outputValue":{"15":0},"delay":1,"signDelay":1},\n' +
                '        {"inputSet":"10110","outputValue":{"15":0},"delay":1,"signDelay":1},\n' +
                '        {"inputSet":"10111","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"11000","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"11001","outputValue":{"15":0},"delay":1,"signDelay":1},\n' +
                '        {"inputSet":"11010","outputValue":{"15":0},"delay":1,"signDelay":1},\n' +
                '        {"inputSet":"11011","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"11100","outputValue":{"15":0},"delay":1,"signDelay":1},\n' +
                '        {"inputSet":"11101","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"11110","outputValue":{"15":0},"delay":1,"signDelay":0},\n' +
                '        {"inputSet":"11111","outputValue":{"15":0},"delay":1,"signDelay":0}\n' +
                "    ]\n" +
                "  }\n" +
                "]",
            errorData: [],
        }

        const result = processAllCircuits(mockData.concat(mockMIG, mockAIG))
        expect(result).toEqual(expectedOutput)
    })
})
