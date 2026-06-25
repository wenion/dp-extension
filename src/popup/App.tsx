import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import IndexPage from "./pages/IndexPage";
import SignInPage from "./pages/SignInPage";
import SiteAccessPromptPage from "./pages/SiteAccessPromptPage";


export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={<IndexPage />}
      />
      <Route
        path="/sign-in"
        element={<SignInPage />}
      />

      <Route
        path="/site-access-prompt"
        element={<SiteAccessPromptPage />}
      />
    </Routes>
  )
}
