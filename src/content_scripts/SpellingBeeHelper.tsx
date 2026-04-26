import { useCallback, useEffect, useState } from "react"
import { updateFoundWords, updateWordLengthDisplay } from "./FoundWordsParser"
import WordTotals from "./WordTotals"
import SpellingBeeGrid from "./SpellingBeeGrid"
import { fetchData } from "./TodaysHintsParser"
import TwoLetterList from "./TwoLetterList"
import BeePhoto from "./BeePhoto"
import { UpdateErrorFunction } from "./Index"
import {
    GLOBAL_SETTING_SHOW_BEE_PHOTO,
    GLOBAL_SETTING_SHOW_GRID,
    GLOBAL_SETTING_SHOW_TOTALS,
    GLOBAL_SETTING_SHOW_TWO_LETTER_LIST,
    GLOBAL_SETTING_UPDATE_WORD_LENGTHS,
    getSetting,
    SPH_SETTINGS_CHANGED_EVENT
} from "./Settings"

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

    const [beePhotoDetails, setBeePhotoDetails] = useState({
        src: "",
        srcset: "",
        credit: ""
    })

     const watchWordListChanges = useCallback(() => {
        const wordList = document.getElementsByClassName("sb-wordlist-drawer")
        if (wordList == null || wordList.length !== 1) {
            console.log("Failed to find word list.")
            return
        }

        const observer = new MutationObserver((mutations) => {
            // Check if any mutations resulted in new words being added
            let shouldUpdate = false
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are sb-anagram elements (actual words)
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i]
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element
                            if (element.classList?.contains("sb-anagram")) {
                                shouldUpdate = true
                                break
                            }
                            // Also check if any child elements are sb-anagram
                            if (element.querySelector?.(".sb-anagram")) {
                                shouldUpdate = true
                                break
                            }
                        }
                    }
                    if (shouldUpdate) break
                }
            }
            
            if (shouldUpdate) {
                // Add a small delay to ensure DOM is fully updated
                setTimeout(() => {
                    try {
                        const foundWordsData = updateFoundWords()
                        setFoundLetterCounts(foundWordsData.letterCounts)
                        setFoundTwoLetterCounts(foundWordsData.twoLetterCounts)
                        setFoundWordLengths(foundWordsData.wordLengthCounts)

                        const showWordLengths = getSetting(GLOBAL_SETTING_UPDATE_WORD_LENGTHS, true)
                        updateWordLengthDisplay(showWordLengths)
                    } catch (error) {
                        console.log("Error updating found words:", error)
                    }
                }, 50)
            }
        })

        observer.observe(wordList[0], {
            childList: true,
            subtree: true
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

                if (getSetting(GLOBAL_SETTING_UPDATE_WORD_LENGTHS, true)) {
                    updateWordLengthDisplay()
                }
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
            setBeePhotoDetails(todaysHintsData.beePhoto)

            const foundWordsData = updateFoundWords()
            setFoundLetterCounts(foundWordsData.letterCounts)
            setFoundTwoLetterCounts(foundWordsData.twoLetterCounts)
            setFoundWordLengths(foundWordsData.wordLengthCounts)

            if (getSetting(GLOBAL_SETTING_UPDATE_WORD_LENGTHS, true)) {
                updateWordLengthDisplay()
            }
        } catch (error: any) {
            setError((error as Error).message)
        }
    }, [])

    // Listen for setting changes via custom events (when toggle is changed in Settings)
    const handleSettingChange = useCallback((event: CustomEvent) => {
        const { setting, value } = event.detail
        if (setting === GLOBAL_SETTING_UPDATE_WORD_LENGTHS) {
            updateWordLengthDisplay(value)
        }
    }, [])

    useEffect(() => {
        window.addEventListener(SPH_SETTINGS_CHANGED_EVENT, handleSettingChange as EventListener)
        return () => {
            window.removeEventListener(SPH_SETTINGS_CHANGED_EVENT, handleSettingChange as EventListener)
        }
    }, [handleSettingChange])

    useEffect(() => {
        watchGameScreenAppear()
        watchWordListChanges()
        update()
    }, [watchGameScreenAppear, watchWordListChanges, update])

    useEffect(() => {
        updateError(error)
    }, [error, updateError])

    const wordTotals = () => {
        if (getSetting(GLOBAL_SETTING_SHOW_TOTALS, true)) {
            return <WordTotals requiredWordTotals={requiredWordTotals} />
        } else {
            return <></>
        }
    }

    const spellingBeeGrid = () => {
        if (getSetting(GLOBAL_SETTING_SHOW_GRID, true)) {
            return <SpellingBeeGrid
                requiredWordLengths={requiredWordLengths}
                requiredLetterCounts={requiredLetterCounts}
                foundLetterCounts={foundLetterCounts}
                foundWordLengths={foundWordLengths} />
        } else {
            return <></>
        }
    }

    const towLetterList = () => {
        if (getSetting(GLOBAL_SETTING_SHOW_TWO_LETTER_LIST, true)) {
            return <TwoLetterList
                requiredTwoLetterCounts={requiredTwoLetterCounts}
                foundTwoLetterCounts={foundTwoLetterCounts} />
        } else {
            return <></>
        }
    }

    const beePhoto = () => {
        if (getSetting(GLOBAL_SETTING_SHOW_BEE_PHOTO, true)) {
            return <BeePhoto
                src={beePhotoDetails.src}
                srcset={beePhotoDetails.srcset}
                credit={beePhotoDetails.credit} />
        } else {
            return <></>
        }
    }

    const checkNoHelpersEnabled = () => {
        if (
            !getSetting(GLOBAL_SETTING_SHOW_TOTALS, true) &&
            !getSetting(GLOBAL_SETTING_SHOW_GRID, true) &&
            !getSetting(GLOBAL_SETTING_SHOW_TWO_LETTER_LIST, true) &&
            !getSetting(GLOBAL_SETTING_SHOW_BEE_PHOTO, true)
        ) {
            return <>
                <p className="spelling-bee-helper-error">
                    No Spelling Bee Helpers enabled.
                </p>
                <p className="spelling-bee-helper-error">
                    Please check your settings.
                </p>
            </>
        } else {
            return <></>
        }
    }

    return <div className="spelling-bee-helper-main-container">
        {wordTotals()}
        {spellingBeeGrid()}
        {towLetterList()}
        {beePhoto()}

        {checkNoHelpersEnabled()}
    </div>
}

export default SpellingBee