import React, { useMemo, useState, useEffect } from 'react';
import { Partner, Transaction, TransactionType } from '../types';
import { UsersIcon } from './Icons';

interface SociosProps {
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  transactions: Transaction[];
}

const Socios: React.FC<SociosProps> = ({ partners, setPartners, transactions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPartners, setEditedPartners] = useState<Partner[]>(partners);

  useEffect(() => {
    if (!isEditing) {
      setEditedPartners(partners);
    }
  }, [partners, isEditing]);

  const { totalIncome, netBalance } = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, netBalance: totalIncome - totalExpenses };
  }, [transactions]);

  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedPartners(partners);
  };
  
  const handleSave = () => {
    const total = editedPartners.reduce((sum, p) => sum + p.percentage, 0);
    if(Math.round(total) !== 100) {
      alert('A soma dos percentuais deve ser exatamente 100%.');
      return;
    }
    setPartners(editedPartners);
    setIsEditing(false);
  };

  const handlePartnerChange = (id: string, field: 'name' | 'percentage', value: string | number) => {
    setEditedPartners(prev => prev.map(p =>
        p.id === id ? { ...p, [field]: field === 'percentage' ? Number(value) : value } : p
    ));
  };
  
  const currentPartners = isEditing ? editedPartners : partners;
  const totalPercentage = currentPartners.reduce((sum, p) => sum + p.percentage, 0);

  return (
    <div className="p-8 bg-gray-50 flex-1">
      <h1 className="text-3xl font-bold text-gray-800">Controle de Sócios</h1>
      <p className="mt-2 text-gray-600">
        Gerencie a distribuição de lucros entre a empresa e os sócios.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profit Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <UsersIcon className="h-6 w-6 mr-3 text-teal-600" />
            Distribuição de Lucro
          </h2>
          <div className="mt-4 space-y-3">
            {partners.map(partner => {
              const share = netBalance > 0 ? (netBalance * partner.percentage) / 100 : 0;
              return (
                <div key={partner.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-800">{partner.name}</p>
                    <p className="text-sm text-gray-500">Participação: {partner.percentage}%</p>
                  </div>
                  <p className="font-semibold text-lg text-teal-700">R$ {share.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary and Settings */}
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">Resumo Financeiro</h2>
                 <div className="mt-4 space-y-2">
                     <div className="flex justify-between text-gray-700">
                         <span>Receita Bruta do Período:</span>
                         <span className="font-medium text-green-600">R$ {totalIncome.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-gray-700 font-bold border-t pt-2 mt-2">
                         <span>Lucro Líquido a Distribuir:</span>
                         <span className={`font-bold ${netBalance > 0 ? 'text-blue-700' : 'text-red-700'}`}>R$ {netBalance.toFixed(2)}</span>
                     </div>
                 </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Configuração de Percentuais</h2>
                    {!isEditing && (
                        <button onClick={handleEdit} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100 transition-colors">
                            Editar
                        </button>
                    )}
                </div>
                 <div className="mt-4 space-y-2">
                    {currentPartners.map(partner => (
                         <div key={partner.id} className="flex justify-between items-center gap-4">
                             <input 
                                type="text"
                                value={partner.name}
                                readOnly={!isEditing}
                                onChange={e => handlePartnerChange(partner.id, 'name', e.target.value)}
                                className={`flex-1 p-1 border rounded-md ${!isEditing ? 'bg-gray-100 border-transparent' : 'bg-white border-gray-300'}`}
                             />
                             <input 
                                type="number" 
                                value={partner.percentage}
                                readOnly={!isEditing}
                                onChange={e => handlePartnerChange(partner.id, 'percentage', e.target.value)}
                                className={`w-24 p-1 text-right border rounded-md ${!isEditing ? 'bg-gray-100' : 'bg-white'}`}
                              />
                         </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span className={Math.round(totalPercentage) !== 100 ? 'text-red-600' : 'text-green-600'}>
                            {totalPercentage}%
                        </span>
                    </div>
                    {Math.round(totalPercentage) !== 100 && (
                        <p className="text-xs text-red-600 text-center">A soma dos percentuais deve ser 100%.</p>
                    )}
                    {isEditing && (
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Salvar Alterações</button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Socios;
