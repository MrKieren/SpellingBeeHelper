import { useState } from "react"
import ReactDOM from "react-dom"

export const SPELLING_BEE_CONTENT_AREA = "spelling-bee-content-area"

const SpellingBee = () => {
    const [letterMap, setLetterMap] = useState(new Map<string, number>())
    const [doubleLetterMap, setDoubleLetterMap] =
        useState(new Map<string, Map<string, number>>())

    const UpdateWords = () => {
        const wordList = document.getElementsByClassName("sb-has-words")
        if (wordList == null) {
            console.log("Failed to find word list.")
            return
        }

        const words = wordList[0].getElementsByClassName("sb-anagram")
        if (words == null) {
            console.log("Failed to find words in word list.")
            return
        }

        const singleLetterWords = new Map<string, number>();
        const doubleLetterWords = new Map<string, Map<string, number>>();

        for (let index = 0; index < words.length; index++) {
            const child = words[index]

            const word = child.innerHTML
            const firstLetter = word[0]
            const first2Letters = word[0] + word[1]

            if (!singleLetterWords.has(firstLetter)) {
                singleLetterWords.set(firstLetter, 0)
            }
            singleLetterWords.set(
                firstLetter, singleLetterWords.get(firstLetter)! + 1
            )

            if (!doubleLetterWords.has(firstLetter)) {
                doubleLetterWords.set(firstLetter, new Map<string, number>())
            }
            if (!doubleLetterWords.get(firstLetter)!.get(first2Letters)) {
                doubleLetterWords.get(firstLetter)!.set(first2Letters, 0)
            }
            doubleLetterWords.get(firstLetter)!.set(
                first2Letters,
                doubleLetterWords.get(firstLetter)!.get(first2Letters)! + 1
            )
        }

        setLetterMap(singleLetterWords)
        setDoubleLetterMap(doubleLetterWords)
    }

    const DoubleLetterMapToString = (map: Map<string, number>) => {
        return <>
            {Array.from(map).sort().map(([key, value]) => (
                <>
                    <div>&emsp;{key}: {value}</div>
                </>
            ))}
        </>
    }

    return (
        <>
            <span className="spelling-bee-helper-header">
                Spelling Bee Helper
            </span>

            {Array.from(letterMap).sort().map(([key, value]) => (
                <>
                    <div>{key}: {value}</div>
                    {DoubleLetterMapToString(doubleLetterMap.get(key)!)}
                </>
            ))}

            <button onClick={UpdateWords}>Update</button>
        </>
    )
}

const Render = () => {
    const contentBox = document.getElementsByClassName("sb-content-box")
    if (contentBox == null || contentBox.length !== 1) {
        console.log("Failed to find content box.")
        return
    }

    const wordListWindow = document.createElement("div")
    wordListWindow.setAttribute("class", SPELLING_BEE_CONTENT_AREA)
    wordListWindow.setAttribute("id", SPELLING_BEE_CONTENT_AREA)

    contentBox[0].appendChild(wordListWindow)

    ReactDOM.render(
        <SpellingBee />,
        document.getElementById(SPELLING_BEE_CONTENT_AREA)
    )
}

console.log("Loading Spelling Bee Helper.")
Render()

export default SpellingBee