import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  roomNumber?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

// Laundry Types
export interface Machine {
  id: string;
  name: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'occupied' | 'maintenance';
  location: string;
  estimatedTime?: number;
}

export interface Booking {
  id: string;
  userId: string;
  machineId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  serviceType: string;
  totalCost: number;
}

export interface BookingRequest {
  machineId: string;
  startTime: string;
  serviceType: string;
  duration: number;
  preferences?: Record<string, unknown>;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'crypto' | 'wallet';
  details: string;
  isDefault: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: string;
  bookingId?: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// Lost & Found Types
export interface LostItem {
  id: string;
  name: string;
  description: string;
  category: string;
  dateReported: Date;
  status: 'lost' | 'found' | 'matched' | 'returned';
  images?: string[];
}

export interface ReportItemRequest {
  name: string;
  description: string;
  category: string;
  location?: string;
  images?: File[];
}

// Analytics Types
export interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  machineUtilization: Record<string, number>;
  peakHours: Array<{ hour: number; usage: number }>;
  userGrowth: Array<{ date: string; users: number }>;
}

// Auth Service
export class AuthService {
  static async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  static async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  }

  static async getProfile(): Promise<ApiResponse<AuthResponse['user']>> {
    return apiClient.get<AuthResponse['user']>(API_ENDPOINTS.AUTH.PROFILE);
  }

  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH);
  }
}

// Laundry Service
export class LaundryService {
  static async getMachines(): Promise<ApiResponse<Machine[]>> {
    return apiClient.get<Machine[]>(API_ENDPOINTS.LAUNDRY.MACHINES);
  }

  static async getAvailability(date?: string): Promise<ApiResponse<Machine[]>> {
    const endpoint = date
      ? `${API_ENDPOINTS.LAUNDRY.AVAILABILITY}?date=${date}`
      : API_ENDPOINTS.LAUNDRY.AVAILABILITY;
    return apiClient.get<Machine[]>(endpoint);
  }

  static async createBooking(booking: BookingRequest): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(API_ENDPOINTS.LAUNDRY.BOOKINGS, booking);
  }

  static async getBookings(): Promise<ApiResponse<Booking[]>> {
    return apiClient.get<Booking[]>(API_ENDPOINTS.LAUNDRY.BOOKINGS);
  }

  static async cancelBooking(bookingId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.LAUNDRY.BOOKINGS}/${bookingId}`);
  }
}

// Payment Service
export class PaymentService {
  static async processPayment(payment: PaymentRequest): Promise<ApiResponse<{ transactionId: string }>> {
    return apiClient.post<{ transactionId: string }>(API_ENDPOINTS.PAYMENT.PROCESS, payment);
  }

  static async getPaymentHistory(): Promise<ApiResponse<PaymentRequest[]>> {
    return apiClient.get<PaymentRequest[]>(API_ENDPOINTS.PAYMENT.HISTORY);
  }

  static async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiClient.get<PaymentMethod[]>(API_ENDPOINTS.PAYMENT.METHODS);
  }
}

// Notification Service
export class NotificationService {
  static async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
  }

  static async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}`);
  }

  static async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ);
  }
}

// Lost & Found Service
export class LostFoundService {
  static async getItems(type?: 'lost' | 'found'): Promise<ApiResponse<LostItem[]>> {
    const endpoint = type
      ? `${API_ENDPOINTS.LOST_FOUND.ITEMS}?type=${type}`
      : API_ENDPOINTS.LOST_FOUND.ITEMS;
    return apiClient.get<LostItem[]>(endpoint);
  }

  static async reportLostItem(item: ReportItemRequest): Promise<ApiResponse<LostItem>> {
    return apiClient.post<LostItem>(API_ENDPOINTS.LOST_FOUND.REPORT_LOST, item);
  }

  static async reportFoundItem(item: ReportItemRequest): Promise<ApiResponse<LostItem>> {
    return apiClient.post<LostItem>(API_ENDPOINTS.LOST_FOUND.REPORT_FOUND, item);
  }

  static async findMatches(itemId: string): Promise<ApiResponse<LostItem[]>> {
    return apiClient.get<LostItem[]>(`${API_ENDPOINTS.LOST_FOUND.MATCH}/${itemId}`);
  }
}

// Reporting Service
export class ReportingService {
  static async getAnalytics(timeRange?: string): Promise<ApiResponse<AnalyticsData>> {
    const endpoint = timeRange
      ? `${API_ENDPOINTS.REPORTING.ANALYTICS}?range=${timeRange}`
      : API_ENDPOINTS.REPORTING.ANALYTICS;
    return apiClient.get<AnalyticsData>(endpoint);
  }

  static async getUsageReport(machineId?: string): Promise<ApiResponse<Record<string, unknown>>> {
    const endpoint = machineId
      ? `${API_ENDPOINTS.REPORTING.USAGE}?machineId=${machineId}`
      : API_ENDPOINTS.REPORTING.USAGE;
    return apiClient.get<Record<string, unknown>>(endpoint);
  }

  static async getRevenueReport(period?: string): Promise<ApiResponse<Record<string, unknown>>> {
    const endpoint = period
      ? `${API_ENDPOINTS.REPORTING.REVENUE}?period=${period}`
      : API_ENDPOINTS.REPORTING.REVENUE;
    return apiClient.get<Record<string, unknown>>(endpoint);
  }
}
