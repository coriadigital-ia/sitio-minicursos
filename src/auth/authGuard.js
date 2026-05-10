import { supabase } from '../lib/supabaseClient.js';

export async function checkSessionAndRedirect() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const path = window.location.pathname;
  // Detecta si es la página de login (soporta /login, /login.html y raíz /)
  const isLoginPage = path.includes('login') || path === '/login' || path === '/login.html';
  
  if (!session && !isLoginPage) {
    // Si no hay sesión y no estamos en login, vamos a login
    window.location.href = '/login.html';
  } else if (session && isLoginPage) {
    // Si ya hay sesión y estamos en login, vamos al dashboard
    window.location.href = '/index.html';
  }
  
  return session;
}
