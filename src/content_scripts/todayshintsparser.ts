import { currentDate } from "./utils"

type TodaysHintsData = {
    wordLengths: Array<number>
    letterCounts: Map<string, Map<number, number>>
    twoLetterCounts: Map<string, number>
    requiredWordTotals: WordTotals
    beePhoto: BeePhoto
}

type SpellingBeeGridData = {
    wordLengths: Array<number>
    letterCounts: Map<string, Map<number, number>>
}

type WordTotals = {
    words: number
    pangrams: number
    perfectPangrams: number
    points: number
}

type BeePhoto = {
    src: string,
    srcset: string,
    credit: string
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
    const requiredWordTotals = parseStats(interactiveBody[0])
    const beePhoto = parseBeePhoto(doc)

    return {
        wordLengths: spellingBeeGridData.wordLengths,
        letterCounts: spellingBeeGridData.letterCounts,
        twoLetterCounts: twoLetterCounts,
        requiredWordTotals: requiredWordTotals,
        beePhoto: beePhoto
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

function getPElements(
    interactiveBody: Element
): HTMLCollectionOf<HTMLParagraphElement> {
    const pElements = interactiveBody.getElementsByTagName("p")
    if (pElements === null || pElements.length === 0) {
        throw new Error("Failed to find any hints in Today's Hints.")
    }
    return pElements
}

function parseTwoLetterList(interactiveBody: Element): Map<string, number> {
    const pElements = getPElements(interactiveBody)
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

function parseStats(interactiveBody: Element): WordTotals {
    const pElements = getPElements(interactiveBody)
    const stats = Array.from(pElements).find(element => {
        return element.innerHTML.includes("PANGRAMS")
    })
    if (stats === null) {
        throw new Error("Failed to find game stats.")
    }

    const content = stats?.innerHTML
    const contentParts = content?.split(",")

    var words = 0
    var pangrams = 0
    var perfectPangrams = 0
    var points = 0
    contentParts?.forEach(part => {
        if (part.includes("WORDS")) {
            words = Number(part.replace("WORDS:", "").trim())
        }

        if (part.includes("PANGRAMS")) {
            const pangramParts = part.split("(")
            pangrams = Number(pangramParts[0].replace("PANGRAMS:", "").trim())

            if (pangramParts.length === 2) {
                perfectPangrams = Number(
                    pangramParts[1].replace("Perfect)", "").trim()
                )
            }
        }

        if (part.includes("POINTS")) {
            points = Number(part.replace("POINTS:", "").trim())
        }
    })

    return {
        words: words,
        pangrams: pangrams,
        perfectPangrams: perfectPangrams,
        points: points
    }
}

function parseBeePhoto(doc: Document): BeePhoto {
    const pictureElement = doc.getElementsByTagName("picture")
    if (pictureElement == null || pictureElement.length !== 1) {
        throw new Error("Failed to find bee picture element.")
    }

    const beeImage = pictureElement[0].getElementsByTagName("img")
    if (beeImage == null || beeImage.length !== 1) {
        throw new Error("Failed to find bee image.")
    }

    const figCaptionElement = doc.getElementsByTagName("figCaption")
    if (figCaptionElement == null || figCaptionElement.length !== 1) {
        throw new Error("Failed to find bee picture credit element.")
    }

    var credit = ""
    const beeImageCredit = figCaptionElement[0].getElementsByTagName("span")
    for (let i = 1; i < beeImageCredit.length; i++) {
        const content = beeImageCredit[i].innerText ?? ""
        if (!content.includes("Courtesy of")) {
            continue
        }

        credit = content
        break
    }

    return {
        src: beeImage[0].getAttribute("src") ?? "",
        srcset: beeImage[0].getAttribute("srcset") ?? "",
        credit: credit
    }
}