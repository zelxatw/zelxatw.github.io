// General Variables
let index = 0;
let startTime = 0;
let elapsedTime = 0;

// Normal Variables
let total = 0;
let streak = 0;
let lps = 0;
let completes = 0;

let word = "";
let lastWord = "";

// General Intervals
let timerInterval;

// Normal Word List
const wordList = [
  "apple", "banana", "grape", "orange", "lemon",
  "table", "chair", "mouse", "keyboard", "screen",
  "water", "cloud", "stone", "river", "mountain",
  "happy", "sadness", "joyful", "angry", "excited",
  "light", "dark", "shadow", "bright", "silent",
  "quick", "slowly", "jump", "run", "crawl",
  "dream", "night", "sleep", "wake", "thought",
  "world", "peace", "fight", "hope", "future",
  "code", "debug", "script", "function", "object",
  "array", "string", "number", "value", "variable"
];


function newWord() {
    if (index == 1) {
        do {
            word = wordList[Math.floor(Math.random() * wordList.length)];
        } while (word === lastWord);

        lastWord = word;

        console.log(`New Word: ${word}`);
        $("#word").text(word);
        $("#normalInput").focus();
        startTimer();
    }
}

function startTimer() {
    startTime = Date.now();

    timerInterval = setInterval(() => {
        elapsedTime = (Date.now() - startTime) / 1000;
        $("#timer").text(`Time: ${elapsedTime.toFixed(2)}s`);
    }, 100);
}

function checkAnswer() {
    const input = $("#normalInput").val().trim();
    if (input === word) {
        clearInterval(timerInterval);
        total++;
        if ($("#feedback").text() === "Incorrect! Try again.") {
            $("#feedback").text("");
        } else {
            streak++;
            completes++;
            lps = ((lps * (completes - 1)) + word.length / elapsedTime) / completes;
            $("#completes").text(completes);
            $("#streak").text(streak);
            $("#lps").text(lps.toFixed(2));
            $("#feedback").text("Correct! Well done!");
        }
        $("#accuracy").text(((completes / total) * 100).toFixed(2));
        $("#normalInput").val("");
        console.log("Correct Answer");
        localStorage.setItem("user", JSON.stringify({completes, streak, lps, total}));
        newWord();
    } else {
        streak = 0;
        $("#streak").text(`Streak: ${streak}`);
        $("#feedback").text("Incorrect! Try again.");
        $("#normalInput").val("");
        $("#normalInput").focus();
        console.log("Incorrect Answer");
    }
}

$(document).ready(function() {
    $("#normal").click(function () {
        $("#cover").hide();
        $("#home").show();
        $("#normalPage").show();

        const savedData = JSON.parse(localStorage.getItem("user"));
        if (savedData) {
            completes = savedData.completes || 0;
            streak = savedData.streak || 0;
            lps = savedData.lps || 0;
            total = savedData.total || 0;

            $("#completes").text(completes);
            $("#streak").text(streak);
            $("#lps").text(lps.toFixed(2));
            $("#accuracy").text(((completes / total) * 100).toFixed(2));
        } else {
            completes = 0;
            streak = 0;
            lps = 0;
            total = 0;

            $("#completes").text(0);
            $("#streak").text(0);
            $("#lps").text("0.00");
            $("#accuracy").text("0.00");
        }


        console.log("Normal Mode Selected");

        index = 1;
        newWord();
    });

    $("#home").click(function () {
        clearInterval(timerInterval);

        $(".page").hide();
        $("#cover").show();
        $("#home").hide();

        console.log("Home Page Selected");
    });

    $("#event").click(function () {

    });

    $("#stats").click(function () {

    });

    $("#settings").click(function () {

    });

    $("#normalInput").on("keypress", function(e) {
        if (e.key === "Enter") {
            checkAnswer();
        }
    });
});