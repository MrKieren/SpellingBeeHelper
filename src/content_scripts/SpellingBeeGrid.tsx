type Props = {
    requiredWordLengths: Array<number>
    requiredLetterCounts: Map<string, Map<number, number>>
    foundLetterCounts: Map<string, Map<number, number>>
    foundWordLengths: Map<number, number>
}

const SpellingBeeGrid = ({
    requiredWordLengths,
    requiredLetterCounts,
    foundLetterCounts,
    foundWordLengths
}: Props) => {
    const CalculateWordCount = () => {
        const updatedCounters = new Map<string, Map<number, number>>()
        var wordRunningCount = 0

        requiredLetterCounts.forEach((counts, letter) => {
            const updatedLetterCounts = new Map<number, number>()
            var letterRunningCount = 0

            counts.forEach((count, wordLength) => {
                const foundCount =
                    foundLetterCounts.get(letter)?.get(wordLength) ?? 0

                if (wordLength === undefined) {
                    // Handle the last column being the total count of letters.
                    if (letter === "Σ") {
                        updatedLetterCounts.set(
                            wordLength, count - wordRunningCount
                        )
                    } else {
                        updatedLetterCounts.set(
                            wordLength, count - letterRunningCount
                        )
                    }
                } else if (letter === "Σ") {
                    // Handle the last row being the word length count.
                    const lengthCount = foundWordLengths.get(wordLength) ?? 0
                    updatedLetterCounts.set(wordLength, count - lengthCount)
                } else {
                    // Normal letter word length counter.
                    letterRunningCount += foundCount
                    wordRunningCount += foundCount
                    updatedLetterCounts.set(wordLength, count - foundCount)
                }
            })

            updatedCounters.set(letter, updatedLetterCounts)
        })

        return <>
            {Array.from(updatedCounters).sort().map(([letter, counts]) => (
                <>
                    <tr>
                        <td className="cell">{letter}</td>
                        {Array.from(counts).map(([wordLength, count]) => (
                            <td className="cell">
                                {count === 0 ? "-" : count}
                            </td>
                        ))}
                    </tr>
                </>
            ))}
        </>
    }

    return <>
        <div className="spelling-bee-helper-grid">
            <p className="spelling-bee-helper-title">
                Spelling Bee Grid
            </p>

            <table className="table">
                <tbody>
                    <tr className="row">
                        <>
                            <td className="cell"></td>
                            {Array.from(requiredWordLengths).map(value => (
                                <td className="cell">{value}</td>
                            ))}
                        </>
                        <td className="cell">Σ</td>
                    </tr>
                    <CalculateWordCount />
                </tbody>
            </table>
        </div>
    </>
}

export default SpellingBeeGrid