import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PrintPaper from "./pages/PrintPaper";
import Centers from "./pages/Centers";
import Network from "./pages/Network";
import RegisterCenter from "./pages/RegisterCenter";
import ConsortiumMember from "./pages/ConsortiumMember";
import VotingPage from "./pages/VotingPage";
import Sidebar from "./components/layout/Sidebar";

function App() {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "#030303" }}>
      <Sidebar />
      <div style={{ flex: 1, height: "100vh", overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/print" element={<PrintPaper />} />
          <Route path="/centers" element={<Centers />} />
          <Route path="/network" element={<Network />} />
          <Route path="/apply" element={<RegisterCenter />} />
          <Route path="/consortium" element={<ConsortiumMember />} />
          <Route path="/vote" element={<VotingPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;