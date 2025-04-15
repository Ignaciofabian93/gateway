import { Router } from "express";
import { Login } from "./controller";

const Auth = Router();

Auth.route("/").post(Login);

export default Auth;
