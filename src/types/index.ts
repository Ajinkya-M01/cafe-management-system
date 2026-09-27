export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export type Category = 
  | 'Coffee' 
  | 'Tea' 
  | 'Cold Beverages' 
  | 'Breakfast' 
  | 'Snacks' 
  | 'Main Course' 
  | 'Desserts' 
  | 'Specials';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  image: string;
  isVeg: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  calories?: number;
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Billing' | 'Cleaning';
export type TableSection = 'Indoor' | 'Patio' | 'Window' | 'Private';

export interface Table {
  id: string;
  number: string; // e.g. "01", "02"
  name: string;   // e.g. "Table 01"
  capacity: number;
  section: TableSection;
  status: TableStatus;
  currentOrderId?: string;
  currentBillAmount?: number;
  currentReservationId?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
export type OrderType = 'dine-in' | 'takeaway';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isVeg: boolean;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "NB-8421"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: OrderType;
  tableId?: string;
  tableNumber?: string;
  pickupTime?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show';

export interface Reservation {
  id: string;
  reservationNumber: string; // e.g. "RES-9104"
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  tablePreference: string;
  specialRequests?: string;
  status: ReservationStatus;
  assignedTableId?: string;
  assignedTableNumber?: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-034"
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  generatedAt: string;
  gstin: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  lastVisit: string;
  notes?: string;
}

export interface CafeSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  cgstRate: number; // e.g. 2.5%
  sgstRate: number; // e.g. 2.5%
  currency: string;
  openingHours: {
    days: string;
    hours: string;
  }[];
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  token: string;
}
