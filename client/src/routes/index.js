import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Flights from "../pages/flights/Flights";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/flights" element={<Flights />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
  