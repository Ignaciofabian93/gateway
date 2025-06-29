import { Router } from "express";
import { Login, RefreshToken } from "./controller";

const auth = Router();

// Login route
auth.route("/auth").post(Login);
auth.route("/refresh").post(RefreshToken);

export default auth;
