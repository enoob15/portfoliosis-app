import Link from "next/link";
import { ArrowRight, FileText, Layout, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Layout className="w-5 h-5" />
          </div>
          Portfoliosis
        </div>
        <nav className="flex gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Portfolio Builder</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transform your Resume into a <span className="text-blue-600 dark:text-blue-500">Masterpiece</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop struggling with templates. Drop your resume, and let our multi-model AI agent build a stunning, professional portfolio website for you in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Build My Portfolio
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              Log in
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-slate-100 dark:bg-slate-900 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Smart Parsing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Supported by GPT-4, our parser extracts every detail from your PDF or DOCX resume with near-perfect accuracy.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">AI Enhancement</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Claude & Gemini analyze your profile to rewrite descriptions, highlight skills, and infer missing context.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Instant Deploy</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get a personal website deployed to Vercel in one click. Fully responsive, SEO-optimized, and yours to keep.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-slate-500 dark:text-slate-500 text-sm">
        <p>© 2026 Portfoliosis. All rights reserved.</p>
      </footer>
    </div>
  );
}
