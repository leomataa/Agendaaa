
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PlusIcon, XIcon, PencilIcon, PlusCircleIcon, MinusCircleIcon } from './Icons';

interface EstoqueProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const StockAdjustmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (quantity: number) => void;
    adjustmentInfo: { product: Product; type: 'add' | 'remove' } | null;
}> = ({ isOpen, onClose, onSave, adjustmentInfo }) => {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
        }
    }, [isOpen]);

    if (!isOpen || !adjustmentInfo) return null;

    const { product, type } = adjustmentInfo;
    const title = type === 'add' ? `Adicionar Estoque: ${product.name}` : `Remover do Estoque: ${product.name}`;
    const maxQuantity = type === 'remove' ? product.quantity : undefined;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) {
            alert("A quantidade deve ser maior que zero.");
            return;
        }
        if (type === 'remove' && quantity > product.quantity) {
            alert("Não é possível remover mais itens do que o disponível em estoque.");
            return;
        }
        onSave(quantity);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar modal"><XIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantidade a {type === 'add' ? 'adicionar' : 'remover'}</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                        min="1"
                        max={maxQuantity}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        autoFocus
                    />
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'>, id: string | null) => void;
    productToEdit: Product | null;
}> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        lowStockThreshold: 5,
    });

    const isEditing = productToEdit !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setFormData({
                    name: productToEdit.name,
                    quantity: productToEdit.quantity,
                    lowStockThreshold: productToEdit.lowStockThreshold,
                });
            } else {
                setFormData({
                    name: '',
                    quantity: 1,
                    lowStockThreshold: 5,
                });
            }
        }
    }, [isOpen, productToEdit, isEditing]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(formData.name.trim() === '') {
            alert('O nome do produto não pode estar vazio.');
            return;
        }
        onSave(formData, isEditing ? productToEdit.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar modal"><XIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantidade Inicial</label>
                                <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={isEditing} />
                                {isEditing && <p className="text-xs text-gray-500 mt-1">Use os botões +/- na tabela para ajustar o estoque.</p>}
                            </div>
                            <div>
                                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">Alerta de Estoque Baixo</label>
                                <input type="number" id="lowStockThreshold" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} required min="0" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Estoque: React.FC<EstoqueProps> = ({ products, setProducts }) => {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [adjustingStockInfo, setAdjustingStockInfo] = useState<{ product: Product; type: 'add' | 'remove' } | null>(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleOpenStockModal = (product: Product, type: 'add' | 'remove') => {
        setAdjustingStockInfo({ product, type });
        setIsStockModalOpen(true);
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'>, id: string | null) => {
        if (id) {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, name: productData.name, lowStockThreshold: productData.lowStockThreshold } : p));
        } else {
            const newProduct: Product = { id: `prod-${Date.now()}`, ...productData };
            setProducts(prev => [...prev, newProduct]);
        }
        setIsProductModalOpen(false);
    };

    const handleStockAdjustment = (quantity: number) => {
        if (!adjustingStockInfo) return;
        const { product, type } = adjustingStockInfo;
        setProducts(prev => prev.map(p => {
            if (p.id === product.id) {
                const newQuantity = type === 'add' ? p.quantity + quantity : p.quantity - quantity;
                return { ...p, quantity: newQuantity >= 0 ? newQuantity : 0 };
            }
            return p;
        }));
        setIsStockModalOpen(false);
    };

    const handleDeleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setConfirmingDeleteId(null);
    };

  return (
    <>
      <div className="p-8 bg-gray-50 flex-1">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
            <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                aria-label="Adicionar novo produto"
            >
                <PlusIcon className="h-5 w-5" />
                <span>Adicionar Produto</span>
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={confirmingDeleteId === product.id ? 'bg-red-50' : ''}>
                    {confirmingDeleteId === product.id ? (
                        <td colSpan={4} className="px-6 py-4 text-center transition-all">
                            <div className="flex justify-center items-center gap-4">
                                <p className="font-semibold text-red-800">Deseja realmente excluir este item?</p>
                                <button onClick={() => handleDeleteProduct(product.id)} className="px-4 py-1.5 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700">Excluir</button>
                                <button onClick={() => setConfirmingDeleteId(null)} className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">Cancelar</button>
                            </div>
                        </td>
                    ) : (
                        <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center justify-center gap-3">
                                    <button onClick={() => handleOpenStockModal(product, 'remove')} className="text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed" disabled={product.quantity <= 0} aria-label="Remover do estoque"><MinusCircleIcon className="h-6 w-6" /></button>
                                    <span className="font-semibold text-base text-gray-800 min-w-[30px] text-center">{product.quantity}</span>
                                    <button onClick={() => handleOpenStockModal(product, 'add')} className="text-gray-500 hover:text-green-600" aria-label="Adicionar ao estoque"><PlusCircleIcon className="h-6 w-6" /></button>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {product.quantity > product.lowStockThreshold ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Em estoque</span>
                                ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Estoque baixo</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={() => handleOpenEditModal(product)} className="text-gray-400 hover:text-teal-600" aria-label={`Editar ${product.name}`}><PencilIcon className="h-5 w-5" /></button>
                                    <button onClick={() => setConfirmingDeleteId(product.id)} className="text-gray-400 hover:text-red-600" aria-label={`Excluir ${product.name}`}><XIcon className="h-5 w-5" /></button>
                                </div>
                            </td>
                        </>
                    )}
                </tr>
              ))}
               {products.length === 0 && (
                  <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-500">
                          Nenhum produto encontrado. Adicione um para começar.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
      />
      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSave={handleStockAdjustment}
        adjustmentInfo={adjustingStockInfo}
      />
    </>
  );
};

export default Estoque;
