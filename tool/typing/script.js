// General Variables
let index = 0;
let startTime = 0;
let elapsedTime = 0;

// Practice Variables
let practiceStats = {};
let word = "";
let lastWord = "";
let practiceMode = "word";
let letterTimings = [];
let lastKeystrokeTime = 0;
let letterStats = {};

// Settings
let settings = {
    darkMode: false,
    timer: true,
    autoFocus: true,
    sound: true,
    timerPrecision: 2,
    wordListSize: 'basic',
    minWordLength: 3,
    maxWordLength: 20
};

// General Intervals
let timerInterval;

// Word List
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
    "array", "string", "number", "value", "variable",
    "algorithm", "binary", "class", "const", "let",
    "loop", "condition", "boolean", "integer", "float",
    "compile", "execute", "error", "syntax", "logic",
    "network", "server", "client", "request", "response",
    "window", "document", "element", "event", "listener",
    "html", "css", "json", "api", "token",
    "game", "player", "level", "score", "bonus",
    "victory", "defeat", "enemy", "ally", "quest",
    "forest", "desert", "ocean", "castle", "village",
    "hero", "magic", "sword", "shield", "potion",
    "dragon", "phoenix", "wolf", "lion", "tiger",
    "energy", "power", "speed", "strength", "agility"
];

// Sentence List
const sentenceList = [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect.",
    "I am coding like a pro today.",
    "This is a sample sentence for testing.",
    "Never give up on your dreams.",
    "Coding is fun when you know what you're doing.",
    "Every bug you fix makes your code stronger.",
    "Stay positive, work hard, and make it happen.",
    "Debugging is like being the detective in a crime movie where you are also the murderer.",
    "Believe in yourself and all that you are.",
    "A journey of a thousand miles begins with a single step.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Keep calm and keep coding.",
    "Dream big, work hard, stay focused, and surround yourself with good people.",
    "The best way to predict the future is to invent it.",
    "Errors are proof that you are trying.",
    "Learning never exhausts the mind.",
    "Great things never come from comfort zones.",
    "Do something today that your future self will thank you for.",
    "The only limit to our realization of tomorrow is our doubts of today."
];

function getFilteredWordList() {
    return wordList.filter(w => 
        w.length >= settings.minWordLength && 
        w.length <= settings.maxWordLength
    );
}

function newWord() {
    if (index == 1) {
        const filteredWords = getFilteredWordList();
        
        if (practiceMode === "word") {
            if (filteredWords.length === 0) {
                word = wordList[Math.floor(Math.random() * wordList.length)];
            } else {
                do {
                    word = filteredWords[Math.floor(Math.random() * filteredWords.length)];
                } while (word === lastWord && filteredWords.length > 1);
            }
        } else if (practiceMode === "sentence") {
            do {
                word = sentenceList[Math.floor(Math.random() * sentenceList.length)];
            } while (word === lastWord);
        }

        lastWord = word;

        console.log(`New ${practiceMode === "word" ? "Word" : "Sentence"}: ${word}`);
        $("#word").text(word);
        
        if (settings.autoFocus) {
            $("#normalInput").focus();
        }
        startTimer();
    }
}

function startTimer() {
    startTime = Date.now();

    timerInterval = setInterval(() => {
        elapsedTime = (Date.now() - startTime) / 1000;
        if (settings.timer) $("#timer").text(`Time: ${elapsedTime.toFixed(settings.timerPrecision)}s`);
    }, 100);
}

function playSound(type) {
    if (!settings.sound) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'incorrect') {
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
}

function checkAnswer() {
    const input = $("#normalInput").val().trim();
    if (input === word) {
        clearInterval(timerInterval);
        practiceStats.total++;
        
        if ($("#feedback").hasClass("incorrect")) {
            $("#feedback").removeClass("incorrect").text("");
        } else {
            practiceStats.streak++;
            practiceStats.completes++;
            practiceStats.lps = ((practiceStats.lps * (practiceStats.completes - 1)) + word.length / elapsedTime) / practiceStats.completes;
            
            if (practiceStats.streak > practiceStats.bestStreak) {
                practiceStats.bestStreak = practiceStats.streak;
            }

            $("#completes").text(practiceStats.completes);
            $("#streak").text(practiceStats.streak);
            $("#lps").text(practiceStats.lps.toFixed(2));
            $("#feedback").removeClass("incorrect").addClass("correct").text("Correct! Well done!");
            
            playSound('correct');
        }
        
        $("#accuracy").text(((practiceStats.completes / practiceStats.total) * 100).toFixed(2));
        $("#normalInput").val("");
        console.log("Correct Answer");
        
        localStorage.setItem('userStats', JSON.stringify(practiceStats));
        
        startTime = 0;
        newWord();
    } else {
        practiceStats.streak = 0;
        $("#streak").text(practiceStats.streak);
        $("#feedback").removeClass("correct").addClass("incorrect").text("Incorrect! Try again.");
        $("#normalInput").val("");
        
        playSound('incorrect');
        
        if (settings.autoFocus) {
            $("#normalInput").focus();
        }
        console.log("Incorrect Answer");
    }
    calculateLetterAverages();
    letterTimings = [];
}

function calculateLetterAverages() {
    letterTimings.forEach(({ letter, time }) => {
        if (!letterStats[letter]) {
            letterStats[letter] = { total: 0, count: 0 };
        }
        letterStats[letter].total += time;
        letterStats[letter].count++;
    });

    console.log("Letter Averages:");
    for (const letter in letterStats) {
        const avg = letterStats[letter].total / letterStats[letter].count;
        console.log(`To ${letter}: ${avg.toFixed(3)}s`);
    }

    localStorage.setItem('letterStats', JSON.stringify(letterStats));
    updateLetterStatsDisplay();
}

function updateLetterStatsDisplay() {
    const container = $("#letterStatsContainer");
    
    if (Object.keys(letterStats).length === 0) {
        container.html('<p>No data available yet. Start practicing to see your letter statistics!</p>');
        return;
    }
    
    let html = '';
    const sortedLetters = Object.keys(letterStats).sort();
    
    sortedLetters.forEach(letter => {
        const avg = letterStats[letter].total / letterStats[letter].count;
        const displayLetter = letter === ' ' ? 'SPACE' : letter.toUpperCase();
        html += `
            <div class="letter-stat-item">
                <div style="font-weight: bold; font-size: 1.2em;">${displayLetter}</div>
                <div>${avg.toFixed(3)}s</div>
                <div style="font-size: 0.8em; opacity: 0.7;">(${letterStats[letter].count} times)</div>
            </div>
        `;
    });
    
    container.html(html);
}

function loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    
    $("#darkModeToggle").prop('checked', settings.darkMode);
    $("#timerToggle").prop('checked', settings.timer);
    $("#autoFocusToggle").prop('checked', settings.autoFocus);
    $("#soundToggle").prop('checked', settings.sound);
    $("#timerPrecision").val(settings.timerPrecision);
    $("#wordListSize").val(settings.wordListSize);
    $("#minWordLength").val(settings.minWordLength);
    $("#maxWordLength").val(settings.maxWordLength);
    
    applyTheme();
}

function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

function applyTheme() {
    if (settings.darkMode) {
        $('html').attr('data-theme', 'dark');
    } else {
        $('html').removeAttr('data-theme');
    }

    if (settings.timer) {
        $("#timer").removeClass("toggle-off");
    } else {
        $("#timer").addClass("toggle-off");
    }
}

$(document).ready(function() {
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
        practiceStats = JSON.parse(savedStats);
        console.log("Loaded Saved Free Practice Stats:", practiceStats);
    } else {
        practiceStats = {
            completes: 0,
            streak: 0,
            bestStreak: 0,
            lps: 0,
            total: 0
        };
        console.log("No Free Practice Stats Found");
    }

    const savedLetterStats = localStorage.getItem('letterStats');
    if (savedLetterStats) {
        letterStats = JSON.parse(savedLetterStats);
        console.log("Loaded Saved Letter Stats:", letterStats);
    } else {
        letterStats = {};
        console.log("No Letter Stats Found");
    }

    loadSettings();

    $("#normal").click(function () {
        $("#cover").hide();
        $("#home").show();
        $("#normalPage").show();

        $("#completes").text(practiceStats.completes);
        $("#streak").text(practiceStats.streak);
        $("#lps").text(practiceStats.lps.toFixed(2));
        $("#accuracy").text(practiceStats.total > 0 ? ((practiceStats.completes / practiceStats.total) * 100).toFixed(2) : "0.00");

        console.log("Free Practice Mode Selected");

        index = 1;
        newWord();
    });

    $("#home").click(function () {
        clearInterval(timerInterval);
        $(".page").hide();
        $("#cover").show();
        $("#home").hide();
        index = 0;
        console.log("Home Page Selected");
    });

    $("#stats").click(function () {
        $("#cover").hide();
        $("#home").show();
        $("#statPage").show();

        $("#statAttempts").text(practiceStats.total);
        $("#statCompletes").text(practiceStats.completes);
        $("#statAccuracy").text(practiceStats.total > 0 ? (practiceStats.completes/practiceStats.total*100).toFixed(2) : "0.00");
        $("#statStreak").text(practiceStats.streak);
        $("#statBestStreak").text(practiceStats.bestStreak);
        $("#statLPS").text(practiceStats.lps.toFixed(2));
        
        updateLetterStatsDisplay();
    });

    $("#settings").click(function () {
        $("#cover").hide();
        $("#home").show();
        $("#settingsPage").show();
    });

    $("#wordMode").click(function () {
        practiceMode = "word";
        $(this).addClass("active");
        $("#sentenceMode").removeClass("active");
        console.log("Practice Mode: Word");
        if (index === 1) newWord();
    });

    $("#sentenceMode").click(function () {
        practiceMode = "sentence";
        $(this).addClass("active");
        $("#wordMode").removeClass("active");
        console.log("Practice Mode: Sentence");
        if (index === 1) newWord();
    });

    $("#statGeneralBtn").click(function () {
        $(this).addClass("active");
        $("#statAdvancedBtn").removeClass("active");
        $("#statGeneral").addClass("active");
        $("#statAdvanced").removeClass("active");
    });

    $("#statAdvancedBtn").click(function () {
        $(this).addClass("active");
        $("#statGeneralBtn").removeClass("active");
        $("#statAdvanced").addClass("active");
        $("#statGeneral").removeClass("active");
        updateLetterStatsDisplay();
    });

    $("#darkModeToggle").change(function () {
        settings.darkMode = $(this).is(':checked');
        applyTheme();
        saveSettings();
    });

    $("#timerToggle").change(function () {
        settings.timer = $(this).is(':checked');
        applyTheme();
        saveSettings();
    });

    $("#autoFocusToggle").change(function () {
        settings.autoFocus = $(this).is(':checked');
        saveSettings();
    });

    $("#soundToggle").change(function () {
        settings.sound = $(this).is(':checked');
        saveSettings();
    });

    $("#timerPrecision").change(function () {
        settings.timerPrecision = parseInt($(this).val());
        saveSettings();
    });

    $("#wordListSize").change(function () {
        settings.wordListSize = $(this).val();
        saveSettings();
    });

    $("#minWordLength").change(function () {
        const value = parseInt($(this).val());
        if (value <= settings.maxWordLength) {
            settings.minWordLength = value;
            saveSettings();
        } else {
            $(this).val(settings.minWordLength);
            alert("Minimum word length cannot be greater than maximum word length!");
        }
    });

    $("#maxWordLength").change(function () {
        const value = parseInt($(this).val());
        if (value >= settings.minWordLength) {
            settings.maxWordLength = value;
            saveSettings();
        } else {
            $(this).val(settings.maxWordLength);
            alert("Maximum word length cannot be less than minimum word length!");
        }
    });

    $("#resetStats").click(function () {
        if (confirm("Are you sure you want to reset all statistics? This cannot be undone.")) {
            practiceStats = {
                completes: 0,
                streak: 0,
                bestStreak: 0,
                lps: 0,
                total: 0
            };
            
            localStorage.setItem('userStats', JSON.stringify(practiceStats));
            
            $("#statAttempts").text(0);
            $("#statCompletes").text(0);
            $("#statAccuracy").text("0.00");
            $("#statStreak").text(0);
            $("#statBestStreak").text(0);
            $("#statLPS").text("0.00");
            
            alert("All statistics have been reset!");
        }
    });

    $("#resetLetterStats").click(function () {
        if (confirm("Are you sure you want to reset letter statistics? This cannot be undone.")) {
            letterStats = {};
            localStorage.setItem('letterStats', JSON.stringify(letterStats));
            updateLetterStatsDisplay();
            alert("Letter statistics have been reset!");
        }
    });

    $("#resetSettings").click(function () {
        if (confirm("Are you sure you want to reset all settings to default?")) {
            settings = {
                darkMode: false,
                timer: true,
                autoFocus: true,
                sound: true,
                timerPrecision: 2,
                wordListSize: 'basic',
                minWordLength: 3,
                maxWordLength: 20
            };
            
            saveSettings();
            loadSettings();
            alert("Settings have been reset to default!");
        }
    });

    $("#normalInput").on("keypress", function(e) {
        const now = Date.now();

        if (lastKeystrokeTime !== 0) {
            const diff = (now - lastKeystrokeTime) / 1000;
            const letter = e.key;

            if (letter !== "Enter" && letter.length === 1) {
                console.log(`To ${letter}: ${diff.toFixed(3)}s`);
                letterTimings.push({ letter, time: diff });
            }
        }

        lastKeystrokeTime = now;

        if (e.key === "Enter") {
            checkAnswer();
            lastKeystrokeTime = 0;
        }
    });

    $("#normalInput").on("input", function() {
        const input = $(this).val();
        const currentWord = $("#word").text();
        
        if (currentWord.startsWith(input)) {
            $(this).css("border-color", "var(--input-border)");
        } else {
            $(this).css("border-color", "#f44336");
        }
    });

    updateLetterStatsDisplay();
});