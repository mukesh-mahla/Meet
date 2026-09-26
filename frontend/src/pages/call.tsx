import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { authClient } from "../lib/auth-client"
import type { BetterFetchError } from "better-auth/react"
import type { SessionQueryParams } from "better-auth"

type SessionData = {
    session: {
        id: string
        userId: string
        expiresAt: Date
        createdAt: Date
        updatedAt: Date
        ipAddress: string
        userAgent: string
        token: string
    }
    user: {
        id: string
        name: string
        email: string
        emailVerified: boolean
        image?: string | null
        createdAt: Date
        updatedAt: Date
    }
}

type Message = {
    from: string
    payload: string
}

export function CallRoom() {
    const { roomId } = useParams()

    const { data, isPending } = authClient.useSession() as {
        data: SessionData | null
        isPending: boolean
        isRefetching: boolean
        error: BetterFetchError | null
        refetch: (queryParams?: {
            query?: SessionQueryParams
        }) => Promise<void>
    }

    const wsRef = useRef<WebSocket | null>(null)
    const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map())

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const inputRef = useRef<HTMLInputElement | null>(null)

    const iceCandidateBuffer = useRef<
        {
            from: string
            candidate: RTCIceCandidateInit
        }[]
    >([])

    const [remoteStreams, setRemoteStreams] =
        useState<Map<string, MediaStream>>(new Map())

    const [messages, setMessages] = useState<Message[]>([])

    const [micEnabled, setMicEnabled] = useState(true)
    const [cameraEnabled, setCameraEnabled] = useState(true)
    const [screenSharing, setScreenSharing] = useState(false)

    const [chatOpen, setChatOpen] = useState(false)
    const [participantsOpen, setParticipantsOpen] =
        useState(false)

    const [roomName] = useState("Friday Coding")

    /*
    |--------------------------------------------------------------------------
    | CAMERA
    |--------------------------------------------------------------------------
    */

    async function setupCamera() {
        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })

        streamRef.current = stream

        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }

    /*
    |--------------------------------------------------------------------------
    | MICROPHONE
    |--------------------------------------------------------------------------
    */

    function toggleMicrophone() {
        const track =
            streamRef.current?.getAudioTracks()[0]

        if (!track) return

        track.enabled = !track.enabled

        setMicEnabled(track.enabled)
    }

    /*
    |--------------------------------------------------------------------------
    | CAMERA TOGGLE
    |--------------------------------------------------------------------------
    */

    function toggleCamera() {
        const track =
            streamRef.current?.getVideoTracks()[0]

        if (!track) return

        track.enabled = !track.enabled

        setCameraEnabled(track.enabled)
    }

    /*
    |--------------------------------------------------------------------------
    | SCREEN SHARE
    |--------------------------------------------------------------------------
    */

    async function startScreenShare() {
        try {
            const screenStream =
                await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                })

            const screenTrack =
                screenStream.getVideoTracks()[0]

            pcsRef.current.forEach((pc) => {
                const sender = pc
                    .getSenders()
                    .find(
                        (sender) =>
                            sender.track?.kind ===
                            "video"
                    )

                if (sender) {
                    sender.replaceTrack(
                        screenTrack
                    )
                }
            })

            if (videoRef.current) {
                videoRef.current.srcObject =
                    screenStream
            }

            setScreenSharing(true)

            screenTrack.onended = () => {
                stopScreenShare()
            }
        } catch {
            // User cancelled screen sharing.
        }
    }

    async function stopScreenShare() {
        const cameraTrack =
            streamRef.current?.getVideoTracks()[0]

        if (!cameraTrack) return

        pcsRef.current.forEach((pc) => {
            const sender = pc
                .getSenders()
                .find(
                    (sender) =>
                        sender.track?.kind ===
                        "video"
                )

            if (sender) {
                sender.replaceTrack(
                    cameraTrack
                )
            }
        })

        if (videoRef.current) {
            videoRef.current.srcObject =
                streamRef.current
        }

        setScreenSharing(false)
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE PEER CONNECTION
    |--------------------------------------------------------------------------
    */

    function createPeerConnection(
        remoteUserId: string,
        stream: MediaStream
    ) {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
        })

        /*
        | ICE
        */

        pc.onicecandidate = (event) => {
            if (
                event.candidate &&
                wsRef.current?.readyState ===
                    WebSocket.OPEN
            ) {
                wsRef.current.send(
                    JSON.stringify({
                        type: "signal",
                        roomId,
                        signalType:
                            "ice-candidate",
                        to: remoteUserId,
                        payload: event.candidate,
                    })
                )
            }
        }

        /*
        | REMOTE TRACK
        */

        pc.ontrack = (event) => {
            setRemoteStreams((prev) => {
                const next = new Map(prev)

                next.set(
                    remoteUserId,
                    event.streams[0]
                )

                return next
            })
        }

        /*
        | LOCAL TRACKS
        */

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream)
        })

        pcsRef.current.set(
            remoteUserId,
            pc
        )

        return pc
    }

    /*
    |--------------------------------------------------------------------------
    | ICE BUFFER
    |--------------------------------------------------------------------------
    */

    async function flushIceCandidates(
        remoteUserId: string,
        pc: RTCPeerConnection
    ) {
        const pending =
            iceCandidateBuffer.current.filter(
                (candidate) =>
                    candidate.from === remoteUserId
            )

        for (const { candidate } of pending) {
            await pc.addIceCandidate(
                new RTCIceCandidate(candidate)
            )
        }

        iceCandidateBuffer.current =
            iceCandidateBuffer.current.filter(
                (candidate) =>
                    candidate.from !== remoteUserId
            )
    }

    /*
    |--------------------------------------------------------------------------
    | WEBSOCKET + WEBRTC
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!data || !roomId) return

        const ws = new WebSocket(
            "ws://localhost:3000"
        )

        wsRef.current = ws

        ws.onopen = () => {
            console.log("connected")

            ws.send(
                JSON.stringify({
                    type: "join_room",
                    roomId,
                    userId: data.user.id,
                })
            )
        }

        const mediaPromise = setupCamera()

        ws.onmessage = async (event) => {
            const message = JSON.parse(
                event.data
            )

            /*
            |--------------------------------------------------------------------------
            | EXISTING USERS
            |--------------------------------------------------------------------------
            */

            if (
                message.type ===
                "existing_users"
            ) {
                await mediaPromise

                if (!streamRef.current) return

                for (const userId of message.users) {
                    const pc =
                        createPeerConnection(
                            userId,
                            streamRef.current
                        )

                    const offer =
                        await pc.createOffer()

                    await pc.setLocalDescription(
                        offer
                    )

                    wsRef.current?.send(
                        JSON.stringify({
                            type: "signal",
                            roomId,
                            signalType: "offer",
                            to: userId,
                            payload: offer,
                        })
                    )
                }
            }

            /*
            |--------------------------------------------------------------------------
            | NEW USER
            |--------------------------------------------------------------------------
            */

            if ( message.type === "user_joined") {
                await mediaPromise

                if (!streamRef.current) return

                createPeerConnection(
                    message.userId,
                    streamRef.current
                )
            }

            /*
            |--------------------------------------------------------------------------
            | OFFER
            |--------------------------------------------------------------------------
            */

            if (
                message.type === "signal" &&
                message.signalType === "offer"
            ) {
                await mediaPromise

                if (!streamRef.current) return

                const pc =
                    pcsRef.current.get(
                        message.from
                    ) ||
                    createPeerConnection(
                        message.from,
                        streamRef.current
                    )

                await pc.setRemoteDescription(
                    new RTCSessionDescription(
                        message.payload
                    )
                )

                const answer =
                    await pc.createAnswer()

                await pc.setLocalDescription(
                    answer
                )

                await flushIceCandidates(
                    message.from,
                    pc
                )

                wsRef.current?.send(
                    JSON.stringify({
                        type: "signal",
                        roomId,
                        signalType: "answer",
                        to: message.from,
                        payload: answer,
                    })
                )
            }

            /*
            |--------------------------------------------------------------------------
            | ANSWER
            |--------------------------------------------------------------------------
            */

            if (
                message.type === "signal" &&
                message.signalType === "answer"
            ) {
                const pc =
                    pcsRef.current.get(
                        message.from
                    )

                if (pc) {
                    await pc.setRemoteDescription(
                        new RTCSessionDescription(
                            message.payload
                        )
                    )

                    await flushIceCandidates(
                        message.from,
                        pc
                    )
                }
            }

            /*
            |--------------------------------------------------------------------------
            | ICE CANDIDATE
            |--------------------------------------------------------------------------
            */

            if (
                message.type === "signal" &&
                message.signalType ===
                    "ice-candidate"
            ) {
                const pc =
                    pcsRef.current.get(
                        message.from
                    )

                if (!pc) return

                if (pc.remoteDescription) {
                    await pc.addIceCandidate(
                        new RTCIceCandidate(
                            message.payload
                        )
                    )
                } else {
                    iceCandidateBuffer.current.push(
                        {
                            from: message.from,
                            candidate:
                                message.payload,
                        }
                    )
                }
            }

            /*
            |--------------------------------------------------------------------------
            | CHAT
            |--------------------------------------------------------------------------
            */

            if (message.type === "text") {
                setMessages((prev) => [
                    ...prev,
                    {
                        from: message.from,
                        payload:
                            message.payload,
                    },
                ])
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CLEANUP
        |--------------------------------------------------------------------------
        */

        return () => {
            streamRef.current
                ?.getTracks()
                .forEach((track) =>
                    track.stop()
                )

            pcsRef.current.forEach((pc) =>
                pc.close()
            )

            pcsRef.current.clear()

            ws.close()
        }
    }, [data, roomId])

    /*
    |--------------------------------------------------------------------------
    | CHAT
    |--------------------------------------------------------------------------
    */

    function sendMessage() {
        const input = inputRef.current

        if (!input) return

        const text = input.value.trim()

        if (!text) return

        if (
            wsRef.current?.readyState ===
            WebSocket.OPEN
        ) {
            wsRef.current.send(
                JSON.stringify({
                    type: "chat",
                    userId: data?.user.id,
                    payload: text,
                    roomId,
                })
            )
        }

        setMessages((prev) => [
            ...prev,
            {
                from:
                    data?.user.name ??
                    "You",
                payload: text,
            },
        ])

        input.value = ""
    }

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (isPending || !data) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#111] text-white">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

                    <p className="text-sm text-zinc-400">
                        Joining meeting...
                    </p>
                </div>
            </div>
        )
    }

    const participantCount =
        remoteStreams.size + 1

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#111] text-white">

            {/* HEADER */}

            <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#161616] px-5">

                <div className="flex items-center gap-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold text-black">
                        V
                    </div>

                    <div>
                        <h1 className="text-sm font-semibold">
                            {roomName}
                        </h1>

                        <p className="text-xs text-zinc-500">
                            {participantCount}{" "}
                            {participantCount === 1
                                ? "participant"
                                : "participants"}
                        </p>
                    </div>

                </div>

                <div className="flex items-center gap-1">

                    <button
                        onClick={() =>
                            setParticipantsOpen(
                                !participantsOpen
                            )
                        }
                        className="rounded-xl px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                    >
                        👥 {participantCount}
                    </button>

                    <button
                        onClick={() =>
                            setChatOpen(!chatOpen)
                        }
                        className={`rounded-xl px-4 py-2 text-sm transition ${
                            chatOpen
                                ? "bg-white/10 text-white"
                                : "text-zinc-300 hover:bg-white/10"
                        }`}
                    >
                        💬
                    </button>

                    <button className="rounded-xl px-3 py-2 text-zinc-400 transition hover:bg-white/10">
                        ⋮
                    </button>

                </div>

            </header>


            {/* MAIN */}

            <main className="flex min-h-0 flex-1">

                {/* VIDEO AREA */}

                <div className="relative flex min-w-0 flex-1 items-center justify-center p-5">

                    <div
                        className={`grid h-full w-full gap-3 ${
                            remoteStreams.size === 0
                                ? "grid-cols-1"
                                : remoteStreams.size === 1
                                ? "grid-cols-2"
                                : "grid-cols-2 lg:grid-cols-3"
                        }`}
                    >

                        {/* LOCAL VIDEO */}

                        <div className="relative min-h-0 overflow-hidden rounded-2xl bg-zinc-900">

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

                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-700 text-3xl font-semibold">
                                        {data.user.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                </div>
                            )}

                            <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs backdrop-blur">
                                {data.user.name}

                                <span className="text-zinc-400">
                                    {" "}
                                    · You
                                </span>
                            </div>

                        </div>


                        {/* REMOTE VIDEOS */}

                        {Array.from(
                            remoteStreams.entries()
                        ).map(
                            ([
                                userId,
                                stream,
                            ]) => (
                                <div
                                    key={userId}
                                    className="relative min-h-0 overflow-hidden rounded-2xl bg-zinc-900"
                                >

                                    <video
                                        autoPlay
                                        playsInline
                                        ref={(el) => {
                                            if (el) {
                                                el.srcObject =
                                                    stream
                                            }
                                        }}
                                        className="h-full w-full object-cover"
                                    />

                                    <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs backdrop-blur">
                                        Participant
                                    </div>

                                </div>
                            )
                        )}

                    </div>


                    {/* CONNECTION */}

                    <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur">

                        <span className="h-2 w-2 rounded-full bg-green-500" />

                        Connected

                    </div>

                </div>


                {/* CHAT */}

                {chatOpen && (
                    <aside className="flex w-80 shrink-0 flex-col border-l border-white/10 bg-[#161616]">

                        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">

                            <h2 className="font-semibold">
                                Chat
                            </h2>

                            <button
                                onClick={() =>
                                    setChatOpen(false)
                                }
                                className="rounded-lg px-2 py-1 text-xl text-zinc-400 hover:bg-white/10"
                            >
                                ×
                            </button>

                        </div>


                        <div className="flex-1 overflow-y-auto p-4">

                            {messages.length ===
                            0 ? (
                                <div className="flex h-full items-center justify-center text-center">

                                    <div>
                                        <div className="mb-3 text-3xl">
                                            💬
                                        </div>

                                        <p className="text-sm text-zinc-400">
                                            No messages yet
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-600">
                                            Send a message
                                            to everyone
                                        </p>
                                    </div>

                                </div>
                            ) : (
                                <div className="space-y-4">

                                    {messages.map(
                                        (
                                            message,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                            >
                                                <p className="mb-1 text-xs text-zinc-500">
                                                    {
                                                        message.from
                                                    }
                                                </p>

                                                <div className="inline-block max-w-[90%] rounded-xl bg-zinc-800 px-3 py-2 text-sm text-zinc-200">
                                                    {
                                                        message.payload
                                                    }
                                                </div>
                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </div>


                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                sendMessage()
                            }}
                            className="border-t border-white/10 p-3"
                        >

                            <div className="flex gap-2 rounded-xl bg-zinc-900 p-1">

                                <input
                                    ref={inputRef}
                                    placeholder="Message everyone..."
                                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-600"
                                />

                                <button
                                    type="submit"
                                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black"
                                >
                                    ↑
                                </button>

                            </div>

                        </form>

                    </aside>
                )}

            </main>


            {/* CONTROLS */}

            <footer className="flex h-24 shrink-0 items-center justify-center border-t border-white/10 bg-[#161616]">

                <div className="flex items-center gap-3">

                    {/* MICROPHONE */}

                    <button
                        onClick={
                            toggleMicrophone
                        }
                        title={
                            micEnabled
                                ? "Mute microphone"
                                : "Unmute microphone"
                        }
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                            micEnabled
                                ? "bg-zinc-800 hover:bg-zinc-700"
                                : "bg-red-500 hover:bg-red-600"
                        }`}
                    >
                        {micEnabled
                            ? "🎤"
                            : "🔇"}
                    </button>


                    {/* CAMERA */}

                    <button
                        onClick={toggleCamera}
                        title={
                            cameraEnabled
                                ? "Turn camera off"
                                : "Turn camera on"
                        }
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                            cameraEnabled
                                ? "bg-zinc-800 hover:bg-zinc-700"
                                : "bg-red-500 hover:bg-red-600"
                        }`}
                    >
                        {cameraEnabled
                            ? "📹"
                            : "🚫"}
                    </button>


                    {/* SCREEN SHARE */}

                    <button
                        onClick={
                            screenSharing
                                ? stopScreenShare
                                : startScreenShare
                        }
                        className={`flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium transition ${
                            screenSharing
                                ? "bg-white text-black"
                                : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                    >
                        🖥

                        <span className="hidden sm:inline">
                            {screenSharing
                                ? "Stop sharing"
                                : "Share"}
                        </span>
                    </button>


                    {/* CHAT */}

                    <button
                        onClick={() =>
                            setChatOpen(
                                !chatOpen
                            )
                        }
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                            chatOpen
                                ? "bg-white text-black"
                                : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                    >
                        💬
                    </button>


                    {/* LEAVE */}

                    <button
                        onClick={() => {
                            window.location.href =
                                "/"
                        }}
                        className="ml-4 flex h-12 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-semibold transition hover:bg-red-600"
                    >
                        <span>☎</span>

                        <span className="hidden sm:inline">
                            Leave
                        </span>
                    </button>

                </div>

            </footer>

        </div>
    )
}