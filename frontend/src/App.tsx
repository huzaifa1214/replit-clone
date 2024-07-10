import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./components/Landing";
import Project from "./components/Project";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/project" element={<Project />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
