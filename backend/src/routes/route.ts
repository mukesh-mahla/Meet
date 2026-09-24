import { Router } from "express";
import { prisma } from "../lib/prisma";

export const userRouter = Router()

userRouter.post('/create-room',async(req,res)=>{
                 const {name,userId} = req.body
                const data = await prisma.room.create({
                    data:{
                        name,
                     userId
                    }
                 })

                 return res.json(data)
})

userRouter.get('/room',async(req,res)=>{
    const {roomName} = req.body

    const data = await prisma.room.findFirst({
        where:{
            name:roomName
        }
    })
    if(!data){
        return res.json({msg:"room not found",status:404})
    }

    res.json({data:data.id})
})
