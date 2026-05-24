import "dotenv/config";

export const jwtConstants = {
  secret: process.env.SECRET_KEY,
  refresh: process.env.REFRESH_SECRET_KEY,
};
