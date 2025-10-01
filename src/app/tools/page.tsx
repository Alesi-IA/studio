
'use client';
import { PageHeader } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Plus, Search, Trash2, Edit, SquarePen } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const guides = [
  {
    title: 'Guía para Principiantes de Cultivo de Cannabis',
    content: 'Desde la semilla hasta la cosecha, esta guía cubre todos los conceptos básicos que necesitas para comenzar tu primer cultivo. Aprende sobre iluminación, suelo, riego y más.',
  },
  {
    title: 'Manejo Avanzado de Nutrientes',
    content: 'Comprende el papel de los macronutrientes (N-P-K) y micronutrientes. Aprende a diagnosticar y tratar deficiencias y toxicidades.',
  },
  {
    title: 'Control de Plagas y Enfermedades',
    content: 'Una guía completa para identificar y eliminar plagas comunes como los ácaros araña y los mosquitos de los hongos, y enfermedades como el oídio.',
  },
  {
    title: 'Cosecha, Secado y Curado',
    content: 'El momento de la cosecha es crucial. Aprende las mejores técnicas para secar y curar tus cogollos para maximizar la potencia y el sabor.',
  },
];

const dictionary = [
    {
      term: 'Cannabinoides',
      definition: 'Compuestos químicos que se encuentran en la planta de cannabis, como el THC y el CBD, que interactúan con los receptores del cuerpo humano.',
    },
    {
      term: 'Terpenos',
      definition: 'Aceites aromáticos que dan a las variedades de cannabis sabores distintivos como cítricos, bayas, menta y pino. También juegan un papel en los efectos de la planta.',
    },
    {
      term: 'Tricomas',
      definition: 'Las glándulas cristalinas en la superficie de las flores de cannabis que producen y almacenan cannabinoides y terpenos. Parecen pequeños pelos o champiñones.',
    },
    {
      term: 'Semillas Feminizadas',
      definition: 'Semillas de cannabis que se crían específicamente para eliminar los cromosomas masculinos, asegurando que cada planta cultivada a partir de ellas sea hembra y produzca cogollos.',
    },
  ];

const initialTasks = [
    { id: 'task1', label: 'Regar plantas (pH 6.5)', completed: true },
    { id: 'task2', label: 'Revisar plagas/enfermedades', completed: false },
    { id: 'task3', label: 'Mezclar nutrientes (Etapa vegetativa)', completed: true },
    { id: 'task4', label: 'Podar hojas bajas', completed: false },
    { id: 'task5', label: 'Rotar macetas para luz uniforme', completed: false },
];

export default function ToolsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [tasks, setTasks] = useState(initialTasks);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<{id: string, label: string} | null>(null);
    const [newTaskLabel, setNewTaskLabel] = useState('');


    const handleToggleTask = (taskId: string) => {
        setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    };
    
    const handleOpenEditDialog = (task: {id: string, label: string}) => {
        setEditingTask(task);
        setNewTaskLabel(task.label);
        setIsTaskDialogOpen(true);
    };

    const handleOpenNewDialog = () => {
        setEditingTask(null);
        setNewTaskLabel('');
        setIsTaskDialogOpen(true);
    }
    
    const handleSaveTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskLabel.trim()) return;

        if (editingTask) {
            setTasks(tasks.map(task => task.id === editingTask.id ? { ...task, label: newTaskLabel } : task));
        } else {
            const newTask = {
                id: `task-${Date.now()}`,
                label: newTaskLabel,
                completed: false
            };
            setTasks([...tasks, newTask]);
        }
        setIsTaskDialogOpen(false);
        setNewTaskLabel('');
        setEditingTask(null);
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const modifiers = {
        germination: [new Date(today.getFullYear(), today.getMonth(), 8), new Date(today.getFullYear(), today.getMonth(), 9)],
        vegetative: { from: new Date(today.getFullYear(), today.getMonth(), 10), to: new Date(today.getFullYear(), today.getMonth() + 1, 15) },
        flowering: { from: new Date(today.getFullYear(), today.getMonth() + 1, 16), to: new Date() },
        hasTasks: tasks.length > 0 ? [new Date()] : [],
    };

    return (
        <div className="w-full">
            <PageHeader
                title="Calendario y Tareas"
                description="Tu centro de mando para un cultivo exitoso."
            />
            <div className="p-4 md:p-8">
                <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="calendar">Calendario y Tareas</TabsTrigger>
                        <TabsTrigger value="library">Biblioteca</TabsTrigger>
                    </TabsList>
                    <TabsContent value="calendar" className="mt-6">
                        <div className="grid gap-8 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardContent className="p-2 md:p-6 flex flex-col items-center">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="flex justify-center"
                                        modifiers={modifiers}
                                        modifiersStyles={{
                                            germination: { color: 'hsl(var(--accent-foreground))', backgroundColor: 'hsl(var(--accent))' },
                                            vegetative: { color: 'hsl(var(--primary-foreground))', backgroundColor: 'hsl(var(--primary))' },
                                            flowering: { color: 'hsl(var(--secondary-foreground))', backgroundColor: 'hsl(var(--secondary))' },
                                            hasTasks: { textDecoration: 'underline' }
                                        }}
                                        footer={
                                            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                                                <div className="flex items-center gap-2"><Badge className="bg-accent text-accent-foreground hover:bg-accent/80">Germinación</Badge></div>
                                                <div className="flex items-center gap-2"><Badge className="bg-primary text-primary-foreground hover:bg-primary/80">Vegetativo</Badge></div>
                                                <div className="flex items-center gap-2"><Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Floración</Badge></div>
                                            </div>
                                        }
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Tareas de Hoy</CardTitle>
                                    <Button size="sm" onClick={handleOpenNewDialog}>
                                        <Plus className="-ml-1 h-4 w-4" />
                                        Nueva
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {tasks.length > 0 ? tasks.map((task) => (
                                            <div key={task.id} className="flex items-center space-x-3 group">
                                                <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => handleToggleTask(task.id)} />
                                                <label
                                                    htmlFor={task.id}
                                                    className={`flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                                                >
                                                    {task.label}
                                                </label>
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleOpenEditDialog(task)}>
                                                                <SquarePen className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Seguro que quieres eliminar esta tarea?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )) : (
                                            <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                                <p className="text-sm">No hay tareas para hoy. ¡Añade una!</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="library" className="mt-6">
                        <Tabs defaultValue="guides" className="w-full">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <TabsList>
                                <TabsTrigger value="guides">Guías</TabsTrigger>
                                <TabsTrigger value="articles">Artículos</TabsTrigger>
                                <TabsTrigger value="dictionary">Diccionario</TabsTrigger>
                                </TabsList>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar en la biblioteca..." className="pl-9" />
                                </div>
                            </div>
                            <TabsContent value="guides" className="mt-6">
                                <Accordion type="single" collapsible className="w-full">
                                {guides.map((guide, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>{guide.title}</AccordionTrigger>
                                    <AccordionContent>{guide.content}</AccordionContent>
                                    </AccordionItem>
                                ))}
                                </Accordion>
                            </TabsContent>
                            <TabsContent value="articles" className="mt-6">
                                <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                                    <p className="font-semibold">Artículos Próximamente</p>
                                    <p className="text-sm">Estamos seleccionando una colección de artículos de cultivadores expertos.</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="dictionary" className="mt-6">
                                <Accordion type="multiple" className="w-full">
                                    {dictionary.map((item, index) => (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>{item.term}</AccordionTrigger>
                                        <AccordionContent>{item.definition}</AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Editar Tarea' : 'Añadir Nueva Tarea'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveTask}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="task-name">Nombre de la tarea</Label>
                                <Input
                                    id="task-name"
                                    value={newTaskLabel}
                                    onChange={(e) => setNewTaskLabel(e.target.value)}
                                    placeholder="Ej: Revisar el pH del agua"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                               <Button type="button" variant="ghost">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">{editingTask ? 'Guardar Cambios' : 'Añadir Tarea'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    