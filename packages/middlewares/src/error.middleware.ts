import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Se for um erro gerado propositalmente por nós (ex: throw new Error("Senha incorreta"))
  if (err instanceof Error) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // Loga o erro no terminal para debug (importante manter)
  console.error(err);

  // Se for um erro desconhecido (ex: banco de dados caiu, bug de código)
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.'
  });
}