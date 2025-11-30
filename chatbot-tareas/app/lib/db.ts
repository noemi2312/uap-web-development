// app/lib/db.ts
import { promises as fs } from 'fs'
import path from 'path'
import { TaskInput } from './validations'

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

const DB_PATH = path.join(process.cwd(), 'data', 'tasks.json')

// Datos iniciales de ejemplo
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Comprar leche y pan',
    completed: false,
    priority: 'medium',
    category: 'shopping',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Terminar informe de ventas Q4',
    completed: false,
    priority: 'high',
    category: 'work',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Ir al gimnasio',
    completed: true,
    priority: 'medium',
    category: 'health',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Llamar al dentista',
    completed: false,
    priority: 'low',
    category: 'health',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Planificar vacaciones',
    completed: false,
    priority: 'low',
    category: 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

// Función para asegurar que la base de datos existe
async function ensureDB(): Promise<void> {
  try {
    await fs.access(DB_PATH)
  } catch {
    // Crear directorio y archivo con datos iniciales
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, JSON.stringify(initialTasks, null, 2))
    console.log('✅ Database initialized with sample tasks')
  }
}

export const db = {
  // Obtener todas las tareas
  async getTasks(): Promise<Task[]> {
    await ensureDB()
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  },

  // Guardar todas las tareas
  async saveTasks(tasks: Task[]): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2))
  },

  // Crear nueva tarea
  async createTask(taskData: TaskInput): Promise<Task> {
    const tasks = await this.getTasks()
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      completed: taskData.completed ?? false,
      priority: taskData.priority ?? 'medium',
      category: taskData.category ?? 'other',
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    tasks.push(newTask)
    await this.saveTasks(tasks)
    return newTask
  },

  // Actualizar tarea existente
  async updateTask(id: string, updates: Partial<TaskInput>): Promise<Task | null> {
    const tasks = await this.getTasks()
    const taskIndex = tasks.findIndex(t => t.id === id)
    
    if (taskIndex === -1) return null
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    await this.saveTasks(tasks)
    return tasks[taskIndex]
  },

  // Eliminar tarea
  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getTasks()
    const taskIndex = tasks.findIndex(t => t.id === id)
    
    if (taskIndex === -1) return false
    
    tasks.splice(taskIndex, 1)
    await this.saveTasks(tasks)
    return true
  },

  // Buscar tareas con filtros - VERSIÓN ACTUALIZADA CON FECHAS
  async searchTasks(filters: {
    query?: string
    completed?: boolean
    priority?: Task['priority']
    category?: Task['category']
    dueDateFrom?: string    // NUEVO: Fecha mínima
    dueDateTo?: string      // NUEVO: Fecha máxima
    overdue?: boolean       // NUEVO: Tareas atrasadas
  } = {}): Promise<Task[]> {
    const tasks = await this.getTasks()
    
    return tasks.filter(task => {
      // Filtro por texto de búsqueda
      if (filters.query && !task.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false
      }
      
      // Filtro por estado completado
      if (filters.completed !== undefined && task.completed !== filters.completed) {
        return false
      }
      
      // Filtro por prioridad
      if (filters.priority && task.priority !== filters.priority) {
        return false
      }
      
      // Filtro por categoría
      if (filters.category && task.category !== filters.category) {
        return false
      }
      
      // NUEVO: Filtro por fecha mínima
      if (filters.dueDateFrom && task.dueDate) {
        const taskDueDate = new Date(task.dueDate)
        const filterFromDate = new Date(filters.dueDateFrom)
        // Comparar solo la fecha (sin hora)
        if (taskDueDate.toISOString().split('T')[0] < filterFromDate.toISOString().split('T')[0]) {
          return false
        }
      }
      
      // NUEVO: Filtro por fecha máxima
      if (filters.dueDateTo && task.dueDate) {
        const taskDueDate = new Date(task.dueDate)
        const filterToDate = new Date(filters.dueDateTo)
        // Comparar solo la fecha (sin hora)
        if (taskDueDate.toISOString().split('T')[0] > filterToDate.toISOString().split('T')[0]) {
          return false
        }
      }
      
      // NUEVO: Filtro por tareas atrasadas
      if (filters.overdue !== undefined) {
        const now = new Date()
        if (filters.overdue) {
          // Solo tareas atrasadas: tienen dueDate, no están completadas y la fecha ya pasó
          if (!task.dueDate || task.completed || new Date(task.dueDate) >= now) {
            return false
          }
        } else {
          // Excluir tareas atrasadas
          if (task.dueDate && !task.completed && new Date(task.dueDate) < now) {
            return false
          }
        }
      }
      
      return true
    })
  }
}