"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
const prompts_1 = require("./prompts");
const react_1 = require("./defaults/react");
const node_1 = require("./defaults/node");
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const apikey1 = process.env.GEMINI_API_KEY_1;
const apikey2 = process.env.GEMINI_API_KEY_2;
if (!apikey1) {
    throw new Error("Gemini API Key is missing!");
}
if (!apikey2) {
    throw new Error("Gemini API Key is missing!");
}
if (!port) {
    throw new Error("Port is missing!");
}
const genAI_1 = new generative_ai_1.GoogleGenerativeAI(apikey2);
const genAI_2 = new generative_ai_1.GoogleGenerativeAI(apikey2);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"],
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
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = req.body.prompt;
    console.log("Request body: ", req.body);
    console.log("Type of request body prompt: ", typeof (req.body.prompt));
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
        const result = yield model.generateContent({
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
                    prompts_1.BASE_PROMPT,
                    "Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n",
                ],
                uiPrompts: react_1.basePrompt,
            });
            console.log("Response has been sent from template endpoint.");
            return;
        }
        else if (ans === "node") {
            // clearTimeout(timeout);
            res.status(200).json({
                prompts: ['Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n'],
                uiPrompts: node_1.basePrompt,
            });
            console.log("Response has been sent from template endpoint.");
            return;
        }
        else {
            // clearTimeout(timeout);
            res.status(403).json({ message: "We are still working on these services!" });
            console.log("Response has been sent from template endpoint.");
            return;
        }
    }
    catch (error) {
        // clearTimeout(timeout);
        console.log("Error in gemini generation content: ", error);
    }
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    console.log("----------------------------------------------------------------------------------");
    console.log("Chat enpoint initiated");
    console.log("request message in chat endpoint: ", req.body);
    console.log("Type of message in chat endpoint: ", typeof (req.body.messages));
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
        const chat = model.startChat({
            tools: [
                {
                    codeExecution: {}
                }
            ]
        });
        const result = yield chat.sendMessageStream(message);
        let fullResponse = "";
        try {
            for (var _d = true, _e = __asyncValues(result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                fullResponse += chunk.text();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        console.log("Result: ", result);
        console.log("Response: ", result.response);
        console.log("Response in text: ", (yield result.response).text());
        console.log("Stream Response: ", result.stream);
        console.log("Full Response: ", fullResponse);
        res.json({ message: fullResponse });
        console.log("Chat endpoint response completed and sent.");
        // clearTimeout(timeout);
        return;
    }
    catch (error) {
        // clearTimeout(timeout);
        console.log("Error in startChat: ", error);
    }
}));
app.listen(port, () => {
    console.log("App is listening on port:", port);
});
