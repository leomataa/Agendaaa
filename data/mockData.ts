import { Client, Appointment, Product, Transaction, Partner, TransactionType, Service, Payable, Professional } from '../types';
import { subDays } from 'date-fns/subDays';
import { addDays } from 'date-fns/addDays';
import { setHours } from 'date-fns/setHours';
import { formatISO } from 'date-fns/formatISO';

const now = new Date();

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli1', name: 'Ana Silva', phone: '11 98765-4321', lastVisit: formatISO(subDays(now, 40)) },
  { id: 'cli2', name: 'Bruno Gomes', phone: '21 91234-5678', lastVisit: formatISO(subDays(now, 8)) },
  { id: 'cli3', name: 'Carla Dias', phone: '31 99999-8888', lastVisit: formatISO(subDays(now, 1)) },
];

export const MOCK_SERVICES: Service[] = [
  { id: 'serv1', name: 'Micropigmentação de Sobrancelhas', duration: 120, cost: 450 },
  { id: 'serv2', name: 'Delineador Definitivo', duration: 90, cost: 400 },
  { id: 'serv3', name: 'Micropigmentação Labial', duration: 150, cost: 550 },
  { id: 'serv4', name: 'Limpeza de Pele', duration: 60, cost: 150 },
  { id: 'serv5', name: 'Tratamento de Verrugas', duration: 30, cost: 100 },
];

export const MOCK_PROFESSIONALS: Professional[] = [
  { id: 'prof1', name: 'Junior Pimenta' },
  { id: 'prof2', name: 'Vinicius Teixeira' },
];

const limpezaDePele = MOCK_SERVICES.find(s => s.id === 'serv4')!;
const delineador = MOCK_SERVICES.find(s => s.id === 'serv2')!;
const microLabial = MOCK_SERVICES.find(s => s.id === 'serv3')!;
const tratamentoVerrugas = MOCK_SERVICES.find(s => s.id === 'serv5')!;
const microSobrancelhas = MOCK_SERVICES.find(s => s.id === 'serv1')!;

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt1',
    clientId: 'cli3',
    clientName: 'Carla Dias',
    services: [limpezaDePele],
    date: formatISO(setHours(subDays(now,1), 14)),
    duration: limpezaDePele.duration,
    cost: limpezaDePele.cost,
    status: 'scheduled',
  },
  {
    id: 'apt2',
    clientId: 'cli2',
    clientName: 'Bruno Gomes',
    services: [delineador],
    date: formatISO(setHours(subDays(now,8), 16)),
    duration: delineador.duration,
    cost: delineador.cost,
    status: 'scheduled',
  },
  {
    id: 'apt3',
    clientId: 'cli1',
    clientName: 'Ana Silva',
    services: [microLabial, tratamentoVerrugas],
    date: formatISO(setHours(addDays(now,1), 10)),
    duration: microLabial.duration + tratamentoVerrugas.duration,
    cost: microLabial.cost + tratamentoVerrugas.cost,
    status: 'scheduled',
  },
    {
    id: 'apt4',
    clientId: 'cli2',
    clientName: 'Bruno Gomes',
    services: [microSobrancelhas],
    date: formatISO(setHours(addDays(now, 5), 11)),
    duration: microSobrancelhas.duration,
    cost: microSobrancelhas.cost,
    status: 'scheduled',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod1', name: 'Creme Hidratante Facial', quantity: 15, lowStockThreshold: 10, cost: 25.50 },
  { id: 'prod2', name: 'Óleo Essencial de Lavanda', quantity: 8, lowStockThreshold: 5, cost: 40.00 },
  { id: 'prod3', name: 'Protetor Solar FPS 50', quantity: 20, lowStockThreshold: 15, cost: 55.00 },
  { id: 'prod4', name: 'Máscara de Argila Verde', quantity: 4, lowStockThreshold: 5, cost: 15.75 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'trn1', type: TransactionType.INCOME, description: 'Serviço: Limpeza de Pele (Carla Dias)', amount: 150, date: formatISO(subDays(now, 1)) },
  { id: 'trn2', type: TransactionType.INCOME, description: 'Serviço: Massagem (Bruno Gomes)', amount: 120, date: formatISO(subDays(now, 8)) },
  { id: 'trn3', type: TransactionType.EXPENSE, description: 'Compra de material', amount: 300, date: formatISO(subDays(now, 10)) },
];

export const MOCK_PAYABLES: Payable[] = [
    { id: 'pay1', description: 'Aluguel do espaço', amount: 1500, dueDate: formatISO(setHours(addDays(now, 5), 0)), isPaid: false },
    { id: 'pay2', description: 'Software de Gestão', amount: 80, dueDate: formatISO(setHours(addDays(now, 10), 0)), isPaid: false },
    { id: 'pay3', description: 'Fornecedor de cosméticos', amount: 450, dueDate: formatISO(setHours(subDays(now, 2), 0)), isPaid: true }
];


export const MOCK_PARTNERS: Partner[] = [
  { id: 'part1', name: 'Empresa', percentage: 60 },
  { id: 'part2', name: 'Vinicius Teixeira', percentage: 20 },
  { id: 'part3', name: 'Junior Pimenta', percentage: 20 },
];
