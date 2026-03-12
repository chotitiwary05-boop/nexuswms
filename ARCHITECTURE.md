# Nexus Enterprise WMS - System Architecture

## 1. Full System Architecture
The system follows a **Modular Monolith** architecture with a clear separation between the Core Engine, Billing Engine, and Accounting Module.

### High-Level Components:
- **Web Frontend**: React.js SPA for Admin, Managers, and Staff.
- **Customer Portal**: React.js SPA for Vendors.
- **Mobile App**: React Native for Staff (Scanning) and Vendors (Tracking).
- **Backend API**: Node.js/Express RESTful API.
- **Database**: MySQL (Relational for transactional integrity).
- **Caching**: Redis for session management and real-time utilization stats.
- **Storage**: AWS S3 for documents (Invoices, GRNs).

---

## 2. Database Schema (MySQL)

### Core Tables:
- `users`: id, name, email, password_hash, role (SUPER_ADMIN, MANAGER, STAFF, VENDOR), branch_id.
- `branches`: id, name, address, total_area, total_volume, capacity_pallets.
- `zones`: id, branch_id, name, type (COLD, DRY, HAZARDOUS), capacity.
- `racks`: id, zone_id, name, levels, slots.
- `locations`: id, rack_id, shelf, bin, type (FLOOR, RACK), occupied_capacity, total_capacity.

### Vendor & Contract Management:
- `vendors`: id, name, company_name, gst_number, contact_details.
- `contracts`: id, vendor_id, branch_id, start_date, end_date, billing_cycle (DAILY, WEEKLY, MONTHLY), rate_plan_id, status.
- `rate_plans`: id, name, unit_type (SQFT, CBM, PALLET), rate_per_unit.

### Inventory & Movement:
- `items`: id, vendor_id, name, sku, category, unit_type, weight, volume, min_stock.
- `inventory`: id, item_id, location_id, quantity, batch_number, expiry_date.
- `grn` (Goods Receipt Note): id, vendor_id, branch_id, status (PENDING, COMPLETED), received_by.
- `grn_items`: id, grn_id, item_id, quantity, location_id.
- `dispatch_orders`: id, vendor_id, status, destination, vehicle_details.
- `dispatch_items`: id, order_id, item_id, quantity.

### Billing & Accounting:
- `invoices`: id, vendor_id, contract_id, amount, tax, total, status, due_date.
- `payments`: id, invoice_id, amount, method, transaction_ref, date.
- `ledger`: id, entity_id (Vendor/Company), type (DEBIT, CREDIT), amount, balance, description.

---

## 3. API Design (RESTful)

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Warehouse Operations
- `GET /api/branches`
- `GET /api/branches/:id/utilization`
- `POST /api/inward/grn`
- `POST /api/outward/dispatch`

### Vendor & Billing
- `GET /api/vendors/:id/inventory`
- `GET /api/vendors/:id/contracts`
- `POST /api/billing/generate-invoice`

---

## 4. UI Screen List

### Admin/Manager Dashboard
1. **Global Overview**: Map of branches, total revenue, occupancy heatmaps.
2. **Warehouse Designer**: Visual grid to manage Zones/Racks.
3. **Contract Manager**: Approval workflow for vendor contracts.
4. **Inventory Audit**: Real-time stock levels across all branches.
5. **Billing Center**: Automated invoice generation and payment tracking.

### Staff App
1. **Inward Scanning**: Scan QR codes for GRN entry.
2. **Put-away Suggestion**: AI-based location assignment.
3. **Picking List**: Optimized route for outward dispatch.

### Vendor Portal
1. **My Inventory**: Stock levels and movement history.
2. **Dispatch Request**: Form to request outward movement.
3. **Financials**: Download invoices and view ledger.

---

## 5. Workflow Diagrams

### Inward Workflow:
`Gate Entry` -> `Unloading` -> `Quality Check` -> `GRN Generation` -> `Put-away (Storage Allocation)` -> `Inventory Update`

### Outward Workflow:
`Dispatch Request` -> `Approval` -> `Picking` -> `Packing` -> `Gate Pass` -> `Stock Deduction`

---

## 6. Recommended Development Plan

### Phase 1: Core Foundation (Weeks 1-3)
- Database setup and Auth.
- Branch and Warehouse structure management.
- Basic Item and Vendor CRUD.

### Phase 2: Inventory & Movement (Weeks 4-6)
- GRN and Dispatch workflows.
- Real-time stock tracking.
- Location-based capacity management.

### Phase 3: Billing & Accounting (Weeks 7-9)
- Contract engine.
- Automated billing calculations.
- Ledger and basic financial reporting.

### Phase 4: Portals & Mobile (Weeks 10-12)
- Vendor Portal.
- Mobile app for staff scanning.
- Advanced reporting and dashboards.

---

## 7. Deployment Architecture
- **Environment**: Dockerized containers on AWS ECS/EKS.
- **Database**: AWS RDS (MySQL) with Multi-AZ for high availability.
- **Load Balancer**: AWS ALB for traffic distribution.
- **CDN**: CloudFront for frontend assets.
