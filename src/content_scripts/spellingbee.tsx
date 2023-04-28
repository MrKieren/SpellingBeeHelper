import { useCallback, useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { updateFoundWords } from "./foundwordsparser"
import WordTotals from "./wordtotals"
import SpellingBeeGrid from "./spellingbeegrid"
import { fetchData } from "./todayshintsparser"
import TwoLetterList from "./twoletterlist"
import BeePhoto from "./beephoto"

export const SPELLING_BEE_CONTENT_AREA = "spelling-bee-content-area"

const SpellingBee = () => {
    const [requiredWordTotals, setRequiredWordTotals] = useState({
        words: 0,
        pangrams: 0,
        perfectPangrams: 0,
        points: 0
    })

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

    const [beePhoto, setBeePhoto] = useState({
        src: "",
        srcset: "",
        credit: ""
    })

    const [error, setError] = useState("")

    const watchEnterButton = useCallback(() => {
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
                const foundWordsData = updateFoundWords()
                setFoundLetterCounts(foundWordsData.letterCounts)
                setFoundTwoLetterCounts(foundWordsData.twoLetterCounts)
                setFoundWordLengths(foundWordsData.wordLengthCounts)
            }
        })

        observer.observe(submitButton[0], {
            attributes: true,
            attributeFilter: ["class"],
            childList: false,
            characterData: false
        })
    }, [])

    const watchGameScreenAppear = useCallback(() => {
        const gameScreen =
            document.getElementsByClassName("pz-game-screen")
        if (gameScreen == null || gameScreen.length !== 1) {
            console.log("Failed to find game screen.")
            return
        }

        const observer = new MutationObserver((mutation) => {
            observer.disconnect()

            const gameScreenTarget = mutation[0].target as Element
            if (gameScreenTarget.classList.contains("on-stage")) {
                const foundWordsData = updateFoundWords()
                setFoundLetterCounts(foundWordsData.letterCounts)
                setFoundTwoLetterCounts(foundWordsData.twoLetterCounts)
                setFoundWordLengths(foundWordsData.wordLengthCounts)
            }
        })

        observer.observe(gameScreen[0], {
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
            setRequiredWordTotals(todaysHintsData.requiredWordTotals)
            setBeePhoto(todaysHintsData.beePhoto)

            const foundWordsData = updateFoundWords()
            setFoundLetterCounts(foundWordsData.letterCounts)
            setFoundTwoLetterCounts(foundWordsData.twoLetterCounts)
            setFoundWordLengths(foundWordsData.wordLengthCounts)
        } catch (error: any) {
            setError((error as Error).message)
        }
    }, [])

    useEffect(() => {
        watchGameScreenAppear()
        watchEnterButton()
        update()
    }, [watchGameScreenAppear, watchEnterButton, update])

    return <>
        <div className="spelling-bee-helper sb-wordlist-box">
            {error !== "" ?
                <p className="spelling-bee-helper-error">{error}</p>
                :
                <>
                    <WordTotals
                        requiredWordTotals={requiredWordTotals} />
                    <SpellingBeeGrid
                        requiredWordLengths={requiredWordLengths}
                        requiredLetterCounts={requiredLetterCounts}
                        foundLetterCounts={foundLetterCounts}
                        foundWordLengths={foundWordLengths} />
                    <TwoLetterList
                        requiredTwoLetterCounts={requiredTwoLetterCounts}
                        foundTwoLetterCounts={foundTwoLetterCounts} />
                    <BeePhoto
                        src={beePhoto.src}
                        srcset={beePhoto.srcset}
                        credit={beePhoto.credit} />
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