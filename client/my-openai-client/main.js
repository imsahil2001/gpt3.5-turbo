//import
import { v4 as uuidv4 } from 'uuid';
import pako from "pako";
import dotenv from "dotenv";

// dotenv.config();


// DOM selectors
const promptreply = document.getElementById("prompt-reply");
const promptInput = document.getElementById("prompt-input");
const systemTextarea = document.getElementById("systemTextarea");
const hamburger = document.getElementById("hamburger");
const rolesContainer = document.getElementById("roles-container");
const hamburgerCross = document.getElementById("hamburger-cross");

let globalPrompt = "";
let unZippedglobalPrompt;

window.addEventListener("load", () => {
  if (localStorage.getItem("globalPrompt") == null)
    localStorage.setItem("globalPrompt", globalPrompt);
  if (localStorage.getItem("systemPrompt") == null)
    localStorage.setItem("systemPrompt", systemTextarea.value);
  else
    systemTextarea.value = localStorage.getItem("systemPrompt");
})

let flag = 1;
const API_KEY = "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";

promptInput.addEventListener("keydown", async (e) => {
  if (e.keyCode == 13 && e.ctrlKey) {
    promptreply.innerHTML += `<div class="promptdiv"><p class="lighter">${promptInput.value}</p></div>`;
    promptreply.scrollIntoView({ behavior: "smooth", block: "end" });

    const query = promptInput.value;
    globalPrompt = localStorage.getItem("globalPrompt")
    globalPrompt += query;

    promptInput.value = '';
    try {
      // API call
      const fetchPromptReply = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          temperature: 0.5,
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
        const reply = await fetchPromptReply.json();
        console.log(reply.choices[0].message.content);
        const result = copyCode(reply.choices[0].message.content);
        const parsed = reply.choices[0].message.content.trim();

        // adding the response and prompts to later use it as prompt for summary
        globalPrompt += result + "\n";

        const uuid = uuidv4();
        promptreply.innerHTML += `<div id="${uuid}" class="biggerReplyContainer" >${result}</div>`;
        promptreply.scrollIntoView({ behavior: "smooth", block: "end" });

        setInterval(() => {
          promptreply.scrollTop = promptreply.scrollHeight;
        }, 2000);
      }


      const summarizeChat = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY,
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: `Convert our chat that we had all had into a short summarize for rememberence \n\n Our chat is as follows : ${globalPrompt}.`,
          temperature: 0,
          max_tokens: 278,
        }),
      });

      if (summarizeChat.ok) {
        const response = await summarizeChat.json();
        const summary = response.choices[0].text.trim();
        console.log(`Summary ->> ${summary}`);
        globalPrompt = summary;
        localStorage.setItem("globalPrompt", globalPrompt)
      }
    }
    catch (error) {
      console.error(error);
    }
  }
});


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

hamburger.addEventListener("click", () => {
  rolesContainer.style.left = "0%"
})

hamburgerCross.addEventListener("click", () => {
  rolesContainer.style.left = "-80%"
})


