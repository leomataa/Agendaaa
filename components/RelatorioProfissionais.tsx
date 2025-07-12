
import React, { useState, useMemo } from 'react';
import { Appointment, Professional, Service } from '../types';
import { parseISO } from 'date-fns/parseISO';
import { isToday } from 'date-fns/isToday';
import { isThisWeek } from 'date-fns/isThisWeek';
import { isThisMonth } from 'date-fns/isThisMonth';
import { UsersIcon } from './Icons';

interface RelatorioProfissionaisProps {
    appointments: Appointment[];
    professionals: Professional[];
    services: Service[];
}

const RelatorioProfissionais: React.FC<RelatorioProfissionaisProps> = ({ appointments, professionals, services }) => {
    const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');

    const reportData = useMemo(() => {
        const finalizedAppointments = appointments.filter(apt => apt.status === 'finished');

        const dateFilterFn = (date: Date) => {
            if (filter === 'day') return isToday(date);
            if (filter === 'week') return isThisWeek(date, { weekStartsOn: 0 }); // Sunday start
            if (filter === 'month') return isThisMonth(date);
            return false;
        };

        const filteredAppointments = finalizedAppointments.filter(apt => dateFilterFn(parseISO(apt.date)));

        const totalRevenue = filteredAppointments.reduce((sum, apt) => sum + apt.cost, 0);
        const totalAppointments = filteredAppointments.length;

        const professionalStats = professionals.map(prof => {
            const profAppointments = filteredAppointments.filter(apt => apt.professionalId === prof.id);
            const profRevenue = profAppointments.reduce((sum, apt) => sum + apt.cost, 0);
            
            const serviceCounts = new Map<string, number>();
            profAppointments.forEach(apt => {
                apt.services.forEach(service => {
                    serviceCounts.set(service.id, (serviceCounts.get(service.id) || 0) + 1);
                });
            });

            let topServiceId = '';
            let maxCount = 0;
            serviceCounts.forEach((count, serviceId) => {
                if (count > maxCount) {
                    maxCount = count;
                    topServiceId = serviceId;
                }
            });
            const topServiceName = services.find(s => s.id === topServiceId)?.name || 'Nenhum';

            return {
                id: prof.id,
                name: prof.name,
                appointmentCount: profAppointments.length,
                revenue: profRevenue,
                topService: topServiceName
            };
        }).sort((a,b) => b.revenue - a.revenue);

        return { totalRevenue, totalAppointments, professionalStats };
    }, [appointments, professionals, services, filter]);
    
    const getFilterTitle = () => {
        if (filter === 'day') return 'de Hoje';
        if (filter === 'week') return 'desta Semana';
        if (filter === 'month') return 'deste Mês';
        return '';
    };

    return (
        <div className="p-8 bg-gray-50 flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Relatório de Atendimento</h1>
                    <p className="mt-1 text-gray-600">Performance dos profissionais com base nos atendimentos finalizados.</p>
                </div>
                 <div className="flex items-center bg-gray-200 p-1 rounded-md">
                    <button onClick={() => setFilter('day')} className={`px-4 py-1.5 text-sm rounded-md ${filter === 'day' ? 'bg-white shadow font-semibold text-teal-700' : 'text-gray-600 hover:bg-white/50'}`}>Hoje</button>
                    <button onClick={() => setFilter('week')} className={`px-4 py-1.5 text-sm rounded-md ${filter === 'week' ? 'bg-white shadow font-semibold text-teal-700' : 'text-gray-600 hover:bg-white/50'}`}>Semana</button>
                    <button onClick={() => setFilter('month')} className={`px-4 py-1.5 text-sm rounded-md ${filter === 'month' ? 'bg-white shadow font-semibold text-teal-700' : 'text-gray-600 hover:bg-white/50'}`}>Mês</button>
                </div>
            </div>

            {/* Overall Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Resumo Geral {getFilterTitle()}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Total de Atendimentos</p>
                        <p className="text-3xl font-bold text-teal-600">{reportData.totalAppointments}</p>
                    </div>
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Receita Total</p>
                        <p className="text-3xl font-bold text-green-600">R$ {reportData.totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
             {/* Professional Breakdown */}
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Desempenho por Profissional</h2>
                 {reportData.professionalStats.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {reportData.professionalStats.map(prof => (
                            <div key={prof.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                                <div className="flex items-center mb-4">
                                    <div className="bg-teal-100 p-3 rounded-full mr-4">
                                        <UsersIcon className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">{prof.name}</h3>
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-gray-600">Atendimentos:</span>
                                        <span className="font-semibold text-gray-800">{prof.appointmentCount}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-gray-600">Receita Gerada:</span>
                                        <span className="font-semibold text-green-600">R$ {prof.revenue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-gray-600">Serviço Principal:</span>
                                        <span className="font-semibold text-gray-800 text-right truncate">{prof.topService}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="bg-white p-10 rounded-lg shadow-md text-center">
                        <p className="text-gray-500">Nenhum atendimento finalizado encontrado para o período selecionado.</p>
                    </div>
                 )}
            </div>
        </div>
    );
}

export default RelatorioProfissionais;
