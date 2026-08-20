import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Only show the full-page loader for a short time.
  // If the backend is cold-starting on Render, don't block the UI —
  // let the user see the login/signup page while the backend wakes up.
  useEffect(() => {
    if (!isCheckingAuth) {
      setShowLoader(false);
      return;
    }
    const timer = setTimeout(() => setShowLoader(false), 1500);
    return () => clearTimeout(timer);
  }, [isCheckingAuth]);

  console.log({ authUser });

  if (isCheckingAuth && showLoader) return <PageLoader />;
  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-0 md:p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:18px_14px]" />
      <div className="absolute top-0 -left-4 size-96 bg-violet-700 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-pink-600 opacity-20 blur-[100px]" />
      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
        />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
