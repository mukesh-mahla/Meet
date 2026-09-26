import { useNavigate } from "react-router-dom"

export function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#fafafa] text-zinc-950">

            {/* NAVBAR */}
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        V
                    </div>

                    <span className="text-lg font-semibold tracking-tight">
                        VideoMeet
                    </span>
                </div>

                <div className="hidden items-center gap-8 text-sm text-zinc-500 md:flex">
                    <a
                        href="#features"
                        className="transition hover:text-zinc-950"
                    >
                        Features
                    </a>

                    <a
                        href="#how-it-works"
                        className="transition hover:text-zinc-950"
                    >
                        How it works
                    </a>
                </div>

                <button
                    onClick={() => navigate("/signin")}
                    className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                    Sign in
                </button>
            </nav>


            {/* HERO */}
            <main>

                <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">

                    <div className="mx-auto max-w-4xl text-center">

                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />

                            Simple video meetings, built for the web
                        </div>


                        <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                            Meet.
                            <br />
                            <span className="text-zinc-400">
                                Connect.
                            </span>
                        </h1>


                        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-500">
                            Start a video meeting in seconds. Talk, share your
                            screen, and collaborate with your team without
                            complicated setup.
                        </p>


                        {/* ACTIONS */}
                        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">

                            <button
                                onClick={() => navigate("/meet")}
                                className="rounded-full bg-zinc-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                Create a meeting
                            </button>

                            <button
                                onClick={() => navigate("/join")}
                                className="rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
                            >
                                Join a meeting
                            </button>

                        </div>

                    </div>


                    {/* PRODUCT PREVIEW */}
                    <div className="relative mx-auto mt-20 max-w-5xl">

                        <div className="absolute inset-x-20 top-10 h-40 rounded-full bg-zinc-300/30 blur-3xl" />

                        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 p-2 shadow-2xl">

                            {/* browser header */}
                            <div className="flex h-10 items-center gap-2 px-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />

                                <div className="mx-auto rounded-md bg-zinc-900 px-20 py-1.5 text-[10px] text-zinc-600">
                                    videomeet.app/room/friday-coding
                                </div>

                                <div className="w-12" />
                            </div>


                            {/* meeting preview */}
                            <div className="grid aspect-[16/9] grid-cols-3 gap-2 rounded-2xl bg-zinc-900 p-2">

                                <div className="relative col-span-2 overflow-hidden rounded-xl bg-zinc-800">
                                    <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white">
                                        You
                                    </div>

                                    <div className="flex h-full items-center justify-center">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700 text-2xl font-medium text-zinc-300">
                                            M
                                        </div>
                                    </div>
                                </div>


                                <div className="flex flex-col gap-2">

                                    <div className="relative flex-1 overflow-hidden rounded-xl bg-zinc-800">
                                        <div className="absolute bottom-3 left-3 text-xs text-zinc-300">
                                            Alex
                                        </div>

                                        <div className="flex h-full items-center justify-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-zinc-300">
                                                A
                                            </div>
                                        </div>
                                    </div>


                                    <div className="relative flex-1 overflow-hidden rounded-xl bg-zinc-800">
                                        <div className="absolute bottom-3 left-3 text-xs text-zinc-300">
                                            Sarah
                                        </div>

                                        <div className="flex h-full items-center justify-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-zinc-300">
                                                S
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>

                </section>


                {/* FEATURES */}
                <section
                    id="features"
                    className="border-t border-zinc-200 bg-white"
                >
                    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                                Everything you need
                            </p>

                            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                                Built around the conversation.
                            </h2>

                            <p className="mt-4 text-zinc-500">
                                A focused meeting experience with the tools
                                you actually need during a call.
                            </p>
                        </div>


                        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-200 md:grid-cols-2">

                            <Feature
                                title="Real-time video"
                                description="Connect directly with other participants using WebRTC."
                                icon="◉"
                            />

                            <Feature
                                title="Screen sharing"
                                description="Share your screen when words aren't enough."
                                icon="□"
                            />

                            <Feature
                                title="Room chat"
                                description="Send messages without leaving the meeting."
                                icon="⌁"
                            />

                            <Feature
                                title="Simple rooms"
                                description="Create a room, share its name, and start talking."
                                icon="↗"
                            />

                        </div>

                    </div>
                </section>


                {/* HOW IT WORKS */}
                <section
                    id="how-it-works"
                    className="bg-[#fafafa]"
                >
                    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

                        <div className="mx-auto max-w-2xl text-center">

                            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                                How it works
                            </p>

                            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                                From zero to meeting in seconds.
                            </h2>

                        </div>


                        <div className="mt-16 grid gap-8 md:grid-cols-3">

                            <Step
                                number="01"
                                title="Create a room"
                                description="Give your meeting a unique name and create your room."
                            />

                            <Step
                                number="02"
                                title="Share it"
                                description="Send the room name or meeting link to your participants."
                            />

                            <Step
                                number="03"
                                title="Start talking"
                                description="Join the room and connect through video, audio, chat, and screen sharing."
                            />

                        </div>

                    </div>
                </section>


                {/* CTA */}
                <section className="px-6 py-24">

                    <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-zinc-950 px-8 py-16 text-center text-white">

                        <h2 className="text-4xl font-semibold tracking-tight">
                            Your next meeting starts here.
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                            Create a room and invite your team.
                        </p>

                        <button
                            onClick={() => navigate("/meet")}
                            className="mt-8 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                        >
                            Start a meeting
                        </button>

                    </div>

                </section>

            </main>


            {/* FOOTER */}
            <footer className="border-t border-zinc-200">

                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">

                    <span>
                        © 2026 VideoMeet
                    </span>

                    <span>
                        Built for better conversations.
                    </span>

                </div>

            </footer>

        </div>
    )
}


function Feature({
    title,
    description,
    icon,
}: {
    title: string
    description: string
    icon: string
}) {
    return (
        <div className="bg-white p-8 transition hover:bg-zinc-50">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg">
                {icon}
            </div>

            <h3 className="mt-6 text-lg font-semibold">
                {title}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                {description}
            </p>

        </div>
    )
}


function Step({
    number,
    title,
    description,
}: {
    number: string
    title: string
    description: string
}) {
    return (
        <div>

            <span className="text-sm font-medium text-zinc-400">
                {number}
            </span>

            <h3 className="mt-4 text-xl font-semibold">
                {title}
            </h3>

            <p className="mt-3 leading-7 text-zinc-500">
                {description}
            </p>

        </div>
    )
}