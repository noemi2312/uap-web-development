document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const listaTareas = document.getElementById('lista-tareas');
    const formTarea = document.getElementById('form-tarea');
    const inputTarea = document.getElementById('nombre');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterAll = document.getElementById('filter-all');
    const filterActive = document.getElementById('filter-active');
    const filterCompleted = document.getElementById('filter-completed');

    // Estado global
    let tareas = [];
    let currentFilter = 'all';

    // Delegación de eventos para la lista de tareas
    listaTareas.addEventListener('click', (e) => {
        const target = e.target;
        const li = target.closest('.tarea');
        if (!li) return;
        
        const id = parseInt(li.dataset.id);
        const tarea = tareas.find(t => t.id === id);
        if (!tarea) return;

        // Checkbox
        if (target.classList.contains('checkbox-btn') || target.closest('.checkbox-btn')) {
            tarea.completada = !tarea.completada;
            actualizarTarea(tarea);
        }
        
        // Botón de eliminar
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
            tareas = tareas.filter(t => t.id !== tarea.id);
            li.remove();
        }
    });

    // Función para agregar tareas al DOM
    function agregarTareaALista(tarea) {
        const li = document.createElement('li');
        li.className = 'tarea';
        li.dataset.id = tarea.id;
        li.style.display = debeMostrarse(tarea) ? 'flex' : 'none';
        
        li.innerHTML = `
            <button class="checkbox-btn" aria-label="${tarea.completada ? 'Desmarcar' : 'Marcar'} tarea">
                <input type="checkbox" ${tarea.completada ? 'checked' : ''} class="checkbox" aria-hidden="true">
            </button>
            <span class="${tarea.completada ? 'completada' : ''}">${tarea.texto}</span>
            <div class="acciones">
                <button class="delete-btn" aria-label="Eliminar tarea">
                    <svg class="recycle-bin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        
        listaTareas.appendChild(li);
    }

    // Actualizar tarea en el DOM
    function actualizarTarea(tarea) {
        const li = document.querySelector(`.tarea[data-id="${tarea.id}"]`);
        if (li) {
            const checkbox = li.querySelector('.checkbox');
            const span = li.querySelector('span');
            
            checkbox.checked = tarea.completada;
            span.className = tarea.completada ? 'completada' : '';
            li.style.display = debeMostrarse(tarea) ? 'flex' : 'none';
        }
    }

    // Resto del código permanece igual...
    function debeMostrarse(tarea) {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !tarea.completada;
        if (currentFilter === 'completed') return tarea.completada;
    }

    function aplicarFiltro(filtro) {
        currentFilter = filtro;
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter-${filtro}`).classList.add('active');
        
        tareas.forEach(tarea => {
            const li = document.querySelector(`.tarea[data-id="${tarea.id}"]`);
            if (li) li.style.display = debeMostrarse(tarea) ? 'flex' : 'none';
        });
    }

    formTarea.addEventListener('submit', (e) => {
        e.preventDefault();
        const texto = inputTarea.value.trim();
        
        if (!texto) {
            alert('¡Por favor ingresa una tarea válida!');
            inputTarea.focus();
            return;
        }
        
        const nuevaTarea = {
            texto: texto,
            completada: false,
            id: Date.now()
        };
        
        tareas.push(nuevaTarea);
        agregarTareaALista(nuevaTarea);
        inputTarea.value = '';
        inputTarea.focus();
    });

    filterAll.addEventListener('click', () => aplicarFiltro('all'));
    filterActive.addEventListener('click', () => aplicarFiltro('active'));
    filterCompleted.addEventListener('click', () => aplicarFiltro('completed'));

    clearCompletedBtn.addEventListener('click', () => {
        const tareasCompletadas = tareas.filter(t => t.completada);
        
        if (tareasCompletadas.length === 0) {
            alert('No hay tareas completadas para eliminar');
            return;
        }
        
        tareas = tareas.filter(t => !t.completada);
        tareasCompletadas.forEach(t => {
            const li = document.querySelector(`.tarea[data-id="${t.id}"]`);
            if (li) li.remove();
        });
    });

    aplicarFiltro('all');
});