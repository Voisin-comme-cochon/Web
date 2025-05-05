import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from "@/containers/Login/LoginPage.tsx";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
            </Routes>
        </Router>
    )
}