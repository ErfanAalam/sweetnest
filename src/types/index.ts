export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
}

export interface BookingData {
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalPrice: number;
}

export interface PaymentResponse {
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  message?: string;
}

export interface KYCDocuments {
  aadhaarUrl?: string;
  panUrl?: string;
  passportUrl?: string;
  drivingLicenseUrl?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
