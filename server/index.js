import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import fetch from "node-fetch";
import clc from "cli-color";
import timeout from "connect-timeout";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// cli colots constants
const error = clc.red.bold;
const warn = clc.yellow;
const notice = clc.blue;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const getResponse = async (prompt) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.34,
    max_tokens: 461,
    top_p: 0.62,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  // console.log(response.data.choices[0].text);
  return response.data.choices[0].text;
};

// getResponse();

app.get("/", (req, res) => {
  res.send("hello");
});


app.post("/getreply", timeout('90s'), async (req, res) => {
  console.log(req.body.messages);
  let reply = "";

  try {
    const fetchPromptReply = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        messages: req.body.messages
      }),
    });

    if (fetchPromptReply.ok) {
      reply = await fetchPromptReply.json();
      console.log(reply.choices[0].message.content);

      res.status(200).send({
        replyMessage: reply.choices[0].message.content
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      replyMessage: reply.choices[0].message.content
    });
  }
});

// to summazrize
app.post("/summarizing", async (req, res) => {
  console.log(req.body.globalPrompt);
  let reply = "";

  const summaryContext = `You are a great summarizer! Whenever the user and you have a chat about some topic you will make a summary of it in such a way that whenever you are given that prompt you would make a decent memory of it. One thing to note is not to add any extra points from your own just make summary of context you are given no anything outside.
  Context: '''
  ${req.body.globalPrompt}
  '''
  Summary:`;

  try {
    const summarizeChat = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: summaryContext,
        temperature: 0,
        max_tokens: 278,
      }),
    });

    if (summarizeChat.ok) {
      reply = await summarizeChat.json();
      console.log(reply.choices[0].text);

      res.status(200).send({
        summarizedMsg: reply.choices[0].text
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      replyMessage: reply.choices[0].text
    });
  }
});

app.listen(5000, () => {
  console.log("Port: http://localhost:5000");
});
