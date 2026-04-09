import { createContext, useContext, useRef, useState } from "react";

export const ToastContext = createContext({
  showToast: () => {}
});

export default function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = (message, type = "info") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToast({ message, type });

    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return {
    toast,
    showToast
  };
}

export function useToastContext() {
  return useContext(ToastContext);
}