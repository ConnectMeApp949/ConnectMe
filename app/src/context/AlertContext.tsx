import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type AlertType = 'friendRequest' | 'bookingAccepted' | 'bookingReceived' | 'newMessage' | 'reviewReceived';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  onPress?: () => void;
}

interface AlertContextValue {
  currentAlert: AlertItem | null;
  showAlert: (type: AlertType, title: string, message: string, onPress?: () => void) => void;
  dismissAlert: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  currentAlert: null,
  showAlert: () => {},
  dismissAlert: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  const queueRef = useRef<AlertItem[]>([]);
  const idCounter = useRef(0);

  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setCurrentAlert(next);
    } else {
      setCurrentAlert(null);
    }
  }, []);

  const dismissAlert = useCallback(() => {
    showNext();
  }, [showNext]);

  const showAlert = useCallback((type: AlertType, title: string, message: string, onPress?: () => void) => {
    const item: AlertItem = {
      id: `alert-${++idCounter.current}`,
      type,
      title,
      message,
      onPress,
    };

    setCurrentAlert((prev) => {
      if (prev === null) {
        return item;
      }
      queueRef.current.push(item);
      return prev;
    });
  }, []);

  return (
    <AlertContext.Provider value={{ currentAlert, showAlert, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
