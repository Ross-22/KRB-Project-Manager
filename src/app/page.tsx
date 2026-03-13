import { getTasks } from '@/lib/actions';
import { TaskList } from '@/components/task-list';
import { GanttChart } from '@/components/gantt-chart';
import { TaskForm } from '@/components/task-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Home() {
  const tasks = await getTasks();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-sm border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-medium text-lg">Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <TaskForm />
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-medium text-lg">Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TaskList tasks={tasks} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border h-full min-h-[500px]">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-medium text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <GanttChart tasks={tasks} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
