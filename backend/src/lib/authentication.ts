import { auth } from "./auth";
import type { IncomingHttpHeaders } from "http";


export async function Authentication(req:IncomingHttpHeaders){
    const session = await auth.api.getSession(
        {headers:req}
    )

    return session?.user.id
}