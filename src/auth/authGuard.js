import { supabase } from '../lib/supabaseClient.js';

export async function checkSessionAndRedirect() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const isLoginPage = window.location.pathname.includes('/login.html');
  
  if (!session && !isLoginPage) {
    // Si no hay sesión y no está en login, redirigir a login
    window.location.href = '/login.html';
  } else if (session && isLoginPage) {
    // Si hay sesión y está en login, redirigir a dashboard
    window.location.href = '/index.html';
  }
  
  return session;
}
