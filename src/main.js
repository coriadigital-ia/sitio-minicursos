import './auth/antiInspect.js';
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

// Función de escape para prevenir XSS
function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

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

    // Lógica para el Modal
    const modal = document.getElementById('courseModal');
    const courseForm = document.getElementById('courseForm');
    const addBtn = document.getElementById('add-btn');
    const closeModal = document.getElementById('closeModal');

    addBtn.onclick = () => {
        courseForm.reset();
        document.getElementById('courseId').value = '';
        modal.classList.remove('hidden');
    };

    closeModal.onclick = () => modal.classList.add('hidden');

    courseForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('courseId').value;
        const title = document.getElementById('courseTitle').value;
        const courseData = {
            title: title,
            slug: title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
            category: document.getElementById('courseCategory').value,
            duration: parseInt(document.getElementById('courseDuration').value),
            pdf_url: document.getElementById('coursePdf').value
        };

        if (id) {
            const { error } = await supabase.from('courses').update(courseData).eq('id', id);
            if (error) alert("Error al actualizar: " + error.message);
        } else {
            const { error } = await supabase.from('courses').insert([courseData]);
            if (error) alert("Error al guardar: " + error.message);
        }

        modal.classList.add('hidden');
        fetchCourses();
    };
});

// Funciones globales
window.setCat = (c) => { 
    activeCat = c; 
    renderFilters(); 
    renderCards(); 
};

window.editCourse = async (id) => {
    const { data: course, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error) return alert("Error al obtener curso: " + error.message);
    
    document.getElementById('courseId').value = course.id;
    document.getElementById('courseTitle').value = course.title;
    document.getElementById('courseCategory').value = course.category;
    document.getElementById('courseDuration').value = course.duration;
    document.getElementById('coursePdf').value = course.pdf_url;
    
    document.getElementById('courseModal').classList.remove('hidden');
};

window.deleteCourse = async (id) => {
    if (confirm("¿Estás seguro de eliminar este curso?")) {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else fetchCourses();
    }
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
            <h3 style="margin-bottom: 0.5rem; padding-right: 3.5rem; line-height: 1.3;">${escapeHTML(c.title)}</h3>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1.5rem;">${escapeHTML(c.category)} | ${c.duration} min</p>
            <button class="btn-signin" style="width: auto; padding: 0.6rem 1.5rem; font-size: 0.85rem; display: inline-flex; border-radius: 0.5rem;" onclick="window.open('${c.pdf_url}', '_blank')">Ver PDF</button>
        </div>
    `).join('');
}
