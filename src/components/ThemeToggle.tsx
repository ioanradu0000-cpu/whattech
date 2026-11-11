import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const THEME_KEY='whattech.theme'
const THEME_EVENT='whattech:theme'

function systemTheme():Theme{return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
function savedTheme():Theme{
  try{const saved=localStorage.getItem(THEME_KEY);return saved==='dark'||saved==='light'?saved:systemTheme()}
  catch{return systemTheme()}
}
function currentTheme():Theme{return document.documentElement.dataset.theme==='dark'?'dark':'light'}
function applyTheme(theme:Theme){
  document.documentElement.dataset.theme=theme
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0b1017':'#ff4b16')
}
function subscribe(onChange:()=>void){
  const media=window.matchMedia('(prefers-color-scheme: dark)')
  const handleTheme=()=>onChange()
  const handleStorage=(event:StorageEvent)=>{if(event.key===THEME_KEY){applyTheme(savedTheme());onChange()}}
  const handleSystem=()=>{try{if(!localStorage.getItem(THEME_KEY)){applyTheme(systemTheme());onChange()}}catch{applyTheme(systemTheme());onChange()}}
  window.addEventListener(THEME_EVENT,handleTheme)
  window.addEventListener('storage',handleStorage)
  media.addEventListener('change',handleSystem)
  return()=>{window.removeEventListener(THEME_EVENT,handleTheme);window.removeEventListener('storage',handleStorage);media.removeEventListener('change',handleSystem)}
}

export function ThemeToggle(){
  const theme=useSyncExternalStore(subscribe,currentTheme,()=> 'light')
  const nextTheme=theme==='dark'?'light':'dark'
  function toggle(){
    applyTheme(nextTheme)
    try{localStorage.setItem(THEME_KEY,nextTheme)}catch{/* Theme still applies when storage is unavailable. */}
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return <button type="button" className="themeToggle" aria-label={`Switch to ${nextTheme} mode`} aria-pressed={theme==='dark'} title={`Switch to ${nextTheme} mode`} onClick={toggle}>
    {theme==='dark'?<Sun/>:<Moon/>}<span>{theme==='dark'?'Light':'Dark'}</span>
  </button>
}
