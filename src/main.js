import { checkSessionAndRedirect } from './auth/authGuard.js';
import { supabase } from './lib/supabaseClient.js';
import { initWebGLBackground } from './components/bg.js';
import './styles/global.css';
import './styles/dashboard.css';

let userRole = 'Cliente'; 
let courses = []; 
let activeCat = 'Todos';

const categoryIcons = { 
    'Todos': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', 
    'Diseño': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>', 
    'Desarrollo': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', 
    'Soft Skills': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', 
    'Negocios': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' 
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Sesión. Si no hay, te manda al login
    const session = await checkSessionAndRedirect();
    if (!session) return;
    
    // 2. Cargar UI
    initWebGLBackground();
    
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('display-email').textContent = session.user.email;
    
    // 3. Fetch de rol y cursos
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (data) userRole = data.role;
    
    if (userRole === 'Administrador') {
        document.getElementById('add-btn').style.display = 'block';
    }
    
    await fetchCourses();
    
    // 4. Listeners
    document.getElementById('btn-logout').onclick = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login.html';
    };
});

window.setCat = (c) => { 
    activeCat = c; 
    renderFilters(); 
    renderCards(); 
};

async function fetchCourses() { 
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false }); 
    courses = data || []; 
    renderFilters(); 
    renderCards(); 
}

function renderFilters() {
    const cats = ['Todos', 'Diseño', 'Desarrollo', 'Soft Skills', 'Negocios'];
    document.getElementById('filterBar').innerHTML = cats.map(c => `<button class="filter-pill ${c === activeCat ? 'active' : ''}" onclick="setCat('${c}')">${c}</button>`).join('');
    document.getElementById('mobileMenu').innerHTML = cats.map(c => `<button class="menu-item ${c === activeCat ? 'active' : ''}" onclick="setCat('${c}')">${categoryIcons[c]}<span>${c}</span></button>`).join('');
}

function renderCards() {
    const filtered = activeCat === 'Todos' ? courses : courses.filter(c => c.category === activeCat);
    document.getElementById('cardGrid').innerHTML = filtered.map(c => `
        <div class="course-card">
            ${userRole === 'Administrador' ? `<div class="admin-actions"><button class="btn-icon" onclick="editCourse('${c.id}')">✏️</button><button class="btn-icon" onclick="deleteCourse('${c.id}')">🗑️</button></div>` : ''}
            <h3 style="margin-bottom: 0.5rem; padding-right: 3.5rem;">${c.title}</h3>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">${c.category} | ${c.duration} min</p>
            <button class="btn-signin" style="padding: 0.6rem; font-size: 0.8rem;" onclick="window.open('${c.pdf_url}', '_blank')">Ver PDF</button>
        </div>
    `).join('');
}
