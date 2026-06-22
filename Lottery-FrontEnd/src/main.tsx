import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* 1. Redux Store එක මුලින්ම මුළු ඇප් එකටම සම්බන්ධ කරනවා */}
    <Provider store={store}>
      {/* 2. අපේ Auth Context එක ඊළඟට සම්බන්ධ කරනවා */}
      <AuthProvider> 
        <App /> 
      </AuthProvider>
    </Provider>
  </StrictMode>
);