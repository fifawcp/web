export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type OtpRequestResponse = {
  message: string;
  expiresAt: string;
};

export type OtpVerifyResponse = {
  data: {
    message: string;
    auth: {
      access_token: string;
      expires_at: string;
    };
    user: {
      id: string;
      email: string;
      username: string;
      first_name: string;
      last_name: string;
      created_at: string;
      updated_at: string;
    };
  };
};

export type OtpPurpose = "login" | "registration";
