type Props = {
    label: string
}

const ToggleButton = ({ label }: Props) => {
    return (
        <div className="spelling-bee-helper-toggle-button">
            <span className="spelling-bee-helper-toggle-button-label">
                {label}
            </span>
            <label className="spelling-bee-helper-switch">
                <input type="checkbox" />
                <span className="spelling-bee-helper-slider spelling-bee-helper-round" />
            </label>
        </div>
    )
}

export default ToggleButton