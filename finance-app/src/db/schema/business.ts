import { pgTable, text, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";

export const businessClients = pgTable("business_clients", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(), // KTP Name
    nickname: text("nickname"), // Nama Panggilan
    clientType: text("client_type").notNull().default("personal"),

    // Identity
    nik: text("nik"),

    // ID & PPPoE
    customerId: text("customer_id"), // e.g. "jeffry@runsnet.id"

    // Service Info
    servicePackage: text("service_package"),
    bandwidth: text("bandwidth"),
    wifiSsid: text("wifi_ssid"),
    wifiPassword: text("wifi_password"),
    monthlyFee: decimal("monthly_fee", { precision: 12, scale: 2 }).notNull().default("0"),
    installationDate: timestamp("installation_date"),
    odpLocation: text("odp_location"),

    // Status
    status: text("status").default("active"),

    // Location / Address
    address: text("address"), // Full address string if needed
    province: text("province").default("Bengkulu"),
    regency: text("regency").default("Mukomuko"),
    district: text("district").default("Teras Terunjam"),
    village: text("village"), // Dropdown: Tunggal Jaya, Karang Jaya, Mekar Jaya
    coordinate: text("coordinate"), // Lat,Long

    // Contact
    phone: text("phone"),
    email: text("email"),

    // Images
    ktpPhotoPath: text("ktp_photo_path"),
    homePhotoPath: text("home_photo_path"),

    // Other
    notes: text("notes"),

    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const businessAssets = pgTable("business_assets", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull().default("hardware"),
    purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull().default("0"),
    purchaseDate: timestamp("purchase_date"),
    lifespanMonths: integer("lifespan_months").default(12),
    monthlyMaintenanceCost: decimal("monthly_maintenance_cost", { precision: 12, scale: 2 }).default("0"),
    status: text("status").default("active"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const businessIncomes = pgTable("business_incomes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    type: text("type").default("gross"), // 'gross' | 'net'
    isTransferredToPersonal: boolean("is_transferred_to_personal").default(false),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const businessExpenses = pgTable("business_expenses", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    category: text("category").default("operational"), // 'invoice_pusat', 'operational', 'salary', 'maintainance'
    invoiceNo: text("invoice_no"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const businessDebts = pgTable("business_debts", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    dueDate: timestamp("due_date"),
    description: text("description"),
    status: text("status").default("unpaid"), // 'unpaid', 'paid'
    type: text("type").default("payable"), // 'payable' (Hutang), 'receivable' (Piutang/Kasbon)
    category: text("category").default("other"), // 'kuota', 'voucher', 'other'
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

// Store Settings & Company Info in one table or separate? 
// Only one row per user usually.
export const businessSettings = pgTable("business_settings", {
    userId: text("user_id").primaryKey(), // One setting per user
    // Company Info
    myCompanyName: text("my_company_name").default("PT. NET SYNERGY INOVATE"),
    myCompanyDesc: text("my_company_desc"),
    partnerName: text("partner_name").default("PT. RUBYAN NETWORK SOLUTION"),
    partnerDesc: text("partner_desc"),

    // Page Configuration (Tabs visibility)
    showAssets: boolean("show_assets").default(true),
    showIncome: boolean("show_income").default(true),
    showDebt: boolean("show_debt").default(true),
    showAI: boolean("show_ai").default(true),

    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
