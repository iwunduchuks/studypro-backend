export const apiResponse = <T>({
  success,
  message,
  data = null,
  error = null,
  meta,
}: {
  success: boolean;
  message: string;
  data?: T | null;
  error?: any;
  meta?: any;
}) => ({
  success,
  message,
  data,
  error,
  meta,
});
