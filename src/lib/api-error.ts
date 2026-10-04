export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  requestId?: string;
  retryable?: boolean;
  details?: Record<string, unknown> | unknown[];
  fieldErrors?: Record<string, string[]>;
}

export function parseApiError(error: unknown): ApiError {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Ocorreu um erro desconhecido.',
      retryable: false,
    };
  }

  const responseData = (error as any)?.response?.data;

  // Formato aninhado: { error: { code, message, requestId, details, ... } }
  if (responseData?.error) {
    const err = responseData.error;
    return {
      code: err.code || 'UNKNOWN_ERROR',
      message: err.message || 'Erro inesperado.',
      statusCode: err.statusCode || (error as any)?.response?.status,
      requestId: err.requestId || err.request_id || responseData.request_id,
      retryable: (err.statusCode || (error as any)?.response?.status) >= 500,
      details: err.details,
      fieldErrors: err.fieldErrors || err.field_errors,
    };
  }

  // Formato direto na raiz: { code, message, request_id, details }
  if (responseData && typeof responseData === 'object') {
    return {
      code: responseData.code || 'UNKNOWN_ERROR',
      message: responseData.message || (error as any)?.message || 'Erro inesperado.',
      statusCode: responseData.statusCode || (error as any)?.response?.status,
      requestId: responseData.requestId || responseData.request_id,
      retryable: (responseData.statusCode || (error as any)?.response?.status) >= 500,
      details: responseData.details,
      fieldErrors: responseData.fieldErrors || responseData.field_errors,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      retryable: false,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
    retryable: false,
  };
}
