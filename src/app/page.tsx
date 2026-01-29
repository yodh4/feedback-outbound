import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
    MessageSquareDashed, 
    Github, 
    Twitter, 
    Linkedin,
    Sparkles,
    Zap,
    ShieldCheck,
    ArrowRight,
    CheckCircle2
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
                <MessageSquareDashed className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              FeedbackPortal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-3">
                <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-medium">
                    Sign In
                    </Button>
                </Link>
                <Link href="/signup">
                    <Button size="sm" className="font-medium">
                    Get Started
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-600"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative text-center">
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
                    Turn Customer Feedback into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Actionable Insights</span>
                </h1>
                
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    Stop drowning in support tickets. Our AI-powered portal automatically categorizes, prioritizes, and routes user feedback so you can focus on building.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    <Link href="/signup">
                        <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow">
                            Try it Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Simulated UI Mockup */}
                <div className="mt-16 relative mx-auto max-w-5xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm">
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
                            {/* Fake Header */}
                            <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-400/80"></div>
                                    <div className="h-3 w-3 rounded-full bg-amber-400/80"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-400/80"></div>
                                </div>
                                <div className="ml-4 h-6 w-64 rounded bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            {/* Fake Content */}
                            <div className="p-8 grid gap-6">
                                <div className="flex justify-between items-center">
                                    <div className="h-8 w-48 rounded bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="h-8 w-24 rounded bg-blue-600/20"></div>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-700"></div>
                                                    <div className="h-3 w-32 rounded bg-slate-100 dark:bg-slate-800"></div>
                                                </div>
                                            </div>
                                            <div className="h-6 w-20 rounded-full bg-green-100 dark:bg-green-900/30"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                        Everything you need to <span className="text-blue-600 dark:text-blue-400">manage feedback</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        We've optimized every step of the feedback loop so you can build what users actually want.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                AI Classification
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our intelligent engine reads every submission, categorizing it as Bug, Feature, or Improvement automatically.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                Instant Prioritization
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Critical issues are flagged immediately. Don't let game-breaking bugs sit in your backlog unnoticed.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                Status Transparency
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Keep users in the loop. Automated email notifications and status badges ensure they know you're listening.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquareDashed className="h-6 w-6" />
                FeedbackPortal
              </span>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Streamlining product feedback for modern engineering teams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Feedback Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

