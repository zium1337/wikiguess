import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Game from "./pages/Game";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Stats from "./pages/Stats";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { LoadingProvider } from "./store/LoadingContext";
import { AuthProvider } from "./store/AuthContext";
import RequireAuth from "./components/AuthComponents/RequireAuth";
import RequireGuest from "./components/AuthComponents/RequireGuest";

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Game />} />
              <Route path="/game" element={<Game />} />
              <Route element={<RequireGuest />}>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
              </Route>
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/stats" element={<Stats />} />
              </Route>
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
