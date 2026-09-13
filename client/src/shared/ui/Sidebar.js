import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, FileText, Wrench, Bell, Bot, Settings, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectVehicle } from '../../store/slices/vehicleSlice';
import { useVehicles } from '../../features/vehicles/hooks/use-vehicles';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/service-history', icon: Wrench, label: 'Service History' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/copilot', icon: Bot, label: 'Copilot' },
];

export function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedId = useSelector((s) => s.vehicle.selectedVehicleId);
  const { data: vehicles = [] } = useVehicles();
  const selected = vehicles.find((v) => v.id === selectedId);

  return (
    <aside className="w-56 flex-shrink-0 bg-surface border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <span className="text-xl font-bold text-text tracking-tight">Velora</span>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-surfaceElevated text-text'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-text'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-border space-y-0.5">
        {vehicles.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Active Vehicle</p>
            <div className="relative">
              <select
                value={selectedId || ''}
                onChange={(e) => dispatch(selectVehicle(e.target.value))}
                className="w-full text-xs bg-surfaceElevated text-text border border-border rounded px-2 py-1.5 appearance-none pr-6 cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
            </div>
          </div>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive ? 'bg-surfaceElevated text-text' : 'text-textMuted hover:bg-surfaceElevated hover:text-text'
            }`
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
