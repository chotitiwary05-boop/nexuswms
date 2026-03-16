export type ContractType = 'Monthly' | 'Weekly' | 'Daily' | 'Pay-as-used';
export type UnitType = 'Piece' | 'Carton' | 'Pallet' | 'Weight' | 'Volume' | 'Quantity';
export type PaymentCycle = 'Monthly' | 'Weekly' | 'Daily' | 'Prepaid';

export interface VendorContract {
  id: string;
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  warehouseLocation: string;
  allocatedSpace: number; // in sq ft
  ratePlan: string;
  securityDeposit: number;
  paymentCycle: PaymentCycle;
  contractType: ContractType;
}

export interface ItemMaster {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitType: UnitType;
  weight: number; // kg
  volume: number; // m3
  price?: number;
  quantity?: number;
  modelNumber?: string;
  shortDescription?: string;
  mfgDate?: string;
  expiryDate?: string;
}

export interface InwardItem {
  itemId: string;
  itemName: string;
  modelNumber?: string;
  shortDescription?: string;
  quantity: number;
  rackId?: string;
  shelfId?: string;
  weight: number;
  volume: number;
  storageLocation: string;
}

export interface InwardGoods {
  grnNo: string;
  vendorId: string;
  vendorName: string;
  items: InwardItem[];
  warehouse: string;
  dateTime: string;
  status: 'Gate Entry' | 'GRN' | 'Quality Check' | 'Stored';
  lrNumber?: string;
  courierName?: string;
  courierDetails?: string;
  trackingNumber?: string;
  thirdPartyCourier?: string;
  thirdPartyTracking?: string;
}

export interface OutwardItem {
  itemId: string;
  itemName: string;
  modelNumber?: string;
  shortDescription?: string;
  quantity: number;
  weight: number;
}

export interface OutwardGoods {
  dispatchOrderId: string;
  vendorId: string;
  vendorName: string;
  items: OutwardItem[];
  destination: string;
  vehicleDetails: string;
  dateTime: string;
  status: 'Requested' | 'Approved' | 'Picking' | 'Packing' | 'Gate Pass' | 'Dispatched';
  lrNumber?: string;
  courierName?: string;
  courierDetails?: string;
  trackingNumber?: string;
  thirdPartyCourier?: string;
  thirdPartyTracking?: string;
}

export interface InventoryRecord {
  itemId: string;
  itemName: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  damagedQuantity?: number;
  expiredQuantity?: number;
  missingQuantity?: number;
  location: string;
  warehouse: string;
  lastUpdated: string;
  agingDays: number;
}

export interface WarehouseUtilization {
  warehouse: string;
  totalArea: number;
  usedArea: number;
  freeArea: number;
  vendorAllocations: { vendorName: string; allocatedSpace: number }[];
}

export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  taxId?: string;
  taxRate?: number;
  taxAmount?: number;
  type: 'SPACE_RENTAL' | 'HANDLING' | 'INWARD' | 'OUTWARD' | 'STORAGE' | 'ADDITIONAL';
}

export interface Invoice {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  totalTaxAmount?: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  items?: InvoiceItem[];
  lastReminderSent?: string;
}

export interface Payment {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  date: string;
  method: 'CASH' | 'BANK' | 'UPI' | 'CHEQUE' | 'OTHER';
  type: 'FULL' | 'PARTIAL' | 'ADVANCE';
  reference?: string;
}

export interface LedgerEntry {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface PricingConfig {
  id: string;
  key: string;
  value: number;
  unit: string;
  description: string;
}

export interface Customer {
  id: string;
  username: string;
  password: string;
  vendorId: string; // Linked to a vendor to see their specific data
  isActive: boolean;
  accessDeniedByAdmin: boolean;
}

export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  vendorId?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  totalArea: number;
  manager?: string;
  contactNumber?: string;
  status: 'Active' | 'Inactive';
}

export interface Rack {
  id: string;
  branch_id?: string;
  name: string;
  description?: string;
}

export interface Shelf {
  id: string;
  rack_id: string;
  rack_name?: string;
  name: string;
  capacity?: number;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  description?: string;
}
