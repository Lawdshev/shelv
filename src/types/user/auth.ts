export interface ILogin {
  email: string;
  password: string;
  ip: string;
  referer: string;
}

export interface IVerifyEmail {
  token: string;
}

export interface IRequestOTP {
  phone: string;
}

export interface IPasswordUpdate {
  oldPassword: string;
  newPassword: string;
  ip: string;
}

export interface IPasswordReset {
  token: string;
  password: string;
  email: string;
  ip: string;
  referer: string;
}
