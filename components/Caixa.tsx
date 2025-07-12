
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, Payable } from '../types';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { isToday } from 'date-fns/isToday';
import { isSameMonth } from 'date-fns/isSameMonth';
import { isFuture } from 'date-fns/isFuture';
import { formatISO } from 'date-fns/formatISO';
import { PlusIcon, XIcon, PencilIcon } from './Icons';

interface CaixaProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  payables: Payable[];
  setPayables: React.Dispatch<React.SetStateAction<Payable[]>>;
}

const PayableModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Payable, 'id' | 'isPaid'>, id: string | null) => void;
    payableToEdit: Payable | null;
}> = ({ isOpen, onClose, onSave, payableToEdit }) => {
    const isEditing = payableToEdit !== null;

    const getInitialFormData = () => {
      if (isEditing && payableToEdit) {
        return {
          description: payableToEdit.description,
          amount: payableToEdit.amount,
          dueDate: format(parseISO(payableToEdit.dueDate), 'yyyy-MM-dd'),
        };
      }
      return {
        description: '',
        amount: 0,
        dueDate: format(new Date(), 'yyyy-MM-dd'),
      };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if(isOpen) {
            setFormData(getInitialFormData());
        }
    }, [isOpen, payableToEdit]);


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(formData.description.trim() === '') {
            alert('A descrição não pode estar vazia.');
            return;
        }
        onSave(formData, isEditing ? payableToEdit.id : null);
    };

    const modalTitle = isEditing ? 'Editar Despesa' : 'Adicionar Despesa a Pagar';
    const saveButtonText = isEditing ? 'Salvar Alterações' : 'Salvar';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{modalTitle}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar modal">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                            <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                                <input type="number" step="0.01" id="amount" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                                <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">{saveButtonText}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Caixa: React.FC<CaixaProps> = ({ transactions, setTransactions, payables, setPayables }) => {
  const [isPayableModalOpen, setIsPayableModalOpen] = useState(false);
  const [payableToEdit, setPayableToEdit] = useState<Payable | null>(null);

  const sortedTransactions = [...transactions].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  
  const { totalIncome, totalExpenses, netBalance, todayExpenses, upcomingPayables } = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const todayExpenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE && isToday(parseISO(t.date)))
      .reduce((sum, t) => sum + t.amount, 0);

    const upcomingPayables = payables
      .filter(p => !p.isPaid && isSameMonth(parseISO(p.dueDate), new Date()))
      .sort((a,b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());

    return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        todayExpenses,
        upcomingPayables
    };
  }, [transactions, payables]);

  const handleSavePayable = (payableData: Omit<Payable, 'id' | 'isPaid'>, id: string | null) => {
      const dataWithIsoDate = {
          ...payableData,
          dueDate: formatISO(parseISO(payableData.dueDate))
      };
      
      if (id) { // Editing existing payable
          setPayables(prev => prev.map(p => p.id === id ? { ...p, ...dataWithIsoDate } : p));
      } else { // Creating new payable
          const newPayable: Payable = {
              id: `pay-${Date.now()}`,
              isPaid: false,
              ...dataWithIsoDate
          };
          setPayables(prev => [...prev, newPayable]);
      }
      handleCloseModal();
  };
  
  const handleMarkAsPaid = (payable: Payable) => {
    const newTransaction: Transaction = {
        id: `trn-pay-${payable.id}`,
        type: TransactionType.EXPENSE,
        description: `Pagamento: ${payable.description}`,
        amount: payable.amount,
        date: formatISO(new Date()),
    };
    setTransactions(prev => [...prev, newTransaction]);
    setPayables(prev => prev.map(p => p.id === payable.id ? { ...p, isPaid: true } : p));
  };
  
  const handleOpenAddModal = () => {
    setPayableToEdit(null);
    setIsPayableModalOpen(true);
  };
  
  const handleOpenEditModal = (payable: Payable) => {
    setPayableToEdit(payable);
    setIsPayableModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPayableModalOpen(false);
    setPayableToEdit(null);
  };

  const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );

  return (
    <>
    <div className="p-8 bg-gray-50 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Controle de Caixa</h1>
        <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Adicionar Despesa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Receita Total" value={`R$ ${totalIncome.toFixed(2)}`} color="text-green-600" />
        <StatCard title="Despesa Total" value={`R$ ${totalExpenses.toFixed(2)}`} color="text-red-600" />
        <StatCard title="Saídas do Dia" value={`R$ ${todayExpenses.toFixed(2)}`} color="text-orange-500" />
        <StatCard title="Saldo Líquido" value={`R$ ${netBalance.toFixed(2)}`} color={netBalance >= 0 ? 'text-blue-600' : 'text-red-600'} />
      </div>

      <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="p-4 text-xl font-semibold text-gray-800 border-b">Despesas a Pagar (Mês Atual)</h2>
            <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full">
                    <tbody className="divide-y divide-gray-200">
                        {upcomingPayables.map(payable => (
                            <tr key={payable.id}>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{payable.description}</p>
                                    <p className={`text-sm ${isFuture(parseISO(payable.dueDate)) ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
                                        Vence em: {format(parseISO(payable.dueDate), 'dd/MM/yyyy')}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="font-semibold text-gray-800">R$ {payable.amount.toFixed(2)}</p>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button 
                                      onClick={() => handleOpenEditModal(payable)}
                                      className="text-gray-400 hover:text-teal-600 p-2"
                                      aria-label={`Editar ${payable.description}`}
                                      title="Editar despesa"
                                    >
                                      <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleMarkAsPaid(payable)}
                                        className="ml-2 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-md hover:bg-green-200"
                                    >
                                        Marcar como Paga
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {upcomingPayables.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500">
                                    Nenhuma despesa pendente para este mês.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
             <h2 className="p-4 text-xl font-semibold text-gray-800 border-b">Histórico de Transações</h2>
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(parseISO(transaction.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === TransactionType.INCOME
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm text-right font-medium ${
                          transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                      }`}>
                        R$ {transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                   {sortedTransactions.length === 0 && (
                      <tr>
                          <td colSpan={4} className="text-center py-10 text-gray-500">
                              Nenhuma transação encontrada.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </div>
    <PayableModal
        isOpen={isPayableModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePayable}
        payableToEdit={payableToEdit}
    />
    </>
  );
};

export default Caixa;
