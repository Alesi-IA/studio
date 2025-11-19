
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Plus, Search, Trash2, SquarePen, Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { addDays, format, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import type { UserGuide, CultivationTask, DictionaryTerm } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { UserGuideCard } from '@/components/user-guide-card';
import { predefinedTasks, CultivationPhase } from '@/lib/cultivation-plan';
import { getLunarPhase, LunarPhaseInfo } from '@/lib/lunar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const officialGuides = [
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

const demoUserGuides: UserGuide[] = [
    {
        id: 'ug-1',
        authorId: 'user-2',
        authorName: 'CultivadorPro',
        authorAvatar: 'https://picsum.photos/seed/user-2/40/40',
        title: 'Mi técnica de LST para aumentar la producción',
        content: 'El Low Stress Training (LST) es clave. Consiste en doblar suavemente las ramas para que la luz llegue a más partes de la planta...',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        likedBy: ['user-3', 'user-4'],
        comments: []
    }
];

const demoDictionary: DictionaryTerm[] = [
    { id: 'dt-1', term: 'Autofloreciente', definition: 'Variedad de cannabis que florece automáticamente según su edad, no por el ciclo de luz. Ideal para principiantes.'},
    { id: 'dt-2', term: 'Feminizada', definition: 'Semilla de cannabis genéticamente modificada para producir solo plantas hembra, que son las que producen cogollos.'},
    { id: 'dt-3', term: 'Tricomas', definition: 'Pequeñas glándulas de resina en las flores y hojas de cannabis que contienen cannabinoides como el THC y el CBD. Parecen pequeños cristales.'},
];


function generatePlan(startDate: Date, authorId: string): CultivationTask[] {
    return predefinedTasks.map(taskTemplate => ({
        id: `task-${authorId}-${taskTemplate.day}-${Math.random()}`,
        authorId: authorId,
        label: taskTemplate.name,
        description: taskTemplate.description,
        completed: false,
        date: addDays(startOfDay(startDate), taskTemplate.day - 1),
        phase: taskTemplate.phase,
    }));
}


export default function ToolsPage() {
    const { user, addExperience } = useAuth();
    const [tasks, setTasks] = useState<CultivationTask[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<CultivationTask | null>(null);
    const [newTaskLabel, setNewTaskLabel] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [cultivationStartDate, setCultivationStartDate] = useState<Date | undefined>(new Date());
    
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

    const [guideSearch, setGuideSearch] = useState('');
    const [dictSearch, setDictSearch] = useState('');
    
    const [userGuides, setUserGuides] = useState<UserGuide[]>(demoUserGuides);
    const [isLoadingGuides, setIsLoadingGuides] = useState(false);
    const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
    const [isSubmittingGuide, setIsSubmittingGuide] = useState(false);
    const [newGuideTitle, setNewGuideTitle] = useState('');
    const [newGuideContent, setNewGuideContent] = useState('');
    const [userGuideSearch, setUserGuideSearch] = useState('');
    
    const [dictionary, setDictionary] = useState<DictionaryTerm[]>(demoDictionary);
    const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);

    useEffect(() => {
        if (cultivationStartDate && user) {
            const newPlan = generatePlan(cultivationStartDate, user.uid);
            setTasks(newPlan);
        } else {
            setTasks([]);
        }
    }, [cultivationStartDate, user]);

    const filteredUserGuides = useMemo(() => {
        if (!userGuideSearch.trim()) {
            return userGuides;
        }
        return userGuides.filter(guide => 
            guide.title.toLowerCase().includes(userGuideSearch.toLowerCase()) ||
            guide.content.toLowerCase().includes(userGuideSearch.toLowerCase())
        );
    }, [userGuides, userGuideSearch]);


    const handleSaveGuide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuideTitle.trim() || !newGuideContent.trim() || !user) return;
        setIsSubmittingGuide(true);
        console.log('Simulating guide creation');
        addExperience(user.uid, 20); // +20 XP for writing a guide
        setIsGuideDialogOpen(false);
        setNewGuideTitle('');
        setNewGuideContent('');
        setIsSubmittingGuide(false);
    };

    const handleToggleTask = async (taskId: string) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, completed: !t.completed} : t));
    };
    
    const handleOpenEditDialog = (task: CultivationTask) => {
        setEditingTask(task);
        setNewTaskLabel(task.label);
        setNewTaskDescription(task.description || '');
        setIsTaskDialogOpen(true);
    };

    const handleOpenNewDialog = () => {
        if (!selectedDate) return;
        setEditingTask(null);
        setNewTaskLabel('');
        setNewTaskDescription('');
        setIsTaskDialogOpen(true);
    }
    
    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskLabel.trim() || !user) return;

        if (editingTask) {
            setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? {...t, label: newTaskLabel, description: newTaskDescription } : t));
        } else {
            const newTask: CultivationTask = {
                id: `task-${Date.now()}`,
                authorId: user.uid,
                label: newTaskLabel,
                description: newTaskDescription,
                completed: false,
                date: selectedDate || new Date()
            };
            setTasks(prevTasks => [...prevTasks, newTask]);
        }
        
        setIsTaskDialogOpen(false);
        setNewTaskLabel('');
        setNewTaskDescription('');
        setEditingTask(null);
    };

    const handleDeleteTask = async (taskId: string) => {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    };

    const DayWithLunarPhase = ({ date, ...props }: { date: Date } & any) => {
        const lunarPhase = useMemo(() => getLunarPhase(date), [date]);
        const LunarIcon = lunarPhase.icon;
    
        return (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div {...props} className={cn(props.className, 'relative')}>
                            {props.children}
                            <LunarIcon className="absolute bottom-1 right-1 h-3 w-3 text-muted-foreground opacity-50" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-semibold">{lunarPhase.phaseName}</p>
                        <p className="text-xs text-muted-foreground">{lunarPhase.advice}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };
    
    const tasksForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return tasks.filter(task => format(new Date(task.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));
    }, [tasks, selectedDate]);
    
    const modifiers = useMemo(() => {
        const taskDays = tasks.reduce((acc, task) => {
            const day = startOfDay(new Date(task.date)).toISOString();
            if (!acc.has(day)) acc.set(day, { date: new Date(day), tasks: [] });
            acc.get(day)!.tasks.push(task);
            return acc;
        }, new Map<string, { date: Date; tasks: CultivationTask[] }>());
        
        if (!cultivationStartDate) return { hasTasks: Array.from(taskDays.values()).map(v => v.date) };

        const getPhaseStyle = (phase: CultivationPhase) => {
            switch(phase) {
                case 'germination': return 'germination-modifier';
                case 'vegetative': return 'vegetative-modifier';
                case 'flowering': return 'flowering-modifier';
                default: return '';
            }
        };

        const phaseModifiers = {
            germination: { from: addDays(cultivationStartDate, 0), to: addDays(cultivationStartDate, 6) },
            vegetative: { from: addDays(cultivationStartDate, 7), to: addDays(cultivationStartDate, 36) },
            flowering: { from: addDays(cultivationStartDate, 37), to: addDays(cultivationStartDate, 90) },
        };
        
        return {
            ...phaseModifiers,
            hasTasks: Array.from(taskDays.values()).map(v => v.date),
        };
    }, [cultivationStartDate, tasks]);

    const filteredOfficialGuides = useMemo(() => 
        officialGuides.filter(g => g.title.toLowerCase().includes(guideSearch.toLowerCase()) || g.content.toLowerCase().includes(guideSearch.toLowerCase()))
    , [guideSearch]);
    
    const filteredDictionary = useMemo(() =>
        dictionary.filter(d => d.term.toLowerCase().includes(dictSearch.toLowerCase()) || d.definition.toLowerCase().includes(dictSearch.toLowerCase()))
    , [dictSearch, dictionary]);

    return (
        <div className="w-full">
            <PageHeader
                title="Herramientas de Cultivo"
                description="Tu centro de mando para un cultivo exitoso."
            />
            <div className="p-4 md:p-8">
                <Tabs defaultValue="planner" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="planner">Planificador Inteligente</TabsTrigger>
                        <TabsTrigger value="guides">Guías Oficiales</TabsTrigger>
                        <TabsTrigger value="user-guides">Guías de Usuarios</TabsTrigger>
                        <TabsTrigger value="dictionary">Diccionario</TabsTrigger>
                    </TabsList>
                    <TabsContent value="planner" className="mt-6">
                        <div className="grid gap-8 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle>Plan de Cultivo</CardTitle>
                                            <CardDescription>Selecciona una fecha para ver y gestionar tareas.</CardDescription>
                                        </div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full sm:w-[280px] justify-start text-left font-normal",
                                                        !cultivationStartDate && "text-muted-foreground"
                                                    )}
                                                    disabled={!user}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {cultivationStartDate ? `Inicio del cultivo: ${format(cultivationStartDate, "PPP")}` : "Elige una fecha de inicio"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="end">
                                                <Calendar
                                                    mode="single"
                                                    selected={cultivationStartDate}
                                                    onSelect={(date) => {
                                                        setCultivationStartDate(date);
                                                        if (date) setSelectedDate(date);
                                                    }}
                                                    initialFocus
                                                    disabled={!user}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 md:p-6 flex flex-col items-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => setSelectedDate(date || new Date())}
                                        className="flex justify-center"
                                        modifiers={modifiers}
                                        modifiersClassNames={{
                                            germination: 'germination-modifier',
                                            vegetative: 'vegetative-modifier',
                                            flowering: 'flowering-modifier',
                                            hasTasks: 'has-tasks-modifier',
                                        }}
                                        components={{
                                            Day: DayWithLunarPhase,
                                        }}
                                        footer={
                                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-sm">
                                                <div className="flex items-center gap-2"><Badge className="bg-accent text-accent-foreground hover:bg-accent/80">Germinación</Badge></div>
                                                <div className="flex items-center gap-2"><Badge className="bg-primary text-primary-foreground hover:bg-primary/80">Vegetativo</Badge></div>
                                                <div className="flex items-center gap-2"><Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Floración</Badge></div>
                                                <div className="flex items-center gap-2"><span className="relative flex h-2 w-2 rounded-full bg-foreground" />Día con tareas</div>
                                            </div>
                                        }
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle>Tareas para {format(selectedDate, "d 'de' MMMM")}</CardTitle>
                                        <CardDescription>
                                            {getLunarPhase(selectedDate).advice}
                                        </CardDescription>
                                    </div>
                                    <Button size="icon" variant="outline" onClick={handleOpenNewDialog} disabled={!user}>
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Añadir Tarea</span>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {isLoadingTasks ? (
                                            <div className="flex items-center justify-center p-4">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        ) : tasksForSelectedDate.length > 0 ? (
                                            <Accordion type="single" collapsible className="w-full">
                                                {tasksForSelectedDate.map((task) => (
                                                     <AccordionItem value={task.id} key={task.id}>
                                                        <div className="flex items-center group">
                                                             <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => handleToggleTask(task.id)} className="mr-3" />
                                                            <AccordionTrigger className={cn("flex-1 text-sm py-3", task.completed ? 'line-through text-muted-foreground' : '')}>
                                                                {task.label}
                                                            </AccordionTrigger>
                                                            <AlertDialog>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
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
                                                        <AccordionContent className="pl-7 text-xs text-muted-foreground">
                                                            {task.description || 'No hay descripción para esta tarea.'}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        ) : (
                                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                                <p className="font-semibold">Sin tareas programadas</p>
                                                <p className="text-sm mt-1">¡Un día tranquilo para tus plantas!</p>
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
                            {filteredOfficialGuides.map((guide, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{guide.title}</AccordionTrigger>
                                <AccordionContent className="whitespace-pre-line">{guide.content}</AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                             {filteredOfficialGuides.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">
                                    <p>No se encontraron guías.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="user-guides" className="mt-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-6">
                               <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Buscar en guías de usuarios..." 
                                        className="pl-9" 
                                        value={userGuideSearch}
                                        onChange={(e) => setUserGuideSearch(e.target.value)}
                                    />
                                </div>
                                <Button onClick={() => setIsGuideDialogOpen(true)} className="w-full sm:w-auto" disabled={!user}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Nueva Guía
                                </Button>
                            </div>
                             <div className="space-y-6">
                                {isLoadingGuides ? (
                                     <div className="flex items-center justify-center p-12">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                     </div>
                                ) : filteredUserGuides.length > 0 ? (
                                    filteredUserGuides.map(guide => (
                                        <UserGuideCard 
                                            key={guide.id}
                                            guide={guide}
                                            currentUser={user}
                                            onUpdate={() => {}}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                                        <p className="font-semibold">{userGuideSearch ? 'No se encontraron guías' : '¡Sé el primero en compartir tu sabiduría!'}</p>
                                        <p className="text-sm">{userGuideSearch ? 'Intenta con otra búsqueda.' : 'Todavía no hay guías de usuarios. Crea una para ayudar a la comunidad.'}</p>
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
                            {isLoadingDictionary ? (
                                <div className="flex items-center justify-center p-12">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <Accordion type="multiple" className="w-full">
                                    {filteredDictionary.map((item, index) => (
                                        <AccordionItem value={`item-${index}`} key={item.id}>
                                        <AccordionTrigger>{item.term}</AccordionTrigger>
                                        <AccordionContent>{item.definition}</AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )}
                            {!isLoadingDictionary && filteredDictionary.length === 0 && (
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
                             <div className="grid gap-2">
                                <Label htmlFor="task-description">Descripción (Opcional)</Label>
                                <Textarea
                                    id="task-description"
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    placeholder="Añade detalles sobre la tarea..."
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
                               <Button type="button" variant="ghost" disabled={isSubmittingGuide}>Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmittingGuide}>
                                {isSubmittingGuide && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Publicar Guía
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
