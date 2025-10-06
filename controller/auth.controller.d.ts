import type { Request, Response } from 'express';
declare const AuthController: {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    forgotPassword: (req: Request, res: Response) => Promise<void>;
    resetPassword: (req: Request, res: Response) => Promise<void>;
};
export default AuthController;
//# sourceMappingURL=auth.controller.d.ts.map