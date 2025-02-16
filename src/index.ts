// DOM Elements ids
const enum ELEMENT_IDS {
    generateButton = "generate",
    lastCfsInput = "last_cfs",
    rawDataInput = "raw_data",
    resOutput = "result",
    postScriptInput = "post",
    copyButton = "copy",
}

// DOM Elements
const generateButton = document.getElementById(
    ELEMENT_IDS.generateButton
) as HTMLButtonElement;
const lastCfsInput = document.getElementById(
    ELEMENT_IDS.lastCfsInput
) as HTMLInputElement;
const rawDataInput = document.getElementById(
    ELEMENT_IDS.rawDataInput
) as HTMLTextAreaElement;
const resOutput = document.getElementById(
    ELEMENT_IDS.resOutput
) as HTMLSpanElement;
const postScriptInput = document.getElementById(
    ELEMENT_IDS.postScriptInput
) as HTMLTextAreaElement;
const copyButton = document.getElementById(
    ELEMENT_IDS.copyButton
) as HTMLButtonElement;

// CONSTANTS
const CFS_PREFIX = "#TVcfs";
const CFS_FOOTER = `<br>___________<br>Link gửi cfs: https://docs.google.com/forms/d/e/1FAIpQLSem4l9lYH1Ldcl_7bSU7ZGF_FLvBc7V9lKZZFe6ygpofcLaxw/viewform?fbclid=IwAR01KKkvyuMXQvFaUK8kD-tZqi64toMNCGBms1Fgfx-TUccbcAapLEwoTzE`;
const LOCAL_STORAGE_LAST_CFS_KEY = "last_cfs";
const UPDATE_TIMEOUT_MS = 3000;

const savedLastCfs = localStorage.getItem(LOCAL_STORAGE_LAST_CFS_KEY);
if (savedLastCfs) {
    lastCfsInput.value = savedLastCfs;
}

// Generate CFS tag with prefix and ID
function generateCfsTag(id: number): string {
    return `${CFS_PREFIX}${id} `;
}

// For clearTimeout
let prevUpdateBorderTimer: number;

// Help user know that the output is updating
function updateResBorder() {
    clearTimeout(prevUpdateBorderTimer);

    resOutput.classList.add("updating");

    prevUpdateBorderTimer = setTimeout(() => {
        resOutput.classList.remove("updating");
    }, UPDATE_TIMEOUT_MS);
}

// Update value of lastCfsInput into localStorage
function updateLocalLastCfsId(lastCfsId?: number | string) {
    const idToUpdate = lastCfsId?.toString() || lastCfsInput.value;
    localStorage.setItem(LOCAL_STORAGE_LAST_CFS_KEY, idToUpdate);
}

// Get an array of confessions from copied Google Sheet data
function parseConfessions(rawData: string): string[] {
    let confessions = [""];

    let isInQuotes = false;

    for (let i = 0; i < rawData.length; ++i) {
        const currentCharacter = rawData[i];
        if (currentCharacter == '"') {
            isInQuotes = !isInQuotes;
        }

        if (currentCharacter == "\n") {
            if (isInQuotes) {
                // Break line if in quotes
                confessions[confessions.length - 1] += "<br>";
            } else {
                // Skip to next confession if is out of quotes
                confessions.push("");
            }
            continue;
        }

        confessions[confessions.length - 1] += currentCharacter;
    }
    return confessions;
}

// Generate final post with parsed confessions
function formatConfessions(confessions: string[]): string {
    const firstCfsId = Number(lastCfsInput.value) + 1;

    return confessions
        .reverse()
        .map((confession, index) => {
            const id = firstCfsId + index;
            return `${generateCfsTag(id)}${confession}`;
        })
        .join("<br><br>");
}

// Get P/s for the post
function getPostScript() {
    const postScript = postScriptInput.value.replace(/\n/g, "<br>");
    if (postScript) return `<br>___________<br>${postScript}`;
    return "";
}

// Runs whenever the input is changed
const handleChange = () => {
    updateResBorder();
    updateLocalLastCfsId();

    let rawData = rawDataInput.value;
    // Replace all double " with a single '
    rawData = rawData.replace(/""/g, "'");
    const parsedConfessions = parseConfessions(rawData);
    const formattedConfessions = formatConfessions(parsedConfessions);
    const postScript = getPostScript();

    // Update output
    resOutput.innerHTML = formattedConfessions + postScript + CFS_FOOTER;

    // Update saved id if confessions are not empty
    if (parsedConfessions[0].length > 0) {
        updateLocalLastCfsId(
            Number(lastCfsInput.value) + parsedConfessions.length
        );
    }
};

rawDataInput.oninput = handleChange;
lastCfsInput.oninput = handleChange;
postScriptInput.oninput = handleChange;

// For clearTimeout
let copyEffectTimer: number;

copyButton.onclick = () => {
    navigator.clipboard.writeText(resOutput.innerText);

    copyButton.classList.add("copied");
    copyButton.textContent = "Copied!";

    clearTimeout(copyEffectTimer);
    copyEffectTimer = setTimeout(() => {
        copyButton.classList.remove("copied");
        copyButton.textContent = "Copy";
    }, UPDATE_TIMEOUT_MS);
};
