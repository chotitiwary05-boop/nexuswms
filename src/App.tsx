import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Users, 
  FileText, 
  Warehouse as WarehouseIcon, 
  BarChart3, 
  Search, 
  Plus, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Truck, 
  ShieldCheck,
  MoreVertical,
  Filter,
  Download,
  AlertCircle,
  CreditCard,
  Receipt,
  History,
  TrendingUp,
  Activity,
  Settings,
  Settings2,
  X,
  ChevronDown,
  Camera,
  LogOut,
  Bell,
  Upload,
  MessageSquare,
  Barcode,
  Wrench,
  Database,
  FileUp,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';
import BarcodeGenerator from 'react-barcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { format, differenceInDays } from 'date-fns';
import { cn } from './lib/utils';
import { 
  VendorContract, 
  ItemMaster, 
  InwardGoods, 
  InwardItem,
  OutwardGoods, 
  OutwardItem,
  InventoryRecord, 
  WarehouseUtilization,
  ContractType,
  UnitType,
  PaymentCycle,
  Invoice,
  Payment,
  LedgerEntry,
  PricingConfig,
  Customer,
  User,
  Warehouse
} from './types';

// --- Mock Data ---

const MOCK_CONTRACTS: VendorContract[] = [
  {
    id: 'CON001',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    warehouseLocation: 'Delhi Hub',
    allocatedSpace: 5000,
    ratePlan: 'Premium Space',
    securityDeposit: 50000,
    paymentCycle: 'Monthly',
    contractType: 'Monthly'
  },
  {
    id: 'CON002',
    vendorId: 'V002',
    vendorName: 'Global Logistics',
    startDate: '2024-02-15',
    endDate: '2024-08-15',
    warehouseLocation: 'Mumbai West',
    allocatedSpace: 12000,
    ratePlan: 'Standard Bulk',
    securityDeposit: 120000,
    paymentCycle: 'Monthly',
    contractType: 'Pay-as-used'
  },
  {
    id: 'CON003',
    vendorId: 'V003',
    vendorName: 'Tech Solutions',
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    warehouseLocation: 'Bangalore East',
    allocatedSpace: 8000,
    ratePlan: 'High Security',
    securityDeposit: 80000,
    paymentCycle: 'Weekly',
    contractType: 'Monthly'
  },
  {
    id: 'CON004',
    vendorId: 'V004',
    vendorName: 'Fresh Foods Ltd',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    warehouseLocation: 'Delhi Hub',
    allocatedSpace: 3000,
    ratePlan: 'Cold Storage',
    securityDeposit: 60000,
    paymentCycle: 'Daily',
    contractType: 'Daily'
  }
];

const MOCK_ITEMS: ItemMaster[] = [
  { id: 'ITEM001', name: 'Mobile Phone', sku: 'SKU123', category: 'Electronics', unitType: 'Piece', weight: 0.5, volume: 0.02, price: 15000 },
  { id: 'ITEM002', name: 'LED TV', sku: 'SKU456', category: 'Electronics', unitType: 'Piece', weight: 15, volume: 0.8, price: 45000 },
  { id: 'ITEM003', name: 'Office Chair', sku: 'SKU789', category: 'Furniture', unitType: 'Piece', weight: 10, volume: 0.5, price: 5000 },
  { id: 'ITEM004', name: 'Laptop Pro', sku: 'SKU101', category: 'Electronics', unitType: 'Piece', weight: 2.5, volume: 0.05, price: 85000 },
  { id: 'ITEM005', name: 'Dining Table', sku: 'SKU202', category: 'Furniture', unitType: 'Piece', weight: 45, volume: 1.2, price: 25000 },
  { id: 'ITEM006', name: 'Air Conditioner', sku: 'SKU303', category: 'Appliances', unitType: 'Piece', weight: 35, volume: 0.6, price: 35000 },
  { id: 'ITEM007', name: 'Microwave Oven', sku: 'SKU404', category: 'Appliances', unitType: 'Piece', weight: 12, volume: 0.15, price: 12000 },
  { id: 'ITEM008', name: 'Bluetooth Speaker', sku: 'SKU505', category: 'Electronics', unitType: 'Piece', weight: 0.8, volume: 0.01, price: 3500 }
];

const MOCK_INWARD: InwardGoods[] = [
  {
    grnNo: 'GRN00045',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    items: [
      {
        itemId: 'ITEM002',
        itemName: 'LED TV',
        quantity: 50,
        weight: 750,
        volume: 40,
        storageLocation: 'Rack A2'
      }
    ],
    warehouse: 'Delhi Hub',
    dateTime: '2024-03-10 10:30',
    status: 'Stored'
  },
  {
    grnNo: 'GRN00046',
    vendorId: 'V003',
    vendorName: 'Tech Solutions',
    items: [
      {
        itemId: 'ITEM004',
        itemName: 'Laptop Pro',
        quantity: 100,
        weight: 250,
        volume: 5,
        storageLocation: 'Rack C1'
      }
    ],
    warehouse: 'Bangalore East',
    dateTime: '2024-03-11 09:15',
    status: 'Stored'
  },
  {
    grnNo: 'GRN00047',
    vendorId: 'V002',
    vendorName: 'Global Logistics',
    items: [
      {
        itemId: 'ITEM005',
        itemName: 'Dining Table',
        quantity: 10,
        weight: 450,
        volume: 12,
        storageLocation: 'Floor Area 1'
      }
    ],
    warehouse: 'Mumbai West',
    dateTime: '2024-03-11 11:45',
    status: 'Quality Check'
  },
  {
    grnNo: 'GRN00048',
    vendorId: 'V004',
    vendorName: 'Fresh Foods Ltd',
    items: [
      {
        itemId: 'ITEM006',
        itemName: 'Air Conditioner',
        quantity: 20,
        weight: 700,
        volume: 12,
        storageLocation: 'Rack D2'
      }
    ],
    warehouse: 'Delhi Hub',
    dateTime: '2024-03-12 08:30',
    status: 'Gate Entry'
  }
];

const MOCK_OUTWARD: OutwardGoods[] = [
  {
    dispatchOrderId: 'DO00123',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    items: [
      {
        itemId: 'ITEM001',
        itemName: 'Mobile Phone',
        quantity: 20,
        weight: 10
      }
    ],
    destination: 'Retail Store - Bangalore',
    vehicleDetails: 'KA-01-MH-1234',
    dateTime: '2024-03-11 14:00',
    status: 'Dispatched'
  },
  {
    dispatchOrderId: 'DO00124',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    items: [
      {
        itemId: 'ITEM002',
        itemName: 'LED TV',
        quantity: 5,
        weight: 75
      }
    ],
    destination: 'Customer Home - Delhi',
    vehicleDetails: 'DL-01-AB-5678',
    dateTime: '2024-03-12 10:00',
    status: 'Packing'
  },
  {
    dispatchOrderId: 'DO00125',
    vendorId: 'V002',
    vendorName: 'Global Logistics',
    items: [
      {
        itemId: 'ITEM003',
        itemName: 'Office Chair',
        quantity: 15,
        weight: 150
      }
    ],
    destination: 'Corporate Office - Mumbai',
    vehicleDetails: 'MH-02-XY-9012',
    dateTime: '2024-03-12 11:30',
    status: 'Approved'
  }
];

const MOCK_INVENTORY: InventoryRecord[] = [
  {
    itemId: 'ITEM002',
    itemName: 'LED TV',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    quantity: 25,
    location: 'Rack A2',
    warehouse: 'Delhi Hub',
    lastUpdated: '2024-03-10',
    agingDays: 15
  },
  {
    itemId: 'ITEM001',
    itemName: 'Mobile Phone',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    quantity: 150,
    location: 'Rack B1',
    warehouse: 'Delhi Hub',
    lastUpdated: '2024-03-05',
    agingDays: 20
  },
  {
    itemId: 'ITEM004',
    itemName: 'Laptop Pro',
    vendorId: 'V003',
    vendorName: 'Tech Solutions',
    quantity: 85,
    location: 'Rack C1',
    warehouse: 'Bangalore East',
    lastUpdated: '2024-03-11',
    agingDays: 5
  },
  {
    itemId: 'ITEM005',
    itemName: 'Dining Table',
    vendorId: 'V002',
    vendorName: 'Global Logistics',
    quantity: 12,
    location: 'Floor Area 1',
    warehouse: 'Mumbai West',
    lastUpdated: '2024-03-08',
    agingDays: 12
  },
  {
    itemId: 'ITEM006',
    itemName: 'Air Conditioner',
    vendorId: 'V004',
    vendorName: 'Fresh Foods Ltd',
    quantity: 40,
    location: 'Rack D2',
    warehouse: 'Delhi Hub',
    lastUpdated: '2024-03-12',
    agingDays: 2
  },
  {
    itemId: 'ITEM003',
    itemName: 'Office Chair',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    quantity: 60,
    location: 'Rack B2',
    warehouse: 'Delhi Hub',
    lastUpdated: '2024-03-01',
    agingDays: 30
  }
];

const MOCK_UTILIZATION: WarehouseUtilization[] = [
  {
    warehouse: 'Delhi Hub',
    totalArea: 50000,
    usedArea: 32000,
    freeArea: 18000,
    vendorAllocations: [
      { vendorName: 'ABC Traders', allocatedSpace: 15000 },
      { vendorName: 'Fresh Foods Ltd', allocatedSpace: 5000 },
      { vendorName: 'Others', allocatedSpace: 12000 }
    ]
  },
  {
    warehouse: 'Mumbai West',
    totalArea: 30000,
    usedArea: 25000,
    freeArea: 5000,
    vendorAllocations: [
      { vendorName: 'Global Logistics', allocatedSpace: 20000 },
      { vendorName: 'Others', allocatedSpace: 5000 }
    ]
  },
  {
    warehouse: 'Bangalore East',
    totalArea: 40000,
    usedArea: 15000,
    freeArea: 25000,
    vendorAllocations: [
      { vendorName: 'Tech Solutions', allocatedSpace: 10000 },
      { vendorName: 'Others', allocatedSpace: 5000 }
    ]
  }
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV001',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    invoiceNumber: 'INV-2024-001',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    totalAmount: 45000,
    paidAmount: 45000,
    status: 'PAID',
    items: [
      { id: '1', description: 'Monthly Space Rental - March', amount: 40000, type: 'SPACE_RENTAL' },
      { id: '2', description: 'Handling Charges', amount: 5000, type: 'HANDLING' }
    ]
  },
  {
    id: 'INV002',
    vendorId: 'V002',
    vendorName: 'Global Logistics',
    invoiceNumber: 'INV-2024-002',
    date: '2024-03-05',
    dueDate: '2024-03-20',
    totalAmount: 120000,
    paidAmount: 0,
    status: 'UNPAID',
    items: [
      { id: '1', description: 'Monthly Space Rental - March', amount: 100000, type: 'SPACE_RENTAL' },
      { id: '2', description: 'Storage Surcharge', amount: 20000, type: 'STORAGE' }
    ]
  },
  {
    id: 'INV003',
    vendorId: 'V003',
    vendorName: 'Tech Solutions',
    invoiceNumber: 'INV-2024-003',
    date: '2024-03-08',
    dueDate: '2024-03-22',
    totalAmount: 85000,
    paidAmount: 40000,
    status: 'PARTIAL',
    items: [
      { id: '1', description: 'Weekly Space Rental', amount: 75000, type: 'SPACE_RENTAL' },
      { id: '2', description: 'Inward Handling', amount: 10000, type: 'INWARD' }
    ]
  },
  {
    id: 'INV004',
    vendorId: 'V004',
    vendorName: 'Fresh Foods Ltd',
    invoiceNumber: 'INV-2024-004',
    date: '2024-03-10',
    dueDate: '2024-03-25',
    totalAmount: 35000,
    paidAmount: 0,
    status: 'UNPAID',
    items: [
      { id: '1', description: 'Daily Cold Storage', amount: 30000, type: 'STORAGE' },
      { id: '2', description: 'Loading/Unloading', amount: 5000, type: 'HANDLING' }
    ]
  }
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'PAY001',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    invoiceId: 'INV001',
    invoiceNumber: 'INV-2024-001',
    amount: 45000,
    date: '2024-03-02',
    method: 'BANK',
    type: 'FULL',
    reference: 'TXN987654321'
  },
  {
    id: 'PAY002',
    vendorId: 'V003',
    vendorName: 'Tech Solutions',
    invoiceId: 'INV003',
    invoiceNumber: 'INV-2024-003',
    amount: 40000,
    date: '2024-03-10',
    method: 'UPI',
    type: 'PARTIAL',
    reference: 'UPI123456789'
  }
];

const MOCK_LEDGER: LedgerEntry[] = [
  {
    id: 'L001',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    date: '2024-03-01',
    description: 'Invoice INV-2024-001',
    reference: 'INV-2024-001',
    debit: 45000,
    credit: 0,
    balance: 45000
  },
  {
    id: 'L002',
    vendorId: 'V001',
    vendorName: 'ABC Traders',
    date: '2024-03-02',
    description: 'Payment - BANK',
    reference: 'PAY001',
    debit: 0,
    credit: 45000,
    balance: 0
  },
  {
    id: 'L003',
    vendorId: 'V003',
    vendorName: 'Tech Solutions',
    date: '2024-03-08',
    description: 'Invoice INV-2024-003',
    reference: 'INV-2024-003',
    debit: 85000,
    credit: 0,
    balance: 85000
  },
  {
    id: 'L004',
    vendorId: 'V003',
    vendorName: 'Tech Solutions',
    date: '2024-03-10',
    description: 'Payment - UPI',
    reference: 'PAY002',
    debit: 0,
    credit: 40000,
    balance: 45000
  }
];

const MOCK_PRICING: PricingConfig[] = [
  { id: '1', key: 'area_rate', value: 15, unit: 'sq ft / month', description: 'Area Based Rental Rate' },
  { id: '2', key: 'volume_rate', value: 100, unit: 'cubic meter / month', description: 'Volume Based Rental Rate' },
  { id: '3', key: 'pallet_rate', value: 50, unit: 'pallet / day', description: 'Pallet Based Rental Rate' },
  { id: '4', key: 'rack_rate', value: 75, unit: 'rack / month', description: 'Rack Based Rental Rate' },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', username: 'customer', password: '12345', vendorId: 'V001', isActive: true, accessDeniedByAdmin: false },
  { id: '2', username: 'tech', password: '12345', vendorId: 'V003', isActive: true, accessDeniedByAdmin: false },
  { id: '3', username: 'global', password: '12345', vendorId: 'V002', isActive: true, accessDeniedByAdmin: false },
  { id: '4', username: 'fresh', password: '12345', vendorId: 'V004', isActive: true, accessDeniedByAdmin: false },
];

const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'WH001', name: 'Delhi Hub', location: 'Okhla Phase III, New Delhi', totalArea: 50000, manager: 'Rajesh Kumar', contactNumber: '+91 98765 43210', status: 'Active' },
  { id: 'WH002', name: 'Mumbai West', location: 'Andheri East, Mumbai', totalArea: 30000, manager: 'Suresh Patil', contactNumber: '+91 87654 32109', status: 'Active' },
  { id: 'WH003', name: 'Bangalore East', location: 'Whitefield, Bangalore', totalArea: 40000, manager: 'Anil Reddy', contactNumber: '+91 76543 21098', status: 'Active' }
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
      active 
        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const Card = ({ children, className, title, subtitle, action }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, action?: React.ReactNode }) => (
  <div className={cn("bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm min-w-0", className)}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          {title && <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{title}</h3>}
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'neutral', className }: { children: React.ReactNode, variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info', className?: string }) => {
  const variants = {
    neutral: 'bg-zinc-100 text-zinc-600',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    error: 'bg-rose-50 text-rose-700 border border-rose-100',
    info: 'bg-blue-50 text-blue-700 border border-blue-100',
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};

const ActionButtons = ({ 
  onEdit, 
  onDelete, 
  onView, 
  onPrint, 
  onExportExcel, 
  onExportPDF 
}: { 
  onEdit?: () => void, 
  onDelete?: () => void, 
  onView?: () => void, 
  onPrint?: () => void, 
  onExportExcel?: () => void, 
  onExportPDF?: () => void 
}) => (
  <div className="flex items-center gap-1">
    {onView && (
      <button onClick={onView} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View">
        <Search size={14} />
      </button>
    )}
    {onEdit && (
      <button onClick={onEdit} className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Edit">
        <Settings size={14} />
      </button>
    )}
    {onDelete && (
      <button onClick={onDelete} className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete">
        <X size={14} />
      </button>
    )}
    <div className="w-px h-4 bg-zinc-200 mx-1" />
    {onPrint && (
      <button onClick={onPrint} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors" title="Print">
        <FileText size={14} />
      </button>
    )}
    {onExportExcel && (
      <button onClick={onExportExcel} className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Export Excel">
        <Download size={14} />
      </button>
    )}
    {onExportPDF && (
      <button onClick={onExportPDF} className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Export PDF">
        <FileText size={14} />
      </button>
    )}
  </div>
);

// --- Views ---

const DashboardView = ({ 
  contracts, 
  inventory, 
  inward, 
  outward 
}: { 
  contracts: VendorContract[], 
  inventory: InventoryRecord[], 
  inward: InwardGoods[], 
  outward: OutwardGoods[] 
}) => {
  const util = MOCK_UTILIZATION[0];
  const totalInventory = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const occupiedSpace = contracts.reduce((sum, c) => sum + c.allocatedSpace, 0);
  const occupancyPercent = Math.min(100, Math.round((occupiedSpace / util.totalArea) * 100));

  const pieData = [
    { name: 'Used', value: occupiedSpace, color: '#18181b' },
    { name: 'Free', value: Math.max(0, util.totalArea - occupiedSpace), color: '#e4e4e7' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 610000 },
    { month: 'Apr', revenue: 580000 },
    { month: 'May', revenue: 640000 },
    { month: 'Jun', revenue: 720000 },
  ];

  const dispatchData = [
    { day: 'Mon', volume: 45 },
    { day: 'Tue', volume: 52 },
    { day: 'Wed', volume: 38 },
    { day: 'Thu', volume: 65 },
    { day: 'Fri', volume: 48 },
    { day: 'Sat', volume: 32 },
    { day: 'Sun', volume: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Total Warehouses</p>
          <p className="text-xl font-black text-zinc-900">04</p>
        </div>
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Total Vendors</p>
          <p className="text-xl font-black text-zinc-900">{contracts.length}</p>
        </div>
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Total Inventory</p>
          <p className="text-xl font-black text-zinc-900">{totalInventory.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Occupied Space</p>
          <p className="text-xl font-black text-zinc-900">{occupancyPercent}%</p>
        </div>
        <div className="p-4 bg-zinc-900 text-white rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Revenue Generated</p>
          <p className="text-xl font-black">₹8.4L</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Monthly Revenue" subtitle="Revenue trends over the last 6 months">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#18181b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Warehouse Utilization" subtitle={util.warehouse}>
          <div className="h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-zinc-900">{Math.round((util.usedArea / util.totalArea) * 100)}%</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Occupied</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {util.vendorAllocations.slice(0, 3).map((alloc, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">{alloc.vendorName}</span>
                <span className="font-bold">{Math.round((alloc.allocatedSpace / util.totalArea) * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Dispatch Volume" subtitle="Daily dispatch activity for the current week">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={dispatchData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors text-center">
                <Plus size={20} className="mx-auto mb-2 text-zinc-900" />
                <span className="text-[10px] font-bold uppercase">New GRN</span>
              </button>
              <button className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors text-center">
                <Truck size={20} className="mx-auto mb-2 text-zinc-900" />
                <span className="text-[10px] font-bold uppercase">Dispatch</span>
              </button>
              <button className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors text-center">
                <FileText size={20} className="mx-auto mb-2 text-zinc-900" />
                <span className="text-[10px] font-bold uppercase">Invoice</span>
              </button>
              <button className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors text-center">
                <Users size={20} className="mx-auto mb-2 text-zinc-900" />
                <span className="text-[10px] font-bold uppercase">Vendor</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ContractsView = ({ 
  contracts, 
  onNew, 
  onEdit, 
  onDelete, 
  onView, 
  onPrint, 
  onExportExcel, 
  onExportPDF 
}: { 
  contracts: VendorContract[], 
  onNew: () => void, 
  onEdit: (c: VendorContract) => void, 
  onDelete: (id: string) => void, 
  onView: (c: VendorContract) => void, 
  onPrint: () => void, 
  onExportExcel: () => void, 
  onExportPDF: () => void 
}) => (
  <Card 
    title="Vendor Contracts" 
    subtitle="Manage terms, space allocation and rate plans" 
    action={
      <div className="flex gap-2">
        <button onClick={onExportExcel} className="p-2 text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg"><Download size={14} /></button>
        <button onClick={onNew} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors">
          <Plus size={14} /> New Contract
        </button>
      </div>
    }
  >
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor ID</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor Name</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Location</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Space (sq ft)</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Type</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">End Date</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {contracts.map((c) => (
            <tr key={c.id} className="group hover:bg-zinc-50 transition-colors">
              <td className="py-4 text-xs font-mono font-bold text-zinc-400">{c.vendorId}</td>
              <td className="py-4">
                <p className="text-sm font-bold text-zinc-900">{c.vendorName}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{c.id}</p>
              </td>
              <td className="py-4 text-sm text-zinc-600">{c.warehouseLocation}</td>
              <td className="py-4 text-sm font-bold text-zinc-900">{c.allocatedSpace.toLocaleString()}</td>
              <td className="py-4">
                <Badge variant="info">{c.contractType}</Badge>
              </td>
              <td className="py-4 text-sm text-zinc-600">{c.endDate}</td>
              <td className="py-4 text-right">
                <ActionButtons 
                  onEdit={() => onEdit(c)} 
                  onDelete={() => onDelete(c.id)} 
                  onView={() => onView(c)}
                  onPrint={onPrint}
                  onExportExcel={onExportExcel}
                  onExportPDF={onExportPDF}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const InventoryView = ({ 
  inventory, 
  items, 
  onNewItem, 
  onEditItem, 
  onDeleteItem, 
  onViewItem,
  onPrint,
  onExportExcel,
  onExportPDF,
  onStockAdjustment
}: { 
  inventory: InventoryRecord[], 
  items: ItemMaster[], 
  onNewItem: () => void, 
  onEditItem: (i: ItemMaster) => void, 
  onDeleteItem: (id: string) => void, 
  onViewItem: (i: ItemMaster) => void,
  onPrint: () => void,
  onExportExcel: () => void,
  onExportPDF: () => void,
  onStockAdjustment: (item: InventoryRecord) => void
}) => {
  const [tab, setTab] = useState<'master' | 'tracking'>('tracking');

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button 
          onClick={() => setTab('tracking')}
          className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", tab === 'tracking' ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 border border-zinc-200")}
        >
          Real-time Tracking
        </button>
        <button 
          onClick={() => setTab('master')}
          className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", tab === 'master' ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 border border-zinc-200")}
        >
          Item Master
        </button>
      </div>

      {tab === 'tracking' ? (
        <Card title="Inventory Tracking" subtitle="Real-time stock availability across locations">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Available</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Damaged/Exp/Miss</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Location</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {inventory.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-bold text-zinc-900">{inv.itemName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{inv.itemId}</p>
                    </td>
                    <td className="py-4 text-sm text-zinc-600">{inv.vendorName}</td>
                    <td className="py-4 text-sm font-black text-zinc-900">{inv.quantity}</td>
                    <td className="py-4">
                      <div className="flex gap-1">
                        {inv.damagedQuantity ? <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded" title="Damaged">{inv.damagedQuantity}D</span> : null}
                        {inv.expiredQuantity ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded" title="Expired">{inv.expiredQuantity}E</span> : null}
                        {inv.missingQuantity ? <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded" title="Missing">{inv.missingQuantity}M</span> : null}
                        {!inv.damagedQuantity && !inv.expiredQuantity && !inv.missingQuantity && <span className="text-zinc-300 text-[10px]">None</span>}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <MapPin size={12} className="text-zinc-400" />
                        {inv.location}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onStockAdjustment(inv)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                          title="Stock Adjustment"
                        >
                          <Settings2 size={16} />
                        </button>
                        <ActionButtons 
                          onView={() => onViewItem(items.find(i => i.id === inv.itemId) || items[0])}
                          onPrint={onPrint}
                          onExportExcel={onExportExcel}
                          onExportPDF={onExportPDF}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card title="Item Master" subtitle="Manage product catalog and specifications" action={<button onClick={onNewItem} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors"><Plus size={14} /> Add Item</button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item Name</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Model #</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">SKU</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">{item.shortDescription || 'No description'}</p>
                    </td>
                    <td className="py-4 text-sm text-zinc-600 font-mono">{item.modelNumber || '-'}</td>
                    <td className="py-4 text-sm text-zinc-600 font-mono">{item.sku}</td>
                    <td className="py-4 text-sm text-zinc-600">{item.category}</td>
                    <td className="py-4 text-right">
                      <ActionButtons 
                        onEdit={() => onEditItem(item)} 
                        onDelete={() => onDeleteItem(item.id)} 
                        onView={() => onViewItem(item)}
                        onPrint={onPrint}
                        onExportExcel={onExportExcel}
                        onExportPDF={onExportPDF}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

const InwardView = ({ 
  records, 
  onNewGRN, 
  onVendorDelivery,
  onGateEntry,
  onStorageAllocation,
  onEdit, 
  onDelete, 
  onView, 
  onPrint, 
  onExportExcel, 
  onExportPDF,
  onUpdateStatus,
  onProcessReturn
}: { 
  records: InwardGoods[], 
  onNewGRN: () => void, 
  onVendorDelivery: () => void,
  onGateEntry: () => void,
  onStorageAllocation: () => void,
  onEdit: (r: InwardGoods) => void, 
  onDelete: (id: string) => void, 
  onView: (r: InwardGoods) => void, 
  onPrint: () => void, 
  onExportExcel: () => void, 
  onExportPDF: () => void,
  onUpdateStatus: (id: string, status: InwardGoods['status']) => void,
  onProcessReturn: () => void
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <button 
        onClick={onVendorDelivery}
        className="p-4 bg-white border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-50 transition-colors"
      >
        <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900"><Truck size={20} /></div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase">Vendor Delivery</p>
      </button>
      <button 
        onClick={onGateEntry}
        className="p-4 bg-white border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-50 transition-colors"
      >
        <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900"><ShieldCheck size={20} /></div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase">Gate Entry</p>
      </button>
      <button 
        onClick={onNewGRN}
        className="p-4 bg-zinc-900 text-white rounded-xl flex flex-col items-center justify-center text-center gap-2 shadow-lg hover:bg-zinc-800 transition-colors"
      >
        <div className="p-2 bg-white/10 rounded-lg text-white"><FileText size={20} /></div>
        <p className="text-[10px] font-bold text-zinc-300 uppercase">GRN Generation</p>
      </button>
      <button 
        onClick={onStorageAllocation}
        className="p-4 bg-white border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-50 transition-colors"
      >
        <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900"><WarehouseIcon size={20} /></div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase">Storage Allocation</p>
      </button>
      <button 
        onClick={onProcessReturn}
        className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-rose-100 transition-colors"
      >
        <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><RotateCcw size={20} /></div>
        <p className="text-[10px] font-bold text-rose-400 uppercase">Return Damaged</p>
      </button>
    </div>

    <Card title="Inward Goods Management" subtitle="Goods Receipt Note (GRN) Records" action={<button onClick={onNewGRN} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors"><Plus size={14} /> New GRN</button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">GRN No</th>
              <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
              <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th>
              <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Qty</th>
              <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Location</th>
              <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {records.map((item) => (
              <tr key={item.grnNo} className="hover:bg-zinc-50 transition-colors">
                <td className="py-4 text-xs font-mono font-bold text-zinc-900">{item.grnNo}</td>
                <td className="py-4 text-sm text-zinc-600">{item.vendorName}</td>
                <td className="py-4 text-sm font-bold text-zinc-900">
                  {item.items && item.items.length > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-xs">{item.items[0].itemName}</span>
                      {item.items.length > 1 && <span className="text-[10px] text-zinc-400">+{item.items.length - 1} more items</span>}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="py-4 text-sm font-black text-zinc-900">
                  {item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                </td>
                <td className="py-4 text-sm text-zinc-600">
                  {item.items?.[0]?.storageLocation || 'N/A'}
                </td>
                <td className="py-4">
                  <select 
                    value={item.status} 
                    onChange={(e) => onUpdateStatus(item.grnNo, e.target.value as any)}
                    className="text-[10px] font-bold uppercase bg-zinc-100 px-2 py-1 rounded border-none outline-none"
                  >
                    <option value="Gate Entry">Gate Entry</option>
                    <option value="GRN">GRN</option>
                    <option value="Quality Check">QC</option>
                    <option value="Stored">Stored</option>
                  </select>
                </td>
                <td className="py-4 text-right">
                  <ActionButtons 
                    onEdit={() => onEdit(item)} 
                    onDelete={() => onDelete(item.grnNo)} 
                    onView={() => onView(item)}
                    onPrint={onPrint}
                    onExportExcel={onExportExcel}
                    onExportPDF={onExportPDF}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

const OutwardView = ({ 
  records, 
  onNewDispatch, 
  onEdit, 
  onDelete, 
  onView, 
  onPrint, 
  onExportExcel, 
  onExportPDF 
}: { 
  records: OutwardGoods[], 
  onNewDispatch: () => void, 
  onEdit: (r: OutwardGoods) => void, 
  onDelete: (id: string) => void, 
  onView: (r: OutwardGoods) => void, 
  onPrint: () => void, 
  onExportExcel: () => void, 
  onExportPDF: () => void 
}) => (
  <Card title="Outward Goods / Dispatch" subtitle="Manage customer dispatch requests and gate passes" action={<button onClick={onNewDispatch} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors"><Plus size={14} /> New Dispatch</button>}>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Order ID</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Qty</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destination</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {records.map((item) => (
            <tr key={item.dispatchOrderId} className="hover:bg-zinc-50 transition-colors">
              <td className="py-4 text-xs font-mono font-bold text-zinc-900">{item.dispatchOrderId}</td>
              <td className="py-4 text-sm font-bold text-zinc-900">
                {item.items && item.items.length > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-xs">{item.items[0].itemName}</span>
                    {item.items.length > 1 && <span className="text-[10px] text-zinc-400">+{item.items.length - 1} more items</span>}
                  </div>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="py-4 text-sm font-black text-zinc-900">
                {item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
              </td>
              <td className="py-4 text-sm text-zinc-600">{item.destination}</td>
              <td className="py-4"><Badge variant="info">{item.status}</Badge></td>
              <td className="py-4 text-right">
                <ActionButtons 
                  onEdit={() => onEdit(item)} 
                  onDelete={() => onDelete(item.dispatchOrderId)} 
                  onView={() => onView(item)}
                  onPrint={onPrint}
                  onExportExcel={onExportExcel}
                  onExportPDF={onExportPDF}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const ReportsView = ({ 
  inventory, 
  inward, 
  outward, 
  invoices, 
  utilization,
  contracts 
}: { 
  inventory: InventoryRecord[], 
  inward: InwardGoods[], 
  outward: OutwardGoods[], 
  invoices: Invoice[],
  utilization: WarehouseUtilization[],
  contracts: VendorContract[]
}) => {
  const [category, setCategory] = useState<'inventory' | 'warehouse' | 'financial' | 'operational'>('inventory');
  const [reportType, setReportType] = useState('stock-on-date');

  const categories = [
    { id: 'inventory', label: 'Inventory Reports', icon: Package },
    { id: 'warehouse', label: 'Warehouse Reports', icon: WarehouseIcon },
    { id: 'financial', label: 'Financial Reports', icon: CreditCard },
    { id: 'operational', label: 'Operational Reports', icon: Activity },
  ];

  const reports = {
    inventory: [
      { id: 'stock-on-date', label: 'Stock as on Date' },
      { id: 'stock-movement', label: 'Stock Movement' },
      { id: 'vendor-inventory', label: 'Vendor Inventory' },
    ],
    warehouse: [
      { id: 'space-utilization', label: 'Space Utilization' },
      { id: 'rack-occupancy', label: 'Rack Occupancy' },
    ],
    financial: [
      { id: 'invoice-summary', label: 'Invoice Summary' },
      { id: 'payment-pending', label: 'Payment Pending' },
      { id: 'vendor-ledger', label: 'Vendor Ledger' },
    ],
    operational: [
      { id: 'inward-report', label: 'Inward Report' },
      { id: 'outward-report', label: 'Outward Report' },
      { id: 'daily-activity', label: 'Daily Warehouse Activity' },
    ],
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'vendor-ledger':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Debit</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Credit</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 text-sm text-zinc-600">{inv.date}</td>
                    <td className="py-4 text-sm text-zinc-900 font-bold">Invoice {inv.invoiceNumber}</td>
                    <td className="py-4 text-sm font-black text-rose-600 text-right">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-4 text-sm text-zinc-900 text-right">₹0</td>
                    <td className="py-4 text-sm font-black text-zinc-900 text-right">₹{inv.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'daily-activity':
        const activityData = [
          ...inward.map(i => ({ 
            time: i.dateTime, 
            type: 'Inward', 
            desc: `Received ${i.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} units of ${i.items?.[0]?.itemName || 'items'}${i.items?.length > 1 ? ` (+${i.items.length - 1} more)` : ''}` 
          })),
          ...outward.map(o => ({ 
            time: o.dateTime, 
            type: 'Outward', 
            desc: `Dispatched ${o.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} units of ${o.items?.[0]?.itemName || 'items'}${o.items?.length > 1 ? ` (+${o.items.length - 1} more)` : ''}` 
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        return (
          <div className="space-y-4">
            {activityData.map((act, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className={cn("p-2 rounded-lg", act.type === 'Inward' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                  {act.type === 'Inward' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{act.desc}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'rack-occupancy':
        const occupancyData = inventory.reduce((acc: any, curr) => {
          const loc = curr.location.split('-')[0];
          acc[loc] = (acc[loc] || 0) + curr.quantity;
          return acc;
        }, {});
        const chartData = Object.entries(occupancyData).map(([name, value]) => ({ name, value }));
        return (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip />
                <Bar dataKey="value" name="Units Stored" fill="#18181b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'stock-movement':
        const movementData = [
          ...inward.flatMap(i => (i.items || []).map(item => ({ 
            date: i.dateTime.split(' ')[0], 
            type: 'Inward', 
            qty: item.quantity, 
            name: item.itemName 
          }))),
          ...outward.flatMap(o => (o.items || []).map(item => ({ 
            date: o.dateTime.split(' ')[0], 
            type: 'Outward', 
            qty: -item.quantity, 
            name: item.itemName 
          })))
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {movementData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 text-sm text-zinc-600">{m.date}</td>
                    <td className="py-4">
                      <Badge variant={m.type === 'Inward' ? 'success' : 'info'}>{m.type}</Badge>
                    </td>
                    <td className="py-4 text-sm font-bold text-zinc-900">{m.name}</td>
                    <td className={cn("py-4 text-sm font-black text-right", m.qty > 0 ? "text-emerald-600" : "text-rose-600")}>
                      {m.qty > 0 ? `+${m.qty}` : m.qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'vendor-inventory':
        const vendorStock = contracts.map(c => ({
          name: c.vendorName,
          stock: inventory.filter(i => i.vendorId === c.vendorId).reduce((acc, curr) => acc + curr.quantity, 0)
        }));
        return (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorStock} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f4f4f5" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} width={100} />
                <Tooltip />
                <Bar dataKey="stock" fill="#18181b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'payment-pending':
        const pendingInvoices = invoices.filter(i => i.status !== 'PAID');
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Invoice #</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Pending Amount</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {pendingInvoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 text-xs font-mono font-bold text-zinc-900">{inv.invoiceNumber}</td>
                    <td className="py-4 text-sm text-zinc-600">{inv.vendorName}</td>
                    <td className="py-4 text-sm font-black text-rose-600 text-right">₹{(inv.totalAmount - inv.paidAmount).toLocaleString()}</td>
                    <td className="py-4 text-xs text-zinc-500">{inv.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'outward-report':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Order #</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destination</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Qty</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {outward.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 text-xs font-mono font-bold text-zinc-900">{item.dispatchOrderId}</td>
                    <td className="py-4 text-sm text-zinc-900 font-bold">
                      {item.items && item.items.length > 0 ? (
                        <div className="flex flex-col">
                          <span>{item.items[0].itemName}</span>
                          {item.items.length > 1 && <span className="text-[10px] text-zinc-400">+{item.items.length - 1} more items</span>}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="py-4 text-sm text-zinc-600">{item.destination}</td>
                    <td className="py-4 text-sm font-black text-rose-600 text-right">
                      {item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                    </td>
                    <td className="py-4">
                      <Badge variant="info">{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'stock-on-date':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item Name</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Quantity</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Aging (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {inventory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 text-sm font-bold text-zinc-900">{item.itemName}</td>
                    <td className="py-4 text-sm text-zinc-600">{item.vendorName}</td>
                    <td className="py-4 text-sm font-black text-zinc-900 text-right">{item.quantity}</td>
                    <td className="py-4 text-sm text-zinc-600 text-right">{item.agingDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'space-utilization':
        const utilData = utilization.map(u => ({
          name: u.warehouse,
          used: u.usedArea,
          free: u.freeArea
        }));
        return (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="used" name="Used Area" fill="#18181b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="free" name="Free Area" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'invoice-summary':
        const invoiceData = [
          { name: 'Paid', value: invoices.filter(i => i.status === 'PAID').length },
          { name: 'Unpaid', value: invoices.filter(i => i.status === 'UNPAID').length },
          { name: 'Partial', value: invoices.filter(i => i.status === 'PARTIAL').length },
        ];
        const COLORS = ['#10b981', '#f43f5e', '#f59e0b'];
        return (
          <div className="h-[400px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {invoiceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'inward-report':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">GRN #</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Qty</th>
                  <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {inward.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 text-xs font-mono font-bold text-zinc-900">{item.grnNo}</td>
                    <td className="py-4 text-sm text-zinc-600">{item.vendorName}</td>
                    <td className="py-4 text-sm text-zinc-900 font-bold">
                      {item.items && item.items.length > 0 ? (
                        <div className="flex flex-col">
                          <span>{item.items[0].itemName}</span>
                          {item.items.length > 1 && <span className="text-[10px] text-zinc-400">+{item.items.length - 1} more items</span>}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="py-4 text-sm font-black text-zinc-900 text-right">
                      {item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                    </td>
                    <td className="py-4 text-xs text-zinc-500">{item.dateTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return (
          <div className="h-[400px] flex items-center justify-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-sm font-bold text-zinc-900">Report Preview</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">Select a report type above to generate detailed warehouse analytics and inventory insights.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategory(cat.id as any);
              setReportType(reports[cat.id as keyof typeof reports][0].id);
            }}
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
              category === cat.id 
                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" 
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
            )}
          >
            <cat.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {reports[category].map((btn) => (
          <button 
            key={btn.id}
            onClick={() => setReportType(btn.id)}
            className={cn(
              "px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all",
              reportType === btn.id 
                ? "bg-zinc-100 text-zinc-900 border-zinc-300" 
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <Card title={reportType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} action={<button className="flex items-center gap-2 text-[10px] font-bold text-zinc-900 uppercase"><Download size={14} /> Export CSV</button>}>
        {renderReportContent()}
      </Card>
    </div>
  );
};

const RemindersView = ({ invoices, contracts, onSendReminder }: { invoices: Invoice[], contracts: VendorContract[], onSendReminder: (id: string) => void }) => {
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'PAID');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedInvoices(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.length === unpaidInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(unpaidInvoices.map(i => i.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">Vendor Reminders</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Active Follow-ups</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Total Pending</span>
                <span className="font-bold text-rose-600">₹{unpaidInvoices.reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Unpaid Invoices</span>
                <span className="font-bold">{unpaidInvoices.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Reminders Sent (Today)</span>
                <span className="font-bold">0</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Payment Reminder" action={
          <button 
            onClick={() => {
              selectedInvoices.forEach(id => onSendReminder(id));
              setSelectedInvoices([]);
              alert(`Reminders sent to ${selectedInvoices.length} vendors via WhatsApp/Email`);
            }}
            disabled={selectedInvoices.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare size={14} />
            Send Reminders
          </button>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      checked={selectedInvoices.length === unpaidInvoices.length && unpaidInvoices.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Party</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reminder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {unpaidInvoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        checked={selectedInvoices.includes(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900">{inv.vendorName}</td>
                    <td className="px-6 py-4 text-sm font-black text-zinc-900">₹{(inv.totalAmount - inv.paidAmount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors">
                        <MessageSquare size={14} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Payment Status Table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Party Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Upcoming Reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900">{inv.vendorName}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{inv.date}</td>
                  <td className="px-6 py-4 text-sm font-black text-zinc-900">₹{inv.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-black text-rose-600">₹{(inv.totalAmount - inv.paidAmount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {inv.status !== 'PAID' ? (
                      <button 
                        onClick={() => {
                          onSendReminder(inv.id);
                          alert(`Reminder sent for Invoice ${inv.invoiceNumber}`);
                        }}
                        className="text-zinc-900 hover:underline text-xs font-bold flex items-center gap-1"
                      >
                        <Bell size={12} />
                        Send Now
                      </button>
                    ) : (
                      <span className="text-zinc-400 text-xs italic">No reminders</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const BarcodeView = ({ items }: { items: ItemMaster[] }) => {
  const [selectedItem, setSelectedItem] = useState<ItemMaster | null>(null);
  const [header, setHeader] = useState('Nexus WMS');
  const [line2, setLine2] = useState('Premium Quality');
  const [qty, setQty] = useState(1);
  const [barcodeList, setBarcodeList] = useState<{ item: ItemMaster, qty: number, header: string, line2: string }[]>([]);

  const addToBarcodeList = () => {
    if (selectedItem) {
      setBarcodeList([...barcodeList, { item: selectedItem, qty, header, line2 }]);
      setSelectedItem(null);
      setQty(1);
    }
  };

  const removeFromList = (idx: number) => {
    setBarcodeList(barcodeList.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1" title="Barcode Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Header Text</label>
              <input 
                type="text" 
                value={header} 
                onChange={e => setHeader(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Line 2 Text</label>
              <input 
                type="text" 
                value={line2} 
                onChange={e => setLine2(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Item</label>
              <select 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
                onChange={(e) => {
                  const item = items.find(i => i.id === e.target.value);
                  setSelectedItem(item || null);
                }}
                value={selectedItem?.id || ''}
              >
                <option value="">Select an item...</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Quantity</label>
              <input 
                type="number" 
                value={qty} 
                onChange={e => setQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" 
                min="1"
              />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col items-center justify-center p-12" title="Barcode Preview">
          {selectedItem ? (
            <div className="bg-white border-2 border-rose-600 rounded-xl p-8 shadow-sm flex flex-col items-center gap-4 max-w-sm w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-600"></div>
              <p className="text-lg font-bold text-zinc-900">{header}</p>
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 flex flex-col items-center">
                <div className="bg-white border border-zinc-200 p-2 flex flex-col items-center justify-center">
                  <BarcodeGenerator value={selectedItem.id} width={1.5} height={60} fontSize={14} />
                  <p className="text-[10px] font-mono mt-1">{selectedItem.id}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-900">Sale Price: ₹{selectedItem.price || '0'}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{line2}</p>
              </div>
              <button 
                onClick={addToBarcodeList}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                <Plus size={14} />
                Add for Barcode
              </button>
            </div>
          ) : (
            <div className="text-center text-zinc-400">
              <Barcode size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">Select an item to generate a barcode preview</p>
            </div>
          )}
        </Card>
      </div>

      <Card title="Barcode Print List" action={
        <button 
          onClick={() => window.print()}
          disabled={barcodeList.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          <Download size={14} />
          Print All Labels
        </button>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item Name</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item Code</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Qty</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit/Cost</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {barcodeList.map((entry, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-sm font-bold text-zinc-900">{entry.item.name}</td>
                  <td className="py-4 text-sm font-mono text-zinc-600">{entry.item.id}</td>
                  <td className="py-4 text-sm font-black text-zinc-900">{entry.qty.toString().padStart(2, '0')}</td>
                  <td className="py-4 text-sm font-black text-zinc-900">₹{(entry.item.price || 0).toLocaleString()}</td>
                  <td className="py-4 text-sm font-black text-zinc-900">₹{((entry.item.price || 0) * entry.qty).toLocaleString()}</td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => removeFromList(idx)}
                      className="text-rose-600 hover:underline text-[10px] font-bold uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {barcodeList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 text-sm italic">No items added to print list</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const InvoicesView = ({ onOpenCreate, invoices }: { onOpenCreate: () => void, invoices: Invoice[] }) => (
  <Card title="Invoices" subtitle="Manage vendor billing and space rental invoices" action={<button onClick={onOpenCreate} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors"><Plus size={14} /> Create Invoice</button>}>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Invoice #</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
              <td className="py-4 text-xs font-mono font-bold text-zinc-900">{inv.invoiceNumber}</td>
              <td className="py-4 text-sm text-zinc-600">{inv.vendorName}</td>
              <td className="py-4 text-sm text-zinc-600">{inv.date}</td>
              <td className="py-4 text-sm font-black text-zinc-900">₹{inv.totalAmount.toLocaleString()}</td>
              <td className="py-4">
                <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'UNPAID' ? 'error' : 'warning'}>
                  {inv.status}
                </Badge>
              </td>
              <td className="py-4 text-right">
                <ActionButtons 
                  onView={() => {}}
                  onPrint={() => window.print()}
                  onExportExcel={() => {}}
                  onExportPDF={() => {}}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const PaymentsView = ({ onOpenRecord, payments }: { onOpenRecord: () => void, payments: Payment[] }) => (
  <Card title="Payments" subtitle="Record and track vendor payments" action={<button onClick={onOpenRecord} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors"><Plus size={14} /> Record Payment</button>}>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment ID</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Invoice #</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {payments.map((pay) => (
            <tr key={pay.id} className="hover:bg-zinc-50 transition-colors">
              <td className="py-4 text-xs font-mono font-bold text-zinc-900">{pay.id}</td>
              <td className="py-4 text-sm text-zinc-600">{pay.vendorName}</td>
              <td className="py-4 text-sm text-zinc-600 font-mono">{pay.invoiceNumber}</td>
              <td className="py-4 text-sm font-black text-zinc-900">₹{pay.amount.toLocaleString()}</td>
              <td className="py-4 text-right">
                <ActionButtons 
                  onView={() => {}}
                  onPrint={() => window.print()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const LedgerView = ({ ledger }: { ledger: LedgerEntry[] }) => (
  <Card title="Vendor Ledger" subtitle="Detailed transaction history for vendors">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Debit</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Credit</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Balance</th>
            <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {ledger.map((entry) => (
            <tr key={entry.id} className="hover:bg-zinc-50 transition-colors">
              <td className="py-4 text-sm text-zinc-600">{entry.date}</td>
              <td className="py-4 text-sm text-zinc-900 font-medium">{entry.description}</td>
              <td className="py-4 text-sm font-bold text-rose-600">{entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}</td>
              <td className="py-4 text-sm font-bold text-emerald-600">{entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}</td>
              <td className="py-4 text-sm font-black text-zinc-900">₹{entry.balance.toLocaleString()}</td>
              <td className="py-4 text-right">
                <ActionButtons 
                  onView={() => {}}
                  onPrint={() => window.print()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const SettingsView = ({ 
  pricing, 
  onUpdatePricing, 
  customers, 
  onAddCustomer, 
  onToggleCustomerAccess,
  onDeleteCustomer
}: { 
  pricing: PricingConfig[], 
  onUpdatePricing: (newPricing: PricingConfig[]) => void,
  customers: Customer[],
  onAddCustomer: (c: Customer) => void,
  onToggleCustomerAccess: (id: string) => void,
  onDeleteCustomer: (id: string) => void
}) => {
  const [localPricing, setLocalPricing] = useState(pricing);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  return (
    <div className="space-y-6">
      <Card title="Warehouse Space Rental Model" subtitle="Configure rates for different storage types">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {localPricing.map((p, idx) => (
            <div key={p.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{p.description}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{p.unit}</p>
                </div>
                <Settings size={16} className="text-zinc-400" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                <input 
                  type="number" 
                  value={p.value}
                  onChange={(e) => {
                    const next = [...localPricing];
                    next[idx] = { ...next[idx], value: Number(e.target.value) };
                    setLocalPricing(next);
                  }}
                  className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none font-bold"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => onUpdatePricing(localPricing)}
            className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Save Pricing Model
          </button>
        </div>
      </Card>

      <Card 
        title="Customer Access Management" 
        subtitle="Manage customer portal credentials and access status"
        action={<button onClick={() => setShowAddCustomer(true)} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-colors"><Plus size={14} /> Add Customer</button>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Username</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Password</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor ID</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 text-sm font-bold text-zinc-900">{c.username}</td>
                  <td className="py-4 text-sm text-zinc-600 font-mono">{c.password}</td>
                  <td className="py-4 text-sm text-zinc-600">{c.vendorId}</td>
                  <td className="py-4">
                    <Badge variant={c.accessDeniedByAdmin ? 'error' : 'success'}>
                      {c.accessDeniedByAdmin ? 'Access Denied' : 'Active'}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onToggleCustomerAccess(c.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          c.accessDeniedByAdmin ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        )}
                        title={c.accessDeniedByAdmin ? "Resume Access" : "Deny Access"}
                      >
                        {c.accessDeniedByAdmin ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                      </button>
                      <button 
                        onClick={() => onDeleteCustomer(c.id)}
                        className="p-2 bg-zinc-50 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddCustomer && (
        <CustomerModal 
          onClose={() => setShowAddCustomer(false)} 
          onSave={(c) => {
            onAddCustomer(c);
            setShowAddCustomer(false);
          }} 
        />
      )}

      <Card title="Billing Formula Reference" className="bg-zinc-900 text-white border-none">
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Standard Formula</p>
            <p className="text-lg font-black italic">Charge = Area Used × Rate × Time Period</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Example Calculation</p>
              <p className="text-sm">100 sq ft × ₹15 × 30 days</p>
              <p className="text-xl font-black text-emerald-400 mt-1">₹45,000</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Billing Components</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Space Rental', 'Handling', 'Inward', 'Outward', 'Storage', 'Additional'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ContractModal = ({ onClose, onSave, initialData, warehouses }: { onClose: () => void, onSave: (c: VendorContract) => void, initialData?: VendorContract, warehouses: Warehouse[] }) => {
  const [formData, setFormData] = useState<Partial<VendorContract>>(initialData || {
    id: `CON${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    vendorId: `V${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    vendorName: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
    warehouseLocation: warehouses[0]?.name || 'Delhi Hub',
    allocatedSpace: 5000,
    ratePlan: 'Standard',
    securityDeposit: 50000,
    paymentCycle: 'Monthly',
    contractType: 'Monthly'
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{initialData ? 'Edit Contract' : 'New Vendor Contract'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vendor Name</label>
            <input type="text" value={formData.vendorName} onChange={e => setFormData({...formData, vendorName: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="e.g. ABC Traders" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Start Date</label>
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">End Date</label>
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Warehouse Location</label>
            <select 
              value={formData.warehouseLocation} 
              onChange={e => setFormData({...formData, warehouseLocation: e.target.value})} 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
            >
              {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Allocated Space (sq ft)</label>
            <input type="number" value={formData.allocatedSpace} onChange={e => setFormData({...formData, allocatedSpace: Number(e.target.value)})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contract Type</label>
            <select value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value as any})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Daily">Daily</option>
              <option value="Pay-as-used">Pay-as-used</option>
            </select>
          </div>
          <div className="col-span-2 pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button onClick={() => onSave(formData as VendorContract)} className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Save Contract</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ItemModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: (i: ItemMaster) => void, initialData?: ItemMaster }) => {
  const [formData, setFormData] = useState<Partial<ItemMaster>>(initialData || {
    id: `ITEM${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    name: '',
    sku: `SKU${Math.floor(Math.random() * 100000).toString()}`,
    category: 'General',
    unitType: 'Piece',
    weight: 0,
    volume: 0,
    modelNumber: '',
    shortDescription: '',
    mfgDate: '',
    expiryDate: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 sticky top-0 z-10">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{initialData ? 'Edit Item' : 'Add New Item'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Item Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="e.g. Office Chair" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">SKU</label>
              <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Category</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Model Number</label>
              <input type="text" value={formData.modelNumber} onChange={e => setFormData({...formData, modelNumber: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Short Description</label>
              <input type="text" value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">MFG Date</label>
              <input type="date" value={formData.mfgDate} onChange={e => setFormData({...formData, mfgDate: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Unit Type</label>
              <select value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value as any})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
                <option value="Piece">Piece</option>
                <option value="Carton">Carton</option>
                <option value="Pallet">Pallet</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Weight (kg)</label>
              <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Volume (m³)</label>
              <input type="number" value={formData.volume} onChange={e => setFormData({...formData, volume: Number(e.target.value)})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button onClick={() => onSave(formData as ItemMaster)} className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Save Item</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StockAdjustmentModal = ({ onClose, onSave, item }: { onClose: () => void, onSave: (type: 'DAMAGED' | 'EXPIRED' | 'MISSING' | 'RETURN', quantity: number) => void, item: InventoryRecord }) => {
  const [type, setType] = useState<'DAMAGED' | 'EXPIRED' | 'MISSING' | 'RETURN'>('DAMAGED');
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Stock Adjustment</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-500">Adjusting stock for <span className="font-bold text-zinc-900">{item.itemName}</span></p>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Adjustment Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
              <option value="DAMAGED">Damaged</option>
              <option value="EXPIRED">Expired</option>
              <option value="MISSING">Missing</option>
              <option value="RETURN">Return Item</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Quantity</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" 
              max={type === 'RETURN' ? undefined : item.quantity}
            />
            {type !== 'RETURN' && <p className="text-[10px] text-zinc-400 mt-1">Available: {item.quantity}</p>}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button onClick={() => onSave(type, quantity)} className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Confirm</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const GRNModal = ({ onClose, onSave, initialData, items, vendors, warehouses }: { onClose: () => void, onSave: (r: InwardGoods) => void, initialData?: InwardGoods, items: ItemMaster[], vendors: VendorContract[], warehouses: Warehouse[] }) => {
  const [formData, setFormData] = useState<Partial<InwardGoods>>(initialData || {
    grnNo: `GRN${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    vendorId: vendors[0]?.vendorId || '',
    vendorName: vendors[0]?.vendorName || '',
    items: [],
    warehouse: warehouses[0]?.name || 'Delhi Hub',
    dateTime: format(new Date(), 'yyyy-MM-dd HH:mm'),
    status: 'GRN',
    lrNumber: '',
    courierName: '',
    courierDetails: '',
    trackingNumber: '',
    thirdPartyCourier: '',
    thirdPartyTracking: ''
  });

  const [currentItem, setCurrentItem] = useState<Partial<InwardItem>>({
    itemId: items[0]?.id || '',
    itemName: items[0]?.name || '',
    quantity: 0,
    weight: 0,
    volume: 0,
    storageLocation: 'Rack A1',
    shortDescription: items[0]?.shortDescription || ''
  });

  const addItem = () => {
    if (!currentItem.itemId || currentItem.quantity! <= 0) return;
    const item = items.find(i => i.id === currentItem.itemId);
    setFormData({
      ...formData,
      items: [...(formData.items || []), {
        ...currentItem as InwardItem,
        itemName: item?.name || '',
        modelNumber: item?.modelNumber,
        shortDescription: item?.shortDescription
      }]
    });
    setCurrentItem({
      itemId: items[0]?.id || '',
      itemName: items[0]?.name || '',
      quantity: 0,
      weight: 0,
      volume: 0,
      storageLocation: 'Rack A1',
      shortDescription: items[0]?.shortDescription || ''
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{initialData ? 'Edit GRN' : 'New Goods Receipt Note (GRN)'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vendor</label>
              <select 
                value={formData.vendorId} 
                onChange={e => {
                  const v = vendors.find(v => v.vendorId === e.target.value);
                  setFormData({...formData, vendorId: e.target.value, vendorName: v?.vendorName || ''});
                }} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
              >
                {vendors.map(v => <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Warehouse</label>
              <select 
                value={formData.warehouse} 
                onChange={e => setFormData({...formData, warehouse: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
              >
                {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">LR Number</label>
              <input type="text" value={formData.lrNumber} onChange={e => setFormData({...formData, lrNumber: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="Lorry Receipt #" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Courier Name</label>
              <input type="text" value={formData.courierName} onChange={e => setFormData({...formData, courierName: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="e.g. BlueDart" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Courier Details</label>
              <input type="text" value={formData.courierDetails} onChange={e => setFormData({...formData, courierDetails: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="Contact/Vehicle info" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tracking Number</label>
              <input type="text" value={formData.trackingNumber} onChange={e => setFormData({...formData, trackingNumber: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="Order Tracking #" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Third Party Courier</label>
              <input type="text" value={formData.thirdPartyCourier} onChange={e => setFormData({...formData, thirdPartyCourier: e.target.value})} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none" placeholder="If not registered" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Third Party Tracking</label>
              <input type="text" value={formData.thirdPartyTracking} onChange={e => setFormData({...formData, thirdPartyTracking: e.target.value})} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
          </div>

          {/* Item Entry */}
          <div className="p-4 border border-dashed border-zinc-200 rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Add Items to GRN</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Item</label>
                <select 
                  value={currentItem.itemId} 
                  onChange={e => {
                    const i = items.find(i => i.id === e.target.value);
                    setCurrentItem({
                      ...currentItem, 
                      itemId: e.target.value, 
                      itemName: i?.name || '',
                      shortDescription: i?.shortDescription || ''
                    });
                  }} 
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none"
                >
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                </select>
                {currentItem.itemId && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 uppercase">Model: {items.find(i => i.id === currentItem.itemId)?.modelNumber || 'N/A'}</span>
                    <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 uppercase">Unit: {items.find(i => i.id === currentItem.itemId)?.unitType}</span>
                    <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 uppercase truncate max-w-[200px]">Desc: {currentItem.shortDescription || 'N/A'}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Quantity ({items.find(i => i.id === currentItem.itemId)?.unitType || 'Units'})</label>
                <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Location</label>
                <input type="text" value={currentItem.storageLocation} onChange={e => setCurrentItem({...currentItem, storageLocation: e.target.value})} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={addItem} className="px-4 py-2 bg-zinc-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-2">
                <Plus size={14} /> Add Item
              </button>
            </div>
          </div>

          {/* Items List */}
          {formData.items && formData.items.length > 0 && (
            <div className="border border-zinc-100 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase">Item / Description</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase">Model</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase">Qty</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase">Location</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900">{item.itemName}</span>
                          <span className="text-[9px] text-zinc-400 italic">{item.shortDescription}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{item.modelNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs font-black text-zinc-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-xs text-zinc-600">{item.storageLocation}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700"><X size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
          <button 
            onClick={() => onSave(formData as InwardGoods)} 
            disabled={!formData.items || formData.items.length === 0}
            className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Generate GRN
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DispatchModal = ({ onClose, onSave, initialData, items, vendors }: { onClose: () => void, onSave: (r: OutwardGoods) => void, initialData?: OutwardGoods, items: ItemMaster[], vendors: VendorContract[] }) => {
  const [formData, setFormData] = useState<Partial<OutwardGoods>>(initialData || {
    dispatchOrderId: `DO${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    vendorId: vendors[0]?.vendorId || '',
    vendorName: vendors[0]?.vendorName || '',
    items: [],
    destination: '',
    vehicleDetails: '',
    dateTime: format(new Date(), 'yyyy-MM-dd HH:mm'),
    status: 'Requested',
    lrNumber: '',
    courierName: '',
    courierDetails: '',
    trackingNumber: '',
    thirdPartyCourier: '',
    thirdPartyTracking: ''
  });

  const [currentItem, setCurrentItem] = useState<Partial<OutwardItem>>({
    itemId: items[0]?.id || '',
    itemName: items[0]?.name || '',
    quantity: 0,
    weight: 0,
    shortDescription: items[0]?.shortDescription || ''
  });

  const addItem = () => {
    if (!currentItem.itemId || currentItem.quantity! <= 0) return;
    const item = items.find(i => i.id === currentItem.itemId);
    setFormData({
      ...formData,
      items: [...(formData.items || []), {
        ...currentItem as OutwardItem,
        itemName: item?.name || '',
        modelNumber: item?.modelNumber,
        shortDescription: item?.shortDescription
      }]
    });
    setCurrentItem({
      itemId: items[0]?.id || '',
      itemName: items[0]?.name || '',
      quantity: 0,
      weight: 0,
      shortDescription: items[0]?.shortDescription || ''
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{initialData ? 'Edit Dispatch' : 'New Dispatch Order'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vendor</label>
              <select 
                value={formData.vendorId} 
                onChange={e => {
                  const v = vendors.find(v => v.vendorId === e.target.value);
                  setFormData({...formData, vendorId: e.target.value, vendorName: v?.vendorName || ''});
                }} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
              >
                {vendors.map(v => <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Destination</label>
              <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="e.g. Retail Store" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vehicle Details</label>
              <input type="text" value={formData.vehicleDetails} onChange={e => setFormData({...formData, vehicleDetails: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="e.g. KA-01-MH-1234" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">LR Number</label>
              <input type="text" value={formData.lrNumber} onChange={e => setFormData({...formData, lrNumber: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="Lorry Receipt #" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Courier Name</label>
              <input type="text" value={formData.courierName} onChange={e => setFormData({...formData, courierName: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="e.g. BlueDart" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tracking Number</label>
              <input type="text" value={formData.trackingNumber} onChange={e => setFormData({...formData, trackingNumber: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="Order Tracking #" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Third Party Courier</label>
              <input type="text" value={formData.thirdPartyCourier} onChange={e => setFormData({...formData, thirdPartyCourier: e.target.value})} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none" placeholder="If not registered" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Third Party Tracking</label>
              <input type="text" value={formData.thirdPartyTracking} onChange={e => setFormData({...formData, thirdPartyTracking: e.target.value})} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
          </div>

          {/* Item Entry */}
          <div className="p-4 border border-dashed border-zinc-200 rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Add Items to Dispatch</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Item</label>
                <select 
                  value={currentItem.itemId} 
                  onChange={e => {
                    const i = items.find(i => i.id === e.target.value);
                    setCurrentItem({
                      ...currentItem, 
                      itemId: e.target.value, 
                      itemName: i?.name || '',
                      shortDescription: i?.shortDescription || ''
                    });
                  }} 
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none"
                >
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                </select>
                {currentItem.itemId && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 uppercase">Model: {items.find(i => i.id === currentItem.itemId)?.modelNumber || 'N/A'}</span>
                    <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 uppercase">Unit: {items.find(i => i.id === currentItem.itemId)?.unitType}</span>
                    <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 uppercase truncate max-w-[200px]">Desc: {currentItem.shortDescription || 'N/A'}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Quantity ({items.find(i => i.id === currentItem.itemId)?.unitType || 'Units'})</label>
                <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={addItem} className="px-4 py-2 bg-zinc-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-2">
                <Plus size={14} /> Add Item
              </button>
            </div>
          </div>

          {/* Items List */}
          {formData.items && formData.items.length > 0 && (
            <div className="border border-zinc-100 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase">Item / Description</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase">Model</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase">Qty</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900">{item.itemName}</span>
                          <span className="text-[9px] text-zinc-400 italic">{item.shortDescription}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{item.modelNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs font-black text-zinc-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700"><X size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
          <button 
            onClick={() => onSave(formData as OutwardGoods)} 
            disabled={!formData.items || formData.items.length === 0}
            className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Create Dispatch
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DeliveryModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Vendor Delivery Entry</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vehicle Number</label>
              <input type="text" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="e.g. KA-01-MH-1234" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Driver Name</label>
              <input type="text" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vendor Name</label>
            <input type="text" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="Select Vendor" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Delivery Note / Invoice #</label>
            <input type="text" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" placeholder="DN-123456" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button onClick={onClose} className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Record Arrival</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const GateEntryModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Security Gate Entry</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400">
              <Camera size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">Scan Vehicle Plate</p>
              <p className="text-[10px] text-zinc-500 uppercase">Automatic OCR Recognition</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Entry Time</label>
              <input type="text" readOnly value={format(new Date(), 'HH:mm')} className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm outline-none text-zinc-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Gate Number</label>
              <select className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
                <option>Gate 01 (Inbound)</option>
                <option>Gate 02 (Inbound)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Security Remarks</label>
            <textarea className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none h-20" placeholder="e.g. Seal intact, no visible damage."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button onClick={onClose} className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Authorize Entry</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StorageModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Storage Allocation / Putaway</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Pending Putaway</p>
              <p className="text-lg font-black">12 Items / 450 Units</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Suggested Zone</p>
              <p className="text-lg font-black">Zone A (Fast Moving)</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recommended Locations</p>
            {[
              { loc: 'Rack A1-B2', cap: '85%', type: 'Standard' },
              { loc: 'Rack A2-C1', cap: '40%', type: 'Standard' },
              { loc: 'Zone B-Cold', cap: '10%', type: 'Temperature Controlled' },
            ].map((l, i) => (
              <div key={i} className="p-3 border border-zinc-200 rounded-lg flex items-center justify-between hover:bg-zinc-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center text-zinc-600"><MapPin size={16} /></div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{l.loc}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{l.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-900">{l.cap} Full</p>
                  <div className="w-24 h-1.5 bg-zinc-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-zinc-900" style={{ width: l.cap }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button onClick={onClose} className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Confirm Putaway</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ViewModal = ({ entity, onClose }: { entity: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Record Details</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {Object.entries(entity).map(([key, value]) => (
              <div key={key}>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-sm font-medium text-zinc-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-zinc-100 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Close</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CreateInvoiceModal = ({ onClose }: { onClose: () => void }) => {
  const [items, setItems] = useState([
    { id: '1', description: 'Storage Charges', amount: 20000, type: 'STORAGE' },
    { id: '2', description: 'Handling Charges', amount: 2000, type: 'HANDLING' },
    { id: '3', description: 'Inward Charges', amount: 500, type: 'INWARD' },
  ]);

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Create New Invoice</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vendor</label>
              <select className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
                <option>ABC Traders</option>
                <option>Global Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Due Date</label>
              <input type="date" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Billing Components</p>
            {items.map((item, idx) => (
              <div key={item.id} className="flex gap-3 items-center">
                <input 
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
                  value={item.description}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].description = e.target.value;
                    setItems(next);
                  }}
                />
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">₹</span>
                  <input 
                    type="number"
                    className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none font-bold"
                    value={item.amount}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].amount = Number(e.target.value);
                      setItems(next);
                    }}
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={() => setItems([...items, { id: Math.random().toString(), description: '', amount: 0, type: 'ADDITIONAL' }])}
              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add Component
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Amount</p>
              <p className="text-2xl font-black text-zinc-900">₹{total.toLocaleString()}</p>
            </div>
            <button className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">
              Generate Invoice
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const RecordPaymentModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Record Payment</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Invoice</label>
            <select className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
              <option>INV-2024-002 (₹1,20,000 Pending)</option>
              <option>Advance Payment (No Invoice)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Payment Type</label>
              <select className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
                <option>Full Payment</option>
                <option>Part Payment</option>
                <option>Advance</option>
                <option>Credit Note</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">₹</span>
                <input type="number" className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none font-bold" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['BANK', 'UPI', 'CASH'].map(m => (
                <button key={m} className="py-2 border border-zinc-200 rounded-lg text-[10px] font-bold hover:bg-zinc-50">{m}</button>
              ))}
            </div>
          </div>
          <button className="w-full py-3 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors mt-4">
            Confirm Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const CustomerModal = ({ onClose, onSave }: { onClose: () => void, onSave: (c: Customer) => void }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    id: Math.random().toString(36).substr(2, 9),
    username: '',
    password: '',
    vendorId: 'V001',
    isActive: true,
    accessDeniedByAdmin: false
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Register New Customer</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Username</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" 
              placeholder="e.g. customer_abc" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Password</label>
            <input 
              type="text" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none font-mono" 
              placeholder="12345" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Link to Vendor ID</label>
            <input 
              type="text" 
              value={formData.vendorId} 
              onChange={e => setFormData({...formData, vendorId: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" 
              placeholder="V001" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button 
              onClick={() => onSave(formData as Customer)}
              className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Register Customer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const WarehousesView = ({ 
  warehouses, 
  onNewWarehouse, 
  onEditWarehouse, 
  onDeleteWarehouse 
}: { 
  warehouses: Warehouse[], 
  onNewWarehouse: () => void, 
  onEditWarehouse: (w: Warehouse) => void, 
  onDeleteWarehouse: (id: string) => void 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={onNewWarehouse} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-all">
            <Plus size={14} /> Add Warehouse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((w) => (
          <div key={w.id}>
            <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEditWarehouse(w)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
                <Settings size={14} />
              </button>
              <button onClick={() => onDeleteWarehouse(w.id)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-rose-600 hover:bg-rose-50 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900 shrink-0">
                <WarehouseIcon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight italic">{w.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {w.location}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-50 rounded-xl">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Area</p>
                <p className="text-sm font-black text-zinc-900 mt-1">{w.totalArea.toLocaleString()} <span className="text-[10px] font-normal">sq ft</span></p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Status</p>
                <Badge variant={w.status === 'Active' ? 'success' : 'error'} className="mt-1">{w.status}</Badge>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[8px] font-bold">
                  {w.manager?.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-900">{w.manager}</p>
                  <p className="text-[8px] text-zinc-500">{w.contactNumber}</p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-zinc-900 hover:underline">View Details</button>
            </div>
          </Card>
        </div>
      ))}
      </div>
    </div>
  );
};

const ReturnModal = ({ onClose, onSave, items, vendors, warehouses }: { onClose: () => void, onSave: (r: any) => void, items: ItemMaster[], vendors: VendorContract[], warehouses: Warehouse[] }) => {
  const [formData, setFormData] = useState({
    itemId: items[0]?.id || '',
    quantity: 0,
    reason: '',
    vendorId: vendors[0]?.vendorId || '',
    warehouse: warehouses[0]?.name || ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider italic">Return Damaged Product</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Item to Return</label>
            <select 
              value={formData.itemId} 
              onChange={e => setFormData({...formData, itemId: e.target.value})} 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
            >
              {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Quantity ({items.find(i => i.id === formData.itemId)?.unitType || 'Units'})</label>
              <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Warehouse</label>
              <select 
                value={formData.warehouse} 
                onChange={e => setFormData({...formData, warehouse: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
              >
                {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vendor</label>
            <select 
              value={formData.vendorId} 
              onChange={e => setFormData({...formData, vendorId: e.target.value})} 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"
            >
              {vendors.map(v => <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Reason for Return</label>
            <textarea 
              value={formData.reason} 
              onChange={e => setFormData({...formData, reason: e.target.value})} 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none h-24 resize-none"
              placeholder="Describe the damage..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button onClick={() => onSave(formData)} className="px-6 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors">Process Return</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const WarehouseModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: (w: Warehouse) => void, initialData?: Warehouse }) => {
  const [formData, setFormData] = useState<Warehouse>(initialData || {
    id: `WH${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    name: '',
    location: '',
    totalArea: 0,
    manager: '',
    contactNumber: '',
    status: 'Active'
  });

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200">
        <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight italic">
              {initialData ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Configure warehouse capacity and location details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-wider">Warehouse Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                placeholder="e.g. North Regional Hub"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-wider">Location Address</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                placeholder="Full address or landmark"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-wider">Total Area (sq ft)</label>
              <input 
                type="number" 
                value={formData.totalArea}
                onChange={e => setFormData({ ...formData, totalArea: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-wider">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-wider">Warehouse Manager</label>
              <input 
                type="text" 
                value={formData.manager}
                onChange={e => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                placeholder="Manager Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-wider">Contact Number</label>
              <input 
                type="text" 
                value={formData.contactNumber}
                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="px-8 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
          >
            {initialData ? 'Update Warehouse' : 'Create Warehouse'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SQLEditorView = () => {
  const [query, setQuery] = useState('SELECT * FROM items LIMIT 10;');
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(Array.isArray(data) ? data : [data]);
      } else {
        setError(data.error || 'Failed to execute query');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight italic">SQL Editor</h2>
          <p className="text-xs text-zinc-500 mt-1">Direct database access for advanced management</p>
        </div>
        <button 
          onClick={handleRunQuery}
          disabled={loading}
          className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {loading ? <Activity size={14} className="animate-spin" /> : <Database size={14} />}
          Run Query
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <textarea 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-48 p-6 font-mono text-sm bg-zinc-900 text-emerald-400 outline-none resize-none"
          placeholder="Enter SQL query here..."
        />
      </Card>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-medium">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {result && (
        <Card title="Query Result" subtitle={`${result.length || 0} rows returned`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  {result.length > 0 && typeof result[0] === 'object' && result[0] !== null && Object.keys(result[0]).map(key => (
                    <th key={key} className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-4 whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    {typeof row === 'object' && row !== null ? Object.values(row).map((val: any, j) => (
                      <td key={j} className="py-4 text-xs text-zinc-600 px-4 font-medium whitespace-nowrap">
                        {val === null ? <span className="text-zinc-300 italic">null</span> : String(val)}
                      </td>
                    )) : (
                      <td className="py-4 text-xs text-zinc-600 px-4 font-medium">
                        {String(row)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-zinc-400 text-sm">Query executed successfully but returned no data.</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

const LoginView = ({ onLogin, customers, inventory }: { onLogin: (user: User) => void, customers: Customer[], inventory: InventoryRecord[] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin') {
      onLogin({ id: 'admin', username: 'Admin', role: 'ADMIN' });
      return;
    }

    const customer = customers.find(c => c.username === username && c.password === password);
    if (customer) {
      if (customer.accessDeniedByAdmin) {
        setError('Access denied by administrator.');
        return;
      }

      // Check if stock is nill for this vendor
      const vendorStock = inventory.filter(i => i.vendorId === customer.vendorId).reduce((acc, curr) => acc + curr.quantity, 0);
      if (vendorStock <= 0) {
        setError('Access denied: Stock is currently nil. Please contact administrator.');
        return;
      }

      onLogin({ id: customer.id, username: customer.username, role: 'CUSTOMER', vendorId: customer.vendorId });
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-zinc-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white mb-4">
            <WarehouseIcon size={24} />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">Nexus WMS</h1>
          <p className="text-zinc-500 text-sm mt-1">Secure Portal Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              placeholder="Enter ID"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-xs font-bold">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Default Credentials</p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-zinc-500">
            <p><span className="font-bold text-zinc-900">Admin:</span> admin / admin</p>
            <p><span className="font-bold text-zinc-900">Customer:</span> customer / 12345</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CustomerPortal = ({ 
  user, 
  inventory, 
  inward, 
  outward, 
  invoices, 
  payments,
  contracts,
  items,
  onLogout,
  onImportData
}: { 
  user: User, 
  inventory: InventoryRecord[], 
  inward: InwardGoods[], 
  outward: OutwardGoods[], 
  invoices: Invoice[], 
  payments: Payment[],
  contracts: VendorContract[],
  items: ItemMaster[],
  onLogout: () => void,
  onImportData: (data: any) => void
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'billing' | 'reminders' | 'backup' | 'import' | 'reports'>('overview');

  const vendorInventory = inventory.filter(i => i.vendorId === user.vendorId);
  const vendorInward = inward.filter(i => i.vendorId === user.vendorId);
  const vendorOutward = outward.filter(o => o.vendorId === user.vendorId);
  const vendorInvoices = invoices.filter(i => i.vendorId === user.vendorId);
  const vendorPayments = payments.filter(p => p.vendorId === user.vendorId);
  const vendorContract = contracts.find(c => c.vendorId === user.vendorId);

  const totalStock = vendorInventory.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleBackup = () => {
    const data = {
      inventory: vendorInventory,
      inward: vendorInward,
      outward: vendorOutward,
      invoices: vendorInvoices,
      payments: vendorPayments,
      contract: vendorContract,
      timestamp: new Date().toISOString(),
      vendorId: user.vendorId
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_wms_backup_${user.vendorId}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.vendorId !== user.vendorId) {
          alert('Error: This backup file belongs to a different vendor.');
          return;
        }
        onImportData(data);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-zinc-900">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <WarehouseIcon size={20} />
          </div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic">Nexus WMS <span className="text-zinc-400 not-italic font-normal text-sm ml-2">Customer Portal</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-zinc-900">{user.username}</p>
            <p className="text-[10px] text-zinc-500 uppercase">Vendor ID: {user.vendorId}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-900 hover:text-white rounded-lg transition-all"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-zinc-200 px-8 flex gap-8">
        {[
          { id: 'overview', label: 'Movement Overview', icon: Activity },
          { id: 'stock', label: 'Stock Updates', icon: Package },
          { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
          { id: 'reminders', label: 'Reminders', icon: Bell },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'backup', label: 'Backup', icon: Database },
          { id: 'import', label: 'Import', icon: FileUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "py-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all",
              activeTab === tab.id ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-zinc-900 text-white border-none">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total On-Hand Stock</p>
                    <p className="text-4xl font-black">{totalStock.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-bold uppercase">Real-time update</span>
                    </div>
                  </Card>
                  <Card>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Recent Inward (30d)</p>
                    <p className="text-4xl font-black">{vendorInward.length}</p>
                    <p className="text-xs text-zinc-500 mt-1">Shipments received</p>
                  </Card>
                  <Card>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Recent Outward (30d)</p>
                    <p className="text-4xl font-black">{vendorOutward.length}</p>
                    <p className="text-xs text-zinc-500 mt-1">Orders dispatched</p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Inward Movement" subtitle="Latest goods received at warehouse">
                    <div className="space-y-4">
                      {vendorInward.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                          <div>
                            <p className="text-sm font-bold text-zinc-900">
                              {item.items?.[0]?.itemName || 'N/A'}
                              {item.items?.length > 1 && <span className="text-[10px] text-zinc-400 ml-1">+{item.items.length - 1} more</span>}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase">{item.dateTime}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-zinc-900">
                              +{item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                            </p>
                            <Badge variant="success">Stored</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card title="Outward Movement" subtitle="Latest goods dispatched from warehouse">
                    <div className="space-y-4">
                      {vendorOutward.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                          <div>
                            <p className="text-sm font-bold text-zinc-900">
                              {item.items?.[0]?.itemName || 'N/A'}
                              {item.items?.length > 1 && <span className="text-[10px] text-zinc-400 ml-1">+{item.items.length - 1} more</span>}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase">{item.dateTime}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-rose-600">
                              -{item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                            </p>
                            <Badge variant="info">Dispatched</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'stock' && (
              <Card title="Inventory Status" subtitle="Item-wise stock availability and aging">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item Name</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quantity</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Location</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Last Updated</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Aging</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {vendorInventory.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-4">
                            <p className="text-sm font-bold text-zinc-900">{inv.itemName}</p>
                            <p className="text-[10px] text-zinc-400 font-mono">{inv.itemId}</p>
                          </td>
                          <td className="py-4 text-sm font-black text-zinc-900">{inv.quantity}</td>
                          <td className="py-4 text-sm text-zinc-600">{inv.location}</td>
                          <td className="py-4 text-sm text-zinc-600">{inv.lastUpdated}</td>
                          <td className="py-4">
                            <Badge variant={inv.agingDays > 30 ? 'error' : inv.agingDays > 15 ? 'warning' : 'success'}>
                              {inv.agingDays} Days
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <Card title="Billing Summary" subtitle="Recent invoices and payment status">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-100">
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Invoice #</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {vendorInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="py-4 text-xs font-mono font-bold text-zinc-900">{inv.invoiceNumber}</td>
                            <td className="py-4 text-sm text-zinc-600">{inv.date}</td>
                            <td className="py-4 text-sm font-black text-zinc-900">₹{inv.totalAmount.toLocaleString()}</td>
                            <td className="py-4">
                              <Badge variant={inv.status === 'PAID' ? 'success' : 'error'}>{inv.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card title="Payment History" subtitle="Record of payments made to warehouse">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-100">
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Method</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {vendorPayments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="py-4 text-sm text-zinc-600">{pay.date}</td>
                            <td className="py-4 text-sm font-black text-zinc-900">₹{pay.amount.toLocaleString()}</td>
                            <td className="py-4 text-xs font-bold text-zinc-500 uppercase">{pay.method}</td>
                            <td className="py-4 text-xs font-mono text-zinc-400">{pay.reference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
            {activeTab === 'reminders' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-lg">
                          {user.username.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900">{user.username}</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Vendor Profile</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-zinc-100">
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin size={14} className="text-zinc-400" />
                          <span className="text-zinc-600">{vendorContract?.warehouseLocation || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <History size={14} className="text-zinc-400" />
                          <span className="text-zinc-600">Agreement: {vendorContract?.startDate || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CreditCard size={14} className="text-zinc-400" />
                          <span className="text-zinc-600">History: ₹{vendorPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="lg:col-span-2" title="Payment Reminders" action={
                    <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all">
                      <Bell size={14} />
                      View All Reminders
                    </button>
                  }>
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-rose-900">Pending Dues Detected</p>
                          <p className="text-xs text-rose-700">You have {vendorInvoices.filter(i => i.status !== 'PAID').length} unpaid invoices.</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        Pay Now
                      </button>
                    </div>
                  </Card>
                </div>

                <Card title="Payment Status Table">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200">
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Party Name</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Amount</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Balance</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Upcoming Reminder</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {vendorInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-zinc-900">{inv.vendorName}</td>
                            <td className="px-6 py-4 text-sm text-zinc-600">{inv.date}</td>
                            <td className="px-6 py-4 text-sm font-black text-zinc-900">₹{inv.totalAmount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-black text-rose-600">₹{(inv.totalAmount - inv.paidAmount).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              {inv.status !== 'PAID' ? (
                                <button className="text-zinc-900 hover:underline text-xs font-bold flex items-center gap-1">
                                  <Bell size={12} />
                                  Check Status
                                </button>
                              ) : (
                                <span className="text-zinc-400 text-xs italic">No reminders</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'reports' && (
              <ReportsView 
                inventory={vendorInventory} 
                inward={vendorInward} 
                outward={vendorOutward} 
                invoices={vendorInvoices} 
                utilization={MOCK_UTILIZATION.filter(u => u.warehouse === vendorContract?.warehouseLocation)}
                contracts={contracts.filter(c => c.vendorId === user.vendorId)}
              />
            )}

            {activeTab === 'backup' && (
              <Card className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 mb-6">
                  <Database size={32} />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight italic">Cloud Backup</h3>
                <p className="text-sm text-zinc-500 max-w-xs mt-2 mb-8">Securely download your entire warehouse data including inventory, billing, and movement history.</p>
                <button 
                  onClick={handleBackup}
                  className="px-8 py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
                >
                  <Download size={16} />
                  Download Backup (.json)
                </button>
              </Card>
            )}

            {activeTab === 'import' && (
              <Card className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 mb-6">
                  <FileUp size={32} />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight italic">Restore Data</h3>
                <p className="text-sm text-zinc-500 max-w-xs mt-2 mb-8">Upload a previously downloaded backup file to restore your records. This will merge with existing data.</p>
                
                <label className="px-8 py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200 cursor-pointer">
                  <Upload size={16} />
                  Select Backup File
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'contracts' | 'inventory' | 'inward' | 'outward' | 'reports' | 'invoices' | 'payments' | 'ledger' | 'settings' | 'reminders' | 'barcode' | 'warehouses' | 'sql'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pricing, setPricing] = useState<PricingConfig[]>(MOCK_PRICING);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);

  // Data State
  const [contracts, setContracts] = useState<VendorContract[]>(MOCK_CONTRACTS);
  const [items, setItems] = useState<ItemMaster[]>(MOCK_ITEMS);
  const [inwardRecords, setInwardRecords] = useState<InwardGoods[]>(MOCK_INWARD);
  const [outwardRecords, setOutwardRecords] = useState<OutwardGoods[]>(MOCK_OUTWARD);
  const [inventory, setInventory] = useState<InventoryRecord[]>(MOCK_INVENTORY);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [ledger, setLedger] = useState<LedgerEntry[]>(MOCK_LEDGER);

  // Modal States
  const [showContractModal, setShowContractModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showGateEntryModal, setShowGateEntryModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showStockAdjustmentModal, setShowStockAdjustmentModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  
  // Edit States
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [viewingEntity, setViewingEntity] = useState<any>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryRecord | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [itemsRes, inventoryRes, inwardRes, outwardRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/inventory'),
          fetch('/api/inward'),
          fetch('/api/outward')
        ]);

        if (itemsRes.ok) {
          const data = await itemsRes.json();
          const mappedItems = data.map((item: any) => ({
            id: item.id.toString(),
            vendorId: item.vendor_id?.toString(),
            name: item.name,
            sku: item.sku,
            category: item.category_name,
            unitType: item.unit_type,
            quantity: item.quantity,
            minStock: item.min_stock_level,
            location: item.location_name,
            price: item.price,
            modelNumber: item.model_number,
            shortDescription: item.short_description,
            mfgDate: item.mfg_date,
            expiryDate: item.expiry_date
          }));
          setItems(mappedItems);
        }

        if (inventoryRes.ok) {
          const data = await inventoryRes.json();
          const mappedInventory = data.map((inv: any) => ({
            itemId: inv.item_id.toString(),
            itemName: inv.item_name,
            vendorId: inv.vendor_id?.toString(),
            vendorName: inv.vendor_name,
            quantity: inv.quantity,
            damagedQuantity: inv.damaged_quantity,
            expiredQuantity: inv.expired_quantity,
            missingQuantity: inv.missing_quantity,
            location: inv.location_name,
            warehouse: inv.warehouse_name,
            agingDays: inv.aging_days || 0,
            lastUpdated: inv.updated_at
          }));
          setInventory(mappedInventory);
        }

        if (inwardRes.ok) {
          const data = await inwardRes.json();
          setInwardRecords(data);
        }

        if (outwardRes.ok) {
          const data = await outwardRes.json();
          setOutwardRecords(data);
        }
      } catch (err) {
        console.error("Database fetch failed, falling back to mock data:", err);
      }
    };
    fetchInitialData();
  }, []);

  const handleDelete = (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    switch(type) {
      case 'contract': setContracts(prev => prev.filter(c => c.id !== id)); break;
      case 'item': setItems(prev => prev.filter(i => i.id !== id)); break;
      case 'inward': setInwardRecords(prev => prev.filter(r => r.grnNo !== id)); break;
      case 'outward': setOutwardRecords(prev => prev.filter(r => r.dispatchOrderId !== id)); break;
      case 'invoice': setInvoices(prev => prev.filter(i => i.id !== id)); break;
      case 'warehouse': setWarehouses(prev => prev.filter(w => w.id !== id)); break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    alert("PDF Exporting... (In a real app, this would use jspdf or a server-side generator)");
    window.print();
  };

  const handleImportData = (data: any) => {
    if (data.inventory) {
      setInventory(prev => {
        const otherVendors = prev.filter(i => i.vendorId !== data.vendorId);
        return [...otherVendors, ...data.inventory];
      });
    }
    if (data.inward) {
      setInwardRecords(prev => {
        const otherVendors = prev.filter(i => i.vendorId !== data.vendorId);
        return [...otherVendors, ...data.inward];
      });
    }
    if (data.outward) {
      setOutwardRecords(prev => {
        const existingIds = new Set(data.outward.map((o: any) => o.dispatchOrderId));
        const otherRecords = prev.filter(o => !existingIds.has(o.dispatchOrderId));
        return [...otherRecords, ...data.outward];
      });
    }
    if (data.invoices) {
      setInvoices(prev => {
        const otherVendors = prev.filter(i => i.vendorId !== data.vendorId);
        return [...otherVendors, ...data.invoices];
      });
    }
    if (data.payments) {
      setPayments(prev => {
        const otherVendors = prev.filter(p => p.vendorId !== data.vendorId);
        return [...otherVendors, ...data.payments];
      });
    }
  };

  const handleStockAdjustment = async (type: 'DAMAGED' | 'EXPIRED' | 'MISSING' | 'RETURN', quantity: number) => {
    if (!selectedInventoryItem) return;

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: selectedInventoryItem.itemId,
          type,
          quantity,
          vendorId: selectedInventoryItem.vendorId,
          warehouse: selectedInventoryItem.warehouse,
          location: selectedInventoryItem.location
        })
      });

      if (response.ok) {
        // Refresh inventory data
        const invRes = await fetch('/api/inventory');
        if (invRes.ok) {
          const data = await invRes.json();
          const mappedInventory = data.map((inv: any) => ({
            itemId: inv.item_id.toString(),
            itemName: inv.item_name,
            vendorId: inv.vendor_id?.toString(),
            vendorName: inv.vendor_name,
            quantity: inv.quantity,
            damagedQuantity: inv.damaged_quantity,
            expiredQuantity: inv.expired_quantity,
            missingQuantity: inv.missing_quantity,
            location: inv.location_name,
            warehouse: inv.warehouse_name,
            agingDays: inv.aging_days || 0,
            lastUpdated: inv.updated_at
          }));
          setInventory(mappedInventory);
        }
        setShowStockAdjustmentModal(false);
        setSelectedInventoryItem(null);
      } else {
        const err = await response.json();
        alert(err.error || "Failed to adjust stock");
      }
    } catch (err) {
      console.error("Stock adjustment failed:", err);
      alert("An error occurred while adjusting stock");
    }
  };

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': return <DashboardView contracts={contracts} inventory={inventory} inward={inwardRecords} outward={outwardRecords} />;
      case 'contracts': return (
        <ContractsView 
          contracts={contracts} 
          onNew={() => { setEditingEntity(null); setShowContractModal(true); }}
          onEdit={(c) => { setEditingEntity(c); setShowContractModal(true); }}
          onDelete={(id) => handleDelete('contract', id)}
          onView={(c) => setViewingEntity(c)}
          onPrint={handlePrint}
          onExportExcel={() => handleExportExcel(contracts, 'contracts')}
          onExportPDF={handleExportPDF}
        />
      );
      case 'inventory': return (
        <InventoryView 
          inventory={inventory}
          items={items}
          onNewItem={() => { setEditingEntity(null); setShowItemModal(true); }}
          onEditItem={(i) => { setEditingEntity(i); setShowItemModal(true); }}
          onDeleteItem={(id) => handleDelete('item', id)}
          onViewItem={(i) => setViewingEntity(i)}
          onPrint={handlePrint}
          onExportExcel={() => handleExportExcel(items, 'inventory')}
          onExportPDF={handleExportPDF}
          onStockAdjustment={(item) => {
            setSelectedInventoryItem(item);
            setShowStockAdjustmentModal(true);
          }}
        />
      );
      case 'inward': return (
        <InwardView 
          records={inwardRecords}
          onNewGRN={() => { setEditingEntity(null); setShowGRNModal(true); }}
          onVendorDelivery={() => setShowDeliveryModal(true)}
          onGateEntry={() => setShowGateEntryModal(true)}
          onStorageAllocation={() => setShowStorageModal(true)}
          onEdit={(r) => { setEditingEntity(r); setShowGRNModal(true); }}
          onDelete={(id) => handleDelete('inward', id)}
          onView={(r) => setViewingEntity(r)}
          onPrint={handlePrint}
          onExportExcel={() => handleExportExcel(inwardRecords, 'inward_records')}
          onExportPDF={handleExportPDF}
          onUpdateStatus={async (id, status) => {
            try {
              const response = await fetch(`/api/inward/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
              });
              if (response.ok) {
                setInwardRecords(prev => prev.map(r => r.grnNo === id ? { ...r, status } : r));
              }
            } catch (err) {
              console.error("Update status failed:", err);
            }
          }}
          onProcessReturn={() => setShowReturnModal(true)}
        />
      );
      case 'outward': return (
        <OutwardView 
          records={outwardRecords}
          onNewDispatch={() => { setEditingEntity(null); setShowDispatchModal(true); }}
          onEdit={(r) => { setEditingEntity(r); setShowDispatchModal(true); }}
          onDelete={(id) => handleDelete('outward', id)}
          onView={(r) => setViewingEntity(r)}
          onPrint={handlePrint}
          onExportExcel={() => handleExportExcel(outwardRecords, 'outward_records')}
          onExportPDF={handleExportPDF}
        />
      );
      case 'reports': return (
        <ReportsView 
          inventory={inventory} 
          inward={inwardRecords} 
          outward={outwardRecords} 
          invoices={invoices} 
          utilization={MOCK_UTILIZATION}
          contracts={contracts}
        />
      );
      case 'reminders': return <RemindersView invoices={invoices} contracts={contracts} onSendReminder={(id) => {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, lastReminderSent: new Date().toISOString() } : inv));
      }} />;
      case 'barcode': return <BarcodeView items={items} />;
      case 'invoices': return <InvoicesView onOpenCreate={() => setShowInvoiceModal(true)} invoices={invoices} />;
      case 'payments': return <PaymentsView onOpenRecord={() => setShowPaymentModal(true)} payments={payments} />;
      case 'ledger': return <LedgerView ledger={ledger} />;
      case 'warehouses': return (
        <WarehousesView 
          warehouses={warehouses}
          onNewWarehouse={() => { setEditingEntity(null); setShowWarehouseModal(true); }}
          onEditWarehouse={(w) => { setEditingEntity(w); setShowWarehouseModal(true); }}
          onDeleteWarehouse={(id) => handleDelete('warehouse', id)}
        />
      );
      case 'settings': return (
        <SettingsView 
          pricing={pricing} 
          onUpdatePricing={setPricing} 
          customers={customers}
          onAddCustomer={(c) => setCustomers([...customers, c])}
          onToggleCustomerAccess={(id) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, accessDeniedByAdmin: !c.accessDeniedByAdmin } : c))}
          onDeleteCustomer={(id) => setCustomers(prev => prev.filter(c => c.id !== id))}
        />
      );
      default: return <DashboardView contracts={contracts} inventory={inventory} inward={inwardRecords} outward={outwardRecords} />;
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} customers={customers} inventory={inventory} />;
  }

  if (currentUser.role === 'CUSTOMER') {
    return (
      <CustomerPortal 
        user={currentUser} 
        inventory={inventory} 
        inward={inwardRecords} 
        outward={outwardRecords} 
        invoices={invoices} 
        payments={payments}
        contracts={contracts}
        items={items}
        onLogout={() => setCurrentUser(null)}
        onImportData={handleImportData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-zinc-200 flex flex-col sticky top-0 h-screen z-40"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shrink-0">
            <WarehouseIcon size={20} />
          </div>
          {isSidebarOpen && <h1 className="text-lg font-black tracking-tighter uppercase italic">Nexus WMS</h1>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={WarehouseIcon} label="Warehouse Mgmt" active={activeView === 'warehouses'} onClick={() => setActiveView('warehouses')} />
          <SidebarItem icon={Users} label="Vendor Contracts" active={activeView === 'contracts'} onClick={() => setActiveView('contracts')} />
          <SidebarItem icon={Package} label="Inventory Mgmt" active={activeView === 'inventory'} onClick={() => setActiveView('inventory')} />
          <SidebarItem icon={ArrowDownCircle} label="Inward Goods" active={activeView === 'inward'} onClick={() => setActiveView('inward')} />
          <SidebarItem icon={ArrowUpCircle} label="Outward Goods" active={activeView === 'outward'} onClick={() => setActiveView('outward')} />
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Billing & Finance</p>
          </div>
          <SidebarItem icon={FileText} label="Invoices" active={activeView === 'invoices'} onClick={() => setActiveView('invoices')} />
          <SidebarItem icon={CreditCard} label="Payments" active={activeView === 'payments'} onClick={() => setActiveView('payments')} />
          <SidebarItem icon={History} label="Vendor Ledger" active={activeView === 'ledger'} onClick={() => setActiveView('ledger')} />
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Analytics</p>
          </div>
          <SidebarItem icon={BarChart3} label="Reports" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
          <SidebarItem icon={Bell} label="Payment Reminders" active={activeView === 'reminders'} onClick={() => setActiveView('reminders')} />
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Utilities</p>
          </div>
          <SidebarItem icon={Barcode} label="Generate Barcode" active={activeView === 'barcode'} onClick={() => setActiveView('barcode')} />
          <SidebarItem icon={Database} label="Backup/Restore" active={false} onClick={() => alert('Backup/Restore feature coming soon')} />
          <SidebarItem icon={FileUp} label="Import Items" active={false} onClick={() => alert('Import feature coming soon')} />

          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System</p>
          </div>
          <SidebarItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          
          <div className="mt-auto pt-4 border-t border-zinc-100">
            <button 
              onClick={() => setCurrentUser(null)}
              className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors flex justify-center"
          >
            <ChevronRight className={cn("transition-transform", isSidebarOpen && "rotate-180")} size={20} />
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search inventory, vendors, or orders..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-bold">NA</div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold">Neha Angel</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight italic serif">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                {activeView === 'dashboard' && "Welcome back. Here's what's happening in your warehouse today."}
                {activeView === 'contracts' && "Manage vendor relationships and space lease agreements."}
                {activeView === 'inventory' && "Track stock levels, aging, and item master data."}
                {activeView === 'inward' && "Process incoming shipments and generate GRNs."}
                {activeView === 'outward' && "Manage dispatch orders and outward logistics."}
                {activeView === 'reports' && "Generate comprehensive reports for operational insights."}
                {activeView === 'invoices' && "Manage vendor billing and space rental invoices."}
                {activeView === 'payments' && "Record and track vendor payments."}
                {activeView === 'ledger' && "Detailed transaction history for vendors."}
                {activeView === 'settings' && "Configure warehouse rental rates and system parameters."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border border-zinc-200 rounded-lg flex items-center gap-2 text-xs font-bold text-zinc-600">
                <Clock size={14} />
                {format(new Date(), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {showInvoiceModal && <CreateInvoiceModal onClose={() => setShowInvoiceModal(false)} />}
        {showPaymentModal && <RecordPaymentModal onClose={() => setShowPaymentModal(false)} />}
        
        {showContractModal && (
          <ContractModal 
            onClose={() => setShowContractModal(false)} 
            onSave={(contract) => {
              if (editingEntity) {
                setContracts(prev => prev.map(c => c.id === contract.id ? contract : c));
              } else {
                setContracts(prev => [...prev, contract]);
              }
              setShowContractModal(false);
            }}
            initialData={editingEntity}
            warehouses={warehouses}
          />
        )}

        {showItemModal && (
          <ItemModal 
            onClose={() => setShowItemModal(false)} 
            onSave={async (item) => {
              try {
                const response = await fetch('/api/items', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(item)
                });
                if (response.ok) {
                  // Refresh items
                  const itemsRes = await fetch('/api/items');
                  if (itemsRes.ok) {
                    const data = await itemsRes.json();
                    const mappedItems = data.map((i: any) => ({
                      id: i.id.toString(),
                      vendorId: i.vendor_id?.toString(),
                      name: i.name,
                      sku: i.sku,
                      category: i.category_name,
                      unitType: i.unit_type,
                      quantity: i.quantity,
                      minStock: i.min_stock_level,
                      location: i.location_name,
                      price: i.price,
                      modelNumber: i.model_number,
                      shortDescription: i.short_description,
                      mfgDate: i.mfg_date,
                      expiryDate: i.expiry_date
                    }));
                    setItems(mappedItems);
                  }
                  setShowItemModal(false);
                } else {
                  alert("Failed to save item");
                }
              } catch (err) {
                console.error("Save item failed:", err);
                alert("An error occurred while saving the item");
              }
            }}
            initialData={editingEntity}
          />
        )}

        {showStockAdjustmentModal && selectedInventoryItem && (
          <StockAdjustmentModal 
            onClose={() => {
              setShowStockAdjustmentModal(false);
              setSelectedInventoryItem(null);
            }}
            onSave={handleStockAdjustment}
            item={selectedInventoryItem}
          />
        )}

        {showGRNModal && (
          <GRNModal 
            onClose={() => setShowGRNModal(false)} 
            onSave={async (record) => {
              try {
                const response = await fetch('/api/inward', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(record)
                });
                if (response.ok) {
                  // Refresh data
                  const [inwardRes, invRes] = await Promise.all([
                    fetch('/api/inward'),
                    fetch('/api/inventory')
                  ]);
                  if (inwardRes.ok) setInwardRecords(await inwardRes.json());
                  if (invRes.ok) setInventory(await invRes.json());
                  setShowGRNModal(false);
                } else {
                  const err = await response.json();
                  alert(err.error || "Failed to save GRN");
                }
              } catch (err) {
                console.error("Save GRN failed:", err);
                alert("An error occurred while saving the GRN");
              }
            }}
            initialData={editingEntity}
            items={items}
            vendors={contracts}
            warehouses={warehouses}
          />
        )}

        {showDispatchModal && (
          <DispatchModal 
            onClose={() => setShowDispatchModal(false)} 
            onSave={async (record) => {
              try {
                const response = await fetch('/api/outward', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(record)
                });
                if (response.ok) {
                  // Refresh data
                  const [outwardRes, invRes] = await Promise.all([
                    fetch('/api/outward'),
                    fetch('/api/inventory')
                  ]);
                  if (outwardRes.ok) setOutwardRecords(await outwardRes.json());
                  if (invRes.ok) setInventory(await invRes.json());
                  setShowDispatchModal(false);
                } else {
                  const err = await response.json();
                  alert(err.error || "Failed to create dispatch");
                }
              } catch (err) {
                console.error("Dispatch failed:", err);
                alert("An error occurred during dispatch");
              }
            }}
            initialData={editingEntity}
            items={items}
            vendors={contracts}
          />
        )}

        {showReturnModal && (
          <ReturnModal 
            onClose={() => setShowReturnModal(false)}
            onSave={async (record) => {
              try {
                const response = await fetch('/api/returns', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(record)
                });
                if (response.ok) {
                  // Refresh data
                  const [invRes, itemsRes] = await Promise.all([
                    fetch('/api/inventory'),
                    fetch('/api/items')
                  ]);
                  if (invRes.ok) setInventory(await invRes.json());
                  if (itemsRes.ok) {
                    const data = await itemsRes.json();
                    const mappedItems = data.map((i: any) => ({
                      id: i.id.toString(),
                      vendorId: i.vendor_id?.toString(),
                      name: i.name,
                      sku: i.sku,
                      category: i.category_name,
                      unitType: i.unit_type,
                      quantity: i.quantity,
                      minStock: i.min_stock_level,
                      location: i.location_name,
                      price: i.price,
                      modelNumber: i.model_number,
                      shortDescription: i.short_description,
                      mfgDate: i.mfg_date,
                      expiryDate: i.expiry_date
                    }));
                    setItems(mappedItems);
                  }
                  setShowReturnModal(false);
                  alert("Return processed successfully");
                } else {
                  const err = await response.json();
                  alert(err.error || "Failed to process return");
                }
              } catch (err) {
                console.error("Return failed:", err);
                alert("An error occurred while processing return");
              }
            }}
            items={items}
            vendors={contracts}
            warehouses={warehouses}
          />
        )}

        {showDeliveryModal && <DeliveryModal onClose={() => setShowDeliveryModal(false)} />}
        {showGateEntryModal && <GateEntryModal onClose={() => setShowGateEntryModal(false)} />}
        {showStorageModal && <StorageModal onClose={() => setShowStorageModal(false)} />}
        {showWarehouseModal && (
          <WarehouseModal 
            onClose={() => setShowWarehouseModal(false)} 
            onSave={(w) => {
              if (editingEntity) {
                setWarehouses(prev => prev.map(item => item.id === w.id ? w : item));
              } else {
                setWarehouses(prev => [...prev, w]);
              }
              setShowWarehouseModal(false);
            }}
            initialData={editingEntity}
          />
        )}

        {viewingEntity && (
          <ViewModal entity={viewingEntity} onClose={() => setViewingEntity(null)} />
        )}
      </main>
    </div>
  );
}
