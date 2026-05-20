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

function App() {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Game />} />
            <Route path="/game" element={<Game />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
