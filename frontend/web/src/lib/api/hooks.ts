import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AuthService,
  LaundryService,
  PaymentService,
  NotificationService,
  LostFoundService,
  ReportingService,
  LoginRequest,
  RegisterRequest,
  BookingRequest,
  PaymentRequest,
  ReportItemRequest,
} from './services';

// Query Keys
export const QUERY_KEYS = {
  AUTH: ['auth'],
  MACHINES: ['machines'],
  BOOKINGS: ['bookings'],
  NOTIFICATIONS: ['notifications'],
  LOST_FOUND: ['lostFound'],
  ANALYTICS: ['analytics'],
  PAYMENT_METHODS: ['paymentMethods'],
  PAYMENT_HISTORY: ['paymentHistory'],
} as const;

// Auth Hooks
export const useAuth = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH,
    queryFn: () => AuthService.getProfile(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.setQueryData(QUERY_KEYS.AUTH, response.data.user);
        toast.success('Login successful!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => AuthService.register(userData),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.setQueryData(QUERY_KEYS.AUTH, response.data.user);
        toast.success('Registration successful!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
};

// Laundry Hooks
export const useMachines = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINES,
    queryFn: () => LaundryService.getMachines(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAvailability = (date?: string) => {
  return useQuery({
    queryKey: ['availability', date],
    queryFn: () => LaundryService.getAvailability(date),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useBookings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.BOOKINGS,
    queryFn: () => LaundryService.getBookings(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (booking: BookingRequest) => LaundryService.createBooking(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINES });
      toast.success('Booking created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => LaundryService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINES });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel booking');
    },
  });
};

// Payment Hooks
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENT_METHODS,
    queryFn: () => PaymentService.getPaymentMethods(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENT_HISTORY,
    queryFn: () => PaymentService.getPaymentHistory(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payment: PaymentRequest) => PaymentService.processPayment(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_HISTORY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS });
      toast.success('Payment processed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Payment failed');
    },
  });
};

// Notification Hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => NotificationService.getNotifications(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 1 * 60 * 1000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      toast.success('All notifications marked as read');
    },
  });
};

// Lost & Found Hooks
export const useLostFoundItems = (type?: 'lost' | 'found') => {
  return useQuery({
    queryKey: [QUERY_KEYS.LOST_FOUND, type],
    queryFn: () => LostFoundService.getItems(type),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReportLostItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: ReportItemRequest) => LostFoundService.reportLostItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOST_FOUND });
      toast.success('Lost item reported successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to report lost item');
    },
  });
};

export const useReportFoundItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: ReportItemRequest) => LostFoundService.reportFoundItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOST_FOUND });
      toast.success('Found item reported successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to report found item');
    },
  });
};

// Analytics Hooks
export const useAnalytics = (timeRange?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, timeRange],
    queryFn: () => ReportingService.getAnalytics(timeRange),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsageReport = (machineId?: string) => {
  return useQuery({
    queryKey: ['usageReport', machineId],
    queryFn: () => ReportingService.getUsageReport(machineId),
    staleTime: 10 * 60 * 1000,
  });
};

export const useRevenueReport = (period?: string) => {
  return useQuery({
    queryKey: ['revenueReport', period],
    queryFn: () => ReportingService.getRevenueReport(period),
    staleTime: 10 * 60 * 1000,
  });
};
