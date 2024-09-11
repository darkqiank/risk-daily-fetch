import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRATION_TIME = "1m"; // 令牌有效时间

// 生成 JWT
export const generateToken = (payload: object) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRATION_TIME });
};

// 验证 JWT
export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};

const PRESHARED_AUTH_HEADER_KEY = "X-AUTH-KEY";
const PRESHARED_AUTH_HEADER_VALUE = process.env.AUTH_VALUE;

export const authenticate = (req: NextApiRequest) => {
  const psk = req.headers[PRESHARED_AUTH_HEADER_KEY];

  if (!psk) {
    throw new Error("No auth key provided");
  }

  try {
    if (psk === PRESHARED_AUTH_HEADER_VALUE) {
      return "success";
    } else {
      throw new Error("auth key not valid");
    }
  } catch (error) {
    throw new Error("Token is invalid");
  }
};
