import express, { text } from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { basePrompt as nodeBasePrompt } from "./defaults/node";

dotenv.config();
const app = express();
const port = process.env.PORT;
const apikey1 = process.env.GEMINI_API_KEY_1;
const apikey2 = process.env.GEMINI_API_KEY_2

if (!apikey1) {
  throw new Error("Gemini API Key is missing!");
}

if (!apikey2) {
  throw new Error("Gemini API Key is missing!");
}

if (!port) {
  throw new Error("Port is missing!");
}

const genAI_1 = new GoogleGenerativeAI(apikey2);
const genAI_2 = new GoogleGenerativeAI(apikey2);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET","POST"],
  credentials: true
}));
// app.use(cors({
//   origin: "https://localhost:5173",
//   methods: ['GET', 'POST'],
//   credentials: true,
// }));

app.get("", (req, res) => {
  res.send("Hello, World!");
});

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;
  console.log("Request body: ", req.body)
  console.log("Type of request body prompt: ", typeof(req.body.prompt));
  const model = genAI_1.getGenerativeModel({
    model: "gemini-1.5-pro",
    tools: [
      {
        codeExecution: {},
      },
    ],
  });

  // const controller = new AbortController();
  // const timeout = setTimeout(()=>controller.abort(), 5000);

  try {
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
      // tools: [
      //   {
      //     codeExecution: {},
      //   },
      // ],
    });
  
      console.log("Result: ", result);
      console.log("Response: ", result.response);
      console.log("Response in text: ", result.response.text());
    //   res.status(200).json({ message: "Generated Successfully", data: result });
  
    const ans = result.response.text().trim().toLowerCase(); //react or node
    // const ans = result.response.candidates[0].content.parts[0].text.trim().toLowerCase();
    console.log("Ans: ", ans);
  
    if (ans === "react") {
      // clearTimeout(timeout);
      res.status(200).json({
        prompts: [
          BASE_PROMPT,
          "Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n",
        ],
        uiPrompts: reactBasePrompt,
      });
      console.log("Response has been sent from template endpoint.")
      return;
    } else if (ans === "node"){
      // clearTimeout(timeout);
      res.status(200).json({
          prompts: ['Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n'],
          uiPrompts: nodeBasePrompt,
      });
      console.log("Response has been sent from template endpoint.")
      return;
    } else {
      // clearTimeout(timeout);
      res.status(403).json({message: "We are still working on these services!"});
      console.log("Response has been sent from template endpoint.")
      return;
    }
  } catch (error) {
    // clearTimeout(timeout);
    console.log("Error in gemini generation content: ", error);
  }
});

app.post("/chat", async (req, res) => {
  console.log("----------------------------------------------------------------------------------")
  console.log("Chat enpoint initiated");
  console.log("request message in chat endpoint: ", req.body);
  console.log("Type of message in chat endpoint: ", typeof(req.body.messages));
    const message = req.body.messages;
    const model = genAI_2.getGenerativeModel({
        model: "gemini-1.5-pro",
    });

    // const controller = new AbortController();
    // const timeout = setTimeout(()=>controller.abort(), 5000)

    try {

    //   const result = await model.generateContentStream({
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
      
    //   const chat = model.startChat({
    //     tools: [
    //         {
    //             codeExecution: {},
    //         }
    //     ],
    //     history: [
    //       {
    //         role: "user",
    //         parts: [{text: getSystemPrompt()}]
    //       }
    //     ]
    // });

    const chat  = model.startChat({
      tools: [
        {
          codeExecution: {}
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
    console.log("Chat endpoint response completed and sent.");
    // clearTimeout(timeout);
    return;
    } catch (error) {
      // clearTimeout(timeout);
      console.log("Error in startChat: ", error);
    }
})

app.listen(port, () => {
  console.log("App is listening on port:", port);
});
