type FoundWordsData = {
    letterCounts: Map<string, Map<number, number>>
    twoLetterCounts: Map<string, number>
    wordLengthCounts: Map<number, number>
}

// Helper function to extract just the word, stripping any appended length
function extractWordFromElement(element: Element): string {
    const text = element.innerHTML.trim()
    // If text contains " (number)" at the end, extract just the word
    const match = text.match(/^([^(]+?)\s*\(\d+\)$/)
    if (match && match[1]) {
        return match[1].trim()
    }
    return text
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

        const word = extractWordFromElement(child)
        const firstLetter = word[0].toUpperCase()

        if (!letterCounts.has(firstLetter)) {
            letterCounts.set(firstLetter, new Map<number, number>())
        }

        if (!letterCounts.get(firstLetter)?.get(word.length)) {
            letterCounts.get(firstLetter)?.set(word.length, 0)
        }

        const letterCount =
            letterCounts.get(firstLetter)?.get(word.length) ?? 0
        letterCounts.get(firstLetter)?.set(word.length, letterCount + 1)

        const firstTwoLetters = (word[0] + word[1]).toUpperCase()
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

export function updateWordLengthDisplay(enabled: boolean = true): void {
    const wordList = document.getElementsByClassName("sb-wordlist-drawer")
    if (wordList == null || wordList.length !== 1) {
        console.log("Failed to find word list for length display.")
        return
    }

    const words = wordList[0].getElementsByClassName("sb-anagram")
    if (words == null) {
        console.log("Failed to find words in word list for length display.")
        return
    }

    for (let index = 0; index < words.length; index++) {
        const wordElement = words[index]
        const wordText = wordElement.innerHTML.trim()

        if (enabled) {
            // Add length display if not already present
            const existingMatch = wordText.match(/^([^(]+?)\s*\(\d+\)$/)
            if (existingMatch) {
                // Already has length, don't modify
                continue
            }
            const wordLength = wordText.length
            wordElement.innerHTML = `${wordText} (${wordLength})`
        } else {
            // Remove length display by extracting just the word
            const cleanedWord = extractWordFromElement(wordElement)
            if (cleanedWord !== wordText) {
                wordElement.innerHTML = cleanedWord
            }
        }
    }
}