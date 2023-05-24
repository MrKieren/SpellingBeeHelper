import { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import SpellingBee from "./spellingbeehelper"
import ErrorView from "./errorview";

export const SPELLING_BEE_CONTENT_AREA = "spelling-bee-content-area"

export type UpdateErrorFunction = (newError: string) => void;

const enum Views {
    INDEX,
    ERROR
}

const SpellingBeeHelper = () => {
    const [currentView, setCurrentView] = useState(Views.INDEX)

    const [error, setError] = useState("test error")

    const updateError = (newError: string) => {
        setError(newError)
    }

    useEffect(() => {
        if (error.length > 0) {
            setCurrentView(Views.ERROR)
        } else {
            setCurrentView(Views.INDEX)
        }
    }, [error])

    const renderView = () => {
        switch (currentView) {
            case Views.INDEX:
                return <SpellingBee updateError={updateError} />
            case Views.ERROR:
                return <ErrorView error={error} />
        }
    }

    return <>
        <div className="spelling-bee-helper sb-wordlist-box">
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