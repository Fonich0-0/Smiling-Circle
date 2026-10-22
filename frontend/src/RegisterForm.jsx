import { useState } from 'react' 
import './css/auth.css' // Импортируем стили, чтобы для пользователя всё было красиво
import { useNavigate } from 'react-router-dom' // Чтобы перенаправлять пользователя по страницам

function App() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)

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
        } 
        catch (error) {
            setError('Не удалось связаться с сервером.');
            console.error('Сетевая ошибка:', error);
        } 
    }; 
    
    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="title">Welcome,<br /><span>sign up to continue</span></div>

            <input className="input" name="nickname" placeholder="Nickname" type="nickname" value={username} onChange={(e) => setUsername(e.target.value)}/> 

            <input className="input" name="email" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/> 

            <input className="input" name="password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>        

            {error && (
                <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div className="flex-row">
                <div className="login-with">
                    <div className="button-log">
                        <svg xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="56.6934px" viewBox="0 0 56.6934 56.6934" version="1.1" style={{enableBackground: 'new 0 0 56.6934 56.6934'}} id="Layer_1" height="56.6934px" className="icon"><path d="M51.981,24.4812c-7.7173-0.0038-15.4346-0.0019-23.1518-0.001c0.001,3.2009-0.0038,6.4018,0.0019,9.6017  c4.4693-0.001,8.9386-0.0019,13.407,0c-0.5179,3.0673-2.3408,5.8723-4.9258,7.5991c-1.625,1.0926-3.492,1.8018-5.4168,2.139  c-1.9372,0.3306-3.9389,0.3729-5.8713-0.0183c-1.9651-0.3921-3.8409-1.2108-5.4773-2.3649  c-2.6166-1.8383-4.6135-4.5279-5.6388-7.5549c-1.0484-3.0788-1.0561-6.5046,0.0048-9.5805  c0.7361-2.1679,1.9613-4.1705,3.5708-5.8002c1.9853-2.0324,4.5664-3.4853,7.3473-4.0811c2.3812-0.5083,4.8921-0.4113,7.2234,0.294  c1.9815,0.6016,3.8082,1.6874,5.3044,3.1163c1.5125-1.5039,3.0173-3.0164,4.527-4.5231c0.7918-0.811,1.624-1.5865,2.3908-2.4196  c-2.2928-2.1218-4.9805-3.8274-7.9172-4.9056C32.0723,4.0363,26.1097,3.995,20.7871,5.8372  C14.7889,7.8907,9.6815,12.3763,6.8497,18.0459c-0.9859,1.9536-1.7057,4.0388-2.1381,6.1836  C3.6238,29.5732,4.382,35.2707,6.8468,40.1378c1.6019,3.1768,3.8985,6.001,6.6843,8.215c2.6282,2.0958,5.6916,3.6439,8.9396,4.5078  c4.0984,1.0993,8.461,1.0743,12.5864,0.1355c3.7284-0.8581,7.256-2.6397,10.0725-5.24c2.977-2.7358,5.1006-6.3403,6.2249-10.2138  C52.5807,33.3171,52.7498,28.8064,51.981,24.4812z" /></svg>
                    </div>
                    <div className="button-log">
                        <svg className="icon" height="56.693px" id="Layer_1" version="1.1" viewBox="0 0 24 24" width="56.693px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path fillRule="evenodd" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM6.5 5h2.8l2.7 5 2.7-5h2.8l-4.1 7.2V19h-2.8v-6.8L6.5 5z" /></svg>
                    </div>
                    <div className="button-log">
                        <svg className="icon" height="56.693px" id="Layer_1" version="1.1" viewBox="0 0 24 24" width="56.693px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                    </div>
                </div>

                <div className="remember-me-container">
                    <input type="checkbox" id="remember" className="checkbox-input" checked={remember} onChange={(e) => setRemember(e.target.checked)}/>
                    <label htmlFor="remember" className="checkbox-label">remember me</label>
                </div>
                
                <p><span>You have an account?</span> <button type="button" className="button" onClick={() => navigate('/login')}><span className="span">Sign Up</span></button></p>
            </div>

            <button type="submit" className="button-confirm">Let`s go →</button>
        </form>
    ); 
} 

export default App;