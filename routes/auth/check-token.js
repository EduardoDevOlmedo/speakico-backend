import jwt from "jsonwebtoken";

export const checkToken = (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(200).json({ ok: false });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Token inválido o expirado", ok: false });
        }
        req.userInfo = decoded;
        return res.status(200).json({ message: "Token válido", ok: true });
    } catch (error) {
        return res.status(200).json({ message: "Token inválido o expirado", ok: false });
    }
};

