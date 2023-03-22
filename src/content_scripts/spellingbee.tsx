import { useCallback, useEffect, useState } from "react"
import ReactDOM from "react-dom"
import SpellingBeeGrid from "./spellingbeegrid"
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

    const fetchData = useCallback(async function () {
        try {
            const response = await fetch(
                `https://www.nytimes.com/${currentDate()}/crosswords/spelling-bee-forum.html`
            )
            if (!response.ok) {
                throw new Error(`HTTPS error status: ${response.status}`)
            }

            const html = await response.text()

            const parser = new DOMParser()
            const doc = parser.parseFromString(html, "text/html")

            const interactiveBody =
                doc.getElementsByClassName("interactive-body")
            if (interactiveBody == null || interactiveBody.length !== 1) {
                console.log("Failed to find interactive body.")
                return
            }

            parseSpellingBeeGrid(interactiveBody[0])
            parseTwoLetterList(interactiveBody[0])
        } catch (error) {
            console.error(error);
        }
    }, [])

    const update = useCallback(async () => {
        await fetchData()
        updateFoundWords()
    }, [fetchData])

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

    function currentDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}/${month}/${day}`;
    }

    function parseSpellingBeeGrid(interactiveBody: Element) {
        const grid = interactiveBody.getElementsByTagName("table")
        if (grid == null || grid.length !== 1) {
            console.log("Failed to find Spelling Bee Grid.")
            return [new Set<number>(), new Map<string, Array<number>>()]
        }

        const rows = grid[0].getElementsByTagName("tr")

        const wordLengths = new Array<number>()

        const wordCountCells = rows[0].getElementsByTagName("td")
        for (let i = 0; i < wordCountCells.length; i++) {
            const data = wordCountCells[i].textContent?.trim() ?? ""
            if (data === "-") {
                wordLengths.push(0)
            } else if (data.length > 0 && !isNaN(Number(data))) {
                wordLengths.push(Number(data))
            }
        }

        const letterCounts = new Map<string, Map<number, number>>()

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].getElementsByTagName("td")
            const rowLetter = row[0].textContent?.trim().replace(":", "") ?? ""
            if (rowLetter?.length === 0) {
                console.log("Failed to get row letter.")
                continue
            }

            letterCounts.set(rowLetter, new Map<number, number>())

            for (let j = 1; j < row.length; j++) {
                const data = row[j].textContent?.trim() ?? ""
                if (data === "-") {
                    letterCounts.get(rowLetter)!.set(wordLengths[j - 1], 0)
                } else if (data.length > 0 && !isNaN(Number(data))) {
                    letterCounts
                        .get(rowLetter)!
                        .set(wordLengths[j - 1], Number(data))
                }
            }
        }

        setRequiredWordLengths(wordLengths)
        setRequiredLetterCounts(letterCounts)
    }

    function parseTwoLetterList(interactiveBody: Element) {
        const pElements = interactiveBody.getElementsByTagName("p")
        if (pElements === null || pElements.length === 0) {
            console.log("Failed to find two letter list.")
            return new Map<string, number>()
        }

        const twoLetterList = pElements[pElements.length - 1]
            .getElementsByTagName("span")

        const twoLetterCounts = new Map<string, number>()
        for (let i = 0; i < twoLetterList.length; i++) {
            const data = twoLetterList[i].textContent?.trim() ?? ""
            const splitData = data.split(" ")

            for (let j = 0; j < splitData.length; j++) {
                const itemCount = splitData[j].split("-")
                if (itemCount.length !== 2) {
                    console.log("Invalid two letter count: " + splitData[j])
                    continue
                }

                twoLetterCounts.set(itemCount[0], Number(itemCount[1]))
            }
        }

        setRequiredTwoLetterCounts(twoLetterCounts)
    }

    return <>
        <div className="spelling-bee-helper sb-wordlist-box">
            <SpellingBeeGrid
                requiredWordLengths={requiredWordLengths}
                requiredLetterCounts={requiredLetterCounts}
                foundLetterCounts={foundLetterCounts}
                foundWordLengths={foundWordLengths} />
            <TwoLetterList 
                requiredTwoLetterCounts={requiredTwoLetterCounts} 
                foundTwoLetterCounts={foundTwoLetterCounts} />
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