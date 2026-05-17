import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFoundPage } from "./pages/errors/NotFound404.tsx";

import { HomePage } from "./pages/Registration/HomePage.js";
import { LoginPage } from "./pages/Registration/LoginPage.js";
import { RegistrPage } from "./pages/Registration/RegistrPage.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
