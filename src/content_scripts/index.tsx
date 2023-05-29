import { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import SpellingBee from "./spellingbeehelper"
import ErrorView from "./ErrorView"
import Settings from "./Settings"

export const SPELLING_BEE_CONTENT_AREA = "spelling-bee-content-area"

export type UpdateErrorFunction = (newError: string) => void;

const enum Views {
    INDEX,
    ERROR,
    SETTINGS
}

const SpellingBeeHelper = () => {
    const settingButton = useRef<HTMLButtonElement>(null);

    const [currentView, setCurrentView] = useState(Views.INDEX)

    const [error, setError] = useState("")
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    const [minWidth, setMinWidth] = useState(280)

    const updateError = (newError: string) => {
        setError(newError)
    }

    const settingsCog = chrome.runtime.getURL("img/settings_cog.svg")
    const backArrow = chrome.runtime.getURL("img/back_arrow.svg")

    useEffect(() => {
        if (error.length > 0) {
            setCurrentView(Views.ERROR)
        } else {
            setCurrentView(Views.INDEX)
        }
    }, [error])

    useEffect(() => {
        if (isSettingsOpen) {
            setCurrentView(Views.SETTINGS)
        } else {
            setCurrentView(Views.INDEX)
        }
    }, [isSettingsOpen])

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen)

        settingButton.current?.classList.toggle("flipped")
    }

    const updateMinContainerWidth = () => {
        const containerBox =
            document.getElementsByClassName("spelling-bee-helper")
        if (containerBox == null || containerBox.length !== 1) {
            console.log("Failed to find container box.")
            return
        }

        const currentWidth =
            Number(containerBox[0].getBoundingClientRect().width)
        if (currentWidth > minWidth) {
            setMinWidth(currentWidth)
        }
    }

    const renderView = () => {
        updateMinContainerWidth()

        switch (currentView) {
            case Views.INDEX:
                return <SpellingBee updateError={updateError} />
            case Views.ERROR:
                return <ErrorView error={error} />
            case Views.SETTINGS:
                return <Settings />
        }
    }

    return <>
        <div className="spelling-bee-helper sb-wordlist-box" style={{ minWidth: minWidth + "px" }}>
            <div className="spelling-bee-helper-title-container">
                <span className="spelling-bee-helper-main-title">
                    Spelling Bee Helper
                </span>
                <button
                    ref={settingButton}
                    className="spelling-bee-helper-settings-cog"
                    onClick={toggleSettings}>
                    <img
                        className="settings-cog"
                        src={settingsCog}
                        alt="Open settings" />
                    <img
                        className="back-arrow"
                        src={backArrow}
                        alt="Go back" />
                </button>
            </div>

            {renderView()}
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
        <SpellingBeeHelper />,
        document.getElementById(SPELLING_BEE_CONTENT_AREA)
    )
}

console.log("Loading Spelling Bee Helper.")
render()

export default SpellingBeeHelper