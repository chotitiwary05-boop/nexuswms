import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("wms.db");

// Initialize Database Schema
db.exec(`
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
    storage_location TEXT,
    FOREIGN KEY (inward_id) REFERENCES inward_goods(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
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
`);

// Seed initial data if empty
const branchCount = db.prepare("SELECT COUNT(*) as count FROM branches").get() as { count: number };
if (branchCount.count === 0) {
  // Branches
  const b1 = db.prepare("INSERT INTO branches (name, address, total_area, capacity_pallets) VALUES (?, ?, ?, ?)").run("Main Hub - Mumbai", "Sector 5, Navi Mumbai", 50000, 2000).lastInsertRowid;
  const b2 = db.prepare("INSERT INTO branches (name, address, total_area, capacity_pallets) VALUES (?, ?, ?, ?)").run("North Hub - Delhi", "Okhla Phase 3, Delhi", 30000, 1200).lastInsertRowid;

  // Zones & Locations
  const z1 = db.prepare("INSERT INTO zones (branch_id, name, type) VALUES (?, ?, ?)").run(b1, "Zone A - Dry", "DRY").lastInsertRowid;
  db.prepare("INSERT INTO locations (zone_id, name, type, total_capacity) VALUES (?, ?, ?, ?)").run(z1, "A1-R1-S1", "RACK", 100);
  db.prepare("INSERT INTO locations (zone_id, name, type, total_capacity) VALUES (?, ?, ?, ?)").run(z1, "A1-FL-01", "FLOOR", 500);

  // Vendors
  const v1 = db.prepare("INSERT INTO vendors (name, company_name, email, gst_number) VALUES (?, ?, ?, ?)").run("Reliance Retail", "Reliance Retail Ltd", "logistics@reliance.com", "27AAAAA0000A1Z5").lastInsertRowid;
  
  // Contracts
  db.prepare("INSERT INTO contracts (vendor_id, branch_id, start_date, end_date, billing_cycle, rate_per_sqft) VALUES (?, ?, ?, ?, ?, ?)").run(v1, b1, "2024-01-01", "2025-01-01", "MONTHLY", 45.50);

  // Categories
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Electronics");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("FMCG");

  // Items
  db.prepare(`
    INSERT INTO items (vendor_id, name, sku, category_id, unit_type, quantity, location_id, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(v1, "iPhone 15 Pro", "IPH15P-128", 1, "Piece", 500, 1, 1200.00);
}

// Seed pricing config if empty
const pricingCount = db.prepare("SELECT COUNT(*) as count FROM pricing_config").get() as { count: number };
if (pricingCount.count === 0) {
  const insertPricing = db.prepare("INSERT INTO pricing_config (key, value, unit, description) VALUES (?, ?, ?, ?)");
  insertPricing.run("area_rate", 15, "sq ft / month", "Area Based Rental Rate");
  insertPricing.run("volume_rate", 100, "cubic meter / month", "Volume Based Rental Rate");
  insertPricing.run("pallet_rate", 50, "pallet / day", "Pallet Based Rental Rate");
  insertPricing.run("rack_rate", 75, "rack / month", "Rack Based Rental Rate");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API Routes
  
  // Health Check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Dashboard Stats (Enterprise)
  app.get("/api/stats", (req, res) => {
    try {
      const totalBranches = db.prepare("SELECT COUNT(*) as count FROM branches").get() as any;
      const totalVendors = db.prepare("SELECT COUNT(*) as count FROM vendors").get() as any;
      const totalInventory = db.prepare("SELECT SUM(quantity) as count FROM items").get() as any;
      const monthlyRevenue = db.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE created_at >= date('now', 'start of month')").get() as any;
      
      const branchUtilization = db.prepare(`
        SELECT b.name, 
               (SELECT SUM(occupied_capacity) FROM locations l JOIN zones z ON l.zone_id = z.id WHERE z.branch_id = b.id) as occupied,
               (SELECT SUM(total_capacity) FROM locations l JOIN zones z ON l.zone_id = z.id WHERE z.branch_id = b.id) as total
        FROM branches b
      `).all();

      const recentTransactions = db.prepare(`
        SELECT t.*, i.name as item_name, v.name as vendor_name
        FROM transactions t 
        JOIN items i ON t.item_id = i.id 
        JOIN vendors v ON i.vendor_id = v.id
        ORDER BY t.created_at DESC LIMIT 10
      `).all();

      res.json({
        totalBranches: totalBranches.count,
        totalVendors: totalVendors.count,
        totalInventory: totalInventory.count || 0,
        monthlyRevenue: monthlyRevenue.total || 0,
        branchUtilization,
        recentTransactions
      });
    } catch (error) {
      console.error("Error in /api/stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Branches
  app.get("/api/branches", (req, res) => {
    res.json(db.prepare("SELECT * FROM branches").all());
  });

  // Vendors
  app.get("/api/vendors", (req, res) => {
    res.json(db.prepare("SELECT * FROM vendors").all());
  });

  // Inventory
  app.get("/api/items", (req, res) => {
    try {
      const items = db.prepare(`
        SELECT i.*, v.name as vendor_name, c.name as category_name, l.name as location_name, b.name as branch_name
        FROM items i
        JOIN vendors v ON i.vendor_id = v.id
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN locations l ON i.location_id = l.id
        LEFT JOIN zones z ON l.zone_id = z.id
        LEFT JOIN branches b ON z.branch_id = b.id
        ORDER BY i.updated_at DESC
      `).all();
      res.json(items);
    } catch (error) {
      console.error("Error in /api/items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/inventory", (req, res) => {
    try {
      const items = db.prepare(`
        SELECT i.*, i.id as item_id, i.name as item_name, v.name as vendor_name, c.name as category_name, l.name as location_name, b.name as branch_name, b.name as warehouse_name
        FROM items i
        JOIN vendors v ON i.vendor_id = v.id
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN locations l ON i.location_id = l.id
        LEFT JOIN zones z ON l.zone_id = z.id
        LEFT JOIN branches b ON z.branch_id = b.id
        ORDER BY i.updated_at DESC
      `).all();
      res.json(items);
    } catch (error) {
      console.error("Error in /api/inventory:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/items", (req, res) => {
    const { 
      vendorId, vendor_id, 
      name, 
      sku, 
      categoryId, category_id, 
      unitType, unit_type, 
      weight, 
      volume, 
      quantity, 
      minStock, min_stock_level, 
      locationId, location_id, 
      price, 
      gstRate, gst_rate, 
      modelNumber, model_number, 
      shortDescription, short_description, 
      mfgDate, mfg_date, 
      expiryDate, expiry_date 
    } = req.body;
    
    const v_id = vendorId || vendor_id;
    const c_id = categoryId || category_id;
    const u_type = unitType || unit_type;
    const m_stock = minStock || min_stock_level;
    const l_id = locationId || location_id;
    const g_rate = gstRate || gst_rate;
    const m_number = modelNumber || model_number;
    const s_desc = shortDescription || short_description;
    const m_date = mfgDate || mfg_date;
    const e_date = expiryDate || expiry_date;

    try {
      const info = db.prepare(`
        INSERT INTO items (vendor_id, name, sku, category_id, unit_type, weight, volume, quantity, min_stock_level, location_id, price, gst_rate, model_number, short_description, mfg_date, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(v_id, name, sku, c_id, u_type, weight, volume, quantity, m_stock, l_id, price, g_rate, m_number, s_desc, m_date, e_date);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Billing
  app.get("/api/invoices", (req, res) => {
    const invoices = db.prepare(`
      SELECT inv.*, v.name as vendor_name 
      FROM invoices inv 
      JOIN vendors v ON inv.vendor_id = v.id
      ORDER BY inv.date DESC
    `).all() as any[];
    
    // Attach items to each invoice
    const invoicesWithItems = invoices.map(inv => {
      const items = db.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").all(inv.id);
      return { ...inv, items };
    });
    
    res.json(invoicesWithItems);
  });

  app.get("/api/invoices/:id", (req, res) => {
    const invoice = db.prepare(`
      SELECT inv.*, v.name as vendor_name, v.company_name as vendor_company, v.address as vendor_address, v.gst_number as vendor_gst
      FROM invoices inv 
      JOIN vendors v ON inv.vendor_id = v.id
      WHERE inv.id = ?
    `).get(req.params.id) as any;
    
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    
    const items = db.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").all(invoice.id);
    res.json({ ...invoice, items });
  });

  app.post("/api/invoices", (req, res) => {
    const { vendor_id, invoice_number, date, due_date, notes, items } = req.body;
    
    const dbTransaction = db.transaction(() => {
      const total_amount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
      
      const info = db.prepare(`
        INSERT INTO invoices (vendor_id, invoice_number, date, due_date, total_amount, status, notes)
        VALUES (?, ?, ?, ?, ?, 'UNPAID', ?)
      `).run(vendor_id, invoice_number, date, due_date, total_amount, notes);
      
      const invoiceId = info.lastInsertRowid;
      
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (invoice_id, description, amount, type)
        VALUES (?, ?, ?, ?)
      `);
      
      for (const item of items) {
        insertItem.run(invoiceId, item.description, item.amount, item.type);
      }
      
      // Update Ledger (Debit)
      const lastBalance = db.prepare("SELECT balance FROM ledger WHERE vendor_id = ? ORDER BY id DESC LIMIT 1").get(vendor_id) as any;
      const currentBalance = (lastBalance?.balance || 0) + total_amount;
      
      db.prepare(`
        INSERT INTO ledger (vendor_id, date, description, reference, debit, balance)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(vendor_id, date, `Invoice ${invoice_number}`, invoice_number, total_amount, currentBalance);
      
      return invoiceId;
    });

    try {
      const id = dbTransaction();
      res.json({ id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Payments
  app.get("/api/payments", (req, res) => {
    res.json(db.prepare(`
      SELECT p.*, v.name as vendor_name, inv.invoice_number
      FROM payments p
      JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN invoices inv ON p.invoice_id = inv.id
      ORDER BY p.date DESC
    `).all());
  });

  app.post("/api/payments", (req, res) => {
    const { vendor_id, invoice_id, amount, date, method, type, reference, notes } = req.body;
    
    const dbTransaction = db.transaction(() => {
      // Record payment
      const info = db.prepare(`
        INSERT INTO payments (vendor_id, invoice_id, amount, date, method, type, reference, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(vendor_id, invoice_id, amount, date, method, type, reference, notes);
      
      // Update Invoice if applicable
      if (invoice_id) {
        const invoice = db.prepare("SELECT total_amount, paid_amount FROM invoices WHERE id = ?").get(invoice_id) as any;
        const newPaidAmount = invoice.paid_amount + amount;
        let status = 'PARTIAL';
        if (newPaidAmount >= invoice.total_amount) status = 'PAID';
        
        db.prepare("UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?").run(newPaidAmount, status, invoice_id);
      }
      
      // Update Ledger (Credit)
      const lastBalance = db.prepare("SELECT balance FROM ledger WHERE vendor_id = ? ORDER BY id DESC LIMIT 1").get(vendor_id) as any;
      const currentBalance = (lastBalance?.balance || 0) - amount;
      
      db.prepare(`
        INSERT INTO ledger (vendor_id, date, description, reference, credit, balance)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(vendor_id, date, `Payment - ${method}`, reference || 'PAYMENT', amount, currentBalance);
      
      return info.lastInsertRowid;
    });

    try {
      const id = dbTransaction();
      res.json({ id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Ledger
  app.get("/api/ledger", (req, res) => {
    res.json(db.prepare(`
      SELECT l.*, v.name as vendor_name 
      FROM ledger l
      JOIN vendors v ON l.vendor_id = v.id
      ORDER BY l.date DESC, l.id DESC
    `).all());
  });

  app.get("/api/vendors/:id/ledger", (req, res) => {
    res.json(db.prepare(`
      SELECT * FROM ledger 
      WHERE vendor_id = ? 
      ORDER BY date ASC, id ASC
    `).all(req.params.id));
  });

  // Transactions (Inward/Outward/Internal)
  app.get("/api/transactions", (req, res) => {
    res.json(db.prepare(`
      SELECT t.*, i.name as item_name, v.name as vendor_name
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN vendors v ON i.vendor_id = v.id
      ORDER BY t.created_at DESC
    `).all());
  });

  // Inward Goods (GRN)
  app.get("/api/inward", (req, res) => {
    try {
      const records = db.prepare(`
        SELECT ig.*, v.name as vendor_name
        FROM inward_goods ig
        JOIN vendors v ON ig.vendor_id = v.id
        ORDER BY ig.date_time DESC
      `).all() as any[];

      const results = records.map(record => {
        const items = db.prepare(`
          SELECT ii.*, i.name as item_name, i.model_number, i.short_description
          FROM inward_items ii
          JOIN items i ON ii.item_id = i.id
          WHERE ii.inward_id = ?
        `).all(record.id);
        return { 
          grnNo: record.grn_no,
          vendorId: record.vendor_id,
          vendorName: record.vendor_name,
          warehouse: record.warehouse,
          dateTime: record.date_time,
          status: record.status,
          lrNumber: record.lr_number,
          courierName: record.courier_name,
          courierDetails: record.courier_details,
          trackingNumber: record.tracking_number,
          thirdPartyCourier: record.third_party_courier,
          thirdPartyTracking: record.third_party_tracking,
          items: items.map(i => ({
            itemId: i.item_id,
            itemName: i.item_name,
            modelNumber: i.model_number,
            shortDescription: i.short_description,
            quantity: i.quantity,
            weight: i.weight,
            volume: i.volume,
            storageLocation: i.storage_location
          }))
        };
      });

      res.json(results);
    } catch (error) {
      console.error("Error in /api/inward:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inward", (req, res) => {
    const { grnNo, vendorId, warehouse, items, lrNumber, courierName, courierDetails, trackingNumber, thirdPartyCourier, thirdPartyTracking } = req.body;
    
    const dbTransaction = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO inward_goods (grn_no, vendor_id, warehouse, lr_number, courier_name, courier_details, tracking_number, third_party_courier, third_party_tracking)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(grnNo, vendorId, warehouse, lrNumber, courierName, courierDetails, trackingNumber, thirdPartyCourier, thirdPartyTracking);
      
      const inwardId = info.lastInsertRowid;

      for (const item of items) {
        db.prepare(`
          INSERT INTO inward_items (inward_id, item_id, quantity, weight, volume, storage_location)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(inwardId, item.itemId, item.quantity, item.weight, item.volume, item.storageLocation);

        // Update inventory
        db.prepare("UPDATE items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(item.quantity, item.itemId);

        // Record transaction
        db.prepare(`
          INSERT INTO transactions (item_id, type, quantity, reference)
          VALUES (?, 'IN', ?, ?)
        `).run(item.itemId, item.quantity, grnNo);
      }

      return inwardId;
    });

    try {
      const id = dbTransaction();
      res.json({ id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/inward/:grnNo/status", (req, res) => {
    const { status } = req.body;
    try {
      db.prepare("UPDATE inward_goods SET status = ? WHERE grn_no = ?").run(status, req.params.grnNo);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Outward Goods (Dispatch)
  app.get("/api/outward", (req, res) => {
    try {
      const records = db.prepare(`
        SELECT og.*, v.name as vendor_name
        FROM outward_goods og
        JOIN vendors v ON og.vendor_id = v.id
        ORDER BY og.date_time DESC
      `).all() as any[];

      const results = records.map(record => {
        const items = db.prepare(`
          SELECT oi.*, i.name as item_name, i.model_number, i.short_description
          FROM outward_items oi
          JOIN items i ON oi.item_id = i.id
          WHERE oi.outward_id = ?
        `).all(record.id);
        return { 
          dispatchOrderId: record.dispatch_order_id,
          vendorId: record.vendor_id,
          vendorName: record.vendor_name,
          destination: record.destination,
          vehicleDetails: record.vehicle_details,
          dateTime: record.date_time,
          status: record.status,
          lrNumber: record.lr_number,
          courierName: record.courier_name,
          courierDetails: record.courier_details,
          trackingNumber: record.tracking_number,
          thirdPartyCourier: record.third_party_courier,
          thirdPartyTracking: record.third_party_tracking,
          items: items.map(i => ({
            itemId: i.item_id,
            itemName: i.item_name,
            modelNumber: i.model_number,
            shortDescription: i.short_description,
            quantity: i.quantity,
            weight: i.weight
          }))
        };
      });

      res.json(results);
    } catch (error) {
      console.error("Error in /api/outward:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/outward", (req, res) => {
    const { dispatchOrderId, vendorId, destination, vehicleDetails, items, lrNumber, courierName, courierDetails, trackingNumber, thirdPartyCourier, thirdPartyTracking } = req.body;
    
    const dbTransaction = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO outward_goods (dispatch_order_id, vendor_id, destination, vehicle_details, lr_number, courier_name, courier_details, tracking_number, third_party_courier, third_party_tracking)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(dispatchOrderId, vendorId, destination, vehicleDetails, lrNumber, courierName, courierDetails, trackingNumber, thirdPartyCourier, thirdPartyTracking);
      
      const outwardId = info.lastInsertRowid;

      for (const item of items) {
        // Check stock
        const currentItem = db.prepare("SELECT quantity FROM items WHERE id = ?").get(item.itemId) as any;
        if (currentItem.quantity < item.quantity) {
          throw new Error(`Insufficient stock for item ID ${item.itemId}`);
        }

        db.prepare(`
          INSERT INTO outward_items (outward_id, item_id, quantity, weight)
          VALUES (?, ?, ?, ?)
        `).run(outwardId, item.itemId, item.quantity, item.weight);

        // Update inventory
        db.prepare("UPDATE items SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(item.quantity, item.itemId);

        // Record transaction
        db.prepare(`
          INSERT INTO transactions (item_id, type, quantity, reference)
          VALUES (?, 'OUT', ?, ?)
        `).run(item.itemId, item.quantity, dispatchOrderId);
      }

      return outwardId;
    });

    try {
      const id = dbTransaction();
      res.json({ id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/transactions", (req, res) => {
    const { item_id, type, quantity, reference, target_location_id } = req.body;
    
    const dbTransaction = db.transaction(() => {
      const item = db.prepare("SELECT quantity, damaged_quantity, expired_quantity, missing_quantity, price, gst_rate, location_id FROM items WHERE id = ?").get(item_id) as any;
      if (!item) throw new Error("Item not found");
      
      if (type === 'INTERNAL') {
        if (!target_location_id) throw new Error("Target location required for internal move");
        
        // Move from old location to new location
        if (item.location_id) {
          db.prepare("UPDATE locations SET occupied_capacity = occupied_capacity - ? WHERE id = ?").run(quantity, item.location_id);
        }
        db.prepare("UPDATE locations SET occupied_capacity = occupied_capacity + ? WHERE id = ?").run(quantity, target_location_id);
        db.prepare("UPDATE items SET location_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(target_location_id, item_id);
      } else if (type === 'DAMAGED') {
        if (item.quantity < quantity) throw new Error("Insufficient stock to mark as damaged");
        db.prepare("UPDATE items SET quantity = quantity - ?, damaged_quantity = damaged_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(quantity, quantity, item_id);
      } else if (type === 'EXPIRED') {
        if (item.quantity < quantity) throw new Error("Insufficient stock to mark as expired");
        db.prepare("UPDATE items SET quantity = quantity - ?, expired_quantity = expired_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(quantity, quantity, item_id);
      } else if (type === 'MISSING') {
        if (item.quantity < quantity) throw new Error("Insufficient stock to mark as missing");
        db.prepare("UPDATE items SET quantity = quantity - ?, missing_quantity = missing_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(quantity, quantity, item_id);
      } else if (type === 'RETURN') {
        // Return adds back to quantity
        db.prepare("UPDATE items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(quantity, item_id);
        
        // Update location capacity if exists
        if (item.location_id) {
          db.prepare("UPDATE locations SET occupied_capacity = occupied_capacity + ? WHERE id = ?").run(quantity, item.location_id);
        }
      } else {
        const newQuantity = type === 'IN' ? item.quantity + quantity : item.quantity - quantity;
        if (newQuantity < 0) throw new Error("Insufficient stock");
        
        db.prepare("UPDATE items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(newQuantity, item_id);
        
        // Update location capacity
        if (item.location_id) {
          const adjustment = type === 'IN' ? quantity : -quantity;
          db.prepare("UPDATE locations SET occupied_capacity = occupied_capacity + ? WHERE id = ?").run(adjustment, item.location_id);
        }
      }

      const unitPrice = item.price;
      const gstAmount = (unitPrice * quantity * item.gst_rate) / 100;
      const totalAmount = (unitPrice * quantity) + gstAmount;

      db.prepare(`
        INSERT INTO transactions (item_id, type, quantity, unit_price, gst_amount, total_amount, reference) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(item_id, type, quantity, unitPrice, gstAmount, totalAmount, reference);
    });

    try {
      dbTransaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Categories & Suppliers
  app.get("/api/categories", (req, res) => {
    res.json(db.prepare("SELECT * FROM categories").all());
  });

  app.get("/api/suppliers", (req, res) => {
    res.json(db.prepare("SELECT * FROM suppliers").all());
  });

  app.post("/api/suppliers", (req, res) => {
    const { name, email, phone, address, gst_number } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO suppliers (name, email, phone, address, gst_number)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, email, phone, address, gst_number);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/transactions/:id", (req, res) => {
    const tx = db.prepare(`
      SELECT t.*, i.name as item_name, i.sku as item_sku, v.name as vendor_name, v.address as vendor_address, v.gst_number as vendor_gst
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      JOIN vendors v ON i.vendor_id = v.id
      WHERE t.id = ?
    `).get(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.json(tx);
  });

  app.get("/api/locations", (req, res) => {
    res.json(db.prepare(`
      SELECT l.*, z.name as zone_name, b.name as branch_name 
      FROM locations l 
      JOIN zones z ON l.zone_id = z.id 
      JOIN branches b ON z.branch_id = b.id
    `).all());
  });

  // Pricing Config
  app.get("/api/pricing", (req, res) => {
    res.json(db.prepare("SELECT * FROM pricing_config").all());
  });

  app.post("/api/pricing", (req, res) => {
    const { pricing } = req.body; // Array of { key, value }
    const updatePricing = db.prepare("UPDATE pricing_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?");
    
    const dbTransaction = db.transaction(() => {
      for (const p of pricing) {
        updatePricing.run(p.value, p.key);
      }
    });

    try {
      dbTransaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // SQL Editor (Admin Only - simplified for now)
  app.post("/api/sql", (req, res) => {
    const { query } = req.body;
    try {
      const result = db.prepare(query).all();
      res.json(result);
    } catch (err: any) {
      // If it's a non-select query, try run()
      try {
        const result = db.prepare(query).run();
        res.json(result);
      } catch (runErr: any) {
        res.status(400).json({ error: runErr.message });
      }
    }
  });

  // Damaged Product Returns
  app.post("/api/returns", (req, res) => {
    const { itemId, quantity, reason, vendorId, warehouse } = req.body;
    
    if (!itemId || !quantity || !vendorId || !warehouse) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const dbTransaction = db.transaction(() => {
        // 1. Check current stock
        const item = db.prepare('SELECT quantity, name, price, gst_rate FROM items WHERE id = ?').get(itemId) as any;
        if (!item || item.quantity < quantity) {
          throw new Error("Insufficient stock to return");
        }

        // 2. Update inventory (reduce stock)
        db.prepare('UPDATE items SET quantity = quantity - ?, damaged_quantity = damaged_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, quantity, itemId);

        // 3. Record transaction
        const unitPrice = item.price || 0;
        const gstAmount = (unitPrice * quantity * (item.gst_rate || 18)) / 100;
        const totalAmount = (unitPrice * quantity) + gstAmount;

        db.prepare(`
          INSERT INTO transactions (item_id, type, quantity, unit_price, gst_amount, total_amount, reference)
          VALUES (?, 'RETURN', ?, ?, ?, ?, ?)
        `).run(itemId, quantity, unitPrice, gstAmount, totalAmount, `Return: ${reason || 'Damaged'}`);

        // 4. Update ledger (Accounting adjustment - credit the vendor for returned goods)
        const lastBalance = db.prepare("SELECT balance FROM ledger WHERE vendor_id = ? ORDER BY id DESC LIMIT 1").get(vendorId) as any;
        const currentBalance = (lastBalance?.balance || 0) - totalAmount;

        db.prepare(`
          INSERT INTO ledger (vendor_id, date, description, reference, credit, balance)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          vendorId, 
          new Date().toISOString().split('T')[0], 
          `Damaged Product Return: ${item.name} (Qty: ${quantity})`, 
          'RETURN',
          totalAmount,
          currentBalance
        );

        return true;
      });

      dbTransaction();
      res.json({ message: "Return processed successfully" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Catch-all for API routes
  app.all("/api/*", (req, res) => {
    console.log(`404 API: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
