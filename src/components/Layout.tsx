import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

export function Layout() {
  const [open,setOpen]=useState(false)
  const location=useLocation()

  useEffect(()=>{
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'})
  },[location.pathname])
  function closeMenu(){setOpen(false)}

  return <div className="appShell">
    <header className="siteHeader simpleHeader">
      <div className="headerInner">
        <Link className="brand" to="/" aria-label="WhatTech home" onClick={closeMenu}><img src="/whattech-logo.png" alt="WhatTech"/></Link>
        <nav className={open?'siteNav open':'siteNav'} aria-label="Main navigation">
          <NavLink to="/tools" onClick={closeMenu}>Tools</NavLink>
          <NavLink to="/devices" onClick={closeMenu}>Devices</NavLink>
          <NavLink to="/tools/compare" onClick={closeMenu}>Compare</NavLink>
          <NavLink to="/forum" onClick={closeMenu}>Forum</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        </nav>
        <button type="button" className="navToggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(value=>!value)}>{open?<X/>:<Menu/>}</button>
      </div>
    </header>
    <div className="routeStage" key={location.pathname}><Outlet/></div>
    <footer className="siteFooter">
      <div className="footerInner">
        <Link className="brand footerBrand" to="/" aria-label="WhatTech home"><img src="/whattech-logo.png" alt="WhatTech"/></Link>
        <p>A practical toolbox for decisions about your devices.</p>
        <div><b>Tools</b><Link to="/tools">All tools</Link><Link to="/tools/will-it-work">Compatibility</Link><Link to="/tools/fix-my-device">Troubleshooting</Link></div>
        <div><b>Explore</b><Link to="/devices">Device database</Link><Link to="/forum">Community forum</Link><Link to="/tools/compare">Compare</Link><Link to="/about">How it works</Link></div>
      </div>
      <div className="footerBottom"><span>© {new Date().getFullYear()} WhatTech</span><span>Verified data. Clear uncertainty. Useful decisions.</span></div>
    </footer>
  </div>
}
