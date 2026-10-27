import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Loginpage from "./pages/Loginpage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/Chatpage";
import { UserProvider } from "./context/UserContext.jsx";
import { ProtectedRoute } from "./components/auth";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Loginpage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}