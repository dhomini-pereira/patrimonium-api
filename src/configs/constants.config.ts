export const SERVER = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3333,
  HOST: "0.0.0.0",
} as const;
