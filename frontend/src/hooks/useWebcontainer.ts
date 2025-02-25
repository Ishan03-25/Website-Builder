// import { WebContainer } from "@webcontainer/api";
// import { useEffect, useState } from "react";

// export default function useWebcontainer() {
//   const [webcontainer, setWebcontainer] = useState<WebContainer>();

//   const main = async () => {
//     const webcontainerInstance = await WebContainer.boot();
//     setWebcontainer(webcontainerInstance);
//   };

//   useEffect(() => {
//     main();
//   }, []);

//   return;
// }

import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export default function useWebcontainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const initializeWebContainer = async () => {
      try {
        const webcontainerInstance = await WebContainer.boot();
        if (mounted) {
          setWebcontainer(webcontainerInstance);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    initializeWebContainer();

    return () => {
      mounted = false;
      webcontainer?.teardown();
    };
  });

  return { webcontainer, isLoading, error };
}