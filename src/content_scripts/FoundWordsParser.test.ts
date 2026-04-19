import { updateWordLengthDisplay, updateFoundWords } from "./FoundWordsParser"

// Jest test framework uses describe, it, beforeEach, afterEach, expect as globals

// Mock the DOM for testing
const createMockWordList = (words: string[]): HTMLElement => {
    const wordList = document.createElement("div")
    wordList.className = "sb-wordlist-drawer"

    words.forEach((word) => {
        const wordElement = document.createElement("div")
        wordElement.className = "sb-anagram"
        wordElement.innerHTML = word
        wordList.appendChild(wordElement)
    })

    return wordList
}

// Test updateWordLengthDisplay function
describe("updateWordLengthDisplay", () => {
    beforeEach(() => {
        // Clear the document body before each test
        document.body.innerHTML = ""
    })

    it("does not modify DOM when word list is not found", () => {
        // Word list doesn't exist
        updateWordLengthDisplay()
        expect(console.log).not.toThrow()
    })

    it("modifies words with length when word list exists", () => {
        const mockWordList = createMockWordList(["Egging", "Binge", "Gibber"])
        document.body.appendChild(mockWordList)

        updateWordLengthDisplay()

        const words = document.getElementsByClassName("sb-anagram")
        expect(words.length).toBe(3)
        expect(words[0].innerHTML).toBe("Egging (6)")
        expect(words[1].innerHTML).toBe("Binge (5)")
        expect(words[2].innerHTML).toBe("Gibber (6)")
    })

    it("handles empty word list", () => {
        const mockWordList = createMockWordList([])
        document.body.appendChild(mockWordList)

        updateWordLengthDisplay()

        const words = document.getElementsByClassName("sb-anagram")
        expect(words.length).toBe(0)
    })

    it("calculates correct word length", () => {
        const mockWordList = createMockWordList(["A", "AB", "ABC", "LONGWORD"])
        document.body.appendChild(mockWordList)

        updateWordLengthDisplay()

        const words = document.getElementsByClassName("sb-anagram")
        expect(words.length).toBe(4)
        expect(words[0].innerHTML).toBe("A (1)")
        expect(words[1].innerHTML).toBe("AB (2)")
        expect(words[2].innerHTML).toBe("ABC (3)")
        expect(words[3].innerHTML).toBe("LONGWORD (8)")
    })

    it("does not double append length to already modified words", () => {
        const mockWordList = createMockWordList(["Egging (6)", "Binge (5)"])
        document.body.appendChild(mockWordList)

        updateWordLengthDisplay()

        const words = document.getElementsByClassName("sb-anagram")
        expect(words.length).toBe(2)
        expect(words[0].innerHTML).toBe("Egging (6)")
        expect(words[1].innerHTML).toBe("Binge (5)")
    })
})

// Test updateFoundWords function
describe("updateFoundWords", () => {
    beforeEach(() => {
        document.body.innerHTML = ""
    })

    it("returns correct data structure", () => {
        const mockWordList = createMockWordList(["Egging", "Binge", "Gibber"])
        document.body.appendChild(mockWordList)

        const result = updateFoundWords()

        expect(result).toBeDefined()
        expect(result.letterCounts).toBeInstanceOf(Map)
        expect(result.twoLetterCounts).toBeInstanceOf(Map)
        expect(result.wordLengthCounts).toBeInstanceOf(Map)
    })

    it("throws error when word list not found", () => {
        expect(() => updateFoundWords()).toThrow("Failed to find word list.")
    })

    it("handles empty word list by returning empty Maps", () => {
        const mockWordList = document.createElement("div")
        mockWordList.className = "sb-wordlist-drawer"
        document.body.appendChild(mockWordList)

        const result = updateFoundWords()

        expect(result.letterCounts.size).toBe(0)
        expect(result.twoLetterCounts.size).toBe(0)
        expect(result.wordLengthCounts.size).toBe(0)
    })
})

// Test updateWordLengthDisplay toggle functionality
describe("updateWordLengthDisplay toggle", () => {
    beforeEach(() => {
        document.body.innerHTML = ""
    })

    it("removes length display when toggle is set to false", () => {
        const mockWordList = createMockWordList(["Egging (6)", "Binge (5)"])
        document.body.appendChild(mockWordList)

        // First, make sure display is enabled
        updateWordLengthDisplay(true)

        const words = document.getElementsByClassName("sb-anagram")
        expect(words[0].innerHTML).toBe("Egging (6)")
        expect(words[1].innerHTML).toBe("Binge (5)")

        // Now disable the display
        updateWordLengthDisplay(false)

        // Check that the length display is removed
        expect(words[0].innerHTML).toBe("Egging")
        expect(words[1].innerHTML).toBe("Binge")
    })

    it("handles toggle on words without length display", () => {
        const mockWordList = createMockWordList(["Egging", "Binge"])
        document.body.appendChild(mockWordList)

        // Disable first (should do nothing)
        updateWordLengthDisplay(false)
        updateWordLengthDisplay(true)

        const words = document.getElementsByClassName("sb-anagram")
        expect(words[0].innerHTML).toBe("Egging (6)")
        expect(words[1].innerHTML).toBe("Binge (5)")
    })
})
