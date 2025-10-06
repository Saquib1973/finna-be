import jwt from 'jsonwebtoken';
export const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '60s',
    });
};
//# sourceMappingURL=token.js.map