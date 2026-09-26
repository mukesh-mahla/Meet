import type { NextFunction, Request, Response } from "express";
import { auth } from "./auth";
import { Authentication } from "./authentication";


export async function AuthMiddleware(req:Request,res:Response,next:NextFunction){
const session = await Authentication(req.headers)
if(!session){
    return res.json({msg:"not authenticated"})
}
req.session = session
next()
}