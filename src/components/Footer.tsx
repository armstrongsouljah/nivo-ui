// Social icons as inline SVGs (lucide-react version doesn't include social brands)

const footerLinks = {
  Shop: ["New Arrivals", "Tops", "Bottoms", "Hoodies", "Accessories", "Sale"],
  Help: ["Size Guide", "Shipping & Returns", "FAQ", "Contact Us", "Track Order"],
  About: ["Our Story", "Sustainability", "Careers", "Press"],
};

export default function Footer() {
  return (
    <footer className="bg-black text-zinc-400 pt-12 pb-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <a href="/" className="text-white font-black text-2xl tracking-widest uppercase block mb-3">
              Nivo
            </a>
            <p className="text-xs leading-relaxed mb-5 max-w-xs">
              Fresh, street-ready fits for boys who move. Quality you can trust, style they&apos;ll love.
            </p>
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" aria-label="TikTok" className="hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white text-xs font-black tracking-[0.2em] uppercase mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-600 order-2 sm:order-1">
            &copy; {new Date().getFullYear()} Nivo. All rights reserved.
          </p>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <a href="#" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
