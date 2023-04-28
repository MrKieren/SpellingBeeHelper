import { useEffect, useState } from "react";

type Props = {
    src: string,
    srcset: string,
    credit: string
}

const DefaultPictureWidth = 1024

const BeePhoto = ({
    src,
    srcset,
    credit
}: Props) => {
    const [width, setWidth] = useState(DefaultPictureWidth)

    const [isOverlayVisible, setIsOverlayVisible] = useState(false)

    function showBeePictureOverlay() {
        setIsOverlayVisible(true)
    }

    function hideBeePictureOverlay() {
        setIsOverlayVisible(false)
    }

    useEffect(() => {
        if (isOverlayVisible) {
            document.addEventListener("click", hideBeePictureOverlay)
        } else {
            document.removeEventListener("click", hideBeePictureOverlay)
        }

        return () => {
            document.removeEventListener("click", hideBeePictureOverlay)
        }
    }, [isOverlayVisible])

    useEffect(() => {
        setWidth(
            parseInt(srcset.split(" ").pop() ?? DefaultPictureWidth.toString())
        )
    }, [srcset])

    return <>
        <div>
            <div onClick={showBeePictureOverlay}>
                <img
                    className="spelling-bee-helper-bee-photo-thumbnail"
                    src={src}
                    srcSet={srcset}
                    alt={credit} />
                <p className="spelling-bee-helper-bee-photo-credit">
                    {credit}
                </p>
            </div>

            {isOverlayVisible && (
                <div className="spelling-bee-helper-bee-photo-overlay">
                    <div className="spelling-bee-helper-bee-photo-overlay-content">
                        <p className="spelling-bee-helper-bee-photo-overlay-close">
                        </p>
                        <img
                            className="spelling-bee-helper-bee-photo-overlay-photo"
                            src={src}
                            srcSet={srcset}
                            alt={credit}
                            width={width} />
                        <p className="spelling-bee-helper-bee-photo-credit-overlay">
                            {credit}
                        </p>
                    </div>
                </div>
            )}
        </div>
    </>
}

export default BeePhoto