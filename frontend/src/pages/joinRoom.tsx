import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authClient } from "../lib/auth-client"
import type { SessionData } from "./call"
import type { BetterFetchError } from "better-auth/react"
import type { SessionQueryParams } from "better-auth"

export function JoinRoom() {
    const navigate = useNavigate()

    const [roomName, setRoomName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
     const { data } = authClient.useSession() as {
                data: SessionData | null
                isPending: boolean
                isRefetching: boolean
                error: BetterFetchError | null
                refetch: (queryParams?: {
                    query?: SessionQueryParams
                }) => Promise<void>
            }

    async function handleJoinRoom(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault()

        const name = roomName.trim()

        if (!name) return

        setLoading(true)
        setError("")

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${name}`,{withCredentials:true})

        console.log(response)

            if (!response) {
                setError( "Room not found")
                return
            }

            // Again, don't enter CallRoom directly.
            navigate(`/room/${response.data.roomId}/lobby`)
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if(!data){
        navigate("/signin")
        return
    }

    return (
        <div className="min-h-screen bg-[#fafafa] text-zinc-950">

            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">

                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 font-semibold text-white">
                        V
                    </div>

                    <span className="text-lg font-semibold">
                        VideoMeet
                    </span>
                </button>

                <button
                    onClick={() => navigate("/")}
                    className="text-sm text-zinc-500 hover:text-zinc-950"
                >
                    Back to home
                </button>

            </nav>


            <main className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6">

                <div className="w-full max-w-xl">

                    <div className="mb-8 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-2xl text-white">
                            →
                        </div>

                        <h1 className="mt-6 text-4xl font-semibold tracking-tight">
                            Join a meeting
                        </h1>

                        <p className="mt-3 text-zinc-500">
                            Enter the meeting name shared with you.
                        </p>

                    </div>


                    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">

                        <form
                            onSubmit={handleJoinRoom}
                            className="space-y-6"
                        >

                            <div>
                                <label
                                    htmlFor="roomName"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Meeting name
                                </label>

                                <input
                                    id="roomName"
                                    value={roomName}
                                    onChange={(e) => {
                                        setRoomName(e.target.value)
                                        setError("")
                                    }}
                                    placeholder="Friday Coding"
                                    autoFocus
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-100"
                                />
                            </div>


                            {error && (
                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}


                            <button
                                type="submit"
                                disabled={loading || !roomName.trim()}
                                className="w-full rounded-xl bg-zinc-950 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {loading
                                    ? "Finding meeting..."
                                    : "Continue"}
                            </button>

                        </form>


                        <div className="mt-6 border-t border-zinc-100 pt-6 text-center">

                            <p className="text-sm text-zinc-400">
                                Want to start your own meeting?
                            </p>

                            <button
                                onClick={() => navigate("/meet")}
                                className="mt-2 text-sm font-semibold hover:underline"
                            >
                                Create a meeting
                            </button>

                        </div>

                    </div>

                </div>

            </main>
        </div>
    )
}