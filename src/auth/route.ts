import { Router } from "express";
import { Login } from "./controller";

const auth = Router();

// Login route
auth.route("/").post(Login);

export default auth;
