import { Router } from "express";
import { Login, RefreshToken } from "./controller";

const auth = Router();

auth.route("/auth").post(Login);
auth.route("/refresh").post(RefreshToken);

export default auth;
