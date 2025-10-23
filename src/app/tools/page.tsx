
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
import { MoreHorizontal, Plus, Search, Trash2, SquarePen, Calendar as CalendarIcon } from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { addDays, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import type { UserGuide } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { UserGuideCard } from '@/components/user-guide-card';


const guides = [
  {
    title: 'Guía para Principiantes de Cultivo de Cannabis',
    content: 'Cultivar cannabis por primera vez puede parecer abrumador, pero con esta guía, tendrás una base sólida. 1. **Elección de la Semilla:** Comienza con semillas de buena calidad. Las "feminizadas" garantizan plantas hembra (las que producen cogollos), y las "autoflorecientes" tienen un ciclo de vida más corto y son más fáciles para empezar. 2. **Interior vs. Exterior:** El cultivo interior te da control total sobre el ambiente (luz, temperatura), pero requiere una inversión inicial (carpa, luces, ventilador). El exterior es más económico pero depende del clima. 3. **Iluminación (Interior):** Las luces LED son la opción más popular por su eficiencia y baja emisión de calor. Durante la fase vegetativa, las plantas necesitan 18 horas de luz y 6 de oscuridad. 4. **Sustrato:** Un buen sustrato (tierra) debe ser aireado y drenar bien. Las mezclas "light mix" son ideales para principiantes, ya que tienen pocos nutrientes y te permiten añadirlos tú mismo. 5. **Riego:** No riegues en exceso. La regla de oro es regar solo cuando los primeros 2-3 cm de tierra estén secos. El pH del agua es crucial; para tierra, debe estar entre 6.0 y 7.0.',
  },
  {
    title: 'Manejo Avanzado de Nutrientes',
    content: 'Las plantas de cannabis necesitan una dieta balanceada para prosperar. Los nutrientes se dividen en macronutrientes y micronutrientes. **Macronutrientes (N-P-K):** Son los más importantes. Nitrógeno (N) para el crecimiento de hojas y tallos (fase vegetativa). Fósforo (P) para el desarrollo de raíces y flores. Potasio (K) para la salud general y la producción de flores. **Micronutrientes:** Calcio, Magnesio, Azufre, Hierro, etc. Son necesarios en menores cantidades. **Diagnóstico de Deficiencias:** Hojas amarillas desde la parte baja de la planta suelen indicar deficiencia de Nitrógeno (N). Manchas marrones o puntas quemadas pueden ser un signo de exceso de nutrientes (sobrefertilización). Hojas pálidas con venas verdes pueden indicar falta de Magnesio. Siempre introduce los nutrientes gradualmente, empezando con la mitad de la dosis recomendada por el fabricante.',
  },
  {
    title: 'Control de Plagas y Enfermedades',
    content: 'La prevención es la mejor defensa. Un ambiente limpio y con buena circulación de aire es clave. **Plagas Comunes:** 1. **Araña Roja:** Pequeños puntos en las hojas y telarañas finas. Les gusta el aire seco y caliente. El aceite de Neem o el jabón potásico son buenos tratamientos orgánicos. 2. **Mosca del Hongo:** Pequeños mosquitos negros revoloteando sobre la tierra. Indican exceso de humedad. Deja secar la capa superior de la tierra entre riegos. **Enfermedades Comunes:** 1. **Oídio:** Un polvo blanco en las hojas, parece harina. Ocurre con alta humedad y poca ventilación. Se puede tratar con fungicidas a base de azufre o bicarbonato de potasio. 2. **Moho del Cogollo (Botrytis):** Es el más destructivo. Aparece en cogollos densos con poca ventilación. Se ve como un moho gris o marrón. Una vez que aparece, es muy difícil de detener. La prevención (baja humedad en floración) es crucial.',
  },
  {
    title: 'Cosecha, Secado y Curado',
    content: 'Este es el último paso y es vital para la calidad final. **Cuándo Cosechar:** El momento ideal es cuando la mayoría de los tricomas (las glándulas de resina) pasan de ser transparentes a un color blanco lechoso. Unos pocos de color ámbar están bien, pero si la mayoría son ámbar, el efecto será más narcótico y menos psicoactivo. **Secado:** Corta las ramas y cuélgalas boca abajo en un lugar oscuro, con buena ventilación y una humedad relativa del 50-60%. Este proceso dura entre 7 y 14 días. Los cogollos están listos cuando las ramas pequeñas se quiebran al doblarlas, pero las más grandes aún tienen algo de flexibilidad. **Curado:** Una vez secos, corta los cogollos de las ramas y guárdalos en frascos de vidrio herméticos. Llena los frascos al 75% de su capacidad. Durante la primera semana, abre los frascos varias veces al día por unos minutos ("burping") para liberar la humedad. Después, una vez al día durante un par de semanas más. Un buen curado (mínimo 3-4 semanas) mejora drásticamente el sabor, el olor y la potencia.',
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
    { id: 'task1', label: 'Regar plantas (pH 6.5)', completed: true, date: new Date() },
    { id: 'task2', label: 'Revisar plagas/enfermedades', completed: false, date: new Date() },
    { id: 'task3', label: 'Mezclar nutrientes (Etapa vegetativa)', completed: true, date: addDays(new Date(), 2) },
    { id: 'task4', label: 'Podar hojas bajas', completed: false, date: addDays(new Date(), 3) },
    { id: 'task5', label: 'Rotar macetas para luz uniforme', completed: false, date: addDays(new Date(), 3) },
];

const initialUserGuides: UserGuide[] = [
    {
        id: 'user-guide-1',
        authorId: 'user-uid-2',
        authorName: 'YerbaBuena',
        authorAvatar: 'https://picsum.photos/seed/user-uid-2/128/128',
        title: 'Mi método infalible para el secado lento',
        content: 'El secreto para un buen curado empieza con un secado lento. Cuelgo las ramas enteras en un cuarto oscuro con un pequeño ventilador que NO apunte directamente a las plantas. Intento mantener la humedad alrededor del 60% y la temperatura sobre los 18°C. Tarda entre 10 y 14 días, pero la diferencia en el sabor es abismal. ¡Paciencia, cultivadores!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        likes: 28,
        comments: [
            { id: 'ugc-1-1', authorName: 'Sativus', text: '¡Totalmente de acuerdo! El secado lento es la clave.' },
            { id: 'ugc-1-2', authorName: 'Cultivador1', text: 'Gracias por el consejo, voy a probarlo en mi próxima cosecha.' },
        ]
    },
    {
        id: 'user-guide-2',
        authorId: 'admin-uid',
        authorName: 'Admin Canna',
        authorAvatar: 'https://picsum.photos/seed/admin-uid/128/128',
        title: 'Guía Rápida: Cómo hacer un Té de Compost',
        content: 'Un té de compost es un fertilizante líquido y orgánico increíble para tus plantas. Necesitarás: un cubo de 20L, una bomba de aire de acuario, una bolsa de malla, compost de buena calidad y melaza no sulfurada. 1. Llena el cubo con agua sin cloro. 2. Pon 2 tazas de compost en la bolsa de malla y ciérrala. 3. Mete la bolsa en el agua y añade la bomba de aire para oxigenar. 4. Añade 2 cucharadas de melaza al agua. 5. Déjalo burbujear durante 24-36 horas. ¡Listo! Dilúyelo 1:10 con agua y riega tus plantas.',
        createdAt: new Date().toISOString(),
        likes: 55,
        comments: []
    }
]

export default function ToolsPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState(initialTasks);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<{id: string, label: string} | null>(null);
    const [newTaskLabel, setNewTaskLabel] = useState('');
    const [cultivationStartDate, setCultivationStartDate] = useState<Date | undefined>(new Date());
    const [guideSearch, setGuideSearch] = useState('');
    const [dictSearch, setDictSearch] = useState('');
    
    // State for user guides
    const [userGuides, setUserGuides] = useState<UserGuide[]>([]);
    const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
    const [newGuideTitle, setNewGuideTitle] = useState('');
    const [newGuideContent, setNewGuideContent] = useState('');

    const loadUserGuides = useCallback(() => {
        const storedGuidesJSON = sessionStorage.getItem('userGuides');
        const storedGuides = storedGuidesJSON ? JSON.parse(storedGuidesJSON) : [];
        const allGuides = [...storedGuides, ...initialUserGuides];
        const uniqueGuides = allGuides.filter((guide, index, self) =>
            index === self.findIndex((g) => g.id === guide.id)
        );
        const sortedGuides = uniqueGuides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserGuides(sortedGuides);
    }, []);

    useEffect(() => {
        loadUserGuides();
        window.addEventListener('storage:userGuides', loadUserGuides);
        return () => window.removeEventListener('storage:userGuides', loadUserGuides);
    }, [loadUserGuides]);


    const handleSaveGuide = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuideTitle.trim() || !newGuideContent.trim() || !user) return;

        const newGuide: UserGuide = {
            id: `user-guide-${Date.now()}`,
            authorId: user.uid,
            authorName: user.displayName || 'Anónimo',
            authorAvatar: user.photoURL,
            title: newGuideTitle,
            content: newGuideContent,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        const updatedGuides = [newGuide, ...userGuides];
        sessionStorage.setItem('userGuides', JSON.stringify(updatedGuides));
        setUserGuides(updatedGuides);
        
        setIsGuideDialogOpen(false);
        setNewGuideTitle('');
        setNewGuideContent('');
    };

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
                completed: false,
                date: new Date() // Por ahora, las nuevas tareas se añaden para hoy.
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
    
    const tasksToday = tasks.filter(task => format(task.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));

    const modifiers = useMemo(() => {
        const taskDays = tasks.map(task => task.date);
        if (!cultivationStartDate) return { hasTasks: taskDays };

        const germinationStart = cultivationStartDate;
        const germinationEnd = addDays(germinationStart, 6);

        const vegetativeStart = addDays(germinationEnd, 1);
        const vegetativeEnd = addDays(vegetativeStart, 29);

        const floweringStart = addDays(vegetativeEnd, 1);
        const floweringEnd = addDays(floweringStart, 59);

        return {
            germination: { from: germinationStart, to: germinationEnd },
            vegetative: { from: vegetativeStart, to: vegetativeEnd },
            flowering: { from: floweringStart, to: floweringEnd },
            hasTasks: taskDays,
        };
    }, [cultivationStartDate, tasks]);

    const filteredGuides = useMemo(() => 
        guides.filter(g => g.title.toLowerCase().includes(guideSearch.toLowerCase()) || g.content.toLowerCase().includes(guideSearch.toLowerCase()))
    , [guideSearch]);
    
    const filteredDictionary = useMemo(() =>
        dictionary.filter(d => d.term.toLowerCase().includes(dictSearch.toLowerCase()) || d.definition.toLowerCase().includes(dictSearch.toLowerCase()))
    , [dictSearch]);

    return (
        <div className="w-full">
            <PageHeader
                title="Herramientas de Cultivo"
                description="Tu centro de mando para un cultivo exitoso."
            />
            <div className="p-4 md:p-8">
                <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="calendar">Calendario y Tareas</TabsTrigger>
                        <TabsTrigger value="guides">Guías Oficiales</TabsTrigger>
                        <TabsTrigger value="user-guides">Guías de Usuarios</TabsTrigger>
                        <TabsTrigger value="dictionary">Diccionario</TabsTrigger>
                    </TabsList>
                    <TabsContent value="calendar" className="mt-6">
                        <div className="grid gap-8 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <CardTitle>Calendario de Cultivo</CardTitle>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal",
                                                    !cultivationStartDate && "text-muted-foreground"
                                                )}
                                                >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {cultivationStartDate ? format(cultivationStartDate, "PPP") : <span>Elige una fecha de inicio</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                mode="single"
                                                selected={cultivationStartDate}
                                                onSelect={setCultivationStartDate}
                                                initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 md:p-6 flex flex-col items-center">
                                    <Calendar
                                        mode="single"
                                        selected={new Date()}
                                        className="flex justify-center"
                                        modifiers={modifiers}
                                        modifiersClassNames={{
                                            germination: 'germination-modifier',
                                            vegetative: 'vegetative-modifier',
                                            flowering: 'flowering-modifier',
                                            hasTasks: 'has-tasks-modifier',
                                        }}
                                        footer={
                                            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
                                                <div className="flex items-center gap-2"><Badge className="bg-accent text-accent-foreground hover:bg-accent/80">Germinación</Badge></div>
                                                <div className="flex items-center gap-2"><Badge className="bg-primary text-primary-foreground hover:bg-primary/80">Vegetativo</Badge></div>
                                                <div className="flex items-center gap-2"><Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Floración</Badge></div>
                                                <div className="flex items-center gap-2"><span className="relative flex h-2 w-2 rounded-full bg-foreground"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/50 opacity-75"></span></span> Día con tareas</div>
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
                                        {tasksToday.length > 0 ? tasksToday.map((task) => (
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
                     <TabsContent value="guides" className="mt-6">
                        <div className="max-w-2xl mx-auto">
                             <div className="relative w-full mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Buscar en guías..." 
                                    className="pl-9" 
                                    value={guideSearch}
                                    onChange={(e) => setGuideSearch(e.target.value)}
                                />
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                            {filteredGuides.map((guide, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{guide.title}</AccordionTrigger>
                                <AccordionContent>{guide.content}</AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                             {filteredGuides.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">
                                    <p>No se encontraron guías.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="user-guides" className="mt-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-end mb-6">
                                <Button onClick={() => setIsGuideDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Nueva Guía
                                </Button>
                            </div>
                             <div className="space-y-6">
                                {userGuides.length > 0 ? (
                                    userGuides.map(guide => (
                                        <UserGuideCard 
                                            key={guide.id}
                                            guide={guide}
                                            currentUser={user}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                                        <p className="font-semibold">¡Sé el primero en compartir tu sabiduría!</p>
                                        <p className="text-sm">Todavía no hay guías de usuarios. Crea una para ayudar a la comunidad.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="dictionary" className="mt-6">
                        <div className="max-w-2xl mx-auto">
                             <div className="relative w-full mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Buscar término..." 
                                    className="pl-9"
                                    value={dictSearch}
                                    onChange={(e) => setDictSearch(e.target.value)}
                                />
                            </div>
                            <Accordion type="multiple" className="w-full">
                                {filteredDictionary.map((item, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>{item.term}</AccordionTrigger>
                                    <AccordionContent>{item.definition}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            {filteredDictionary.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">
                                    <p>No se encontraron términos.</p>
                                </div>
                            )}
                        </div>
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

            <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Guía</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveGuide}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="guide-title">Título de la guía</Label>
                                <Input
                                    id="guide-title"
                                    value={newGuideTitle}
                                    onChange={(e) => setNewGuideTitle(e.target.value)}
                                    placeholder="Ej: Mi truco para combatir el oídio"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="guide-content">Contenido</Label>
                                <Textarea
                                    id="guide-content"
                                    value={newGuideContent}
                                    onChange={(e) => setNewGuideContent(e.target.value)}
                                    placeholder="Comparte tu conocimiento con la comunidad..."
                                    className="min-h-[150px]"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                               <Button type="button" variant="ghost">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Publicar Guía</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

