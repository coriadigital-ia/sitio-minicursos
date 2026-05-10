import { checkSessionAndRedirect } from './auth/authGuard.js';
import { supabase } from './lib/supabaseClient.js';
import { initWebGLBackground } from './components/bg.js';
import './styles/global.css';
import './styles/login.css';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificamos sesión y si existe, mandamos al dashboard
    await checkSessionAndRedirect();
    
    // 2. Iniciamos el fondo animado
    initWebGLBackground();
    
    // 3. Formularios y Login Google
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert("Error al iniciar sesión: " + error.message);
            } else {
                window.location.href = '/index.html';
            }
        };
    }
    
    const googleBtn = document.getElementById('google-btn');
    if (googleBtn) {
        googleBtn.onclick = () => {
            supabase.auth.signInWithOAuth({ provider: 'google' });
        };
    }
});
