
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authClient } from "../lib/auth-client"

export function Signup() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        setError("")
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { error } = await authClient.signUp.email({
            name,
            email,
            password,
        })

        if (error) {
            setError(error.message || "Something went wrong")
            setLoading(false)
            return
        }

        // Signup succeeded and Better Auth created the session.
        navigate("/meet", { replace: true })
    }

    function handleNavigate() {
        navigate("/signin")
    }

    return (
        <div className="min-h-screen w-full bg-amber-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create an account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign up to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Your name"
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={handleNavigate}
                        disabled={loading}
                        className="font-semibold text-gray-900 hover:underline"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    )
}

