type FoundWordsData = {
    letterCounts: Map<string, Map<number, number>>
    twoLetterCounts: Map<string, number>
    wordLengthCounts: Map<number, number>
}

export function updateFoundWords(): FoundWordsData {
    const wordList = document.getElementsByClassName("sb-wordlist-drawer")
    if (wordList == null || wordList.length !== 1) {
        throw new Error("Failed to find word list.")
    }

    const words = wordList[0].getElementsByClassName("sb-anagram")
    if (words == null) {
        throw new Error("Failed to find words in word list.")
    }

    const letterCounts = new Map<string, Map<number, number>>()
    const twoLetterCounts = new Map<string, number>()
    const wordLengthCounts = new Map<number, number>()

    for (let index = 0; index < words.length; index++) {
        const child = words[index]

        const word = child.innerHTML
        const firstLetter = word[0]

        if (!letterCounts.has(firstLetter)) {
            letterCounts.set(firstLetter, new Map<number, number>())
        }

        if (!letterCounts.get(firstLetter)?.get(word.length)) {
            letterCounts.get(firstLetter)?.set(word.length, 0)
        }

        const letterCount =
            letterCounts.get(firstLetter)?.get(word.length) ?? 0
        letterCounts.get(firstLetter)?.set(word.length, letterCount + 1)

        const firstTwoLetters = word[0] + word[1]
        if (!twoLetterCounts.has(firstTwoLetters)) {
            twoLetterCounts.set(firstTwoLetters, 0)
        }

        const twoLetterCount = twoLetterCounts.get(firstTwoLetters) ?? 0
        twoLetterCounts.set(firstTwoLetters, twoLetterCount + 1)

        const wordLength = word.length
        if (!wordLengthCounts.has(wordLength)) {
            wordLengthCounts.set(wordLength, 0)
        }

        const oldWordLength = wordLengthCounts.get(wordLength) ?? 0
        wordLengthCounts.set(wordLength, oldWordLength + 1)
    }

    return {
        letterCounts: letterCounts,
        twoLetterCounts: twoLetterCounts,
        wordLengthCounts: wordLengthCounts
    }
}