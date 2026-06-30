export interface Product {
  id: string;
  name: string;
  costPrice: number; // سعر التكلفة
  sellingPrice: number; // سعر البيع
  quantityInStock: number; // المخزون الحالي
  category?: string; // التصنيف
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customSellingPrice: number; // سعر البيع الفعلي لهذه العملية (قابل للتعديل)
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number; // سعر التكلفة وقت البيع (للحفاظ على دقة الحسابات التاريخية)
  sellingPrice: number; // سعر البيع وقت البيع
}

export interface Transaction {
  id: string;
  customerName: string; // اسم الزبون
  items: TransactionItem[];
  totalAmount: number; // إجمالي قيمة البيع
  totalCost: number; // إجمالي التكلفة
  totalProfit: number; // صافي الربح
  date: string; // تاريخ العملية
  notes?: string; // ملاحظات إضافية
}

export interface DailyReport {
  date: string;
  sales: number;
  cost: number;
  profit: number;
  count: number;
}
