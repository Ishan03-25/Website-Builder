import { useLocation } from "react-router-dom";
import { StepsList } from "../components/StepsList";
import { useEffect, useState } from "react";
import { FileItem, Step, StepType } from "../types";
// import { Loader } from "../components/Loader";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
// import CodeEditor from "../components/CodeEditor";
// import { PreviewFrame } from "../components/PreviewFrame";
// import useWebcontainer from "../hooks/useWebcontainer";
import type { FileSystemTree } from "@webcontainer/api";
import axios from "axios";
import { parseXml } from "../steps";

// type FileSystemTree = {
//   [key: string]: {
//     directory?: FileSystemTree;
//     file?: { contents: string };
//   };
// };

export default function Builder() {
  const location = useLocation();
  const [prompt, setPrompt] = useState("");
  const [uiPrompt, setUiPrompt] = useState("");
  const [CodePrompt, SetCodePrompt] = useState([]);
  // const { prompt } = location.state;
  console.log("location: ", location);
  // const prompt = "Create a todo app frontend in react";
  // console.log("Prompt in state: ", prompt);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  // const [loading] = useState(false);
  const [, setTemplateSet] = useState(false);
  // const [userPrompt, setUserPrompt] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  // const {
  //   webcontainer,
  //   isLoading: wcLoading,
  //   error: wcError,
  // } = useWebcontainer();
  // const isInitializing = loading || wcLoading || !templateSet;

  // console.log('WebContainer state:', {
  //   isLoading: wcLoading,
  //   error: wcError,
  //   instance: !!webcontainer
  // });

  useEffect(() => {
    if (location.state) {
      console.log("Location state: ", location);
      setPrompt(location.state[0]);
      setUiPrompt(location.state[1].uiPrompts);
      SetCodePrompt(location.state[1].prompts);
      console.log("Prompt: ", prompt);
      console.log("Code Prompt: ", CodePrompt);
      console.log("UiPrompt: ", uiPrompt);
    }
  });

  useEffect(() => {
    console.log("Initial Files: ", files);
    console.log("Processing Steps: ", steps);
    let originalFiles = { ...files };
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = { ...originalFiles };
          const finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            const currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              const file = currentFileStructure.find(
                (x) => x.name === currentFolderName
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                } as FileItem);
              } else {
                file.content = step.code;
              }
            } else {
              const folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                const newFolder: FileItem = {
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                };
                currentFileStructure.push(newFolder);
                currentFileStructure = newFolder.children as FileItem[];
              } else {
                currentFileStructure = folder.children || [];
              }
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(files);
      setSteps((steps) => {
        return steps.map((s) => ({
          ...s,
          status: "completed",
        }));
      });
    }
    console.log("Files at the end of useEffect: ", files);
  }, [files, steps]);

  // useEffect(()=>{
  //   const createMountStructure = (items: FileItem[]): Record<string, unknown> => {
  //     const mountStructure: Record<string, any> = {};
  //     const processFile = (file: FileItem, isRootFolder: boolean): Record<string, unknown> => {
  //       if (file.type==="folder"){
  //         mountStructure[file.name] = {
  //           directory: file.children ? Object.fromEntries(file.children.map((child)=>[child.name, processFile(child, false)])) : {},
  //         };
  //         return {directory: Children}
  //       } else if (file.type==="file"){
  //         if (isRootFolder) {
  //           mountStructure[file.name] = {
  //             file: {
  //               contents: file.content || ""
  //             }
  //           }
  //         } else {
  //           return {
  //             file: {
  //               contents: file.content || ""
  //             }
  //           }
  //         }
  //       }

  //       files.forEach((file)=>processFile(file, true));
  //       return mountStructure
  //     }
  //   };

  //   const mountStructure = createMountStructure(files);
  //   console.log(mountStructure);
  //   webcontainer?.mount(mountStructure);
  // }, [files]);

  useEffect(() => {
    const createMountStructure = (items: FileItem[]): FileSystemTree => {
      return items.reduce((acc, item) => {
        if (item.type === "folder") {
          acc[item.name] = {
            directory: createMountStructure(item.children || []),
          };
        } else {
          acc[item.name] = {
            file: {
              contents: item.content || "",
            },
          };
        }
        return acc;
      }, {} as FileSystemTree);
    };

    console.log("CreateMountStructure: ", createMountStructure);

    // if (webcontainer) {
    //   const mountStructure = createMountStructure(files);
    //   webcontainer.mount(mountStructure as unknown as FileSystemTree);
    // }
    // }, [files, webcontainer]);
  }, [files]);

  // async function init() {
  //   console.log("Init function started.");
  //   const res = await axios.post("http://localhost:3000/template", {
  //     prompt: prompt.trim()
  //   });
  //   console.log(res);
  //   setTemplateSet(true);
  //   const { prompts, uiPrompts } = res.data;
  //   setSteps(
  //     parseXml(uiPrompts[0].map((x: Step)=>({
  //       ...x,
  //       status: "pending"
  //     })))
  //   );
  //   const stepsResponse = await axios.post("http://localhost:3000/chat", {
  //     messages: [...prompts, prompt],
  //   });

  //   console.log("StepsResponse in frontend: ", stepsResponse);
  //   console.log("StepsResponse Data: ", stepsResponse.data);

  //   setSteps((s)=>[
  //     ...s,
  //     ...parseXml(stepsResponse.data).map((X)=>({
  //       ...X,
  //       status: "pending" as const,
  //     })),
  //   ]);
  // }

  // init();

  // In your useEffect for initialization
  // useEffect(() => {
  //   async function init() {
  //     try {
  //       console.log("Template Request initiated");
  //       console.log(
  //         "Prompt in template request: ",
  //         prompt,
  //         ";And its type: ",
  //         typeof prompt
  //       );
  //       const res = await axios.post(
  //         "http://localhost:3000/template",
  //         {
  //           prompt: prompt,
  //         },
  //         { timeout: 50000 }
  //       );

  //       console.log("Template Response: ", res.data);

  //       setTemplateSet(true);
  //       const { prompts, uiPrompts } = res.data;

  //       console.log("After template response, Prompts: ", prompts);
  //       console.log("uiPrompts: ", uiPrompts);

  //       const parsedSteps = parseXml(uiPrompts);

  //       setSteps(
  //         parsedSteps.map((x: Step) => ({
  //           ...x,
  //           status: "pending",
  //         }))
  //       );

  //       console.log("After Template Request, Steps: ", steps);

  //       try {
  //         console.log("Messages sending in chat endpoint: ", [
  //           ...prompts,
  //           prompt,
  //         ]);
  //         const messages = prompts.map((text: string) => ({
  //           role: "user",
  //           parts: [{ text: text }],
  //         }));
  //         messages.push({
  //           role: "user",
  //           parts: [{ text: prompt }],
  //         });
  //         const stepsResponse = await axios.post("http://localhost:3000/chat", {
  //           messages: [...prompts, prompt],
  //         });
  //         console.log("StepsResponse chat request: ", stepsResponse);

  //         const responseString =
  //           typeof stepsResponse.data === "string"
  //             ? stepsResponse.data
  //             : JSON.stringify(stepsResponse.data);

  //         const parsedStepsResponse = parseXml(responseString);
  //         setSteps((s) => [
  //           ...s,
  //           ...parsedStepsResponse.map((X) => ({
  //             ...X,
  //             status: "pending" as const,
  //           })),
  //         ]);
  //       } catch (error) {
  //         console.log("Error in chat request: ", error);
  //       }
  //     } catch (error) {
  //       console.log("Request error:", error);
  //       // Add proper error state handling
  //       setSteps([]);
  //       setTemplateSet(false);
  //     }
  //   }

  //   // Only run if prompt exists
  //   if (prompt) {
  //     init();
  //   }
  // }, [prompt]); // Add prompt as dependency

  // Remove the standalone init() call from the component body

  // if (activeTab==="preview" && !webcontainer) {
  //   <div className="text-red-500">
  //   WebContainer failed to initialize. Check console.
  // </div>
  // }

  useEffect(() => {
    async function handleChatRequest() {
      setTemplateSet(true);
      const parsedSteps = parseXml(uiPrompt);
      setSteps(
        parsedSteps.map((x) => ({
          ...x,
          status: "pending",
        }))
      );
      console.log("Handlechatrequest, steps: ", steps);
      // const messages = CodePrompt.map((text: string) => ({
      //   role: "user",
      //   parts: [{ text: text }],
      // }));
      // messages.push({
      //   role: "user",
      //   parts: [{ text: prompt }],
      // });
      // console.log("Messages: ", messages);
      try {
        const stepsReponse = await axios.post("http://localhost:3000/chat", {
          message: [...CodePrompt, prompt],
        });
        console.log("StepsResponse: ", stepsReponse.data);
        const responseString =
          typeof stepsReponse.data === "string"
            ? stepsReponse.data
            : JSON.stringify(stepsReponse.data);
        console.log("Response String: ", responseString);
        const parsedStepsResponse = parseXml(responseString);
        setSteps((s) => ({
          ...s,
          ...parsedStepsResponse.map((x) => ({
            ...x,
            status: "pending" as const,
          })),
        }));
      } catch (error) {
        console.log("Error in chat request: ", error);
        setSteps([]);
        setTemplateSet(false);
      }
    }

    if (prompt) {
      console.log("Chat request initiated");
      handleChatRequest();
    }
  }, [prompt]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList
                  key={steps.map((step) => step.id).join("-")}
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              <div>
                <div className="flex">
                  <br />
                  {/* {isInitializing && <Loader />} */}
                  {/* {!isInitializing && (
                    <div className="flex">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        className="p-2 w-full"
                      />
                      <button className="bg-purple-400 px-4">Send</button>
                    </div>
                  )} */}
                </div>
                {/* {wcError && (
                  <div className="text-red-500 mt-2">
                    WebContainer error: {wcError}
                  </div>
                )} */}
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {/* {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : webcontainer ? (
                <PreviewFrame webContainer={webcontainer} files={files} />
              ) : (
                <div className="text-gray-400 h-full flex items-center justify-center">
                  {wcLoading
                    ? "Initializing WebContainer..."
                    : "Preview unavailable"}
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
