import { Router } from "express";
import { db } from "../prisma/db";

export const userRouter = Router()

userRouter.post('/create-room',async(req,res)=>{
                 const {name,userId} = req.body
                const data = await db.orm.public.Room.select("name","id").create({
                     name,
                     userId
                 })

                 return res.json(data)
})