import { useState } from 'react' 
import './css/auth.css' // Импортируем стили, чтобы для пользователя всё было красиво
import { useNavigate } from 'react-router-dom' // Чтобы перенаправлять пользователя по страницам

function App() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (event) => { 
        event.preventDefault();
        setError(''); // Сбрасываем прошлую ошибку

        try {
            const apiUrl = new URL('api/v1/registration/', import.meta.env.VITE_API_URL).href;
            
            const response = await fetch(apiUrl, { 
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('isAuthenticated', 'true');
                window.location.href = '/main-menu';
            } else {
                // Склеиваем ошибки полей от Django в одну понятную строку
                let errorText = '';
                if (data.detail) {
                    errorText = data.detail;
                } else {
                    errorText = Object.entries(data)
                        .map(([field, msgs]) => `${field}: ${msgs.join(' ')}`)
                        .join(' | ');
                }
                setError(errorText || 'Ошибка валидации данных');
                console.error('Ошибка от сервера:', data);
            }
        } // ВОТ ТУТ ЗАКРЫЛСЯ БЛОК TRY!
        catch (error) {
            setError('Не удалось связаться с сервером.');
            console.error('Сетевая ошибка:', error);
        } // ВОТ ТУТ ЗАКРЫЛСЯ CATCH!
    }; // ВОТ ТУТ ЗАКРЫЛСЯ HANDLESUBMIT!
    
    return (
        <form className="form" onSubmit={handleSubmit}>
            {error && (
                <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div className="flex-column">         
                <label>Nickname</label>
            </div>         
            <div className="inputForm">             
                <svg height="20" viewBox="0 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M256 256c61.856 0 112-50.144 112-112S317.856 32 256 32s-112 50.144-112 112 50.144 112 112 112zm0-192c44.112 0 80 35.888 80 80s-35.888 80-80 80-80-35.888-80-80 35.888-80 80-80z"></path><path d="M363.2 288H148.8c-60 0-108.8 48.8-108.8 108.8v31.2c0 28.224 22.976 51.2 51.2 51.2h331.6c28.224 0 51.2-22.976 51.2-51.2v-31.2c0-60-48.8-108.8-108.8-108.8zm76.8 140c0 10.592-8.608 19.2-19.2 19.2H91.2c-10.592 0-19.2-8.608-19.2-19.2v-31.2c0-42.352 34.448-76.8 76.8-76.8h214.4c42.352 0 76.8 34.448 76.8 76.8v31.2z"></path></svg>
                <input id="name" type="text" className="input" placeholder="Enter your Nickname" value={username} onChange={(e) => setUsername(e.target.value)}/>        
            </div>

            <div className="flex-column">
                <label>Email</label>
            </div>
            <div className="inputForm">
                <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path></g></svg>
                <input id="email" type="text" className="input" placeholder="Enter your Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            
            <div className="flex-column">
                <label>Password</label>
            </div>
            <div className="inputForm">
                <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path></svg>        
                <input id="password" type="password" className="input" placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            
            <div className="flex-row">
                <div>
                    <input type="checkbox"/>
                    <label>Remember me</label>
                </div>
            </div>
            <button id="button-submit" className="button-submit">Sign Up</button>

            <p className="p">You have an account? <a href="login.html"><span className="span">Sign In</span></a></p>
        </form>
    ); // ВОТ ТУТ ЗАКРЫЛСЯ RETURN КОМПОНЕНТА!
} // ВОТ ТУТ ЗАКРЫЛСЯ КЛАСС FUNCTION APP!

export default App;
