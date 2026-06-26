type TodaysHintsData = {
    wordLengths: Array<number>
    letterCounts: Map<string, Map<number, number>>
    twoLetterCounts: Map<string, number>
    requiredWordTotals: WordTotals
    beePhoto: BeePhoto
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
        "https://www.nytimes.com/svc/spelling-bee/v1/active.json",
        { credentials: "include" }
    );
    if (!response.ok) {
        throw new Error(`Failed to access Today's Hints (error ${response.status}).`);
    }

    const json = await response.json();
    const todayId = json.today;
    const puzzle = json.puzzles?.[todayId];

    if (!puzzle) {
        throw new Error("Failed to find today's puzzle data.");
    }

    const answers: string[] = puzzle.answers;
    const pangrams: string[] = puzzle.pangrams;

    if (!answers || answers.length === 0) {
        throw new Error("Failed to find puzzle answers.");
    }
    if (!pangrams) {
        throw new Error("Failed to find puzzle pangrams.");
    }

    const allWords = answers.concat(pangrams);
    const wordLengths = deriveWordLengths(allWords);
    const letterCounts = deriveLetterCounts(allWords, wordLengths);
    const twoLetterCounts = deriveTwoLetterCounts(allWords);
    const requiredWordTotals = deriveWordTotals(allWords, pangrams);
    const beePhoto = await fetchBeePhoto().catch(() => ({ src: "", srcset: "", credit: "" }));

    return { wordLengths, letterCounts, twoLetterCounts, requiredWordTotals, beePhoto };
}

function deriveWordLengths(answers: string[]): number[] {
    const seen = new Set<number>();
    const lengths: number[] = [];
    for (const w of answers) {
        if (!seen.has(w.length)) { seen.add(w.length); lengths.push(w.length); }
    }
    return lengths.sort((a, b) => a - b);
}

function deriveLetterCounts(
    answers: string[],
    wordLengths: number[]
): Map<string, Map<number, number>> {
    const letterCounts = new Map<string, Map<number | undefined, number>>();

    const seenLetters = new Set<string>();
    const sortedLetters: string[] = [];
    for (const w of answers) {
        const l = w[0].toUpperCase();
        if (!seenLetters.has(l)) { seenLetters.add(l); sortedLetters.push(l); }
    }
    sortedLetters.sort();

    for (const letter of sortedLetters) {
        const lenMap = new Map<number | undefined, number>();
        for (const len of wordLengths) lenMap.set(len, 0);
        lenMap.set(undefined, 0);
        letterCounts.set(letter, lenMap);
    }

    // Σ row for column totals
    const sigmaMap = new Map<number | undefined, number>();
    for (const len of wordLengths) sigmaMap.set(len, 0);
    sigmaMap.set(undefined, 0);
    letterCounts.set("Σ", sigmaMap);

    for (const word of answers) {
        const letter = word[0].toUpperCase();
        const len = word.length;

        const letterMap = letterCounts.get(letter)!;
        letterMap.set(len, (letterMap.get(len) ?? 0) + 1);
        letterMap.set(undefined, (letterMap.get(undefined) ?? 0) + 1);

        sigmaMap.set(len, (sigmaMap.get(len) ?? 0) + 1);
        sigmaMap.set(undefined, (sigmaMap.get(undefined) ?? 0) + 1);
    }

    return letterCounts as unknown as Map<string, Map<number, number>>;
}

function deriveTwoLetterCounts(answers: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const word of answers) {
        const key = word.slice(0, 2).toUpperCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const sorted = Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
    const result = new Map<string, number>();
    for (const [k, v] of sorted) result.set(k, v);
    return result;
}

function deriveWordTotals(answers: string[], pangrams: string[]): WordTotals {
    const pangramSet = new Set(pangrams.map(w => w.toLowerCase()));

    // 4-letter words: 1 point, 5+ letter words: length points, pangrams: +7 bonus
    const points = answers.reduce((sum, word) => {
        const base = word.length === 4 ? 1 : word.length;
        const pangramBonus = pangramSet.has(word.toLowerCase()) ? 7 : 0;
        return sum + base + pangramBonus;
    }, 0);

    // Perfect pangrams use each of the 7 letters exactly once, so they're exactly 7 letters long
    const perfectPangrams = pangrams.filter(w => w.length === 7).length;

    return {
        words: answers.length,
        pangrams: pangrams.length,
        perfectPangrams,
        points,
    };
}

async function fetchBeePhoto(): Promise<BeePhoto> {
    const url = `https://www.nytimes.com/${getGameDate()}/crosswords/spelling-bee-forum.html`;
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error(`Photo fetch error ${response.status}`);

    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    return parseBeePhoto(doc);
}

function getGameDate(): string {
    const gameDate = document.getElementsByClassName("pz-game-date");
    if (gameDate == null || gameDate.length !== 1) {
        throw new Error("Failed to find game date.");
    }

    const gameDateString = gameDate[0].textContent;
    if (gameDateString == null || gameDateString.length === 0) {
        throw new Error("No game date data found.");
    }

    const date = new Date(gameDateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
}

function parseBeePhoto(doc: Document): BeePhoto {
    const pictureElement = doc.getElementsByTagName("picture");
    if (pictureElement == null || pictureElement.length !== 1) {
        throw new Error("Failed to find bee picture element.");
    }

    const beeImage = pictureElement[0].getElementsByTagName("img");
    if (beeImage == null || beeImage.length !== 1) {
        throw new Error("Failed to find bee image.");
    }

    const figCaptionElement = doc.getElementsByTagName("figCaption");
    if (figCaptionElement == null || figCaptionElement.length !== 1) {
        throw new Error("Failed to find bee picture credit element.");
    }

    let credit = "";
    const beeImageCredit = figCaptionElement[0].getElementsByTagName("span");
    for (let i = 1; i < beeImageCredit.length; i++) {
        const content = beeImageCredit[i].innerText ?? "";
        if (!content.includes("Courtesy of")) continue;
        credit = content;
        break;
    }

    return {
        src: beeImage[0].getAttribute("src") ?? "",
        srcset: beeImage[0].getAttribute("srcset") ?? "",
        credit,
    };
}
