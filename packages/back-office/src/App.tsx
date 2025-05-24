import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from "@/containers/Login/LoginPage.tsx";
import Dashboard from "@/containers/Dashboard/Dashboard.tsx";
import NeighborhoodPage from "@/containers/Neighborhoods/NeighborhoodPage.tsx";
import UsersPage from "@/containers/Users/UsersPage.tsx";
import TicketsPage from "@/containers/Tickets/TicketsPage.tsx";
import PluginsThemesPage from "@/containers/PluginsThemes/PluginsThemesPage.tsx";
import NeighborhoodDetailsPage from "@/containers/NeighborhoodsDetails/NeighborhoodDetailsPage.tsx";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/neighborhoods" element={<NeighborhoodPage/>}/>
                <Route path="/users" element={<UsersPage/>}/>
                <Route path="/tickets" element={<TicketsPage/>}/>
                <Route path="/plugins-themes" element={<PluginsThemesPage/>}/>
                <Route path="/neighborhood-detail" element={<NeighborhoodDetailsPage/>}/>
            </Routes>
        </Router>
    )
}