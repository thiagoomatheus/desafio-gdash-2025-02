import { Github, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 backdrop-blur-sm py-6 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        
        <div className="flex flex-col items-center md:items-start">
          <span className="font-semibold text-slate-700">GDASH Energy System</span>
          <span>© 2025 Todos os direitos reservados.</span>
        </div>
        
        <div className="flex items-center gap-1 order-3 md:order-2">
          Desenvolvido com <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> para o Processo Seletivo
        </div>
        
        <div className="flex items-center gap-4 order-2 md:order-3">
          <a 
            href="https://github.com/thiagoomatheus" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <Github size={18} />
          </a>
          <a 
            href="https://linkedin.com/in/thiagoomatheus" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
          >
            <Linkedin size={18} />
          </a>
        </div>

      </div>
    </footer>
  );
}