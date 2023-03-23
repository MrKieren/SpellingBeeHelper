import { currentDate } from "./utils"

type TodaysHintsData = {
    wordLengths: Array<number>
    letterCounts: Map<string, Map<number, number>>
    twoLetterCounts: Map<string, number>
}

type SpellingBeeGridData = {
    wordLengths: Array<number>
    letterCounts: Map<string, Map<number, number>>
}

export async function fetchData(): Promise<TodaysHintsData> {
    const response = await fetch(
        `https://www.nytimes.com/${currentDate()}/crosswords/spelling-bee-forum.html`
    )
    if (!response.ok) {
        throw new Error(
            `Failed to access Today's Hints (error ${response.status}).`
        )
    }

    const html = await response.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    const interactiveBody =
        doc.getElementsByClassName("interactive-body")
    if (interactiveBody == null || interactiveBody.length !== 1) {
        throw new Error("Failed to find hints section on Today's Hints.")
    }

    const spellingBeeGridData = parseSpellingBeeGrid(interactiveBody[0])
    const twoLetterCounts = parseTwoLetterList(interactiveBody[0])
    return {
        wordLengths: spellingBeeGridData.wordLengths,
        letterCounts: spellingBeeGridData.letterCounts,
        twoLetterCounts: twoLetterCounts
    }
}

function parseSpellingBeeGrid(
    interactiveBody: Element
): SpellingBeeGridData {
    const grid = interactiveBody.getElementsByTagName("table")
    if (grid == null || grid.length !== 1) {
        throw new Error("Failed to find Spelling Bee Grid.")
    }

    const rows = grid[0].getElementsByTagName("tr")

    const wordLengths = new Array<number>()

    const wordCountCells = rows[0].getElementsByTagName("td")
    for (let i = 0; i < wordCountCells.length; i++) {
        const data = wordCountCells[i].textContent?.trim() ?? ""
        if (data === "-") {
            wordLengths.push(0)
        } else if (data.length > 0 && !isNaN(Number(data))) {
            wordLengths.push(Number(data))
        }
    }

    const letterCounts = new Map<string, Map<number, number>>()

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].getElementsByTagName("td")
        const rowLetter = row[0].textContent?.trim().replace(":", "") ?? ""
        if (rowLetter?.length === 0) {
            console.log("Failed to get row letter.")
            continue
        }

        letterCounts.set(rowLetter, new Map<number, number>())

        for (let j = 1; j < row.length; j++) {
            const data = row[j].textContent?.trim() ?? ""
            if (data === "-") {
                letterCounts.get(rowLetter)!.set(wordLengths[j - 1], 0)
            } else if (data.length > 0 && !isNaN(Number(data))) {
                letterCounts
                    .get(rowLetter)!
                    .set(wordLengths[j - 1], Number(data))
            }
        }
    }

    return { wordLengths, letterCounts }
}

function parseTwoLetterList(interactiveBody: Element): Map<string, number> {
    const pElements = interactiveBody.getElementsByTagName("p")
    if (pElements === null || pElements.length === 0) {
        console.log("Failed to find two letter list.")
        return new Map<string, number>()
    }

    const twoLetterList = pElements[pElements.length - 1]
        .getElementsByTagName("span")

    const twoLetterCounts = new Map<string, number>()
    for (let i = 0; i < twoLetterList.length; i++) {
        const data = twoLetterList[i].textContent?.trim() ?? ""
        const splitData = data.split(" ")

        for (let j = 0; j < splitData.length; j++) {
            const itemCount = splitData[j].split("-")
            if (itemCount.length !== 2) {
                console.log("Invalid two letter count: " + splitData[j])
                continue
            }

            twoLetterCounts.set(itemCount[0], Number(itemCount[1]))
        }
    }

    return twoLetterCounts
}