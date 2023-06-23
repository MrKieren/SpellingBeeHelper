import { useEffect, useState } from "react"

type Props = {
    label: string,
    initialValue: boolean,
    onChange: (isToggled: boolean, tag: any) => void,
    tag?: any
}

const ToggleButton: React.FC<Props> = ({ label, initialValue, onChange, tag }) => {
    const [isToggled, setIsToggled] = useState(initialValue)

    const handleToggle = () => {
        setIsToggled(!isToggled)
    }

    useEffect(() => {
        onChange(isToggled, tag)
    }, [isToggled, tag, onChange])

    return (
        <div className="spelling-bee-helper-toggle-button">
            <span className="spelling-bee-helper-toggle-button-label">
                {label}
            </span>
            <label className="spelling-bee-helper-switch">
                <input
                    type="checkbox"
                    onClick={handleToggle}
                    checked={isToggled} />
                <span className="spelling-bee-helper-slider spelling-bee-helper-round" />
            </label>
        </div>
    )
}

export default ToggleButton