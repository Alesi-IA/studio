
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
import { MoreHorizontal, Plus, Search, Trash2, SquarePen, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
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
import type { UserGuide, CultivationTask, DictionaryTerm } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { UserGuideCard } from '@/components/user-guide-card';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';


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

export default function ToolsPage() {
    const { user, addExperience } = useAuth();
    const { firestore } = useFirebase();

    const [tasks, setTasks] = useState<CultivationTask[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<CultivationTask | null>(null);
    const [newTaskLabel, setNewTaskLabel] = useState('');
    const [cultivationStartDate, setCultivationStartDate] = useState<Date | undefined>(new Date());
    const [guideSearch, setGuideSearch] = useState('');
    const [dictSearch, setDictSearch] = useState('');
    
    const [userGuides, setUserGuides] = useState<UserGuide[]>([]);
    const [isLoadingGuides, setIsLoadingGuides] = useState(true);
    const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
    const [isSubmittingGuide, setIsSubmittingGuide] = useState(false);
    const [newGuideTitle, setNewGuideTitle] = useState('');
    const [newGuideContent, setNewGuideContent] = useState('');
    const [userGuideSearch, setUserGuideSearch] = useState('');
    
    const [dictionary, setDictionary] = useState<DictionaryTerm[]>([]);
    const [isLoadingDictionary, setIsLoadingDictionary] = useState(true);

    const loadDictionary = useCallback(async () => {
        if (!firestore) return;
        setIsLoadingDictionary(true);
        try {
            const termsQuery = query(collection(firestore, 'dictionaryTerms'));
            const querySnapshot = await getDocs(termsQuery);
            const termsFromDb = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DictionaryTerm));
            setDictionary(termsFromDb);
        } catch (error) {
            console.error("Error loading dictionary:", error);
        } finally {
            setIsLoadingDictionary(false);
        }
    }, [firestore]);


    const loadTasks = useCallback(async () => {
        if (!firestore || !user) return;
        setIsLoadingTasks(true);
        try {
            const tasksQuery = query(collection(firestore, 'cultivationTasks'), where('authorId', '==', user.uid));
            const querySnapshot = await getDocs(tasksQuery);
            const tasksFromDb = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    date: data.date.toDate() // Convert Firestore Timestamp to Date
                } as CultivationTask;
            });
            setTasks(tasksFromDb);
        } catch (error) {
            console.error("Error loading tasks:", error);
        } finally {
            setIsLoadingTasks(false);
        }
    }, [firestore, user]);

    const loadUserGuides = useCallback(async () => {
        if (!firestore) return;
        setIsLoadingGuides(true);
        const guidesQuery = query(collection(firestore, 'userGuides'));
        const querySnapshot = await getDocs(guidesQuery);
        const guidesFromDb = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserGuide));
        guidesFromDb.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserGuides(guidesFromDb);
        setIsLoadingGuides(false);
    }, [firestore]);

    useEffect(() => {
        loadUserGuides();
        loadTasks();
        loadDictionary();
    }, [loadUserGuides, loadTasks, loadDictionary]);

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
        if (!newGuideTitle.trim() || !newGuideContent.trim() || !user || !firestore) return;

        setIsSubmittingGuide(true);
        
        try {
            const guidesCollectionRef = collection(firestore, 'userGuides');
            await addDoc(guidesCollectionRef, {
                authorId: user.uid,
                authorName: user.displayName || 'Anónimo',
                authorAvatar: user.photoURL,
                title: newGuideTitle,
                content: newGuideContent,
                createdAt: new Date().toISOString(),
                likedBy: [],
                comments: []
            });

            addExperience(user.uid, 20); // +20 XP for writing a guide
            await loadUserGuides();
            
            setIsGuideDialogOpen(false);
            setNewGuideTitle('');
            setNewGuideContent('');
        } catch (error) {
            console.error("Error creating guide:", error);
        } finally {
            setIsSubmittingGuide(false);
        }
    };

    const handleToggleTask = async (taskId: string) => {
        if (!firestore) return;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const taskRef = doc(firestore, 'cultivationTasks', taskId);
        await updateDoc(taskRef, { completed: !task.completed });
        loadTasks(); // Reload tasks to reflect the change
    };
    
    const handleOpenEditDialog = (task: CultivationTask) => {
        setEditingTask(task);
        setNewTaskLabel(task.label);
        setIsTaskDialogOpen(true);
    };

    const handleOpenNewDialog = () => {
        setEditingTask(null);
        setNewTaskLabel('');
        setIsTaskDialogOpen(true);
    }
    
    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskLabel.trim() || !user || !firestore) return;

        if (editingTask) {
            const taskRef = doc(firestore, 'cultivationTasks', editingTask.id);
            await updateDoc(taskRef, { label: newTaskLabel });
        } else {
            const tasksCollectionRef = collection(firestore, 'cultivationTasks');
            await addDoc(tasksCollectionRef, {
                authorId: user.uid,
                label: newTaskLabel,
                completed: false,
                date: new Date() // New tasks are for today
            });
        }
        
        await loadTasks();
        setIsTaskDialogOpen(false);
        setNewTaskLabel('');
        setEditingTask(null);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!firestore) return;
        const taskRef = doc(firestore, 'cultivationTasks', taskId);
        await deleteDoc(taskRef);
        loadTasks(); // Reload tasks
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
                                    <Button size="sm" onClick={handleOpenNewDialog} disabled={!user}>
                                        <Plus className="-ml-1 h-4 w-4" />
                                        Nueva
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {isLoadingTasks ? (
                                            <div className="flex items-center justify-center p-4">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        ) : tasksToday.length > 0 ? tasksToday.map((task) => (
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
                            {filteredOfficialGuides.map((guide, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{guide.title}</AccordionTrigger>
                                <AccordionContent>{guide.content}</AccordionContent>
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
                                            onUpdate={loadUserGuides}
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
