import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

type Room = {
    id: string
    name: string
}

export function Lobby() {
    const { roomId } = useParams()
    const navigate = useNavigate()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [room, setRoom] = useState<Room | null>(null)

    const [cameraEnabled, setCameraEnabled] = useState(true)
    const [micEnabled, setMicEnabled] = useState(true)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [copied, setCopied] = useState(false)


    // Get room information
    useEffect(() => {
        if (!roomId) return

        async function getRoom() {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/rooms/${roomId}`,
                    {
                        credentials: "include",
                    }
                )

                const result = await response.json()

                if (!response.ok) {
                    setError(result.message || "Room not found")
                    return
                }

                setRoom(result)
            } catch {
                setError("Unable to load room")
            } finally {
                setLoading(false)
            }
        }

        getRoom()
    }, [roomId])


    // Get camera + microphone
    useEffect(() => {
        async function setupMedia() {
            try {
                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    })

                streamRef.current = stream

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch {
                setError(
                    "Camera or microphone permission was denied."
                )
            }
        }

        setupMedia()

        return () => {
            streamRef.current?.getTracks().forEach(
                (track) => track.stop()
            )
        }
    }, [])


    function toggleCamera() {
        const track =
            streamRef.current?.getVideoTracks()[0]

        if (!track) return

        track.enabled = !track.enabled
        setCameraEnabled(track.enabled)
    }


    function toggleMic() {
        const track =
            streamRef.current?.getAudioTracks()[0]

        if (!track) return

        track.enabled = !track.enabled
        setMicEnabled(track.enabled)
    }


    async function copyLink() {
        if (!roomId) return

        const url =
            `${window.location.origin}/room/${roomId}`

        await navigator.clipboard.writeText(url)

        setCopied(true)

        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }


    function joinMeeting() {
        if (!roomId) return

        // Stop preview tracks.
        // CallRoom will request/use media again.
        streamRef.current?.getTracks().forEach(
            (track) => track.stop()
        )

        navigate(`/room/${roomId}`)
    }


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
                <p className="text-sm text-zinc-500">
                    Preparing your meeting...
                </p>
            </div>
        )
    }


    if (error || !room) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6">

                <div className="text-center">

                    <h1 className="text-2xl font-semibold">
                        Something went wrong
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        {error || "Room not found"}
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                        Back to home
                    </button>

                </div>

            </div>
        )
    }


    return (
        <div className="min-h-screen bg-[#fafafa] text-zinc-950">

            {/* HEADER */}

            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">

                <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 font-semibold text-white">
                        V
                    </div>

                    <span className="font-semibold">
                        VideoMeet
                    </span>

                </div>

                <span className="text-sm text-zinc-500">
                    Before you join
                </span>

            </nav>


            {/* CONTENT */}

            <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-12">

                <div className="grid w-full gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">


                    {/* VIDEO */}

                    <div>

                        <div className="relative aspect-video overflow-hidden rounded-3xl bg-zinc-900 shadow-xl">

                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`h-full w-full object-cover ${
                                    cameraEnabled
                                        ? ""
                                        : "hidden"
                                }`}
                            />

                            {!cameraEnabled && (
                                <div className="flex h-full items-center justify-center">

                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-700 text-3xl font-semibold text-white">
                                        You
                                    </div>

                                </div>
                            )}


                            {/* Name */}

                            <div className="absolute bottom-5 left-5 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur">
                                You
                            </div>

                        </div>


                        {/* CONTROLS */}

                        <div className="mt-5 flex justify-center gap-3">

                            <button
                                onClick={toggleMic}
                                className={`flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium transition ${
                                    micEnabled
                                        ? "bg-white border border-zinc-200"
                                        : "bg-red-500 text-white"
                                }`}
                            >
                                {micEnabled ? "🎤" : "🔇"}
                                {micEnabled ? "Mic on" : "Mic off"}
                            </button>


                            <button
                                onClick={toggleCamera}
                                className={`flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium transition ${
                                    cameraEnabled
                                        ? "bg-white border border-zinc-200"
                                        : "bg-red-500 text-white"
                                }`}
                            >
                                {cameraEnabled ? "📹" : "🚫"}
                                {cameraEnabled
                                    ? "Camera on"
                                    : "Camera off"}
                            </button>

                        </div>

                    </div>


                    {/* INFORMATION */}

                    <div>

                        <p className="text-sm font-medium text-zinc-400">
                            You're about to join
                        </p>

                        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                            {room.name}
                        </h1>


                        <p className="mt-4 leading-7 text-zinc-500">
                            Check your camera and microphone before
                            entering the meeting.
                        </p>


                        {/* LINK */}

                        <div className="mt-8">

                            <label className="text-sm font-medium">
                                Meeting link
                            </label>

                            <div className="mt-2 flex overflow-hidden rounded-xl border border-zinc-200 bg-white">

                                <input
                                    readOnly
                                    value={`${window.location.origin}/room/${room.id}`}
                                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-zinc-500 outline-none"
                                />

                                <button
                                    onClick={copyLink}
                                    className="border-l border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50"
                                >
                                    {copied
                                        ? "Copied"
                                        : "Copy"}
                                </button>

                            </div>

                        </div>


                        {/* JOIN */}

                        <button
                            onClick={joinMeeting}
                            className="mt-7 w-full rounded-xl bg-zinc-950 py-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                            Join meeting
                        </button>


                        <p className="mt-4 text-center text-xs text-zinc-400">
                            You can change your camera and microphone
                            during the meeting too.
                        </p>

                    </div>

                </div>

            </main>

        </div>
    )
}