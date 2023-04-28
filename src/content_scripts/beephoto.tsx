type Props = {
    src: string,
    srcset: string,
    credit: string
}

const BeePhoto = ({
    src,
    srcset,
    credit
}: Props) => {
    return <>
        <div>
            <img
                className="spelling-bee-helper-bee-photo"
                src={src}
                srcSet={srcset}
                alt={credit} />
            <p className="spelling-bee-helper-bee-photo-credit">
                {credit}
            </p>
        </div>
    </>
}

export default BeePhoto