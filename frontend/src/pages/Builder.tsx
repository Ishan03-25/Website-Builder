// import { useLocation } from "react-router-dom";
// import { StepsList } from "../components/StepsList";
// import { useState } from "react";
// import { FileItem, Step } from "../types";
// import { Loader } from "../components/Loader";
// import { FileExplorer } from "../components/FileExplorer";
// import { TabView } from "../components/TabView";
// import CodeEditor from "../components/CodeEditor";
// import { PreviewFrame } from "../components/PreviewFrame";
// import useWebcontainer from "../hooks/useWebcontainer";

// export default function Builder() {
//   const location = useLocation();
//   const { prompt } = location.state as { prompt: string };
//   const [steps, setSteps] = useState<Step[]>([]);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [templateSet, setTemplateSet] = useState(false);
//   const [userPrompt, setUserPrompt] = useState("");
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
//   const [activeTab, setActiveTab] = useState<"code" || "preview">("code");
//   const webcontainer = useWebcontainer();
  
//   return (
//     <div className="min-h-screen bg-gray-900 flex flex-col">
//       <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
//         <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
//         <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
//       </header>

//       <div className="flex-1 overflow-hidden">
//         <div className="h-full grid grid-cols-4 gap-6 p-6">
//           <div className="col-span-1 space-y-6 overflow-auto">
//             <div>
//               <div className="max-h-[75vh] overflow-scroll">
//                 <StepsList
//                   key={steps.map((step) => step.id).join("-")}
//                   steps={steps}
//                   currentStep={currentStep}
//                   onStepClick={setCurrentStep}
//                 />
//               </div>
//               <div>
//                 <div className="flex">
//                   <br />
//                   {(loading || !templateSet) && <Loader />}
//                   {!(loading || !templateSet) && (
//                     <div className="flex">
//                       <textarea
//                         value={userPrompt}
//                         onChange={(e) => setUserPrompt(e.target.value)}
//                         className="p-2 w-full"
//                       />
//                       <button className="bg-purple-400 px-4">Send</button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="col-span-1">
//             <FileExplorer files={files} onFileSelect={setSelectedFile} />
//           </div>
//           <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
//             <TabView activeTab={activeTab} onTabChange={setActiveTab} />
//             <div className="h-[calc(100%-4rem)]">
//                 {activeTab === "code" ? (
//                     <CodeEditor file={selectedFile} />
//                 ) : (
//                     <PreviewFrame webContainer={webcontainer} />
//                 )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useLocation } from "react-router-dom";
import { StepsList } from "../components/StepsList";
import { useState } from "react";
import { FileItem, Step } from "../types";
import { Loader } from "../components/Loader";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
import CodeEditor from "../components/CodeEditor";
import { PreviewFrame } from "../components/PreviewFrame";
import useWebcontainer from "../hooks/useWebcontainer";

export default function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  
  // Updated webcontainer hook usage
  const { webcontainer, isLoading: wcLoading, error: wcError } = useWebcontainer();

  // Combine loading states
  const isInitializing = loading || wcLoading || !templateSet;

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
                  {isInitializing && <Loader />}
                  {!isInitializing && (
                    <div className="flex">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        className="p-2 w-full"
                      />
                      <button className="bg-purple-400 px-4">Send</button>
                    </div>
                  )}
                </div>
                {wcError && (
                  <div className="text-red-500 mt-2">
                    WebContainer error: {wcError.message}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : (
                webcontainer ? (
                  <PreviewFrame webContainer={webcontainer} />
                ) : (
                  <div className="text-gray-400 h-full flex items-center justify-center">
                    {wcLoading ? "Initializing WebContainer..." : "Preview unavailable"}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}