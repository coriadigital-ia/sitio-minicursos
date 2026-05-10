// Bloqueo de Clic Derecho
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Bloqueo de Atajos de Teclado para Inspección
document.addEventListener('keydown', (e) => {
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }

    // Ctrl+U (Ver código fuente)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }

    // Cmd+Opt+I (Mac DevTools)
    if (e.metaKey && e.altKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
});
