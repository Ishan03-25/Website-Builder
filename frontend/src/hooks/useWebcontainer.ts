import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export default function useWebcontainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const main = async () => {
    try {
      const webcontainerInstance = await WebContainer.boot();
      setWebcontainer(webcontainerInstance);
      setIsLoading(false);
    } catch (err) {
      setError("Error in booting webcontainer instance: "+err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    main();
  }, []);

  return {webcontainer, isLoading, error} ;
}

// import { WebContainer } from "@webcontainer/api";
// import { useEffect, useState } from "react";

// export default function useWebcontainer() {
//   const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     const initializeWebContainer = async () => {
//       try {
//         const webcontainerInstance = await WebContainer.boot();
//         if (mounted) {
//           setWebcontainer(webcontainerInstance);
//           setIsLoading(false);
//         }
//       } catch (err) {
//         if (mounted) {
//           setError(err as Error);
//           setIsLoading(false);
//         }
//       }
//     };

//     initializeWebContainer();

//     return () => {
//       mounted = false;
//       webcontainer?.teardown();
//     };
//   });

//   return { webcontainer, isLoading, error };
// }

// hooks/useWebcontainer.ts
// import { useState, useEffect } from 'react';
// import { WebContainer } from '@webcontainer/api';

// // Module-level singleton management
// let webcontainerInstance: WebContainer | null = null;
// let activeCount = 0;

// export default function useWebcontainer() {
//   const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     async function init() {
//       try {
//         if (!window.self.crossOriginIsolated) {
//           throw new Error('Missing cross-origin isolation headers');
//         }

//         // Only boot if no instance exists
//         if (!webcontainerInstance) {
//           webcontainerInstance = await WebContainer.boot();
//         }

//         activeCount++;

//         if (isMounted) {
//           setWebcontainer(webcontainerInstance);
//         }
//       } catch (err) {
//         if (isMounted) setError(err as Error);
//       } finally {
//         if (isMounted) setIsLoading(false);
//       }
//     }

//     init();

//     return () => {
//       isMounted = false;
//       activeCount--;

//       // Only teardown when last consumer unmounts
//       if (activeCount === 0 && webcontainerInstance) {
//         webcontainerInstance.teardown();
//         webcontainerInstance = null;
//       }
//     };
//   }, []); // Empty dependency array = run only once

//   console.log("Error in webcontainer hook: ", error);

//   return { webcontainer, isLoading, error };
// }
