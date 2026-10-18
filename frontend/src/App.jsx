import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RegisterForm from './RegisterForm.jsx' 
import LoginForm from './LoginForm.jsx' 
import MainMenu from './MainMenu.jsx'         
import LevelsMenu from './LevelsMenu.jsx'
import GameScreen from './GameScreen.jsx'

function App() {
    // Читаем статус авторизации из localStorage при запуске приложения
    const [isAuthenticated] = useState(
        localStorage.getItem('isAuthenticated') === 'true'
    );

    return (
        <Router>
            <Routes>
                <Route path="/" element={isAuthenticated ? <MainMenu /> : <Navigate to="/login" />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/main-menu" element={isAuthenticated ? <MainMenu /> : <Navigate to="/login" />} />
                <Route path="/levels-menu" element={isAuthenticated ? <LevelsMenu /> : <Navigate to="/login" />} />
                <Route path="/game-screen" element={<GameScreen />} />
            </Routes>
        </Router>
    )
}

export default App