export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ControllerResult {
  success: boolean;
  error?: string;
  data?: any;
}

export namespace ControllerResult {
  export const success = (data?: any): ControllerResult => ({
    success: true,
    data
  });

  export const failure = (error: string): ControllerResult => ({
    success: false,
    error
  });
}