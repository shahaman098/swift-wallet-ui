type ValidateEnvOptions = {
  optional?: boolean;
};

export const validateEnv = (
  key: string,
  fallback?: string,
  options: ValidateEnvOptions = {},
): string | null => {
  const value = process.env[key] ?? fallback ?? null;

  if (!value && !options.optional) {
    throw new Error(`Environment variable ${key} is required but was not provided.`);
  }

  return value;
};

