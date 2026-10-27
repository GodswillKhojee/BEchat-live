import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Loginpage from "./pages/Loginpage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/Chatpage";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Loginpage />} />
          {/* Not protected yet: add a route guard once JWT auth exists. */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}