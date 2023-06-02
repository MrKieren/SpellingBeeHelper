import ToggleButton from "./controls/ToggleButton"

const SPH_GLOBAL_SETTINGS = "SPH_GLOBAL_SETTINGS"
export const SPH_GLOBAL_SETTING_SHOW_TOTALS = "SPH_GLOBAL_SETTING_SHOW_TOTALS"
export const SPH_GLOBAL_SETTING_SHOW_GRID = "SPH_GLOBAL_SETTING_SHOW_GRID"
export const SPH_GLOBAL_SETTING_SHOW_TWO_LETTER_LIST =
    "SPH_GLOBAL_SETTING_SHOW_TWO_LETTER_LIST"
export const SPH_GLOBAL_SETTING_SHOW_BEE_PHOTO =
    "SPH_GLOBAL_SETTING_SHOW_BEE_PHOTO"

const saveSetting = (key: string, value: boolean) => {
    let globalSettings = JSON.parse(
        window.localStorage.getItem(SPH_GLOBAL_SETTINGS) ?? "{}"
    )

    window.localStorage.setItem(SPH_GLOBAL_SETTINGS, JSON.stringify({
        ...globalSettings,
        [key]: value
    }))
}

export const getSetting = (key: string) => {
    let allIndexes = JSON.parse(
        window.localStorage.getItem(SPH_GLOBAL_SETTINGS) ?? "{}"
    )
    return allIndexes[key] ?? true
}

const Settings = () => {
    const handleShowTotalsChange = (isToggled: boolean) => {
        saveSetting(SPH_GLOBAL_SETTING_SHOW_TOTALS, isToggled)
    }

    const handleShowSpellingBeeGridChange = (isToggled: boolean) => {
        saveSetting(SPH_GLOBAL_SETTING_SHOW_GRID, isToggled)
    }

    const handleShowTwoLetterListChange = (isToggled: boolean) => {
        saveSetting(SPH_GLOBAL_SETTING_SHOW_TWO_LETTER_LIST, isToggled)
    }

    const handleShowBeePhotoChange = (isToggled: boolean) => {
        saveSetting(SPH_GLOBAL_SETTING_SHOW_BEE_PHOTO, isToggled)
    }

    return <>
        <div className="spelling-bee-helper-settings-container">
            <p className="spelling-bee-helper-title">
                Settings
            </p>

            <div>
                <ToggleButton
                    label="Show totals"
                    initialValue={getSetting(SPH_GLOBAL_SETTING_SHOW_TOTALS)}
                    onChange={handleShowTotalsChange} />
                <ToggleButton
                    label="Show spelling bee grid"
                    initialValue={getSetting(SPH_GLOBAL_SETTING_SHOW_GRID)}
                    onChange={handleShowSpellingBeeGridChange} />
                <ToggleButton
                    label="Show two letter list"
                    initialValue={getSetting(SPH_GLOBAL_SETTING_SHOW_TWO_LETTER_LIST)}
                    onChange={handleShowTwoLetterListChange} />
                <ToggleButton
                    label="Show bee photo"
                    initialValue={getSetting(SPH_GLOBAL_SETTING_SHOW_BEE_PHOTO)}
                    onChange={handleShowBeePhotoChange} />
            </div>
        </div>
    </>
}

export default Settings