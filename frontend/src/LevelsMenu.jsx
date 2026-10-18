import { useState } from 'react' 
import { useNavigate } from 'react-router-dom'

function LevelsMenu () {
    const navigate = useNavigate()
    function handleClick (path) {
        navigate('/game-screen', {state: { levelPath: path}} )
    }
        return (
            <div className="levels">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <button onClick={() => handleClick('biome-1/stage-1')}>Start</button>
                        </div>
                    </div>
                </div>
            </div>
        )
}

export default LevelsMenu