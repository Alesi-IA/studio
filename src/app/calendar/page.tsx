'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import React from 'react';

const tasks = [
  { id: 'task1', label: 'Water plants (pH 6.5)', completed: true },
  { id: 'task2', label: 'Check for pests/disease', completed: false },
  { id: 'task3', label: 'Mix nutrients (Veg stage)', completed: true },
  { id: 'task4', label: 'Prune lower fan leaves', completed: false },
  { id: 'task5', label: 'Rotate pots for even light', completed: false },
];

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Grow Calendar"
        description="Organize your cultivation stages and track your tasks."
        actions={
            <Button>
                <Plus className="-ml-1 h-4 w-4" />
                New Task
            </Button>
        }
      />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-2 md:p-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="flex justify-center"
                modifiers={{
                  germination: [new Date(2024, 5, 8), new Date(2024, 5, 9)],
                  vegetative: { from: new Date(2024, 5, 10), to: new Date(2024, 6, 15) },
                  flowering: { from: new Date(2024, 6, 16), to: new Date() },
                }}
                modifiersStyles={{
                  germination: { color: 'hsl(var(--accent-foreground))', backgroundColor: 'hsl(var(--accent))' },
                  vegetative: { color: 'hsl(var(--primary-foreground))', backgroundColor: 'hsl(var(--primary))' },
                  flowering: { color: 'hsl(var(--secondary-foreground))', backgroundColor: 'hsl(var(--secondary))' },
                }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <Checkbox id={task.id} defaultChecked={task.completed} />
                    <label
                      htmlFor={task.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
