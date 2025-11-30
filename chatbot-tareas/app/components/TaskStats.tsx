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
  }
]

async function ensureDB() {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, JSON.stringify(initialTasks, null, 2))
  }
}

export const db = {
  async getTasks(): Promise<Task[]> {
    await ensureDB()
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2))
  },

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks()
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    tasks.push(newTask)
    await this.saveTasks(tasks)
    return newTask
  }
}