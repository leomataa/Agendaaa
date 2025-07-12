
import React, { useState, useMemo } from 'react';
import { Appointment, Product, Professional, Service } from '../types';
import { XIcon, UsersIcon } from './Icons';
import { parseISO } from 'date-fns/parseISO';
import { isToday } from 'date-fns/isToday';
import { isThisWeek } from 'date-fns/isThisWeek';
import { isThisMonth } from 'date-fns/isThisMonth';

interface RelatoriosModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointments: Appointment[];
    products: Product[];
    professionals: Professional[];
    services: Service[];
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-gray-100 p-4 rounded-lg text-center">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-2xl font-bold text-gray-900 truncate">{value}</p>
    </div>
);


const RelatoriosModal: React.FC<RelatoriosModalProps> = ({ isOpen, onClose, appointments, products, professionals, services }) => {
    const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');
    const [activeTab, setActiveTab] = useState<'products' | 'professionals'>('products');

    const dateFilterFn = useMemo(() => {
        return (date: Date) => {
            if (filter === 'day') return isToday(date);
            if (filter === 'week') return isThisWeek(date, { weekStartsOn: 0 });
            if (filter === 'month') return isThisMonth(date);
            return false;
        };
    }, [filter]);

    const finalizedAppointments = useMemo(() => 
        appointments.filter(apt => apt.status === 'finished' && dateFilterFn(parseISO(apt.date))), 
        [appointments, dateFilterFn]
    );

    const productReportData = useMemo(() => {
        const usageMap = new Map<string, { product: Product, quantity: number, totalCost: number }>();

        for (const apt of finalizedAppointments) {
            if (!apt.usedProducts) continue;
            for (const used of apt.usedProducts) {
                const fullProduct = products.find(p => p.id === used.productId);
                if (!fullProduct) continue;

                const current = usageMap.get(used.productId) || { product: fullProduct, quantity: 0, totalCost: 0 };
                current.quantity += used.quantity;
                current.totalCost += (fullProduct.cost || 0) * used.quantity;
                usageMap.set(used.productId, current);
            }
        }
        
        const detailedList = Array.from(usageMap.values()).sort((a,b) => b.quantity - a.quantity);

        const summary = {
            totalItems: detailedList.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: detailedList.reduce((sum, item) => sum + item.totalCost, 0),
            topSeller: detailedList[0] ? detailedList[0].product.name : 'N/A'
        };

        return { summary, detailedList };
    }, [finalizedAppointments, products]);

    const professionalReportData = useMemo(() => {
        const totalRevenue = finalizedAppointments.reduce((sum, apt) => sum + apt.cost, 0);
        const totalAppointments = finalizedAppointments.length;

        const professionalStats = professionals.map(prof => {
            const profAppointments = finalizedAppointments.filter(apt => apt.professionalId === prof.id);
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
    }, [finalizedAppointments, professionals, services]);


    if (!isOpen) return null;

    const getFilterTitle = () => {
        if (filter === 'day') return 'de Hoje';
        if (filter === 'week') return 'desta Semana';
        if (filter === 'month') return 'deste Mês';
        return '';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Relatórios Gerenciais</h2>
                        <p className="text-gray-500">Exibindo dados {getFilterTitle()}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar modal">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'products' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Uso de Produtos
                        </button>
                        <button
                            onClick={() => setActiveTab('professionals')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'professionals' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Desempenho Profissional
                        </button>
                    </nav>
                </div>
                
                <div className="flex items-center justify-center bg-gray-100 p-1 rounded-md mb-6 flex-shrink-0">
                    <button onClick={() => setFilter('day')} className={`px-4 py-1.5 text-sm rounded-md ${filter === 'day' ? 'bg-white shadow font-semibold text-teal-700' : 'text-gray-600 hover:bg-white/50'}`}>Hoje</button>
                    <button onClick={() => setFilter('week')} className={`px-4 py-1.5 text-sm rounded-md ${filter === 'week' ? 'bg-white shadow font-semibold text-teal-700' : 'text-gray-600 hover:bg-white/50'}`}>Semana</button>
                    <button onClick={() => setFilter('month')} className={`px-4 py-1.5 text-sm rounded-md ${filter === 'month' ? 'bg-white shadow font-semibold text-teal-700' : 'text-gray-600 hover:bg-white/50'}`}>Mês</button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'products' && (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 flex-shrink-0">
                                <StatCard title="Total de Itens Usados" value={productReportData.summary.totalItems} />
                                <StatCard title="Valor Total (Custo)" value={`R$ ${productReportData.summary.totalValue.toFixed(2)}`} />
                                <StatCard title="Produto Mais Usado" value={productReportData.summary.topSeller} />
                            </div>
                             {productReportData.detailedList.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade Usada</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total (Custo)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {productReportData.detailedList.map(({ product, quantity, totalCost }) => (
                                            <tr key={product.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">R$ {totalCost.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                                    <p className="text-lg font-medium">Nenhum produto utilizado</p>
                                    <p>Não há dados de produtos para o período selecionado.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'professionals' && (
                        <div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500">Total de Atendimentos</p>
                                    <p className="text-3xl font-bold text-teal-600">{professionalReportData.totalAppointments}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                                    <p className="text-3xl font-bold text-green-600">R$ {professionalReportData.totalRevenue.toFixed(2)}</p>
                                </div>
                            </div>
                            {professionalReportData.professionalStats.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {professionalReportData.professionalStats.map(prof => (
                                        <div key={prof.id} className="bg-white border p-6 rounded-lg shadow-sm flex flex-col">
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
                                <div className="bg-white p-10 rounded-lg text-center">
                                    <p className="text-gray-500">Nenhum atendimento finalizado encontrado para o período selecionado.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <div className="mt-6 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default RelatoriosModal;
