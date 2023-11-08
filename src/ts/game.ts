import { get, writable } from "svelte/store"
import { alphabet } from "./alphabet"
import { instantPopupsWritable } from "./instantpopups"

class Game {
    guesses: string[]
    boxes: ("empty" | "correct" | "semicorrect")[][]

    getColor(
        color: "empty" | "correct" | "semicorrect" | "none",
        keyboard = false
    ) {
        switch (color) {
            case "correct":
                return "#43B343"
            case "empty":
                return keyboard ? "dimgrey" : "#D3D3D3"
            case "semicorrect":
                return "#FFC300"
            case "none":
                return ""
        }
    }
    get coloredBoxes() {
        return this.boxes.map((row) =>
            row.map((color) => this.getColor(color))
        )
    }
    keyboardColors: {
        [key: string]: "none" | "empty" | "correct" | "semicorrect"
    }
    word: string
    started: number
    endTimer: false | number
    constructor(
        public wordLength: number,
        public maxGuesses: number,
        public guessesList: string[],
        public answersList: string[],
        customWord: false | string = false,
        public dailyWord = false,
    ) {
        const instantPopups = get(instantPopupsWritable)
        this.guesses = []
        this.boxes = [...Array(maxGuesses)].map(() => [...Array(wordLength)].map(() => "empty"))
        if (customWord && dailyWord) {
            console.log("📝 Using daily word!")
            if (instantPopups) instantPopups.add("Daily word detected & used!")
            this.word = customWord.toLowerCase()
        } else if (customWord &&
            customWord.split("").filter(l => alphabet.includes(l)).join("").length === customWord.length &&
            customWord.length === wordLength) {
            console.log("📝 Custom word detected!")
            if (instantPopups) instantPopups.add("Custom word detected & used!")
            this.word = customWord.toLowerCase()
        } else {
            this.word = answersList[Math.floor(Math.random() * answersList.length)]
        }
        if (!guessesList.includes(this.word)) guessesList.push(this.word)
        this.started = Date.now()
        this.endTimer = false
        this.keyboardColors = {}
        alphabet.forEach((letter) => (this.keyboardColors[letter] = "none"))
        // if (this.word) console.log(`Word is "${this.word}" (cheater 👀)`)
    }

    validateInput(input: string) {
        if (!input) return "Enter something!"
        if (input?.length < this.wordLength) return "Input too short!"
        if (input?.length > this.wordLength) return "Input too long!"
        if (this.guesses.includes(input)) return "Don't waste your guesses!"
        if (!this.guessesList.includes(input)) return `"${input}" is not a valid word!`
        return true
    }
}

const gameWritable = writable(new Game(0, 0, [], []))

export {
    Game,
    gameWritable
}

