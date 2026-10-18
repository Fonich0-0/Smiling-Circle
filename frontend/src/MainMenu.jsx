import { useState } from 'react' 
import { useNavigate } from 'react-router-dom'
import "./css/main_menu.css"


function MainMenu () {
    const navigate = useNavigate()
    function handleAccount () {
        navigate('/levels-menu')
    }
    function handleClick () {
        navigate('/levels-menu')
        }
        return (
            <div className="background">
                <nav>
                    <button className="account" onClick={handleAccount}>Ваш аккаунт: 👤 </button>
                </nav>
                <div className="first-buttons">
                    <button className="start" onClick={handleClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
                    </button>
                </div>


                <div className="styled-wrapper">
                    <button name="checkbox" type="button" />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        )
}

export default MainMenu