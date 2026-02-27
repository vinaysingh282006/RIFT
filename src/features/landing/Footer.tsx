import { Github, Video, Heart, Dna } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-20" style={{ background: "hsl(var(--card) / 0.5)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
                <span className="text-primary text-xs font-bold">Rx</span>
              </div>
              <span className="font-bold text-foreground">Pharma<span className="text-primary">Guard</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-Powered Pharmacogenomic Risk Prediction. Built for the RIFT 2026 Precision Medicine Algorithm Track.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Resources</p>
            <div className="space-y-2.5">
              {[
                { icon: Github, label: "GitHub Repository", href: "#" },
                { icon: Video, label: "Demo Video", href: "#" },
                { icon: Dna, label: "CPIC Guidelines", href: "https://cpicpgx.org" },
              ].map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Credits */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Hackathon</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>RIFT 2026 · Precision Medicine Track</p>
              <p>Pharmacogenomics &amp; AI Safety</p>
              <p className="flex items-center gap-1.5 mt-4">
                <Heart size={12} className="text-primary" />
                Built with precision, care &amp; science
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 PharmaGuard. All rights reserved.</p>
          <p>For demonstration purposes only. Not intended for clinical use.</p>
        </div>
      </div>
    </footer>
  );
}
