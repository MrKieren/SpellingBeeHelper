import { useEffect } from "react"
import {
    GLOBAL_SETTING_SKIP_CONGRATS_SCREEN,
    GLOBAL_SETTING_SKIP_WELCOME_SCREEN,
    getSetting,
    handleSettingToggle
} from "./Settings"
import { render } from "react-dom"
import CheckBox from "./controls/CheckBox"

const GAME_MOMENTS = "js-hook-pz-moment__game"

const WELCOME_SCREEN = ".pz-moment__welcome"
const CONGRATS_SCREEN = ".pz-moment__congrats"

const BUTTON_WRAPPER = ".pz-moment__content"
const MOMENT_BUTTONS = ".pz-moment__button.primary.default"
const MOMENT_CLOSE_TEXT = ".pz-moment__close_text"

const SKIP_WELCOME_SECTION = "sbh-skip-welcome"
const SKIP_CONGRATS_SECTION = "sbh-skip-congrats"

const isScreenVisible = (className: string): boolean => {
    const el = document.querySelector(className) as HTMLElement | null
    if (!el) return false
    return el.offsetHeight > 0
}

const closeWelcomeScreen = () => {
    if (!isScreenVisible(WELCOME_SCREEN)) {
        return
    }

    const welcomeEl = document.querySelector(WELCOME_SCREEN) as HTMLElement
    const momentButton = welcomeEl.querySelector(MOMENT_BUTTONS) as HTMLButtonElement | null
    if (momentButton) momentButton.click()
}

const closeCongratsScreen = () => {
    if (!isScreenVisible(CONGRATS_SCREEN)) {
        return
    }

    const momentButtons =
        document.querySelector(MOMENT_CLOSE_TEXT) as HTMLButtonElement
    momentButtons.click()
}

const addButtonArea = (screenClassName: string, id: string): HTMLDivElement | null => {
    const screenEl = document.querySelector(screenClassName) as HTMLElement | null
    if (!screenEl) return null
 
    const buttonWrapper = screenEl.querySelector(BUTTON_WRAPPER) as HTMLDivElement | null
    if (!buttonWrapper) return null
 
    const existing = document.getElementById(id)
    if (existing) return existing as HTMLDivElement
 
    const container = document.createElement("div")
    container.id = id
    container.classList.add(id)
    buttonWrapper.appendChild(container)
    return container
}

const addAutoSkipWelcomeScreenOption = () => {
    if (!isScreenVisible(WELCOME_SCREEN)) {
        return
    }

    const container = addButtonArea(WELCOME_SCREEN, SKIP_WELCOME_SECTION)
    if (!container) return

    render(
        <CheckBox
            label="Skip this screen in the future"
            initialValue={getSetting(GLOBAL_SETTING_SKIP_WELCOME_SCREEN, false)}
            onChange={handleSettingToggle}
            tag={GLOBAL_SETTING_SKIP_WELCOME_SCREEN} />,
        container
    )
}

const addAutoSkipCongratsScreenOption = () => {
    if (!isScreenVisible(CONGRATS_SCREEN)) {
        return
    }

    const container = addButtonArea(CONGRATS_SCREEN, SKIP_CONGRATS_SECTION)

    render(
        <CheckBox
            label="Skip this screen in the future"
            initialValue={getSetting(GLOBAL_SETTING_SKIP_CONGRATS_SCREEN, false)}
            onChange={handleSettingToggle}
            tag={GLOBAL_SETTING_SKIP_CONGRATS_SCREEN} />,
        container
    )
}

const AutoStart = () => {
    useEffect(() => {
        const gameMoments = document.getElementById(GAME_MOMENTS)
        if (!gameMoments) {
            console.log("Failed to find game moment section.")
            return
        }

        const observer = new MutationObserver(() => {
            if (getSetting(GLOBAL_SETTING_SKIP_WELCOME_SCREEN, false)) {
                closeWelcomeScreen()
            } else {
                addAutoSkipWelcomeScreenOption()
            }

            if (getSetting(GLOBAL_SETTING_SKIP_CONGRATS_SCREEN, false)) {
                closeCongratsScreen()
            } else {
                addAutoSkipCongratsScreenOption()
            }
        })

        const observerConfig = {
            attributes: true,
            childList: true,
            subtree: true,
        }

        observer.observe(gameMoments, observerConfig)

        return () => {
            observer.disconnect()
        }
    }, [])

    return null // No UI.
}

export default AutoStart