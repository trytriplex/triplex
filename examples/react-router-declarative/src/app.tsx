import { Route, Routes } from "react-router";
import { Router } from "./router";
import { About } from "./routes/about";
import { Home } from "./routes/home";

export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<About />} path="about" />
      </Routes>
    </Router>
  );
}
