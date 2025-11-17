import jwt from "jsonwebtoken";

export const verifySocketJWT = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach user payload to socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
};
