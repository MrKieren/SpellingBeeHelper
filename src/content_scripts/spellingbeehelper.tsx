import { useCallback, useEffect, useState } from "react"
import { updateFoundWords } from "./FoundWordsParser"
import WordTotals from "./WordTotals"
import SpellingBeeGrid from "./SpellingBeeGrid"
import { fetchData } from "./TodaysHintsParser"
import TwoLetterList from "./TwoLetterList"
import BeePhoto from "./BeePhoto"
import { UpdateErrorFunction } from "./Index"

export const SPELLING_BEE_CONTENT_AREA = "spelling-bee-content-area"

type Props = {
    updateError: UpdateErrorFunction
}

const SpellingBee = ({ updateError }: Props) => {
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

    const [error, setError] = useState("")

    const [beePhoto, setBeePhoto] = useState({
        src: "",
        srcset: "",
        credit: ""
    })

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

    useEffect(() => {
        updateError(error)
    }, [error, updateError])

    return <div className="spelling-bee-helper-main-container">
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
    </div>
}

export default SpellingBee