
import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, CalendarIcon, CashIcon, BoxIcon, UsersIcon, DocumentReportIcon } from './Icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: DashboardIcon },
  { name: 'Agenda', href: '/agenda', icon: CalendarIcon },
  { name: 'Controle de Caixa', href: '/caixa', icon: CashIcon },
  { name: 'Controle de Estoque', href: '/estoque', icon: BoxIcon },
  { name: 'Relatório de Atendimento', href: '/relatorio-profissionais', icon: DocumentReportIcon },
  { name: 'Controle de Sócios', href: '/socios', icon: UsersIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-teal-600">Doctors</h1>
        <span className="ml-2 text-xs font-semibold text-gray-500 mt-2">Clinic Estetica</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-6 w-6" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
