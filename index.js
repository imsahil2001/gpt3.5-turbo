import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

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

const GPT35TurboMessage = [
  { role: "system", content: `You are a Java developer.` },
  {
    role: "user",
    content: "Which npm package is best of openai api development?",
  },
  {
    role: "assistant",
    content: "The 'openai' Node.js library.",
  },
  { role: "user", content: "Tell me difference between loose coupling and tight coupling?" },
];

app.post("/", async (req, res) => {
  let a;
  // console.log(req.body);

  // const response = await openai.createCompletion({
  //   model: "text-davinci-003",
  //   prompt: req.body.prompt,
  //   temperature: 0.34,
  //   max_tokens: 461,
  //   top_p: 0.62,
  //   frequency_penalty: 0,
  //   presence_penalty: 0,
  // });
  const response = await openai.createCompletion({
    model: "gpt-3.5-turbo",
    messages: GPT35TurboMessage
  });

  // console.log(response.data.choices[0].text);
  console.log(response);
  res.status(200).send({
    reply: "hello"
  });
});

app.listen(5000, () => {
  console.log("Port: http://localhost:5000");
});
