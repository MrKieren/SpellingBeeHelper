import { useCallback, useEffect, useState } from "react"
import ReactDOM from "react-dom"
import SpellingBeeGrid from "./spellingbeegrid"
import { fetchData } from "./todayshintsparser"
import TwoLetterList from "./twoletterlist"

export const SPELLING_BEE_CONTENT_AREA = "spelling-bee-content-area"

const SpellingBee = () => {
    const [requiredWordLengths, setRequiredWordLengths] =
        useState(new Array<number>())

    const [requiredLetterCounts, setRequiredLetterCounts] =
        useState(new Map<string, Map<number, number>>())
    const [foundLetterCounts, setFoundLetterCounts] =
        useState(new Map<string, Map<number, number>>())
    const [foundWordLengths, setFoundWordLengths] =
        useState(new Map<number, number>())

    const [requiredTwoLetterCounts, setRequiredTwoLetterCounts] =
        useState(new Map<string, number>())
    const [foundTwoLetterCounts, setFoundTwoLetterCounts] =
        useState(new Map<string, number>())

    const [error, setError] = useState("")

    const WatchEnterButton = useCallback(() => {
        const submitButton =
            document.getElementsByClassName("hive-action__submit")
        if (submitButton == null || submitButton.length !== 1) {
            console.log("Failed to find submit button.")
            return
        }

        const observer = new MutationObserver((mutation) => {
            const submitButtonTarget = mutation[0].target as Element
            if (submitButtonTarget.classList.contains("push-active") ||
                submitButtonTarget.classList.contains("action-active")) {
                updateFoundWords()
            }
        })

        observer.observe(submitButton[0], {
            attributes: true,
            attributeFilter: ["class"],
            childList: false,
            characterData: false
        })
    }, [])

    const update = useCallback(async () => {
        try {
            const todaysHintsData = await fetchData()
            setRequiredWordLengths(todaysHintsData.wordLengths)
            setRequiredLetterCounts(todaysHintsData.letterCounts)
            setRequiredTwoLetterCounts(todaysHintsData.twoLetterCounts)

            updateFoundWords()
        } catch (error: any) {
            setError((error as Error).message)
        }
    }, [])

    useEffect(() => {
        update()
        WatchEnterButton()
    }, [WatchEnterButton, update])

    function updateFoundWords() {
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

        const letterCounts = new Map<string, Map<number, number>>()
        const twoLetterCounts = new Map<string, number>()
        const wordLengthCounts = new Map<number, number>()

        for (let index = 0; index < words.length; index++) {
            const child = words[index]

            const word = child.innerHTML
            const firstLetter = word[0]

            if (!letterCounts.has(firstLetter)) {
                letterCounts.set(firstLetter, new Map<number, number>())
            }

            if (!letterCounts.get(firstLetter)?.get(word.length)) {
                letterCounts.get(firstLetter)?.set(word.length, 0)
            }

            const letterCount =
                letterCounts.get(firstLetter)?.get(word.length) ?? 0
            letterCounts.get(firstLetter)?.set(word.length, letterCount + 1)

            const firstTwoLetters = word[0] + word[1]
            if (!twoLetterCounts.has(firstTwoLetters)) {
                twoLetterCounts.set(firstTwoLetters, 0)
            }

            const twoLetterCount = twoLetterCounts.get(firstTwoLetters) ?? 0
            twoLetterCounts.set(firstTwoLetters, twoLetterCount + 1)

            const wordLength = word.length
            if (!wordLengthCounts.has(wordLength)) {
                wordLengthCounts.set(wordLength, 0)
            }

            const oldWordLength = wordLengthCounts.get(wordLength) ?? 0
            wordLengthCounts.set(wordLength, oldWordLength + 1)
        }

        setFoundLetterCounts(letterCounts)
        setFoundTwoLetterCounts(twoLetterCounts)
        setFoundWordLengths(wordLengthCounts)
    }

    return <>
        <div className="spelling-bee-helper sb-wordlist-box">
            {error !== "" ?
                <p className="spelling-bee-helper-error">{error}</p>
                :
                <>
                    <SpellingBeeGrid
                        requiredWordLengths={requiredWordLengths}
                        requiredLetterCounts={requiredLetterCounts}
                        foundLetterCounts={foundLetterCounts}
                        foundWordLengths={foundWordLengths} />
                    <TwoLetterList
                        requiredTwoLetterCounts={requiredTwoLetterCounts}
                        foundTwoLetterCounts={foundTwoLetterCounts} />
                </>
            }
        </div>
    </>
}

function render() {
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
render()

export default SpellingBee