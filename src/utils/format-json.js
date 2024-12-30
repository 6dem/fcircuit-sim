// Функция для форматирования JSON
export function formatJson(results) {
    return (
        "[\n" +
        results
            .map((result) => {
                const formattedSetResults = result.setResults
                    .map((item) => `        ${JSON.stringify(item)}`)
                    .join(",\n")
                return `  {
    "number": ${result.number},
    "depth": ${result.depth},
    "setResults": [
${formattedSetResults}
    ]
  }`
            })
            .join(",\n") +
        "\n]"
    )
}
