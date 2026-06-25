import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../components/context";

export function MessageListener({ children }: { children: React.ReactNode }) {
  const { setError } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.runtime?.onMessage) return;

    const handler = (message: any) => {
      if (message.type === "HTTP_ERROR") {
        setError(message.error.message);
        navigate("/error");
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, [setError]);

  return <>{children}</>;
}
