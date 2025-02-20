export function removeDuplicateComputedElements(stateHistory) {
    const computedIndexes = new Set()

    Object.keys(stateHistory).forEach((depth) => {
        const elements = stateHistory[depth]

        Object.entries(elements).forEach(([id, element]) => {
            if (computedIndexes.has(id)) {
                delete stateHistory[depth][id]
            }

            if (element.state === "computed") {
                computedIndexes.add(id)
            }
        })
    })
}
