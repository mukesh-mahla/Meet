import { Router } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import {  AuthMiddleware } from "../lib/middleware";

export const userRouter = Router()

userRouter.post('/create-room',AuthMiddleware, async(req,res)=>{
    
                 const {name} = req.body
                const data = await prisma.room.create({
                    data:{
                        name,
                       userId:req.session
                    }
                 })

                 return res.json(data)
})

userRouter.get('/rooms/:roomName',AuthMiddleware,async(req,res)=>{
    const roomName = req.params.roomName as string

    const data = await prisma.room.findFirst({
        where:{
            name:roomName
        }
    })
    if(!data){
        return res.json({msg:"room not found",status:404})
    }

    res.json({roomId:data.id})
})

userRouter.get('/rooms/:roomId',AuthMiddleware,async(req,res)=>{
    const roomId = req.params.roomId as string
    const data = await prisma.room.findFirst({
        where:{
            id:roomId
        }
    })
    if(!data){
        return res.json({msg:"room not found",status:404})
    }

    res.json({data:data.id})
})
