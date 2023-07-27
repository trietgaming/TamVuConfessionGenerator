const generateBtnId = "generate";
const lastCfsInpId = "last_cfs";
const rawDataInpId = "raw_data";
const resOutId = "result";
const postId = "post";
const localLastCfsId = "last_cfs";

const generateBtn = document.getElementById(generateBtnId) as HTMLButtonElement;
const lastCfsInp = document.getElementById(lastCfsInpId) as HTMLInputElement;
const rawDataInp = document.getElementById(rawDataInpId) as HTMLTextAreaElement;
const resOut = document.getElementById(resOutId) as HTMLSpanElement;
const postInp = document.getElementById(postId) as HTMLTextAreaElement;

const cfsPrefix = "#TVcfs";
const cfsEnd = `<br>___________<br>Link gửi cfs: https://docs.google.com/forms/d/e/1FAIpQLSem4l9lYH1Ldcl_7bSU7ZGF_FLvBc7V9lKZZFe6ygpofcLaxw/viewform?fbclid=IwAR01KKkvyuMXQvFaUK8kD-tZqi64toMNCGBms1Fgfx-TUccbcAapLEwoTzE`

const lastCfsLocal = localStorage.getItem(localLastCfsId);
if (lastCfsLocal) lastCfsInp.value = lastCfsLocal;

function generateCfsTag(id : number) {
  return cfsPrefix + `${id}` + " ";
}

let prevTimeOut: number;
function updateResBorder() {
  clearTimeout(prevTimeOut);
  resOut.classList.add("updating");
  prevTimeOut = setTimeout(() => {
    resOut.classList.remove("updating");
  }, 3000)
}

const handleChange = () => {
  updateResBorder();

  resOut.textContent = "";
  localStorage.setItem(localLastCfsId, lastCfsInp.value);
  let currentCfsId = +lastCfsInp.value + 1;
  let rawData = rawDataInp.value;
  rawData = rawData.replace(/""/g, "'");
  let cfsArray = [""];
  for (let i = 0, inner = false; i < rawData.length; ++i) {
    const c = rawData[i];
    if (c == '"') {
      inner = !inner;
    };
    if (c == "\n") {
      if (inner) cfsArray[cfsArray.length - 1] += "<br>"
      else {
        cfsArray.push("");
      }
      continue;
    }
    cfsArray[cfsArray.length - 1] += c;
  }
  for (let i = cfsArray.length - 1; i >= 1; --i) {
    resOut.innerHTML += generateCfsTag(currentCfsId++) + cfsArray[i] + "<br><br>";
  } 
  if (cfsArray[0].length) {
    localStorage.setItem(localLastCfsId, currentCfsId + '');
    resOut.innerHTML += generateCfsTag(currentCfsId) + cfsArray[0];
  }
  
  const postScript = postInp.value.replace(/\n/g, "<br>");
  if (postScript) resOut.innerHTML += `<br>___________<br>` + postScript;
  resOut.innerHTML += cfsEnd;
}

rawDataInp.oninput = handleChange;
lastCfsInp.oninput = handleChange;
postInp.oninput = handleChange;

const copyBtnEl = document.getElementById("copy") as HTMLButtonElement;
let copyEffectTimeout: number;

copyBtnEl!.onclick = () => {
  navigator.clipboard.writeText(resOut.innerText as string) ;
  copyBtnEl?.classList.add("copied");
  copyBtnEl.textContent = "Copied!";
  clearTimeout(copyEffectTimeout);
  copyEffectTimeout = setTimeout(() => {
    copyBtnEl?.classList.remove("copied");
    copyBtnEl.textContent = "Copy"
  }, 3000)
}