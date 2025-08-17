import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 p-6">
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h2 className="font-bold text-lg">ExpenseTracker</h2>
          <p className="text-zinc-400 text-sm mt-2">
            Track your expenses, manage budgets, and stay in control.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <a href="#" className="hover:text-emerald-400">About</a>
          <a href="#" className="hover:text-emerald-400">Contact</a>
          <a href="#" className="hover:text-emerald-400">Privacy Policy</a>
        </div>

        {/* Social */}
        <div className="flex gap-4">
          <a href="https://github.com/tushar6706-Aenaen" className="hover:text-emerald-400"><Github /></a>
          <a href="#" className="hover:text-emerald-400"><Twitter /></a>
          <a href="https://www.linkedin.com/in/tushar-chauhan-a7a112365/" className="hover:text-emerald-400"><Linkedin /></a>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-4 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} ExpenseTracker. All rights reserved.
      </div>
    </footer>
  );
}
