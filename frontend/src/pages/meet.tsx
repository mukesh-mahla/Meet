import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function Meet() {
    const navigate = useNavigate()

    const [roomName, setRoomName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleCreateRoom(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault()

        const name = roomName.trim()

        if (!name) return

        setLoading(true)
        setError("")

        try {
            const response = await fetch(
                "http://localhost:3000/api/create-room",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name,
                    }),
                }
            )

            const result = await response.json()

            if (!response.ok) {
                setError(result.message || "Could not create room")
                return
            }

            // Don't enter CallRoom yet.
            // Go to the lobby first.
            navigate(`/room/${result.id}/lobby`)
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
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
                            +
                        </div>

                        <h1 className="mt-6 text-4xl font-semibold tracking-tight">
                            Create a meeting
                        </h1>

                        <p className="mt-3 text-zinc-500">
                            Give your meeting a name and invite others.
                        </p>

                    </div>


                    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">

                        <form
                            onSubmit={handleCreateRoom}
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
                                    ? "Creating meeting..."
                                    : "Create meeting"}
                            </button>

                        </form>

                    </div>

                </div>

            </main>
        </div>
    )
}