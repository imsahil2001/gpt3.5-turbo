//import
import { v4 as uuidv4 } from 'uuid';

// DOM selectors
const promptreply = document.getElementById("prompt-reply");
const promptInput = document.getElementById("prompt-input");
const promptContainer = document.querySelector(".prompt-container");
const systemTextarea = document.getElementById("systemTextarea");
const hamburger = document.getElementById("hamburger");
const rolesContainer = document.getElementById("roles-container");
const hamburgerCross = document.getElementById("hamburger-cross");
const sendBtn = document.getElementById("send");

let globalPrompt = ""; //var to store the sumarry of prompt and reply bundle throught the chat
let height = 0; // height for promptInput to adjust height of promptContainer

// setting localStorages on load
window.addEventListener("load", () => {
  if (localStorage.getItem("globalPrompt") == null)
    localStorage.setItem("globalPrompt", globalPrompt);
  if (localStorage.getItem("systemPrompt") == null)
    localStorage.setItem("systemPrompt", systemTextarea.value);
  else
    systemTextarea.value = localStorage.getItem("systemPrompt");
})


// adjusting height of promptInput and then adjusting promptContainer's height as well
promptInput.addEventListener("input", () => {
  promptInput.style.height = "5px";
  promptInput.style.height = (promptInput.scrollHeight) + "px";
  if (promptInput.clientHeight > height) {
    height = promptInput.clientHeight;
    promptContainer.style.height = (height * 0.06 + 2) + "rem";
  }
})


// calling API on btn send click
send.addEventListener("click", () => {
  callToOpenAI();
})

// fcn to call to server
const callToOpenAI = async () => {
  promptreply.innerHTML += `<div class="promptdiv"><p class="lighter">${promptInput.value}</p></div>`;
  promptreply.scrollIntoView({ behavior: "smooth", block: "end" });

  const query = promptInput.value;
  globalPrompt = localStorage.getItem("globalPrompt")
  globalPrompt += query;

  promptInput.value = '';
  try {
    // API call to server
    const fetchPromptReply = await fetch("http://localhost:5000/getreply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: localStorage.getItem("systemPrompt"),
          },
          {
            role: 'user',
            content: globalPrompt,
          },
        ]
      }),
    });

    // storing in local storage
    localStorage.setItem("globalPrompt", globalPrompt);

    if (fetchPromptReply.ok) {
      const promptResponse = await fetchPromptReply.json();
      console.log(promptResponse.replyMessage);
      const result = copyCode(promptResponse.replyMessage);

      // adding the response and prompts to later use it as prompt for summary
      globalPrompt += promptResponse.replyMessage.trim() + "\n";

      const uuid = uuidv4();
      // result += "\n";
      promptreply.innerHTML += `<div id="${uuid}" class="biggerReplyContainer"> ${result} <br></div>`;
      promptreply.scrollIntoView({ behavior: "smooth", block: "end" });

      setInterval(() => {
        promptreply.scrollTop = promptreply.scrollHeight;
      }, 2000);
    }


    const summarizeChat = await fetch("http://localhost:5000/summarizing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        globalPrompt: globalPrompt
      }),
    });

    if (summarizeChat.ok) {
      const response = await summarizeChat.json();
      const summary = response.summarizedMsg;
      console.log(`Summary ->> ${summary} `);
      globalPrompt = summary;
      localStorage.setItem("globalPrompt", globalPrompt)
    }
  }
  catch (error) {
    console.error(error);
  }
}


promptInput.addEventListener("keydown", async (e) => {
  if (e.keyCode == 13 && e.ctrlKey) {
    callToOpenAI();
  }
});

//if reply has code in it, will add pre and code tag to the reply
const copyCode = (content) => {

  const size = content.length;
  let i = 0;
  let flag = 0;
  let preindex;
  let result = `<p class="darker">`;

  for (i = 0; i < size; i++) {
    if (content.charAt(i) == '`' && flag == 0) {
      if (content.charAt(i + 1) == '`' && content.charAt(i + 2) == '`') {
        i += 2;
        flag = 1;
        preindex = i + 1;
      }
    } else if (flag == 1 && i === preindex) {
      result += `</p><pre><div class="codingdiv"><code>`
    } else if (content.charAt(i) == '`' && flag == 1 && i + 2 < size) {
      if (content.charAt(i + 1) == '`' && content.charAt(i + 2) == '`') {
        i += 2;
        flag = 0;
        result += `</code></div></pre><p class="darker">`
      }
    } else {
      result += content.charAt(i);
    }
  }

  result += `</p>`;
  console.log(result);
  return result;

}

//ctrl+enter send 
systemTextarea.addEventListener("keyup", (e) => {
  localStorage.setItem("systemPrompt", systemTextarea.value);
})

const globalPromptString = async () => {
  try {
    const compressedGlobalPrompt = localStorage.getItem("globalPrompt");
    const uncompressedGlobalPrompt = pako.ungzip(compressedGlobalPrompt, { to: 'string' })
    return uncompressedGlobalPrompt;
  } catch (error) {
    console.error(error);
  }
}

// ham burger opening and closing calls
hamburger.addEventListener("click", () => {
  rolesContainer.style.left = "0%"
})

hamburgerCross.addEventListener("click", () => {
  rolesContainer.style.left = "-80%"
})


