export const generateCombinations = (length) => {
    const result = []
    const generate = (current, depth) => {
        if (depth === length) {
            result.push(current)
            return
        }
        generate([...current, 0], depth + 1)
        generate([...current, 1], depth + 1)
    }
    generate([], 0)
    return result
}
