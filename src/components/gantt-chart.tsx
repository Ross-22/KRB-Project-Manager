'use client';

import * as React from 'react';
import { useState } from 'react';
import { Task } from '@/lib/actions';
import { differenceInDays, parseISO, addDays, format, isBefore, isAfter } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No data for Gantt Chart
      </div>
    );
  }

  // Find min and max dates
  let minDate = parseISO(tasks[0].start_date);
  let maxDate = parseISO(tasks[0].end_date);

  tasks.forEach((task) => {
    const start = parseISO(task.start_date);
    const end = parseISO(task.end_date);
    if (isBefore(start, minDate)) minDate = start;
    if (isAfter(end, maxDate)) maxDate = end;
  });

  // Add a little buffer to the chart (1 day before, 1 day after)
  minDate = addDays(minDate, -1);
  maxDate = addDays(maxDate, 1);

  const totalDays = differenceInDays(maxDate, minDate) + 1;

  // Generate array of dates for the header
  const dates = Array.from({ length: totalDays }).map((_, i) => addDays(minDate, i));

  return (
    <TooltipProvider>
      <div className="flex w-full border border-border rounded-md bg-card relative overflow-hidden">
        {/* Fixed Left Column */}
        <div className="w-[150px] shrink-0 border-r border-border flex flex-col z-20 bg-card">
          <div className="h-14 border-b border-border p-3 font-medium text-xs text-muted-foreground flex items-end bg-muted/20">
            Task
          </div>
          {tasks.map((task) => (
            <div key={`title-${task.id}`} className="h-12 border-b border-border p-3 font-medium text-sm flex items-center truncate bg-card">
              {task.title}
            </div>
          ))}
        </div>

        {/* Scrollable Right Timeline */}
        <div className="flex-1 overflow-x-auto relative">
          <div 
            className="min-w-max flex flex-col relative"
            style={{ width: `${totalDays * 40}px` }}
          >
            {/* Header row */}
            <div className="flex h-14 border-b border-border bg-muted/20">
              {dates.map((date, i) => (
                <div 
                  key={i} 
                  className="w-[40px] shrink-0 border-r border-border p-1 text-center text-xs font-medium flex flex-col items-center justify-end"
                >
                  <span className="text-muted-foreground text-[10px] uppercase leading-none mb-1">{format(date, 'MMM')}</span>
                  <span className="leading-none text-foreground">{format(date, 'dd')}</span>
                </div>
              ))}
            </div>

            {/* Task Rows */}
            {tasks.map((task) => {
              const taskStart = parseISO(task.start_date);
              const taskEnd = parseISO(task.end_date);
              
              const startCol = differenceInDays(taskStart, minDate);
              const span = differenceInDays(taskEnd, taskStart) + 1;

              return (
                <div 
                  key={`row-${task.id}`} 
                  className="flex h-12 border-b border-border relative items-center hover:bg-muted/10 transition-colors"
                >
                  {/* Background grid lines for the row */}
                  <div className="absolute inset-0 flex h-full pointer-events-none">
                    {dates.map((_, i) => (
                      <div key={i} className="w-[40px] shrink-0 border-r border-border opacity-30 h-full" />
                    ))}
                  </div>
                  
                  {/* The Task Bar */}
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="absolute h-7 rounded-md flex items-center px-2.5 text-xs font-medium truncate shadow-sm transition-transform cursor-pointer text-left hover:scale-[1.01] hover:shadow-md hover:brightness-110"
                      style={{
                        left: `${startCol * 40 + 4}px`, // +4 for padding
                        width: `${span * 40 - 8}px`, // -8 for padding
                        backgroundColor: task.color || 'var(--primary)',
                        color: '#ffffff', // Ensures text on colorful bars is readable
                        textShadow: '0px 1px 2px rgba(0,0,0,0.3)', // Makes text readable on light colors too
                      }}
                    >
                      <span className="truncate w-full block leading-none pt-[1px]">{task.title}</span>
                    </TooltipTrigger>
                    <TooltipContent className="border-border shadow-md rounded-md bg-popover text-popover-foreground p-3 max-w-xs z-50">
                      <p className="font-semibold text-sm mb-1">{task.title}</p>
                      {task.description && (
                        <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs font-medium bg-muted text-foreground inline-flex px-1.5 py-0.5 rounded-sm">
                        {task.start_date} &rarr; {task.end_date}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="border-border shadow-lg rounded-xl sm:max-w-[425px] bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full shrink-0 shadow-sm" 
                style={{ backgroundColor: selectedTask?.color }} 
              />
              <span className="truncate">{selectedTask?.title}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground mt-4 pt-4 border-t border-border leading-relaxed">
              {selectedTask?.description || 'No description provided.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 mt-2">
            <div className="grid grid-cols-4 items-center gap-4 bg-muted/50 rounded-md p-3 text-sm">
              <span className="font-medium text-muted-foreground">Start Date</span>
              <span className="col-span-3">{selectedTask?.start_date}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 bg-muted/50 rounded-md p-3 text-sm">
              <span className="font-medium text-muted-foreground">End Date</span>
              <span className="col-span-3">{selectedTask?.end_date}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 bg-muted/50 rounded-md p-3 text-sm">
              <span className="font-medium text-muted-foreground">Status</span>
              <span className="col-span-3 capitalize">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-background border border-border shadow-sm text-xs font-medium">
                  {selectedTask?.status}
                </span>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
