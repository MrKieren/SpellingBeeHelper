type Props = {
    error: string
}

const ErrorView = ({ error }: Props) => {
    return <>
        <p className="spelling-bee-helper-error">{error}</p>
    </>
}

export default ErrorView