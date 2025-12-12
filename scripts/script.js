const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const inputLang = document.getElementById("inputLang");
const outputLang = document.getElementById("outputLang");
const speakBtn = document.getElementById("speakBtn");
const micBtn = document.getElementById("micBtn");

let speakerActive = false;
speakBtn.style.background = "#b30000"; 

let recognition = null;
let micActive = false;

// ---------------- SESLENDİRME ----------------
function speakText() {
    let lang = outputLang.value;

    if (lang === "ar") {
        alert("Bu dilde sesli çeviri desteklenmiyor.");
        return;
    }

    const utter = new SpeechSynthesisUtterance(outputText.value);
    utter.lang = lang;
    speechSynthesis.speak(utter);
}

// ---------------- ÇEVİRİ ----------------
async function translate() {
    if (!inputText.value.trim()) return;

    const res = await fetch(
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(inputText.value) +
        "&langpair=" + inputLang.value + "|" + outputLang.value
    );

    const data = await res.json();
    outputText.value = data.responseData.translatedText;

    if (speakerActive && outputText.value.trim()) {
        speakText();
    }
}

// ---------------- MİKROFON ----------------
function setupMic() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Tarayıcı mikrofon desteklemiyor.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
}

setupMic();

micBtn.addEventListener("click", () => {
    if (!recognition) setupMic();

    if (!micActive) {
        inputText.value = ""; // temizle
        outputText.value = "";

        micActive = true;

        micBtn.classList.add("pulse");
        micBtn.style.background = "#00cc00";

        recognition.lang = inputLang.value;

        try {
            recognition.start();
        } catch (_) {
            recognition.stop();
            recognition.start();
        }
    } else {
        micActive = false;
        recognition.stop();
    }
});

// ---------------- MİK RESULT ----------------
recognition.onresult = (e) => {
    // SADECE inputText'e yaz → çeviriyi otomatik tetiklemiyoruz
    inputText.value = e.results[0][0].transcript;
};

// ---------------- MİK KAPANDI ----------------
recognition.onend = () => {
    micActive = false;
    micBtn.classList.remove("pulse");
    micBtn.style.background = "#333";

    // mikrofondan gelen yazı → textbox'a yazıldı → çeviri buradan çalışır
    if (inputText.value.trim()) {
        translate();
    }
};

// ---------------- HATA ----------------
recognition.onerror = () => {
    micActive = false;
    micBtn.classList.remove("pulse");
    micBtn.style.background = "#333";
    setupMic();
};

// ---------------- YAZI YAZILDIĞINDA OTOMATİK ÇEVİR ----------------
let typingTimer;
inputText.addEventListener("input", () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        if (inputText.value.trim()) translate();
    }, 500);
});

// ---------------- SES AÇ KAPAT ----------------
speakBtn.addEventListener("click", () => {
    speakerActive = !speakerActive;

    speakBtn.style.background = speakerActive ? "#333" : "#b30000";
});
