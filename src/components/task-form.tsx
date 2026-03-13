'use client';

import { useRef, useState } from 'react';
import { createTask } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

export function TaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [color, setColor] = useState<string>(DEFAULT_COLORS[10]);

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!startDate || !endDate) {
      alert('Please select both a start and end date.');
      return;
    }

    if (!title) return;

    await createTask({
      title,
      description,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      color,
      status: 'pending'
    });

    formRef.current?.reset();
    setStartDate(undefined);
    setEndDate(undefined);
    setColor(DEFAULT_COLORS[10]);
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm font-medium">Task Title</Label>
        <Input 
          id="title" 
          name="title" 
          required 
          className="bg-background/50 focus-visible:ring-1 transition-all" 
          placeholder="New Task"
        />
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium text-muted-foreground">Description</Label>
        <Input 
          id="description" 
          name="description" 
          className="bg-background/50 focus-visible:ring-1 transition-all text-muted-foreground" 
          placeholder="Details..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 flex flex-col">
          <Label className="text-sm font-medium">Start Date</Label>
          <Popover>
            <PopoverTrigger
              className={cn(
                "inline-flex items-center text-sm transition-colors border border-input shadow-sm h-9 px-3 py-2 w-full justify-start text-left font-normal bg-background/50 hover:bg-muted/50 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-border shadow-md rounded-md" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="bg-card text-foreground"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-1.5 flex flex-col">
          <Label className="text-sm font-medium">End Date</Label>
          <Popover>
            <PopoverTrigger
              className={cn(
                "inline-flex items-center text-sm transition-colors border border-input shadow-sm h-9 px-3 py-2 w-full justify-start text-left font-normal bg-background/50 hover:bg-muted/50 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-border shadow-md rounded-md" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="bg-card text-foreground"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-1.5 flex flex-col">
        <Label className="text-sm font-medium">Color</Label>
        <Popover>
          <PopoverTrigger
            className="inline-flex items-center text-sm transition-colors border border-input shadow-sm h-9 px-3 py-2 w-full justify-start text-left font-normal bg-background/50 hover:bg-muted/50 gap-3 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <div 
              className="w-4 h-4 rounded-full shrink-0 border border-border shadow-sm" 
              style={{ backgroundColor: color }}
            />
            <span className="truncate">{color}</span>
            <Palette className="ml-auto h-4 w-4 opacity-50 shrink-0" />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 border-border shadow-md rounded-md" align="start">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border border-border transition-all hover:scale-110",
                    color === c && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Label htmlFor="custom-color" className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                Custom Color
              </Label>
              <div className="relative w-full h-8 rounded-md overflow-hidden border border-border">
                <input
                  id="custom-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button 
        type="submit" 
        className="w-full mt-2 font-medium"
      >
        Add Task
      </Button>
    </form>
  );
}