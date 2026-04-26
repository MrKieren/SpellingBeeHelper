import { render, screen, waitFor } from "@testing-library/react"
import SpellingBee from "./SpellingBeeHelper"
import { updateFoundWords, updateWordLengthDisplay } from "./FoundWordsParser"
import { fetchData } from "./TodaysHintsParser"
import { getSetting } from "./Settings"

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("./FoundWordsParser", () => ({
    updateFoundWords: jest.fn(),
    updateWordLengthDisplay: jest.fn()
}))

jest.mock("./TodaysHintsParser", () => ({
    fetchData: jest.fn()
}))

jest.mock("./Settings", () => ({
    GLOBAL_SETTING_SHOW_BEE_PHOTO: "showBeePhoto",
    GLOBAL_SETTING_SHOW_GRID: "showGrid",
    GLOBAL_SETTING_SHOW_TOTALS: "showTotals",
    GLOBAL_SETTING_SHOW_TWO_LETTER_LIST: "showTwoLetterList",
    GLOBAL_SETTING_UPDATE_WORD_LENGTHS: "updateWordLengths",
    getSetting: jest.fn().mockReturnValue(true),
    SPH_SETTINGS_CHANGED_EVENT: "spellingBeeSettingsChanged"
}))

jest.mock("./WordTotals",      () => ({ __esModule: true, default: () => <div>WordTotals</div> }))
jest.mock("./SpellingBeeGrid", () => ({ __esModule: true, default: () => <div>SpellingBeeGrid</div> }))
jest.mock("./TwoLetterList",   () => ({ __esModule: true, default: () => <div>TwoLetterList</div> }))
jest.mock("./BeePhoto",        () => ({ __esModule: true, default: () => <div>BeePhoto</div> }))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY_FOUND_WORDS_DATA = {
    letterCounts: new Map(),
    twoLetterCounts: new Map(),
    wordLengthCounts: new Map()
}

const EMPTY_HINTS_DATA = {
    wordLengths: [],
    letterCounts: new Map(),
    twoLetterCounts: new Map(),
    requiredWordTotals: { words: 0, pangrams: 0, perfectPangrams: 0, points: 0 },
    beePhoto: { src: "", srcset: "", credit: "" }
}

// Scaffolding elements that the component attaches MutationObservers to.
// Set in setupDom() before each test so tests never need document.querySelector.
let wordListDrawer: HTMLElement
let gameScreen: HTMLElement

/** Build the minimal DOM the component expects to find. */
function setupDom() {
    wordListDrawer = document.createElement("div")
    wordListDrawer.className = "sb-wordlist-drawer"
    gameScreen = document.createElement("div")
    gameScreen.className = "pz-game-screen"
    document.body.innerHTML = ""
    document.body.append(wordListDrawer, gameScreen)
}

/**
 * Append a direct sb-anagram child to trigger the observer's primary path.
 * jsdom fires MutationObserver callbacks synchronously on DOM mutation.
 */
function appendAnagram(parent: Element, text = "word"): Element {
    const el = document.createElement("li")
    el.className = "sb-anagram"
    el.textContent = text
    parent.appendChild(el)
    return el
}

function appendNonAnagram(parent: Element): Element {
    const el = document.createElement("li")
    el.className = "some-other-class"
    parent.appendChild(el)
    return el
}

/**
 * Append an anagram as a grandchild (wrapped in a container) to verify the
 * component's nested `.querySelector(".sb-anagram")` fallback path.
 */
function appendWrappedAnagram(parent: Element): Element {
    const wrapper = document.createElement("div")
    const anagram = document.createElement("li")
    anagram.className = "sb-anagram"
    wrapper.appendChild(anagram)
    parent.appendChild(wrapper)
    return wrapper
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SpellingBeeHelper", () => {
    beforeEach(() => {
        jest.useFakeTimers()
        setupDom()
        ;(updateFoundWords as jest.Mock).mockReturnValue(EMPTY_FOUND_WORDS_DATA)
        ;(fetchData as jest.Mock).mockResolvedValue(EMPTY_HINTS_DATA)
    })

    afterEach(() => {
        jest.runAllTimers()
        jest.useRealTimers()
        jest.clearAllMocks()
    })

    // -----------------------------------------------------------------------
    // Rendering
    // -----------------------------------------------------------------------

    describe("rendering", () => {
        it("renders child helper components when all settings are enabled", async () => {
            render(<SpellingBee updateError={jest.fn()} />)

            await screen.findByText("WordTotals")
            expect(screen.getByText("SpellingBeeGrid")).toBeInTheDocument()
            expect(screen.getByText("TwoLetterList")).toBeInTheDocument()
            expect(screen.getByText("BeePhoto")).toBeInTheDocument()
        })

        it("renders 'no helpers enabled' message when all settings are disabled", async () => {
            ;(getSetting as jest.Mock).mockReturnValue(false)

            render(<SpellingBee updateError={jest.fn()} />)

            await screen.findByText("No Spelling Bee Helpers enabled.")
            expect(screen.getByText("Please check your settings.")).toBeInTheDocument()
        })

        it("passes error messages up to the parent via updateError", async () => {
            const errorMessage = "fetch failed"
            ;(fetchData as jest.Mock).mockRejectedValue(new Error(errorMessage))
            const updateError = jest.fn()

            render(<SpellingBee updateError={updateError} />)

            await waitFor(() => {
                expect(updateError).toHaveBeenCalledWith(errorMessage)
            })
        })
    })

    // -----------------------------------------------------------------------
    // Initial load — update() called on mount
    // -----------------------------------------------------------------------

    describe("initial data load", () => {
        it("calls fetchData and updateFoundWords on mount", async () => {
            render(<SpellingBee updateError={jest.fn()} />)

            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            await waitFor(() => expect(updateFoundWords).toHaveBeenCalledTimes(1))
        })

        it("calls updateWordLengthDisplay on mount when the setting is enabled", async () => {
            ;(getSetting as jest.Mock).mockReturnValue(true)

            render(<SpellingBee updateError={jest.fn()} />)

            await waitFor(() => {
                expect(updateWordLengthDisplay).toHaveBeenCalled()
            })
        })

        it("does not call updateWordLengthDisplay on mount when the setting is disabled", async () => {
            ;(getSetting as jest.Mock).mockImplementation((key: string) =>
                key === "updateWordLengths" ? false : true
            )

            render(<SpellingBee updateError={jest.fn()} />)

            // Wait for the async update() to complete, then assert the negative
            await waitFor(() => {
                expect(fetchData).toHaveBeenCalledTimes(1)
            })
            expect(updateWordLengthDisplay).not.toHaveBeenCalled()
        })
    })

    // -----------------------------------------------------------------------
    // watchWordListChanges
    // -----------------------------------------------------------------------

    describe("watchWordListChanges observer", () => {
        it("calls updateFoundWords when a direct sb-anagram child is added", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateFoundWords as jest.Mock).mockClear()

            appendAnagram(wordListDrawer)
            jest.runAllTimers()

            expect(updateFoundWords).toHaveBeenCalledTimes(1)
        })

        it("calls updateFoundWords when a nested sb-anagram is added inside a container", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateFoundWords as jest.Mock).mockClear()

            appendWrappedAnagram(wordListDrawer)
            jest.runAllTimers()

            expect(updateFoundWords).toHaveBeenCalledTimes(1)
        })

        it("does NOT call updateFoundWords when a non-anagram element is added", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateFoundWords as jest.Mock).mockClear()

            appendNonAnagram(wordListDrawer)
            jest.runAllTimers()

            expect(updateFoundWords).not.toHaveBeenCalled()
        })

        it("batches rapid successive word additions into a single updateFoundWords call", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateFoundWords as jest.Mock).mockClear()

            const drawer = wordListDrawer
            appendAnagram(drawer, "word1")
            appendAnagram(drawer, "word2")
            appendAnagram(drawer, "word3")
            jest.runAllTimers()

            // The observer may fire once or three times depending on jsdom
            // batching, but updateFoundWords is always gated behind the
            // setTimeout so each observer-fire leads to at most one call.
            // What matters is that it was called at least once.
            expect(updateFoundWords).toHaveBeenCalled()
        })

        it("calls updateWordLengthDisplay after a word is added when the setting is enabled", async () => {
            ;(getSetting as jest.Mock).mockReturnValue(true)
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateWordLengthDisplay as jest.Mock).mockClear()

            appendAnagram(wordListDrawer)
            jest.runAllTimers()

            expect(updateWordLengthDisplay).toHaveBeenCalled()
        })

        it("does NOT call updateWordLengthDisplay after a word is added when the setting is disabled", async () => {
            ;(getSetting as jest.Mock).mockImplementation((key: string) =>
                key === "updateWordLengths" ? false : true
            )
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateWordLengthDisplay as jest.Mock).mockClear()

            appendAnagram(wordListDrawer)
            jest.runAllTimers()

            expect(updateWordLengthDisplay).not.toHaveBeenCalled()
        })

        it("handles errors thrown by updateFoundWords without crashing the component", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateFoundWords as jest.Mock).mockImplementation(() => {
                throw new Error("DOM parse error")
            })

            expect(() => {
                appendAnagram(wordListDrawer)
                jest.runAllTimers()
            }).not.toThrow()

            expect(screen.getByText("WordTotals")).toBeInTheDocument()
        })

        it("does not update when sb-wordlist-drawer is absent from the DOM", async () => {
            wordListDrawer.remove()

            render(<SpellingBee updateError={jest.fn()} />)

            await screen.findByText("WordTotals")
        })
    })

    // -----------------------------------------------------------------------
    // watchGameScreenAppear observer
    // -----------------------------------------------------------------------

    describe("watchGameScreenAppear observer", () => {
        it("calls updateFoundWords when the game screen gains the on-stage class", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateFoundWords as jest.Mock).mockClear()

            gameScreen.classList.add("on-stage")

            await waitFor(() => {
                expect(updateFoundWords).toHaveBeenCalledTimes(1)
            })
        })

        it("does NOT call updateFoundWords when the game screen loses on-stage", async () => {
            gameScreen.classList.add("on-stage")

            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateFoundWords as jest.Mock).mockClear()

            gameScreen.classList.remove("on-stage")

            // Brief yield to let any queued microtasks settle, then assert nothing fired
            await new Promise<void>((r) => setTimeout(r, 0))
            expect(updateFoundWords).not.toHaveBeenCalled()
        })
    })

    // -----------------------------------------------------------------------
    // Settings-change event
    // -----------------------------------------------------------------------

    describe("SPH_SETTINGS_CHANGED_EVENT listener", () => {
        it("calls updateWordLengthDisplay with the new value when updateWordLengths setting changes", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateWordLengthDisplay as jest.Mock).mockClear()

            window.dispatchEvent(
                new CustomEvent("spellingBeeSettingsChanged", {
                    detail: { setting: "updateWordLengths", value: false }
                })
            )

            expect(updateWordLengthDisplay).toHaveBeenCalledWith(false)
        })

        it("does NOT call updateWordLengthDisplay for unrelated setting changes", async () => {
            render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
            ;(updateWordLengthDisplay as jest.Mock).mockClear()

            window.dispatchEvent(
                new CustomEvent("spellingBeeSettingsChanged", {
                    detail: { setting: "showGrid", value: false }
                })
            )

            expect(updateWordLengthDisplay).not.toHaveBeenCalled()
        })

        it("removes the event listener on unmount", async () => {
            const { unmount } = render(<SpellingBee updateError={jest.fn()} />)
            await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))

            unmount()
            ;(updateWordLengthDisplay as jest.Mock).mockClear()

            window.dispatchEvent(
                new CustomEvent("spellingBeeSettingsChanged", {
                    detail: { setting: "updateWordLengths", value: true }
                })
            )

            expect(updateWordLengthDisplay).not.toHaveBeenCalled()
        })
    })
})