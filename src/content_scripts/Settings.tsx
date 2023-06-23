import ToggleButton from "./controls/ToggleButton"

const SPH_GLOBAL_SETTINGS = "SPH_GLOBAL_SETTINGS"
export const GLOBAL_SETTING_SHOW_TOTALS = "SPH_GLOBAL_SETTING_SHOW_TOTALS"
export const GLOBAL_SETTING_SHOW_GRID = "SPH_GLOBAL_SETTING_SHOW_GRID"
export const GLOBAL_SETTING_SHOW_TWO_LETTER_LIST =
    "SPH_GLOBAL_SETTING_SHOW_TWO_LETTER_LIST"
export const GLOBAL_SETTING_SHOW_BEE_PHOTO =
    "SPH_GLOBAL_SETTING_SHOW_BEE_PHOTO"
export const GLOBAL_SETTING_SKIP_WELCOME_SCREEN =
    "SPH_GLOBAL_SETTING_SKIP_WELCOME_SCREEN"
export const GLOBAL_SETTING_SKIP_CONGRATS_SCREEN =
    "SPH_GLOBAL_SETTING_SKIP_CONGRATS_SCREEN"

const saveSetting = (key: string, value: boolean) => {
    let globalSettings = JSON.parse(
        window.localStorage.getItem(SPH_GLOBAL_SETTINGS) ?? "{}"
    )

    window.localStorage.setItem(SPH_GLOBAL_SETTINGS, JSON.stringify({
        ...globalSettings,
        [key]: value
    }))
}

export const getSetting = (key: string, defaultValue: any) => {
    let allIndexes = JSON.parse(
        window.localStorage.getItem(SPH_GLOBAL_SETTINGS) ?? "{}"
    )
    return allIndexes[key] ?? defaultValue
}

export const handleSettingToggle = (isToggled: boolean, tag: any) => {
    if (tag) {
        saveSetting(tag as string, isToggled)
    }
}

const Settings = () => {
    return <>
        <div className="spelling-bee-helper-settings-container">
            <p className="spelling-bee-helper-title">
                Settings
            </p>

            <ToggleButton
                label="Show totals"
                initialValue={getSetting(GLOBAL_SETTING_SHOW_TOTALS, true)}
                onChange={handleSettingToggle}
                tag={GLOBAL_SETTING_SHOW_TOTALS} />
            <ToggleButton
                label="Show spelling bee grid"
                initialValue={getSetting(GLOBAL_SETTING_SHOW_GRID, true)}
                onChange={handleSettingToggle}
                tag={GLOBAL_SETTING_SHOW_GRID} />
            <ToggleButton
                label="Show two letter list"
                initialValue={getSetting(GLOBAL_SETTING_SHOW_TWO_LETTER_LIST, true)}
                onChange={handleSettingToggle}
                tag={GLOBAL_SETTING_SHOW_TWO_LETTER_LIST} />
            <ToggleButton
                label="Show bee photo"
                initialValue={getSetting(GLOBAL_SETTING_SHOW_BEE_PHOTO, true)}
                onChange={handleSettingToggle}
                tag={GLOBAL_SETTING_SHOW_BEE_PHOTO} />
            <ToggleButton
                label="Skip welcome screen"
                initialValue={getSetting(GLOBAL_SETTING_SKIP_WELCOME_SCREEN, false)}
                onChange={handleSettingToggle}
                tag={GLOBAL_SETTING_SKIP_WELCOME_SCREEN} />
            <ToggleButton
                label="Skip congratulations screen"
                initialValue={getSetting(GLOBAL_SETTING_SKIP_CONGRATS_SCREEN, false)}
                onChange={handleSettingToggle}
                tag={GLOBAL_SETTING_SKIP_CONGRATS_SCREEN} />
        </div>
    </>
}

export default Settings