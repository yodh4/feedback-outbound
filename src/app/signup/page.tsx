'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 1500)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Feedback Portal
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Create your account
                    </p>
                </div>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Sign Up</CardTitle>
                        <CardDescription>
                            Enter your details to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                                <p className="text-green-600 dark:text-green-400 font-medium">Account created!</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Redirecting to dashboard...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="text-slate-900 dark:text-white font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
