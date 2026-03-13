'use client';

import { Task, updateTask, deleteTask } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskListProps {
  tasks: Task[];
}

const STATUSES = ['pending', 'started', 'cancelled', 'completed', 'delayed'];

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No tasks yet. Create one!
      </div>
    );
  }

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
  };

  return (
    <ul className="divide-y divide-border/50">
      {tasks.map((task) => (
        <li key={task.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors hover:bg-muted/30">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                style={{ backgroundColor: task.color }}
              />
              <h3 className="font-medium text-base leading-none">{task.title}</h3>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 pl-6">{task.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
              <Badge variant="secondary" className="font-normal text-xs text-muted-foreground bg-muted/50 gap-1.5 px-2 py-0.5">
                <CalendarIcon className="w-3 h-3" />
                {task.start_date}
              </Badge>
              <span className="text-xs text-muted-foreground">&rarr;</span>
              <Badge variant="secondary" className="font-normal text-xs text-muted-foreground bg-muted/50 gap-1.5 px-2 py-0.5">
                <CalendarIcon className="w-3 h-3" />
                {task.end_date}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Select 
              defaultValue={task.status} 
              onValueChange={(value) => value && handleStatusChange(task.id, value)}
            >
              <SelectTrigger className="w-[130px] h-9 text-xs capitalize focus:ring-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent align="end" className="shadow-md border-border rounded-md">
                {STATUSES.map((status) => (
                  <SelectItem 
                    key={status} 
                    value={status} 
                    className="capitalize text-xs cursor-pointer focus:bg-muted"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete task</span>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
