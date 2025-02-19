import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { basePrompt as nodeBasePrompt } from "./defaults/node";

dotenv.config();
const app = express();
const port = process.env.PORT;
const apikey = process.env.GEMINI_API_KEY;

if (!apikey) {
  throw new Error("Gemini API Key is missing!");
}

if (!port) {
  throw new Error("Port is missing!");
}

const genAI = new GoogleGenerativeAI(apikey);

app.use(express.json());
app.use(cors());

app.get("", (req, res) => {
  res.send("Hello, World!");
});

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    tools: [
      {
        codeExecution: {},
      },
    ],
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: 'You are a framework recommendation system. Your task is to return either "node" or "react" based on what you think this project should be. Only return a single word, either "node" or "react". Do not ask for clarifications or provide any extra information.',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    tools: [
      {
        codeExecution: {},
      },
    ],
  });

    console.log("Result: ", result);
    console.log("Response: ", result.response);
    console.log("Response in text: ", result.response.text());
  //   res.status(200).json({ message: "Generated Successfully", data: result });

  const ans = result.response.text().trim().toLowerCase(); //react or node
  console.log("Ans: ", ans);

  if (ans === "react") {
    res.status(200).json({
      prompts: [
        BASE_PROMPT,
        "Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n",
      ],
      uiPrompt: reactBasePrompt,
    });
    return;
  } else if (ans === "node"){
    res.status(200).json({
        prompts: ['Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n'],
        uiPrompt: nodeBasePrompt,
    });
    return;
  } else {
    res.status(403).json({message: "We are still working on these services!"});
    return;
  }
});

app.post("/chat", async (req, res) => {
    const message = req.body.message;
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
    });
    
    // const result = await model.generateContentStream({
    //     contents: [
    //         {
    //             role: 'user',
    //             parts: [
    //                 {
    //                     text: getSystemPrompt(),
    //                 }
    //             ]
    //         },
    //         {
    //             role: 'user',
    //             parts: [
    //                 {
    //                     text: message,
    //                 }
    //             ]
    //         }
    //     ]
    // });

    const chat = model.startChat({
        tools: [
            {
                codeExecution: {},
            }
        ]
    });

    const result = await chat.sendMessageStream(message);

    let fullResponse = "";
    for await (const chunk of result.stream){
        fullResponse+=chunk.text();
    }

    console.log("Result: ",result);
    console.log("Response: ", result.response);
    console.log("Response in text: ", (await result.response).text());
    console.log("Stream Response: ", result.stream);
    console.log("Full Response: ", fullResponse);
    res.json({message: fullResponse});
    return;
})

app.listen(port, () => {
  console.log("App is listening on port:", port);
});
