// app/lib/db.ts
import { promises as fs } from 'fs'
import path from 'path'

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

// Tipo para crear tareas (sin los campos auto-generados)
export type TaskInput = {
  title: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  category?: 'work' | 'personal' | 'shopping' | 'health' | 'other'
  dueDate?: string
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
      title: taskData.title,
      completed: taskData.completed ?? false,
      priority: taskData.priority ?? 'medium',
      category: taskData.category ?? 'other',
      dueDate: taskData.dueDate,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    tasks.push(newTask)
    await this.saveTasks(tasks)
    return newTask
  },

  // Actualizar tarea existente
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
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

  // Buscar tareas con filtros
  async searchTasks(filters: {
    query?: string
    completed?: boolean
    priority?: Task['priority']
    category?: Task['category']
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
      
      return true
    })
  }
}