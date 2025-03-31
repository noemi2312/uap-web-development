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
    let tareas = []; // Aquí guardaremos todas las tareas
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // Función para agregar tareas al DOM
    function agregarTareaALista(tarea) {
        const li = document.createElement('li');
        li.className = 'tarea';
        li.dataset.id = tarea.id;
        li.style.display = debeMostrarse(tarea) ? 'flex' : 'none';
        
        li.innerHTML = `
            <button class="checkbox-btn" aria-label="${tarea.completada ? 'Desmarcar' : 'Marcar'} tarea">
                <img class="checkbox" src="images/${tarea.completada ? 'check' : 'no_check'}.png" alt="">
            </button>
            <span class="${tarea.completada ? 'completada' : ''}">${tarea.texto}</span>
            <div class="acciones">
                <button class="delete-btn" aria-label="Eliminar tarea">
                    <img class="recycle-bin" src="images/recycle_bin.png" alt="">
                </button>
            </div>
        `;
        
        li.querySelector('.checkbox-btn').addEventListener('click', () => {
            tarea.completada = !tarea.completada;
            actualizarTarea(tarea);
        });
        
        li.querySelector('.delete-btn').addEventListener('click', () => {
            tareas = tareas.filter(t => t.id !== tarea.id);
            li.remove();
        });
        
        listaTareas.appendChild(li);
    }

    // Actualizar tarea en el DOM
    function actualizarTarea(tarea) {
        const li = document.querySelector(`.tarea[data-id="${tarea.id}"]`);
        if (li) {
            li.querySelector('.checkbox').src = tarea.completada ? 'images/check.png' : 'images/no_check.png';
            li.querySelector('span').className = tarea.completada ? 'completada' : '';
            li.style.display = debeMostrarse(tarea) ? 'flex' : 'none';
        }
    }

    // Determinar si una tarea debe mostrarse según el filtro
    function debeMostrarse(tarea) {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !tarea.completada;
        if (currentFilter === 'completed') return tarea.completada;
    }

    // Aplicar filtro
    function aplicarFiltro(filtro) {
        currentFilter = filtro;
        // Actualizar botones de filtro
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter-${filtro}`).classList.add('active');
        
        // Actualizar visibilidad de tareas
        tareas.forEach(tarea => {
            const li = document.querySelector(`.tarea[data-id="${tarea.id}"]`);
            if (li) li.style.display = debeMostrarse(tarea) ? 'flex' : 'none';
        });
    }

    // Manejar envío del formulario
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
            id: Date.now() // ID único para cada tarea
        };
        
        tareas.push(nuevaTarea);
        agregarTareaALista(nuevaTarea);
        inputTarea.value = '';
        inputTarea.focus();
    });

    // Eventos para los botones de filtro
    filterAll.addEventListener('click', () => aplicarFiltro('all'));
    filterActive.addEventListener('click', () => aplicarFiltro('active'));
    filterCompleted.addEventListener('click', () => aplicarFiltro('completed'));

    // Eliminar tareas completadas (sin confirmación)
    clearCompletedBtn.addEventListener('click', () => {
        const tareasCompletadas = tareas.filter(t => t.completada);
        
        if (tareasCompletadas.length === 0) {
            alert('No hay tareas completadas para eliminar');
            return;
        }
        
        // Eliminar directamente sin confirmación
        tareas = tareas.filter(t => !t.completada);
        tareasCompletadas.forEach(t => {
            const li = document.querySelector(`.tarea[data-id="${t.id}"]`);
            if (li) li.remove();
        });
    });

    // Inicializar con filtro 'all'
    aplicarFiltro('all');
});