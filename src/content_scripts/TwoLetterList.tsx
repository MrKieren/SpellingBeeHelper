import React from "react"

type Props = {
    requiredTwoLetterCounts: Map<string, number>
    foundTwoLetterCounts: Map<string, number>
}

const TwoLetterList = ({
    requiredTwoLetterCounts,
    foundTwoLetterCounts
}: Props) => {
    const updatedCounters: JSX.Element[] = []

    var currentFirstLetter = "a"
    var currentRow = <></>

    requiredTwoLetterCounts.forEach((count, letters) => {
        if (letters[0] !== currentFirstLetter) {
            updatedCounters.push(currentRow)

            currentFirstLetter = letters[0]
            currentRow = <></>
        }

        const foundCount = foundTwoLetterCounts.get(letters) ?? 0

        currentRow = React.cloneElement(
            currentRow,
            {},
            [
                currentRow,
                <span className="two-letter-list-item">
                    {letters.toUpperCase()}-{count - foundCount}
                </span>
            ]
        )
    })
    updatedCounters.push(currentRow)

    return <>
        <div className="two-letter-list">
            <p className="spelling-bee-helper-title">Two letter list</p>
            <ul>
                {updatedCounters.map((count) => (
                    <>
                        <li>
                            <span className="two-letter-list-row">
                                {count}
                            </span>
                        </li>
                    </>
                ))}
            </ul>
        </div>
    </>
}

export default TwoLetterList