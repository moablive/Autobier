import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ITokenPayload } from '@autobier/types'; 

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).end();
  }

  const [, token] = authToken.split(" ");

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT Missing");

    // Usamos a interface importada para tipar o retorno do verify
    const { sub, role } = verify(token, secret) as ITokenPayload;

    // O TypeScript agora sabe que 'role' é boolean
    req.user_id = sub;
    req.user_role = role; 

    return next();

  } catch (err) {
    return res.status(401).end();
  }
}