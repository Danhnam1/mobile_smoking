import React, { createContext, useState, useContext } from "react";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [totalCount, setTotalCount] = useState(0);
  return (
    <NotificationContext.Provider value={{ totalCount, setTotalCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
