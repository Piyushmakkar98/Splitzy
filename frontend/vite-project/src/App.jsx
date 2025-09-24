import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ExpensesPage from "./pages/ExpensePage";
import GroupsPage from "./pages/GroupsPage";
import SettingsPage from "./pages/SettingsPage";
import GroupDetailPage from "./pages/GroupDetailPage";



function App(){
  return(
    <>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/groups" element={<GroupsPage />} /> 
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App;