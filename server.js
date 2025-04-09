const express = require('express');
const bodyParser = require('body-parser');
const app = express();


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//almacenar tareas
let tasks = [];
let currentId = 1;

//listar tareas
app.get('/', (req, res) => {
    const filter = req.query.filter || 'all';
    let filteredTasks = tasks;
    
    //filtrar tareas por estado
    if (filter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);
    
    res.render('index', { 
        tasks: filteredTasks,
        filter
    });
});

//crear nueva tarea
app.post('/tasks', (req, res) => {
    tasks.push({
        id: currentId++,
        text: req.body.text,
        completed: false
    });
    res.redirect('/');
});

//actualizar estado de tarea
app.post('/tasks/:id/toggle', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (task) task.completed = !task.completed;
    res.redirect('/');
});

//eliminar tarea
app.post('/tasks/:id/delete', (req, res) => {
    tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
    res.redirect('/');
});

//eliminar tareas completadas
app.post('/tasks/clear-completed', (req, res) => {
    tasks = tasks.filter(t => !t.completed);
    res.redirect('/');
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});