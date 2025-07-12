
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Appointment, Client, Service, Transaction, TransactionType, Product, Professional } from '../types';
import { addDays } from 'date-fns/addDays';
import { addMonths } from 'date-fns/addMonths';
import { addWeeks } from 'date-fns/addWeeks';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { endOfMonth } from 'date-fns/endOfMonth';
import { endOfWeek } from 'date-fns/endOfWeek';
import { format } from 'date-fns/format';
import { formatISO } from 'date-fns/formatISO';
import { getHours } from 'date-fns/getHours';
import { getMinutes } from 'date-fns/getMinutes';
import { isSameDay } from 'date-fns/isSameDay';
import { isSameMonth } from 'date-fns/isSameMonth';
import { isToday } from 'date-fns/isToday';
import { isThisWeek } from 'date-fns/isThisWeek';
import { isThisMonth } from 'date-fns/isThisMonth';
import { parseISO } from 'date-fns/parseISO';
import { setHours } from 'date-fns/setHours';
import { setMinutes } from 'date-fns/setMinutes';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfWeek } from 'date-fns/startOfWeek';
import { subDays } from 'date-fns/subDays';
import { subMonths } from 'date-fns/subMonths';
import { subWeeks } from 'date-fns/subWeeks';
import { ptBR } from 'date-fns/locale/pt-BR';
import { PlusIcon, XIcon, PencilIcon, CheckCircleIcon, ChartBarIcon } from './Icons';
import RelatoriosModal from './RelatorioProdutosModal';


const ServiceManagementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}> = ({ isOpen, onClose, services, setServices }) => {
    const [serviceData, setServiceData] = useState({ name: '', duration: 60, cost: 100 });
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const isEditing = editingServiceId !== null;

    if (!isOpen) return null;

    const resetForm = () => {
        setEditingServiceId(null);
        setServiceData({ name: '', duration: 60, cost: 100 });
    };

    const handleSelectForEdit = (service: Service) => {
        setEditingServiceId(service.id);
        setServiceData({
            name: service.name,
            duration: service.duration,
            cost: service.cost
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (serviceData.name.trim() === '') {
            alert('O nome do serviço não pode estar vazio.');
            return;
        }
        if (isEditing) {
            setServices(prev => prev.map(s => (s.id === editingServiceId ? { ...s, ...serviceData } : s)));
        } else {
            setServices(prev => [...prev, { id: `serv-${Date.now()}`, ...serviceData }]);
        }
        resetForm();
    };

    const handleRemoveService = (serviceId: string) => {
        if (editingServiceId === serviceId) {
            resetForm();
        }
        setServices(prev => prev.filter(s => s.id !== serviceId));
    };
    
    const handleCloseModal = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gerenciar Serviços</h2>
                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800" aria-label="Fechar modal">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                    {services.map(service => (
                        <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium text-gray-800">{service.name}</p>
                                <p className="text-sm text-gray-500">Duração: {service.duration} min | Custo: R$ {service.cost.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSelectForEdit(service)} className="p-1 text-gray-400 hover:text-teal-600 rounded-full hover:bg-teal-100" aria-label={`Editar ${service.name}`}>
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleRemoveService(service.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100" aria-label={`Remover ${service.name}`}>
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleFormSubmit} className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{isEditing ? `Editando: ${services.find(s=>s.id === editingServiceId)?.name}` : 'Adicionar Novo Serviço'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input type="text" placeholder="Nome do serviço" value={serviceData.name} onChange={e => setServiceData({...serviceData, name: e.target.value})} required className="sm:col-span-3 p-2 border border-gray-300 rounded-md" />
                        <input type="number" placeholder="Duração (min)" value={serviceData.duration} onChange={e => setServiceData({...serviceData, duration: parseInt(e.target.value, 10) || 0})} required className="p-2 border border-gray-300 rounded-md" />
                        <input type="number" placeholder="Custo (R$)" value={serviceData.cost} onChange={e => setServiceData({...serviceData, cost: parseFloat(e.target.value) || 0})} required className="p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <button type="submit" className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex-1">
                            {isEditing ? 'Salvar Alterações' : 'Adicionar Serviço'}
                        </button>
                        {isEditing && (
                             <button type="button" onClick={resetForm} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex-1">
                                Cancelar Edição
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfessionalManagementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    professionals: Professional[];
    setProfessionals: React.Dispatch<React.SetStateAction<Professional[]>>;
}> = ({ isOpen, onClose, professionals, setProfessionals }) => {
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const resetForm = () => {
        setName('');
        setEditingId(null);
    };

    const handleSelectForEdit = (professional: Professional) => {
        setEditingId(professional.id);
        setName(professional.name);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() === '') return;

        if (editingId) {
            setProfessionals(prev => prev.map(p => p.id === editingId ? { ...p, name } : p));
        } else {
            setProfessionals(prev => [...prev, { id: `prof-${Date.now()}`, name }]);
        }
        resetForm();
    };
    
    const handleDelete = (id: string) => {
        if (editingId === id) {
            resetForm();
        }
        setProfessionals(prev => prev.filter(p => p.id !== id));
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gerenciar Profissionais</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar modal"><XIcon className="h-6 w-6" /></button>
                </div>
                
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 mb-6">
                    {professionals.map(prof => (
                        <div key={prof.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <p className="font-medium text-gray-800">{prof.name}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSelectForEdit(prof)} className="p-1 text-gray-400 hover:text-teal-600 rounded-full hover:bg-teal-100" aria-label={`Editar ${prof.name}`}><PencilIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDelete(prof.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100" aria-label={`Remover ${prof.name}`}><XIcon className="h-5 w-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{editingId ? 'Editar Profissional' : 'Adicionar Novo Profissional'}</h3>
                    <input type="text" placeholder="Nome do profissional" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md" />
                    <div className="flex items-center gap-4 mt-4">
                        <button type="submit" className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex-1">
                            {editingId ? 'Salvar Alterações' : 'Adicionar'}
                        </button>
                        {editingId && (
                             <button type="button" onClick={resetForm} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex-1">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

type ModalMode = 'create' | 'edit' | 'finalize';

const AppointmentModal: React.FC<{
    isOpen: boolean;
    mode: ModalMode;
    onClose: () => void;
    onSave: (formData: any, id: string | null, mode: ModalMode) => void;
    clients: Client[];
    services: Service[];
    products: Product[];
    professionals: Professional[];
    newAppointmentDate: Date | null;
    appointmentToEdit: Appointment | null;
}> = ({ isOpen, mode, onClose, onSave, clients, services, products, professionals, newAppointmentDate, appointmentToEdit }) => {
    
    const [formData, setFormData] = useState({
        clientId: '',
        selectedServices: [] as Service[],
        date: '',
        time: '',
        professionalId: '',
        usedProducts: [] as { product: Product; quantity: number }[],
    });

    const [productToAdd, setProductToAdd] = useState('');
    const [quantityToAdd, setQuantityToAdd] = useState(1);

    const { duration, cost } = useMemo(() => {
        const totalDuration = formData.selectedServices.reduce((sum, s) => sum + s.duration, 0);
        const totalCost = formData.selectedServices.reduce((sum, s) => sum + s.cost, 0);
        return { duration: totalDuration, cost: totalCost };
    }, [formData.selectedServices]);

    useEffect(() => {
        if (isOpen) {
            const appointment = appointmentToEdit;
            if (appointment) { // Edit or Finalize mode
                const appointmentDate = parseISO(appointment.date);

                const initialUsedProducts = (appointment.usedProducts || [])
                    .map(up => {
                        const product = products.find(p => p.id === up.productId);
                        return product ? { product, quantity: up.quantity } : null;
                    })
                    .filter((p): p is { product: Product, quantity: number } => p !== null);

                setFormData({
                    clientId: appointment.clientId,
                    selectedServices: appointment.services,
                    date: format(appointmentDate, 'yyyy-MM-dd'),
                    time: format(appointmentDate, 'HH:mm'),
                    professionalId: appointment.professionalId || (professionals.length > 0 ? professionals[0].id : ''),
                    usedProducts: initialUsedProducts,
                });
            } else { // Create mode
                const initialDate = newAppointmentDate || new Date();
                const initialTime = newAppointmentDate ? format(initialDate, 'HH:mm') : '09:00';
                setFormData({
                    clientId: clients[0]?.id || '',
                    selectedServices: [],
                    date: format(initialDate, 'yyyy-MM-dd'),
                    time: initialTime,
                    professionalId: professionals.length > 0 ? professionals[0].id : '',
                    usedProducts: []
                });
            }
        }
    }, [isOpen, appointmentToEdit, newAppointmentDate, clients, professionals, products, mode]);

    if (!isOpen) return null;

    const isFinalizationView = mode === 'finalize' || (mode === 'edit' && appointmentToEdit?.status === 'finished');

    const getModalTitle = () => {
        if (mode === 'create') return 'Novo Agendamento';
        if (mode === 'edit') return appointmentToEdit?.status === 'finished' ? 'Editar Atendimento Finalizado' : 'Editar Agendamento';
        return 'Finalizar Atendimento';
    }

    const getSubmitButtonText = () => {
        if (mode === 'edit' || mode === 'finalize') return 'Salvar Alterações';
        return 'Salvar Agendamento';
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleServiceToggle = (service: Service) => {
        setFormData(prev => {
            const isSelected = prev.selectedServices.some(s => s.id === service.id);
            if (isSelected) {
                return { ...prev, selectedServices: prev.selectedServices.filter(s => s.id !== service.id) };
            } else {
                return { ...prev, selectedServices: [...prev.selectedServices, service] };
            }
        });
    };
    
    const handleAddProduct = () => {
        const product = products.find(p => p.id === productToAdd);
        if (!product || quantityToAdd <= 0) return;

        setFormData(prev => {
             const existing = prev.usedProducts.find(item => item.product.id === product.id);
             if (existing) {
                return {...prev, usedProducts: prev.usedProducts.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item)};
             }
             return {...prev, usedProducts: [...prev.usedProducts, { product, quantity: quantityToAdd }] };
        });
        setQuantityToAdd(1);
        setProductToAdd('');
    };
    
    const handleRemoveUsedProduct = (productId: string) => {
        setFormData(prev => ({...prev, usedProducts: prev.usedProducts.filter(item => item.product.id !== productId)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isFinalizationView && !formData.professionalId) {
            alert('Por favor, selecione o profissional responsável.');
            return;
        }

        const dataToSend = {
          ...formData,
          duration,
          cost,
          usedProducts: formData.usedProducts.map(up => ({ productId: up.product.id, quantity: up.quantity })),
        };
        onSave(dataToSend, appointmentToEdit ? appointmentToEdit.id : null, mode);
    };
    
    const availableProducts = products.filter(p => !formData.usedProducts.some(up => up.product.id === p.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{getModalTitle()}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar modal">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Cliente</label>
                            <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{isFinalizationView ? 'Serviços Realizados' : 'Serviços'}</label>
                            <div className="mt-1 p-2 border border-gray-300 rounded-md max-h-32 overflow-y-auto space-y-2">
                                {services.map(service => (
                                    <div key={service.id} className="flex items-center">
                                        <input
                                            id={`service-${service.id}`}
                                            type="checkbox"
                                            checked={formData.selectedServices.some(s => s.id === service.id)}
                                            onChange={() => handleServiceToggle(service)}
                                            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                        />
                                        <label htmlFor={`service-${service.id}`} className="ml-3 block text-sm text-gray-700">
                                            {service.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora</label>
                                <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>

                        {isFinalizationView && (
                           <>
                            <div>
                                <h3 className="block text-sm font-medium text-gray-700">Profissional Responsável</h3>
                                <select 
                                    name="professionalId"
                                    value={formData.professionalId} 
                                    onChange={handleChange} 
                                    required
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white"
                                >
                                    {professionals.length === 0 ? (
                                    <option value="" disabled>Nenhum profissional cadastrado</option>
                                    ) : (
                                        <>
                                        <option value="" disabled>Selecione um profissional</option>
                                        {professionals.map(prof => (
                                            <option key={prof.id} value={prof.id}>{prof.name}</option>
                                        ))}
                                        </>
                                    )}
                                </select>
                            </div>
                             <div>
                                <h3 className="block text-sm font-medium text-gray-700">Produtos Utilizados</h3>
                                <div className="space-y-2">
                                    {formData.usedProducts.map(({ product, quantity }) => (
                                        <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                            <p className="text-sm">{product.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">Qtd: {quantity}</span>
                                                <button type="button" onClick={() => handleRemoveUsedProduct(product.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full"><XIcon className="h-4 w-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-end gap-2 mt-2">
                                    <div className="flex-1">
                                        <label htmlFor="productToAdd" className="text-xs text-gray-600">Adicionar produto</label>
                                        <select id="productToAdd" value={productToAdd} onChange={e => setProductToAdd(e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm">
                                            <option value="">Selecione um produto</option>
                                            {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} (Disp: {p.quantity})</option>)}
                                        </select>
                                    </div>
                                    <div className="w-20">
                                    <label htmlFor="quantityToAdd" className="text-xs text-gray-600">Qtd.</label>
                                    <input type="number" id="quantityToAdd" value={quantityToAdd} onChange={e => setQuantityToAdd(Number(e.target.value))} min="1" className="block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                                    </div>
                                    <button type="button" onClick={handleAddProduct} disabled={!productToAdd} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50">Adicionar</button>
                                </div>
                            </div>
                           </>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duração Total (min)</label>
                                <input type="number" id="duration" name="duration" value={duration} readOnly required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100" />
                            </div>
                            <div>
                                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Custo Total (R$)</label>
                                <input type="number" step="0.01" id="cost" name="cost" value={cost} readOnly required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">{getSubmitButtonText()}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN AGENDA COMPONENT ---
interface AgendaProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  clients: Client[];
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  professionals: Professional[];
  setProfessionals: React.Dispatch<React.SetStateAction<Professional[]>>;
}

const Agenda: React.FC<AgendaProps> = ({ appointments, setAppointments, clients, services, setServices, transactions, setTransactions, products, setProducts, professionals, setProfessionals }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | null>(null);
  
  const weekStartsOn = 0; // Sunday

  // --- NAVIGATION ---
  const goNext = () => setCurrentDate(current => {
    switch(viewMode) {
      case 'month': return addMonths(current, 1);
      case 'week': return addWeeks(current, 1);
      case 'day': return addDays(current, 1);
    }
  });
  const goPrev = () => setCurrentDate(current => {
     switch(viewMode) {
      case 'month': return subMonths(current, 1);
      case 'week': return subWeeks(current, 1);
      case 'day': return subDays(current, 1);
    }
  });
  const goToToday = () => {
      setCurrentDate(new Date());
  };

  // --- MODAL HANDLERS ---
  const openAppointmentModal = (mode: ModalMode, appointment: Appointment | null, date: Date | null) => {
      setModalMode(mode);
      setActiveAppointment(appointment);
      setNewAppointmentDate(date);
      setIsAppointmentModalOpen(true);
  };
  
  const closeAppointmentModal = () => {
      setIsAppointmentModalOpen(false);
      setActiveAppointment(null);
      setNewAppointmentDate(null);
  };

  const handleSaveAppointment = (formData: any, id: string | null, mode: ModalMode) => {
    const selectedClient = clients.find(c => c.id === formData.clientId);
    if (!selectedClient) {
        alert("Por favor, selecione um cliente."); return;
    }
    if (formData.selectedServices.length === 0) {
        alert("Por favor, selecione pelo menos um serviço."); return;
    }

    const [year, month, day] = formData.date.split('-').map(Number);
    const [hours, minutes] = formData.time.split(':').map(Number);
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);

    const isFinalizingAction = mode === 'finalize' || (mode === 'edit' && activeAppointment?.status === 'finished');

    const baseAppointmentData = {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        services: formData.selectedServices,
        date: formatISO(appointmentDate),
        duration: Number(formData.duration),
        cost: Number(formData.cost),
    };

    if (id) { // Editing or Finalizing
        const updatedAppointmentData = {
            ...baseAppointmentData,
            status: isFinalizingAction ? ('finished' as const) : ('scheduled' as const),
            professionalId: isFinalizingAction ? formData.professionalId : (activeAppointment?.professionalId || undefined),
            usedProducts: isFinalizingAction ? formData.usedProducts : (activeAppointment?.usedProducts || []),
        };
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updatedAppointmentData } : apt));
    } else { // Creating
        const newAppointment: Appointment = {
            id: `apt-${Date.now()}`, ...baseAppointmentData, status: 'scheduled'
        };
        setAppointments(prev => [...prev, newAppointment]);
    }

    if (isFinalizingAction && id) {
        const professional = professionals.find(p => p.id === formData.professionalId);
        const serviceNames = formData.selectedServices.map((s: Service) => s.name).join(', ');
        const newTransaction: Transaction = {
            id: `trn-apt-${id}`,
            description: `Serviços: ${serviceNames} (${selectedClient.name}) por ${professional?.name || 'N/A'}`,
            amount: formData.cost,
            date: formatISO(new Date()),
            type: TransactionType.INCOME,
        };
        setTransactions(prev => [...prev.filter(t => t.id !== `trn-apt-${id}`), newTransaction]);

        // --- ATUALIZAÇÃO DE ESTOQUE ---
        // A lógica a seguir garante que o estoque de produtos seja atualizado corretamente
        // sempre que um atendimento é finalizado ou uma finalização é editada.
        const oldUsedProducts = activeAppointment?.usedProducts || [];
        const newUsedProducts = formData.usedProducts || [];

        // O 'productUsageDiff' calcula a diferença líquida de uso para cada produto.
        // Ex: Se antes usava 1 e agora usa 3, o diff é +2. Se antes usava 2 e agora 1, o diff é -1.
        const productUsageDiff = new Map<string, number>();

        // 1. "Devolve" os produtos do agendamento antigo ao estoque (efeito negativo no diff).
        // Isso é crucial para casos de edição, para não subtrair o produto duas vezes.
        oldUsedProducts.forEach((item: { productId: string; quantity: number }) => {
            productUsageDiff.set(item.productId, (productUsageDiff.get(item.productId) || 0) - item.quantity);
        });
        
        // 2. "Retira" os produtos do novo agendamento do estoque (efeito positivo no diff).
        newUsedProducts.forEach((item: { productId: string; quantity: number }) => {
            productUsageDiff.set(item.productId, (productUsageDiff.get(item.productId) || 0) + item.quantity);
        });

        // 3. Aplica a diferença calculada ao estoque de produtos.
        setProducts(prevProducts => {
            return prevProducts.map(product => {
                if (productUsageDiff.has(product.id)) {
                    // A diferença (diff) é subtraída da quantidade atual.
                    // Se diff > 0 (usou mais), a quantidade diminui.
                    // Se diff < 0 (usou menos), a quantidade aumenta (subtrair um negativo).
                    const diff = productUsageDiff.get(product.id)!;
                    const newQuantity = product.quantity - diff;
                    return { ...product, quantity: newQuantity >= 0 ? newQuantity : 0 };
                }
                return product;
            });
        });
    }
    closeAppointmentModal();
  };

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach(apt => {
        const dayKey = format(parseISO(apt.date), 'yyyy-MM-dd');
        if (!map.has(dayKey)) {
            map.set(dayKey, []);
        }
        map.get(dayKey)?.push(apt);
    });
    return map;
  }, [appointments]);

  const renderHeaderTitle = () => {
    if (viewMode === 'week') {
        const start = startOfWeek(currentDate, { weekStartsOn });
        const end = endOfWeek(currentDate, { weekStartsOn });
        const startMonth = format(start, 'MMMM', { locale: ptBR });
        const endMonth = format(end, 'MMMM', { locale: ptBR });
        if (startMonth === endMonth) {
            return `${format(start, 'd')} - ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
        }
        return `${format(start, "d 'de' MMMM", { locale: ptBR })} - ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    }
    if (viewMode === 'day') {
        return format(currentDate, "eeee, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    return format(currentDate, 'MMMM yyyy', { locale: ptBR });
  };
    
  // --- Time Grid Component ---
  const TimeGrid: React.FC<{
    days: Date[];
  }> = ({ days }) => {
    const hours = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`); // 6am to 9pm (21:00)
    const rowHeight = 64; // h-16

    const handleSlotClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: Date) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const totalMinutes = (y / rect.height) * 16 * 60;
        const hour = Math.floor(totalMinutes / 60) + 6;
        const minute = Math.floor(totalMinutes % 60);
        const clickedDate = setMinutes(setHours(day, hour), minute);
        openAppointmentModal('create', null, clickedDate);
    };

    return (
      <div className="grid grid-cols-[auto,1fr] flex-1">
        {/* Time labels */}
        <div className="text-right text-xs text-gray-500 pr-2">
            {hours.map(hour => <div key={hour} style={{ height: `${rowHeight}px` }} className="flex items-center justify-end -mt-3">{hour}</div>)}
        </div>
        {/* Grid content */}
        <div className={`grid grid-cols-${days.length} relative`}>
            {/* Background grid lines */}
            <div className="absolute inset-0 grid grid-rows-16 pointer-events-none">
                {hours.map((_, i) => <div key={i} className="border-t border-gray-100"></div>)}
            </div>
             {/* Day columns */}
            {days.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayAppointments = (appointmentsByDay.get(dayKey) || []).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
                return (
                    <div key={day.toISOString()} className="border-l border-gray-100 relative" onClick={(e) => handleSlotClick(e, day)}>
                        {dayAppointments.map(apt => {
                            const aptDate = parseISO(apt.date);
                            const startHour = getHours(aptDate);
                            const startMinute = getMinutes(aptDate);

                            if (startHour < 6 || startHour > 21) return null;

                            const top = ((startHour - 6) * 60 + startMinute) * (rowHeight / 60);
                            const height = apt.duration * (rowHeight / 60);
                            
                            const isFinished = apt.status === 'finished';

                            return (
                                <div
                                    key={apt.id}
                                    style={{ top: `${top}px`, height: `${height}px`, minHeight: '20px' }}
                                    className={`absolute left-1 right-1 p-2 rounded-lg text-xs leading-tight z-10 cursor-pointer overflow-hidden transition-colors ${
                                        isFinished ? 'bg-gray-200 border border-gray-300 text-gray-600 hover:bg-gray-300' : 'bg-teal-100 border border-teal-200 text-teal-800 hover:bg-teal-200'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openAppointmentModal(isFinished ? 'edit' : 'finalize', apt, null);
                                    }}
                                    title={isFinished ? 'Editar finalização' : 'Finalizar atendimento'}
                                >
                                    <p className="font-bold truncate">{apt.clientName}</p>
                                    <p className="truncate">{apt.services.map(s => s.name).join(', ')}</p>
                                    {isFinished && <CheckCircleIcon className="h-4 w-4 absolute top-1 right-1 text-green-600" />}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-4 sm:p-8 bg-gray-50 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800 capitalize w-max">
                {renderHeaderTitle()}
            </h1>
            <div className="flex items-center space-x-1 sm:space-x-2">
                <button onClick={goPrev} className="p-2 rounded-full hover:bg-gray-200" aria-label="Anterior">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                 <button onClick={goNext} className="p-2 rounded-full hover:bg-gray-200" aria-label="Próximo">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <button onClick={goToToday} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100">Hoje</button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end items-center">
                <div className="flex items-center bg-gray-200 p-1 rounded-md">
                    <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-sm rounded ${viewMode === 'day' ? 'bg-white shadow text-teal-700' : 'text-gray-600 hover:bg-gray-300/50'}`}>Dia</button>
                    <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm rounded ${viewMode === 'week' ? 'bg-white shadow text-teal-700' : 'text-gray-600 hover:bg-gray-300/50'}`}>Semana</button>
                    <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm rounded ${viewMode === 'month' ? 'bg-white shadow text-teal-700' : 'text-gray-600 hover:bg-gray-300/50'}`}>Mês</button>
                </div>
                <button onClick={() => openAppointmentModal('create', null, setHours(setMinutes(currentDate, 0), 9))} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Agendamento</span>
                </button>
                <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm" title="Relatório de Uso de Produtos">
                    <ChartBarIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Relatório</span>
                </button>
                <div className="hidden md:flex gap-2">
                    <button onClick={() => setIsServiceModalOpen(true)} className="px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm">
                        Serviços
                    </button>
                     <button onClick={() => setIsProfessionalModalOpen(true)} className="px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm">
                        Profissionais
                    </button>
                </div>
            </div>
        </header>

        <main className="flex-1 flex flex-col bg-white shadow-md rounded-lg overflow-hidden">
            {viewMode !== 'day' && (
                <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 border-b">
                    {eachDayOfInterval({start: startOfWeek(currentDate, { weekStartsOn }), end: endOfWeek(currentDate, {weekStartsOn})}).map(d => (
                        <div key={d.toISOString()} className="py-2 capitalize">{format(d, 'EEE', {locale: ptBR})}</div>
                    ))}
                </div>
            )}
            
            <div className="flex-1 overflow-auto">
                {viewMode === 'month' && (
                    <div className="grid grid-cols-7 h-full">
                        {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate), { weekStartsOn }), end: endOfWeek(endOfMonth(currentDate), { weekStartsOn }) }).map(day => (
                            <div 
                                key={day.toISOString()} 
                                className={`border-t border-r p-2 cursor-pointer transition-colors duration-200 flex flex-col ${
                                    !isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : 'hover:bg-teal-50'
                                }`}
                                onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                            >
                                <span className={`flex items-center justify-center h-8 w-8 rounded-full text-sm self-end ${isToday(day) ? 'bg-teal-600 text-white font-bold' : ''}`}>
                                    {format(day, 'd')}
                                </span>
                                <div className="flex-1 overflow-y-auto text-xs space-y-1">
                                    {(appointmentsByDay.get(format(day, 'yyyy-MM-dd')) || []).map(apt => (
                                        <div key={apt.id} className="p-1 rounded bg-teal-100 text-teal-800 truncate">
                                            {format(parseISO(apt.date), 'HH:mm')} {apt.clientName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === 'week' && (
                    <TimeGrid days={eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn }), end: endOfWeek(currentDate, { weekStartsOn }) })} />
                )}
                
                {viewMode === 'day' && (
                     <TimeGrid days={[currentDate]} />
                )}
            </div>
        </main>
      </div>

      <AppointmentModal 
        isOpen={isAppointmentModalOpen}
        mode={modalMode}
        onClose={closeAppointmentModal}
        onSave={handleSaveAppointment}
        clients={clients}
        services={services}
        products={products}
        professionals={professionals}
        newAppointmentDate={newAppointmentDate}
        appointmentToEdit={activeAppointment}
      />
      <ServiceManagementModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        services={services}
        setServices={setServices}
      />
      <ProfessionalManagementModal
        isOpen={isProfessionalModalOpen}
        onClose={() => setIsProfessionalModalOpen(false)}
        professionals={professionals}
        setProfessionals={setProfessionals}
      />
       <RelatoriosModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        appointments={appointments}
        products={products}
        professionals={professionals}
        services={services}
      />
    </>
  );
};

export default Agenda;
