import { useEffect, useState } from "react"

type Props = {
    label: string,
    initialValue: boolean,
    onChange: (isToggled: boolean, tag: any) => void,
    tag?: any
}

const CheckBox: React.FC<Props> = ({ label, initialValue, onChange, tag }) => {
    const [isToggled, setIsToggled] = useState(initialValue)

    const handleToggle = (event: React.MouseEvent<HTMLLabelElement>) => {
        if (event.target === event.currentTarget) {
            setIsToggled(!isToggled)
        }
    }

    useEffect(() => {
        onChange(isToggled, tag)
    }, [isToggled, tag, onChange])

    return (
        <label className="sbh-check-box" onClick={handleToggle}>
            <input type="checkbox" />
            <span className="checkmark"></span>
            {label}
        </label>
    )
}

export default CheckBox