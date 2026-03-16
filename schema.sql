-- Core Infrastructure
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  total_area REAL,
  capacity_pallets INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('DRY', 'COLD', 'HAZARDOUS')),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_id INTEGER,
  name TEXT NOT NULL, -- e.g. R1-S2-B3
  type TEXT CHECK(type IN ('RACK', 'FLOOR')),
  total_capacity REAL,
  occupied_capacity REAL DEFAULT 0,
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- Vendor & Contract Management
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  gst_number TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  branch_id INTEGER,
  start_date DATE,
  end_date DATE,
  billing_cycle TEXT CHECK(billing_cycle IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  rate_per_sqft REAL,
  security_deposit REAL,
  status TEXT DEFAULT 'ACTIVE',
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Inventory
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  model_number TEXT,
  category_id INTEGER,
  unit_type TEXT, -- Piece, Carton, Pallet
  weight REAL,
  volume REAL,
  quantity INTEGER DEFAULT 0,
  damaged_quantity INTEGER DEFAULT 0,
  expired_quantity INTEGER DEFAULT 0,
  missing_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  location_id INTEGER,
  price REAL,
  gst_rate REAL DEFAULT 18.0,
  mfg_date DATE,
  expiry_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('IN', 'OUT', 'INTERNAL', 'DAMAGED', 'EXPIRED', 'MISSING', 'RETURN')) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL,
  gst_amount REAL,
  total_amount REAL,
  reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Billing & Accounting
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  invoice_number TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount REAL DEFAULT 0,
  paid_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'UNPAID' CHECK(status IN ('UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT CHECK(type IN ('SPACE_RENTAL', 'HANDLING', 'INWARD', 'OUTWARD', 'STORAGE', 'ADDITIONAL')),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  invoice_id INTEGER,
  amount REAL NOT NULL,
  date DATE NOT NULL,
  method TEXT CHECK(method IN ('CASH', 'BANK', 'UPI', 'CHEQUE', 'OTHER')),
  type TEXT CHECK(type IN ('FULL', 'PARTIAL', 'ADVANCE')),
  reference TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  date DATE NOT NULL,
  description TEXT,
  reference TEXT,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  gst_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS racks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS shelves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rack_id INTEGER,
  name TEXT NOT NULL,
  capacity REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rack_id) REFERENCES racks(id)
);

CREATE TABLE IF NOT EXISTS taxes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rate REAL NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inward_goods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grn_no TEXT UNIQUE NOT NULL,
  vendor_id INTEGER NOT NULL,
  warehouse TEXT NOT NULL,
  date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'GRN',
  lr_number TEXT,
  courier_name TEXT,
  courier_details TEXT,
  tracking_number TEXT,
  third_party_courier TEXT,
  third_party_tracking TEXT,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS inward_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inward_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  weight REAL,
  volume REAL,
  rack_id INTEGER,
  shelf_id INTEGER,
  storage_location TEXT,
  FOREIGN KEY (inward_id) REFERENCES inward_goods(id),
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (rack_id) REFERENCES racks(id),
  FOREIGN KEY (shelf_id) REFERENCES shelves(id)
);

CREATE TABLE IF NOT EXISTS outward_goods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dispatch_order_id TEXT UNIQUE NOT NULL,
  vendor_id INTEGER NOT NULL,
  destination TEXT,
  vehicle_details TEXT,
  date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'Requested',
  lr_number TEXT,
  courier_name TEXT,
  courier_details TEXT,
  tracking_number TEXT,
  third_party_courier TEXT,
  third_party_tracking TEXT,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS outward_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  outward_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  weight REAL,
  FOREIGN KEY (outward_id) REFERENCES outward_goods(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);
