const mockData = [
    {
        format: "fcircuit",
        number: 1,
        countInputs: 3,
        countFE: 7,
        outputNums: [9],
        instancesFE: [
            { id: 4, inputsFE: [1, 2], mincode: 1 },
            { id: 5, inputsFE: [2], mincode: 2 },
            { id: 6, inputsFE: [1, 2, 3], mincode: 23 },
            { id: 7, inputsFE: [4, 5], mincode: 7 },
            { id: 8, inputsFE: [5, 6], mincode: 7 },
            { id: 9, inputsFE: [7, 2], mincode: 7 },
            { id: 10, inputsFE: [3, 2], mincode: 7 },
        ],
    },
]

const mockMIG = [
    {
        format: "mig",
        number: 23839913,
        countInputs: 5,
        countFE: 8,
        output: [13, 1],
        instancesFE: [
            { id: 6, inputsFE: [0, 2, 5], inverses: [0, 0, 0] },
            { id: 7, inputsFE: [1, 11, 0], inverses: [1, 1, 0] },
            { id: 8, inputsFE: [3, 6, 1], inverses: [0, 1, 1] },
            { id: 9, inputsFE: [0, 2, 11], inverses: [0, 0, 0] },
            { id: 10, inputsFE: [5, 7, 8], inverses: [1, 0, 0] },
            { id: 11, inputsFE: [5, 4, 3], inverses: [1, 0, 0] },
            { id: 12, inputsFE: [1, 6, 4], inverses: [0, 0, 0] },
            { id: 13, inputsFE: [9, 10, 12], inverses: [1, 0, 0] },
        ],
    },
]

const invalidInputFE = [
    {
        format: "fcircuit",
        number: 1,
        countInputs: 3,
        countFE: 7,
        outputsNums: [9],
        instancesFE: [
            { id: 4, inputsFE: [1, 2], mincode: 1 },
            { id: 5, inputsFE: [2], mincode: 2 },
            { id: 6, inputsFE: [1, 2, 3], mincode: 23 },
            { id: 7, inputsFE: [4, 5], mincode: 7 },
            { id: 8, inputsFE: [5, 6], mincode: 7 },
            { id: 9, inputsFE: [7, 12], mincode: 7 },
            { id: 10, inputsFE: [3, 2], mincode: 7 },
        ],
    },
]

export { invalidInputFE, mockData, mockMIG }