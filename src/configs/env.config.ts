export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  PORT: process.env.PORT as string,
};

for (const variable of Object.keys(env)) {
  if (!env[variable as keyof typeof env]) {
    console.log(
      "[SERVER] Variable is not setted in the environment:",
      variable,
    );
    process.exit(1);
  }
}
