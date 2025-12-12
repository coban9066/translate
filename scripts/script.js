const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const inputLang = document.getElementById("inputLang");
const outputLang = document.getElementById("outputLang");
const speakBtn = document.getElementById("speakBtn");
const micBtn = document.getElementById("micBtn");

let speakerActive = false; // Başlangıç: kapalı
speakBtn.style.background = "#b30000"; 
speakBtn.classList.add("pulse");

/* ===== HOPARLÖR AÇ/KAPA ===== */
speakBtn.addEventListener("click", () => {
    speakerActive = !speakerActive;

    if (speakerActive) {
        speakBtn.style.background = "#333";     // aktif: gri
        speakBtn.classList.remove("pulse");     // animasyon dur
    } else {
        speakBtn.style.background = "#b30000";  // pasif: kırmızı
        speakBtn.classList.add("pulse");        // animasyon başla
    }
});

/* ===== METNİ SESLENDİR ===== */
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

/* ===== ÇEVİRİ ===== */
async function translate() {
    if (!inputText.value.trim()) return;

    const res = await fetch(
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(inputText.value) +
        "&langpair=" + inputLang.value + "|" + outputLang.value
    );

    const data = await res.json();
    outputText.value = data.responseData.translatedText;

    // hoparlör açık ise otomatik seslendir
    if (speakerActive && outputText.value.trim() !== "") {
        speakText();
    }
}

inputText.addEventListener("input", translate);
inputLang.addEventListener("change", translate);
outputLang.addEventListener("change", translate);

/* ===== MİKROFON ===== */
micBtn.addEventListener("click", () => {
    let recognition = new webkitSpeechRecognition();
    recognition.lang = inputLang.value;

    recognition.onresult = (e) => {
        inputText.value = e.results[0][0].transcript;
        translate();
    };

    recognition.start();
});
/* ===== MİKROFON ===== */
micBtn.addEventListener("click", () => {
    let recognition = new webkitSpeechRecognition();
    recognition.lang = inputLang.value;
    recognition.continuous = false;

    // Mikrofon çalışıyor → buton yeşil
    micBtn.style.background = "#00cc00";
    micBtn.classList.add("pulse");

    recognition.onresult = (e) => {
        inputText.value = e.results[0][0].transcript;
        translate();
    };

    // Konuşma bittiğinde → griye dön
    recognition.onend = () => {
        micBtn.style.background = "#333";
        micBtn.classList.remove("pulse");
    };

    recognition.start();
});
