import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              Fintrack
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 max-w-md">
              Take control of your finances with intelligent expense tracking, 
              smart budgeting, and powerful insights. Your financial future starts here.
            </p>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by Tushar Chauhankar</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-zinc-200 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3">
              <Link 
                to="/about" 
                className="text-zinc-400 hover:text-blue-400 transition-colors duration-200 text-sm"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="text-zinc-400 hover:text-blue-400 transition-colors duration-200 text-sm"
              >
                Contact
              </Link>
              <Link 
                to="/privacy" 
                className="text-zinc-400 hover:text-blue-400 transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <a 
                href="https://github.com/tushar6706-Aenaen/fintrack" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-blue-400 transition-colors duration-200 text-sm"
              >
                GitHub Repository
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-zinc-200 mb-4">Connect</h3>
            <div className="flex flex-col gap-3">
              <a 
                href="https://github.com/tushar6706-Aenaen" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-zinc-400 hover:text-blue-400 transition-colors duration-200 text-sm group"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>GitHub</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/tushar-chauhan-a7a112365/" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-zinc-400 hover:text-blue-400 transition-colors duration-200 text-sm group"
              >
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>LinkedIn</span>
              </a>
              <a 
                href="mailto:chauhantushar6700@gmail.com" 
                className="flex items-center gap-3 text-zinc-400 hover:text-blue-400 transition-colors duration-200 text-sm group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-zinc-500 text-sm">
                © {new Date().getFullYear()} Fintrack. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-zinc-500 text-sm">
              <span>Built with React & Supabase</span>
              <span className="hidden md:block">•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
