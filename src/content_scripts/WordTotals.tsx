type WordTotalsType = {
    words: number
    pangrams: number
    perfectPangrams: number
    points: number
}

type Props = {
    requiredWordTotals: WordTotalsType
}

const WordTotals = ({
    requiredWordTotals
}: Props) => {
    return <div className="word-totals">
        <p className="spelling-bee-helper-title">Totals</p>
        <p>
            WORDS: {requiredWordTotals.words},
            POINTS: {requiredWordTotals.points},
            PANGRAMS: {requiredWordTotals.pangrams}
            {requiredWordTotals.perfectPangrams > 0 ?
                <> ({requiredWordTotals.perfectPangrams} Perfect)</> :
                <></>}
        </p>
    </div>
}

export default WordTotals