import ToggleButton from './controls/ToggleButton'

const Settings = () => {
    return <>
        <div className="spelling-bee-helper-settings-container">
            <p className="spelling-bee-helper-title">
                Settings
            </p>

            <div>
                <ToggleButton label="Show totals" />
                <ToggleButton label="Show spelling bee grid" />
                <ToggleButton label="Show two letter list" />
                <ToggleButton label="Show bee photo" />
            </div>
        </div>
    </>
}

export default Settings