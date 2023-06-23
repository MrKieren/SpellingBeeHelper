import { useEffect } from "react"
import {
    GLOBAL_SETTING_SKIP_CONGRATS_SCREEN,
    GLOBAL_SETTING_SKIP_WELCOME_SCREEN,
    getSetting,
    handleSettingToggle
} from "./Settings"
import { render } from "react-dom"
import CheckBox from "./controls/CheckBox"

const GAME_MOMENTS = "portal-game-moments"

const WELCOME_SCREEN = "js-hook-pz-moment__welcome"
const CONGRATS_SCREEN = "js-hook-pz-moment__congrats"

const BUTTON_WRAPPER = ".pz-moment__content"
const MOMENT_BUTTONS = ".pz-moment__button.primary.default"
const MOMENT_CONTAINER = ".pz-moment__container"
const MOMENT_CLOSE_TEXT = ".pz-moment__close_text"

const ON_STAGE = "on-stage"
const FLY_OUT = "fly-out"

const SKIP_WELCOME_SECTION = "sbh-skip-welcome"
const SKIP_CONGRATS_SECTION = "sbh-skip-congrats"

const isScreenVisible = (
    screen: string,
    mutationElement: HTMLElement
): boolean => {
    if (mutationElement.id !== screen) {
        return false
    }

    const screenElement = document.getElementById(screen)
    if (!screenElement) {
        return false
    }

    return screenElement.classList.contains(ON_STAGE) &&
        !screenElement.classList.contains(FLY_OUT)
}

const closeWelcomeScreen = (mutationElement: HTMLElement) => {
    if (!isScreenVisible(WELCOME_SCREEN, mutationElement)) {
        return
    }

    const loadingScreen =
        document.querySelector(MOMENT_CONTAINER) as HTMLElement
    loadingScreen.style.display = "none"

    const momentButton =
        mutationElement.querySelector(MOMENT_BUTTONS) as HTMLButtonElement
    momentButton.click()
}

const closeCongratsScreen = (mutationElement: HTMLElement) => {
    if (!isScreenVisible(CONGRATS_SCREEN, mutationElement)) {
        return
    }

    const momentButtons =
        document.querySelector(MOMENT_CLOSE_TEXT) as HTMLButtonElement
    momentButtons.click()
}

const addButtonArea = (mutationElement: HTMLElement, id: string): HTMLDivElement => {
    const buttonWrapper =
        mutationElement.querySelector(BUTTON_WRAPPER) as HTMLDivElement

    const container = document.createElement("div")
    if (!document.getElementById(id)) {
        container.id = id
        container.classList.add(id)
        buttonWrapper.appendChild(container)
    }

    return container
}

const addAutoSkipWelcomeScreenOption = (mutationElement: HTMLElement) => {
    if (!isScreenVisible(WELCOME_SCREEN, mutationElement)) {
        return
    }

    const container = addButtonArea(mutationElement, SKIP_WELCOME_SECTION)

    render(
        <CheckBox
            label="Skip this screen in the future"
            initialValue={getSetting(GLOBAL_SETTING_SKIP_WELCOME_SCREEN, false)}
            onChange={handleSettingToggle}
            tag={GLOBAL_SETTING_SKIP_WELCOME_SCREEN} />,
        container
    )
}

const addAutoSkipCongratsScreenOption = (mutationElement: HTMLElement) => {
    if (!isScreenVisible(CONGRATS_SCREEN, mutationElement)) {
        return
    }

    const container = addButtonArea(mutationElement, SKIP_CONGRATS_SECTION)

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

        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                const targetElement = mutation.target as HTMLElement

                if (getSetting(GLOBAL_SETTING_SKIP_WELCOME_SCREEN, false)) {
                    closeWelcomeScreen(targetElement)
                } else {
                    addAutoSkipWelcomeScreenOption(targetElement)
                }

                if (getSetting(GLOBAL_SETTING_SKIP_CONGRATS_SCREEN, false)) {
                    closeCongratsScreen(targetElement)
                } else {
                    addAutoSkipCongratsScreenOption(targetElement)
                }
            })
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