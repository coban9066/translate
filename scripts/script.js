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
let shouldTranslateOnEnd = false; // <-- ÇEVİRİ TETİKLEME KONTROLÜ

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

// ---------------- MİKROFON BUTONU ----------------
micBtn.addEventListener("click", () => {
    if (!recognition) setupMic();

    if (!micActive) {
        // Yeni dinleme → metinleri temizle
        inputText.value = "";
        outputText.value = "";

        micActive = true;
        shouldTranslateOnEnd = true; // <-- butonla kapatılsa bile çevir

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
        // Elle kapattın
        shouldTranslateOnEnd = true;
        micActive = false;
        recognition.stop();
    }
});

// ---------------- SONUÇ ----------------
recognition.onresult = (e) => {
    inputText.value = e.results[0][0].transcript;
};

// ---------------- MİK KAPANDIĞINDA ----------------
recognition.onend = () => {
    micActive = false;
    micBtn.classList.remove("pulse");
    micBtn.style.background = "#333";

    if (shouldTranslateOnEnd && inputText.value.trim() !== "") {
        translate();
    }

    shouldTranslateOnEnd = false; // tekrar tetiklememesi için sıfırla
};

// ---------------- HATA ----------------
recognition.onerror = () => {
    micActive = false;
    micBtn.classList.remove("pulse");
    micBtn.style.background = "#333";
    setupMic();
};

// ---------------- SES AÇ KAPA ----------------
speakBtn.addEventListener("click", () => {
    speakerActive = !speakerActive;

    if (speakerActive) {
        speakBtn.style.background = "#333";
        speakBtn.classList.remove("pulse");
    } else {
        speakBtn.style.background = "#b30000";
        speakBtn.classList.add("pulse");
    }
});
