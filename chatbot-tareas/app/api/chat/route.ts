// app/api/chat/route.ts
import { db } from '../../lib/db';

// Definir las herramientas (tools) que el LLM puede usar
const tools = {
  createTask: {
    description: 'Create a new task',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title/description of the task'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level of the task'
        },
        category: {
          type: 'string', 
          enum: ['work', 'personal', 'shopping', 'health', 'other'],
          description: 'Category of the task'
        },
        dueDate: {
          type: 'string',
          description: 'Due date in ISO format (optional)'
        }
      },
      required: ['title'],
      additionalProperties: false
    },
    execute: async (args: any) => {
      try {
        const task = await db.createTask({
          title: args.title,
          priority: args.priority || 'medium',
          category: args.category || 'other',
          dueDate: args.dueDate,
          completed: false
        });
        
        return {
          success: true,
          task: {
            id: task.id,
            title: task.title,
            priority: task.priority,
            category: task.category,
            dueDate: task.dueDate,
            completed: task.completed
          },
          message: `✅ Tarea "${task.title}" creada exitosamente`
        };
      } catch (error) {
        console.error('createTask error:', error);
        return {
          success: false,
          error: 'Error al crear la tarea'
        };
      }
    }
  },

  searchTasks: {
    description: 'Search and filter tasks',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search text in task titles'
        },
        completed: {
          type: 'boolean',
          description: 'Filter by completion status'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority level'
        },
        category: {
          type: 'string',
          enum: ['work', 'personal', 'shopping', 'health', 'other'],
          description: 'Filter by category'
        }
      },
      additionalProperties: false
    },
    execute: async (args: any) => {
      try {
        const tasks = await db.searchTasks({
          query: args.query,
          completed: args.completed,
          priority: args.priority,
          category: args.category
        });

        if (tasks.length === 0) {
          return {
            success: true,
            tasks: [],
            total: 0,
            message: 'No se encontraron tareas con esos criterios'
          };
        }

        const taskList = tasks.map(task => 
          `• ${task.title} (${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'} prioridad) - ${task.completed ? '✅ Completada' : '⏳ Pendiente'}`
        ).join('\n');

        return {
          success: true,
          tasks: tasks,
          total: tasks.length,
          message: `Encontré ${tasks.length} tarea(s):\n${taskList}`
        };
      } catch (error) {
        console.error('searchTasks error:', error);
        return {
          success: false,
          error: 'Error al buscar tareas'
        };
      }
    }
  },

getTaskStats: {
  description: 'Get comprehensive task statistics and analytics including breakdown by priority, category, timeline, productivity metrics, and upcoming tasks',
  parameters: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['today', 'week', 'month', 'year', 'all-time'],
        description: 'Time period for statistics'
      }
    },
    additionalProperties: false
  },
  execute: async (args: any) => {
    try {
      console.log('📊 getTaskStats called with period:', args.period);
      const tasks = await db.getTasks();
      const now = new Date();
      
      // Función helper para calcular diferencia en días
      const daysBetween = (date1: Date, date2: Date) => {
        return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
      };

      // Filtros por periodo
      let filteredTasks = tasks;
      if (args.period === 'today') {
        const today = new Date().toDateString();
        filteredTasks = tasks.filter(task => 
          new Date(task.createdAt).toDateString() === today ||
          new Date(task.updatedAt).toDateString() === today
        );
      } else if (args.period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTasks = tasks.filter(task => 
          new Date(task.createdAt) >= weekAgo ||
          new Date(task.updatedAt) >= weekAgo
        );
      } else if (args.period === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTasks = tasks.filter(task => 
          new Date(task.createdAt) >= monthAgo ||
          new Date(task.updatedAt) >= monthAgo
        );
      }

      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(t => t.completed).length;
      const pendingTasks = totalTasks - completedTasks;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Estadísticas por prioridad
      const byPriority = {
        high: {
          total: filteredTasks.filter(t => t.priority === 'high').length,
          completed: filteredTasks.filter(t => t.priority === 'high' && t.completed).length,
          pending: filteredTasks.filter(t => t.priority === 'high' && !t.completed).length
        },
        medium: {
          total: filteredTasks.filter(t => t.priority === 'medium').length,
          completed: filteredTasks.filter(t => t.priority === 'medium' && t.completed).length,
          pending: filteredTasks.filter(t => t.priority === 'medium' && !t.completed).length
        },
        low: {
          total: filteredTasks.filter(t => t.priority === 'low').length,
          completed: filteredTasks.filter(t => t.priority === 'low' && t.completed).length,
          pending: filteredTasks.filter(t => t.priority === 'low' && !t.completed).length
        }
      };

      // Estadísticas por categoría
      const byCategory = {
        work: {
          total: filteredTasks.filter(t => t.category === 'work').length,
          completed: filteredTasks.filter(t => t.category === 'work' && t.completed).length,
          pending: filteredTasks.filter(t => t.category === 'work' && !t.completed).length
        },
        personal: {
          total: filteredTasks.filter(t => t.category === 'personal').length,
          completed: filteredTasks.filter(t => t.category === 'personal' && t.completed).length,
          pending: filteredTasks.filter(t => t.category === 'personal' && !t.completed).length
        },
        shopping: {
          total: filteredTasks.filter(t => t.category === 'shopping').length,
          completed: filteredTasks.filter(t => t.category === 'shopping' && t.completed).length,
          pending: filteredTasks.filter(t => t.category === 'shopping' && !t.completed).length
        },
        health: {
          total: filteredTasks.filter(t => t.category === 'health').length,
          completed: filteredTasks.filter(t => t.category === 'health' && t.completed).length,
          pending: filteredTasks.filter(t => t.category === 'health' && !t.completed).length
        },
        other: {
          total: filteredTasks.filter(t => t.category === 'other').length,
          completed: filteredTasks.filter(t => t.category === 'other' && t.completed).length,
          pending: filteredTasks.filter(t => t.category === 'other' && !t.completed).length
        }
      };

      // Timeline - tareas de hoy y esta semana
      const today = new Date().toDateString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const timeline = {
        tasksCreatedToday: tasks.filter(t => 
          new Date(t.createdAt).toDateString() === today
        ).length,
        tasksCompletedToday: tasks.filter(t => 
          t.completed && new Date(t.updatedAt).toDateString() === today
        ).length,
        tasksCreatedThisWeek: tasks.filter(t => 
          new Date(t.createdAt) >= weekAgo
        ).length,
        tasksCompletedThisWeek: tasks.filter(t => 
          t.completed && new Date(t.updatedAt) >= weekAgo
        ).length
      };

      // Métricas de productividad
      const completedTasksWithDates = tasks.filter(t => t.completed && t.createdAt && t.updatedAt);
      const completionTimes = completedTasksWithDates.map(task => 
        new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime()
      );
      
      const averageCompletionTime = completionTimes.length > 0 
        ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / (1000 * 60 * 60 * 24))
        : 0;

      // Calcular día más productivo (simplificado)
      const completionByDay: { [key: string]: number } = {};
      completedTasksWithDates.forEach(task => {
        const day = new Date(task.updatedAt).toDateString();
        completionByDay[day] = (completionByDay[day] || 0) + 1;
      });
      
      const mostProductiveDay = Object.keys(completionByDay).reduce((a, b) => 
        completionByDay[a] > completionByDay[b] ? a : b, 'N/A'
      );

      // Calcular racha actual (días consecutivos con tareas completadas)
      let currentStreak = 0;
      const todayDate = new Date();
      for (let i = 0; i < 30; i++) { // Revisar últimos 30 días
        const checkDate = new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = checkDate.toDateString();
        if (completionByDay[dateStr]) {
          currentStreak++;
        } else if (i === 0) {
          // Si hoy no hay completadas, no hay racha
          break;
        } else {
          // Si un día no hay completadas, romper la racha
          break;
        }
      }

      // Tareas próximas
      const dueToday = tasks.filter(t => 
        t.dueDate && 
        !t.completed && 
        new Date(t.dueDate).toDateString() === today
      );
      
      const dueThisWeek = tasks.filter(t => 
        t.dueDate && 
        !t.completed && 
        new Date(t.dueDate) >= new Date() &&
        new Date(t.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      );

      const nextDueTask = tasks
        .filter(t => t.dueDate && !t.completed && new Date(t.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

      const stats = {
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate,
          overdueTasks: tasks.filter(t => 
            t.dueDate && !t.completed && new Date(t.dueDate) < new Date()
          ).length
        },
        byPriority,
        byCategory,
        timeline,
        productivity: {
          averageCompletionTime: `${averageCompletionTime} días`,
          mostProductiveDay: new Date(mostProductiveDay).toLocaleDateString('es-ES', { weekday: 'long' }),
          currentStreak,
          longestStreak: currentStreak // Simplificado - en una app real se calcularía históricamente
        },
        upcoming: {
          dueTodayCount: dueToday.length,
          dueThisWeekCount: dueThisWeek.length,
          nextDueTask: nextDueTask ? {
            id: nextDueTask.id,
            title: nextDueTask.title,
            dueDate: nextDueTask.dueDate,
            priority: nextDueTask.priority
          } : null
        }
      };

      // Generar mensaje descriptivo
      let message = `📊 ESTADÍSTICAS ${args.period ? `(${args.period.toUpperCase()})` : ''}\n\n`;
      
      message += `📈 RESUMEN:\n`;
      message += `• Total: ${stats.summary.totalTasks} tareas\n`;
      message += `• Completadas: ${stats.summary.completedTasks} (${stats.summary.completionRate}%)\n`;
      message += `• Pendientes: ${stats.summary.pendingTasks}\n`;
      message += `• Atrasadas: ${stats.summary.overdueTasks}\n\n`;

      message += `🎯 POR PRIORIDAD:\n`;
      message += `• Alta: ${stats.byPriority.high.completed}/${stats.byPriority.high.total} completadas\n`;
      message += `• Media: ${stats.byPriority.medium.completed}/${stats.byPriority.medium.total} completadas\n`;
      message += `• Baja: ${stats.byPriority.low.completed}/${stats.byPriority.low.total} completadas\n\n`;

      message += `📂 POR CATEGORÍA:\n`;
      Object.entries(stats.byCategory).forEach(([category, data]) => {
        if (data.total > 0) {
          const rate = Math.round((data.completed / data.total) * 100);
          message += `• ${category}: ${data.completed}/${data.total} (${rate}%)\n`;
        }
      });
      message += `\n`;

      message += `⏰ TEMPORAL:\n`;
      message += `• Creadas hoy: ${stats.timeline.tasksCreatedToday}\n`;
      message += `• Completadas hoy: ${stats.timeline.tasksCompletedToday}\n`;
      message += `• Creadas esta semana: ${stats.timeline.tasksCreatedThisWeek}\n`;
      message += `• Completadas esta semana: ${stats.timeline.tasksCompletedThisWeek}\n\n`;

      message += `🚀 PRODUCTIVIDAD:\n`;
      message += `• Tiempo promedio: ${stats.productivity.averageCompletionTime}\n`;
      message += `• Día más productivo: ${stats.productivity.mostProductiveDay}\n`;
      message += `• Racha actual: ${stats.productivity.currentStreak} días\n\n`;

      message += `🔜 PRÓXIMAS:\n`;
      message += `• Vencen hoy: ${stats.upcoming.dueTodayCount}\n`;
      message += `• Vencen esta semana: ${stats.upcoming.dueThisWeekCount}\n`;
      if (stats.upcoming.nextDueTask) {
        message += `• Próxima tarea: "${stats.upcoming.nextDueTask.title}" (${new Date(stats.upcoming.nextDueTask.dueDate!).toLocaleDateString()})\n`;
      }

      return {
        success: true,
        stats: stats,
        message: message
      };
    } catch (error) {
      console.error('getTaskStats error:', error);
      return {
        success: false,
        error: 'Error al obtener estadísticas'
      };
    }
  }
},

updateTask: {
  description: 'Update an existing task - can update title, completion status, priority, category, or due date',
  parameters: {
    type: 'object',
    properties: {
      taskTitle: {
        type: 'string', 
        description: 'Title of the task to update (will search for matching task)'
      },
      title: {
        type: 'string',
        description: 'New title for the task (optional)'
      },
      completed: {
        type: 'boolean',
        description: 'New completion status (optional)'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'New priority level (optional)'
      },
      category: {
        type: 'string',
        enum: ['work', 'personal', 'shopping', 'health', 'other'],
        description: 'New category (optional)'
      },
      dueDate: {
        type: 'string',
        description: 'New due date in ISO format (optional)'
      }
    },
    required: ['taskTitle'],
    additionalProperties: false
  },
  execute: async (args: any) => {
    try {
      // Buscar tarea por título
      const tasks = await db.searchTasks({ query: args.taskTitle });
      
      if (tasks.length === 0) {
        return {
          success: false,
          error: `No se encontró ninguna tarea con el título "${args.taskTitle}"`
        };
      }

      // Si hay múltiples coincidencias, usar la primera
      const task = tasks[0];
      const updates: any = {};
      
      // Solo incluir los campos que realmente se quieren actualizar
      if (args.title !== undefined) updates.title = args.title;
      if (args.completed !== undefined) updates.completed = args.completed;
      if (args.priority !== undefined) updates.priority = args.priority;
      if (args.category !== undefined) updates.category = args.category;
      if (args.dueDate !== undefined) updates.dueDate = args.dueDate;

      // Verificar que hay algo para actualizar
      if (Object.keys(updates).length === 0) {
        return {
          success: false,
          error: 'No se especificaron campos para actualizar'
        };
      }

      const updatedTask = await db.updateTask(task.id, updates);
      
      if (!updatedTask) {
        return {
          success: false,
          error: 'Error al actualizar la tarea'
        };
      }

      // Mensaje descriptivo de lo que se actualizó
      const changes = [];
      if (args.title !== undefined) changes.push(`título a "${updatedTask.title}"`);
      if (args.completed !== undefined) changes.push(`estado a ${updatedTask.completed ? 'completada' : 'pendiente'}`);
      if (args.priority !== undefined) changes.push(`prioridad a ${updatedTask.priority}`);
      if (args.category !== undefined) changes.push(`categoría a ${updatedTask.category}`);
      if (args.dueDate !== undefined) changes.push(`fecha límite a ${new Date(updatedTask.dueDate!).toLocaleDateString()}`);

      return {
        success: true,
        task: updatedTask,
        message: `✅ Tarea actualizada: ${changes.join(', ')}`
      };
    } catch (error) {
      console.error('updateTask error:', error);
      return {
        success: false,
        error: 'Error al actualizar la tarea'
      };
    }
  }
},

// En app/api/chat/route.ts - AGREGAR después de updateTask
deleteTask: {
  description: 'Permanently delete a task from the system',
  parameters: {
    type: 'object', 
    properties: {
      taskTitle: {
        type: 'string',
        description: 'Title of the task to delete'
      },
      confirm: {
        type: 'boolean',
        description: 'Confirmation flag for safety'
      }
    },
    required: ['taskTitle'],
    additionalProperties: false
  },
  execute: async (args: any) => {
    try {
      // Buscar tarea por título
      const tasks = await db.searchTasks({ query: args.taskTitle });
      
      if (tasks.length === 0) {
        return {
          success: false,
          error: `No se encontró ninguna tarea con el título "${args.taskTitle}"`
        };
      }

      const task = tasks[0];
      
      // Para seguridad, requerir confirmación explícita
      if (!args.confirm) {
        return {
          success: true,
          requiresConfirmation: true,
          task: task,
          message: `⚠️ ¿Estás seguro que quieres eliminar permanentemente la tarea "${task.title}"? Esta acción no se puede deshacer. Responde "sí, eliminar [título]" para confirmar.`
        };
      }

      const deleted = await db.deleteTask(task.id);
      
      if (!deleted) {
        return {
          success: false,
          error: 'Error al eliminar la tarea'
        };
      }

      return {
        success: true,
        message: `🗑️ Tarea "${task.title}" eliminada permanentemente`
      };
    } catch (error) {
      console.error('deleteTask error:', error);
      return {
        success: false,
        error: 'Error al eliminar la tarea'
      };
    }
  }
}

};

// Función para detectar qué tool usar basado en el mensaje del usuario
// En app/api/chat/route.ts - REEMPLAZAR la función detectToolAndParams
function detectToolAndParams(userMessage: string): { tool: string; params: any } | null {
  const message = userMessage.toLowerCase().trim();
  console.log('🔍 Analyzing message:', message);

  // === DETECTAR ELIMINACIÓN REAL ===
  if ((message.includes('eliminar') || message.includes('borrar') || message.includes('quitar')) && 
      !message.includes('completada')) {
    
    let taskTitle = '';
    
    // Detectar confirmación de eliminación primero
    if ((message.includes('sí') || message.includes('si') || message.includes('confirm')) && 
        (message.includes('eliminar') || message.includes('borrar'))) {
      const confirmMatch = userMessage.match(/(?:sí|si|confirmar).*?(?:eliminar|borrar).*?(.+)/i);
      if (confirmMatch) {
        return {
          tool: 'deleteTask',
          params: { 
            taskTitle: confirmMatch[1].trim(),
            confirm: true
          }
        };
      }
    }

    // Extraer título para eliminación inicial
    if (message.includes('tarea ')) {
      const parts = userMessage.split('tarea ');
      if (parts.length > 1) {
        taskTitle = parts[1].replace(/de|para|el|la|los|las/g, '').trim();
      }
    } else {
      const match = userMessage.match(/(?:eliminar|borrar|quitar)\s+(?:la tarea)?\s*(.+)/i);
      taskTitle = match ? match[1].trim() : '';
    }

    if (taskTitle) {
      console.log('🗑️ Detected delete for task:', taskTitle);
      return {
        tool: 'deleteTask',
        params: { 
          taskTitle,
          confirm: false // Requerir confirmación
        }
      };
    }
  }

  // === DETECTAR ACTUALIZACIONES COMPLEJAS ===
  if ((message.includes('cambiar') || message.includes('modificar') || message.includes('renombrar') || 
       message.includes('mover fecha') || message.includes('cambiar categoría') ||
       message.includes('actualizar')) && 
      (message.includes('tarea') || message.includes('prioridad') || message.includes('categoría'))) {
    
    let taskTitle = '';
    const params: any = {};

    // Extraer título de diferentes patrones
    if (message.includes('tarea ')) {
      const parts = userMessage.split('tarea ');
      if (parts.length > 1) {
        taskTitle = parts[1].split(/(?:a|para|con)/)[0].trim();
      }
    }
    
    if (!taskTitle) {
      const titleMatch = userMessage.match(/(?:cambiar|modificar|renombrar|actualizar).*?(.+?)(?:\s+a\s+|\s+para\s+|$)/i);
      if (titleMatch) taskTitle = titleMatch[1].trim();
    }

    // Detectar qué se quiere cambiar
    if (message.includes('renombrar') || message.includes('nombre a') || message.includes('titulo a')) {
      const newTitleMatch = userMessage.match(/(?:a|para)\s*(.+)/i);
      if (newTitleMatch) params.title = newTitleMatch[1].trim();
    }
    
    if (message.includes('prioridad a') || message.includes('cambiar prioridad')) {
      if (message.includes('alta')) params.priority = 'high';
      else if (message.includes('media')) params.priority = 'medium';
      else if (message.includes('baja')) params.priority = 'low';
    }
    
    if (message.includes('categoría a') || message.includes('cambiar categoría')) {
      if (message.includes('trabajo')) params.category = 'work';
      else if (message.includes('personal')) params.category = 'personal';
      else if (message.includes('compras')) params.category = 'shopping';
      else if (message.includes('salud')) params.category = 'health';
      else if (message.includes('otra')) params.category = 'other';
    }

    if (message.includes('fecha a') || message.includes('mover fecha')) {
      // Para fechas, necesitaríamos un parser más sofisticado
      // Por ahora dejamos que el usuario especifique la fecha en otro mensaje
      params.dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Mañana por defecto
    }

    if (taskTitle && Object.keys(params).length > 0) {
      console.log('✏️ Detected complex update for task:', taskTitle, params);
      return {
        tool: 'updateTask',
        params: { taskTitle, ...params }
      };
    }
  }

  // === DETECTAR MARCAR COMO COMPLETADA === (tu código existente mejorado)
  if ((message.includes('marcar') || message.includes('completar') || message.includes('hecha') || 
       message.includes('terminada') || message.includes('lista')) && 
      (message.includes('tarea') || message.includes('comprar') || message.includes('estudiar') ||
       message.includes('hacer') || message.includes('ir'))) {
    
    let taskTitle = '';
    
    if (message.includes('tarea ')) {
      const parts = userMessage.split('tarea ');
      if (parts.length > 1) {
        taskTitle = parts[1].replace(/de|para|el|la|los|las/g, '').trim();
      }
    } else if (message.includes('marcar') && message.includes('como')) {
      const match = userMessage.match(/marcar.*como.*?(?:hecha|completada).*?(.+)/i);
      taskTitle = match ? match[1].trim() : '';
    } else {
      const keywords = ['comprar', 'estudiar', 'hacer', 'ir', 'terminar', 'planificar'];
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          const match = userMessage.match(new RegExp(`${keyword}\\s+(.+)`, 'i'));
          if (match) {
            taskTitle = match[1].trim();
            break;
          }
        }
      }
    }

    if (taskTitle) {
      console.log('✅ Detected complete task:', taskTitle);
      return {
        tool: 'updateTask',
        params: { 
          taskTitle,
          completed: true 
        }
      };
    }
  }

  // === DETECTAR CREACIÓN === (tu código existente)
  if (message.includes('crear') || message.includes('agregar') || message.includes('nueva tarea') || 
      message.includes('añadir') || message.match(/crea.*tarea/) || message.match(/agrega.*tarea/) ||
      message.includes('crea una tarea') || message.includes('agrega una tarea') ||
      message.match(/^(?:crear|agregar|nueva).*tarea/)) {
    
    let title = '';
    
    if (message.includes('tarea:')) {
      title = userMessage.split('tarea:')[1]?.trim();
    } else if (message.includes('para ')) {
      title = userMessage.split('para ')[1]?.trim();
    } else if (message.includes('crea una tarea')) {
      title = userMessage.split('crea una tarea')[1]?.trim();
    } else if (message.includes('agrega una tarea')) {
      title = userMessage.split('agrega una tarea')[1]?.trim();
    } else {
      const match = userMessage.match(/(?:crear|agregar|nueva|añadir).*?(?:tarea)?\s*(.+)/i);
      title = match ? match[1].trim() : userMessage;
    }

    if (title) {
      console.log('📝 Detected create task:', title);
      return {
        tool: 'createTask',
        params: { title }
      };
    }
  }

  // === DETECTAR BÚSQUEDAS === (tu código existente)
  if (message.includes('mostrar') || message.includes('listar') || message.includes('ver tareas') || 
      message.includes('qué tareas') || message.includes('muestra') || message.includes('lista') ||
      message.includes('muéstrame') || message.includes('enséñame') || message.includes('enseñame') ||
      message.includes('ver mis tareas') || message.includes('mis tareas')) {
    
    const params: any = {};
    
    if (message.includes('alta prioridad') || message.includes('urgente')) params.priority = 'high';
    if (message.includes('trabajo') || message.includes('laboral')) params.category = 'work';
    if (message.includes('personal') || message.includes('casa')) params.category = 'personal';
    if (message.includes('compras') || message.includes('supermercado')) params.category = 'shopping';
    if (message.includes('salud') || message.includes('médico') || message.includes('medico')) params.category = 'health';
    if (message.includes('completada') || message.includes('hecha')) params.completed = true;
    if (message.includes('pendiente') || message.includes('sin hacer')) params.completed = false;

    console.log('📋 Detected tasks list with params:', params);
    return {
      tool: 'searchTasks',
      params
    };
  }

  // === DETECTAR ESTADÍSTICAS === (tu código existente)
  if (message.includes('estadística') || message.includes('cuántas tareas') || 
      message.includes('productividad') || message.includes('progreso') ||
      message.includes('cuantas tareas') || message.includes('resumen') ||
      message.includes('cómo voy') || message.includes('como voy')) {
    
    console.log('📊 Detected stats request');
    return {
      tool: 'getTaskStats',
      params: { period: 'all-time' }
    };
  }

  console.log('🤖 No tool pattern matched');
  return null;
}

// Función para crear un stream de respuesta
function createStreamResponse(content: string): ReadableStream {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    start(controller) {
      // Enviar la respuesta en chunks para simular streaming
      const chunks = [
        `data: ${JSON.stringify({
          choices: [{
            delta: { content: content },
            index: 0,
            finish_reason: 'stop'
          }]
        })}\n\n`,
        'data: [DONE]\n\n'
      ];

      chunks.forEach(chunk => {
        controller.enqueue(encoder.encode(chunk));
      });

      controller.close();
    }
  });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid messages', { status: 400 });
    }

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return new Response('No user message found', { status: 400 });
    }

    console.log('🔍 User message:', lastUserMessage.content);

    // Detectar si el usuario quiere usar alguna tool
    const toolDetection = detectToolAndParams(lastUserMessage.content);
    
    if (toolDetection) {
      const { tool, params } = toolDetection;
      console.log(`🔧 Detected tool: ${tool} with params:`, params);

      // Ejecutar la tool
      const toolResult = await (tools as any)[tool].execute(params);
      
      let responseContent = '';
      
      if (toolResult.success) {
        responseContent = toolResult.message;
        console.log('✅ Tool executed successfully:', responseContent);
      } else {
        responseContent = `❌ ${toolResult.error}`;
        console.log('❌ Tool execution failed:', responseContent);
      }

      // Devolver respuesta en formato de streaming
      const stream = createStreamResponse(responseContent);
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    console.log('🤖 No tool detected, using LLM...');

    // Si no se detecta tool, usar el LLM normal
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Task Manager Chatbot'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return new Response(`OpenRouter API error: ${response.status}`, { status: 500 });
    }

    return new Response(response.body);

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}