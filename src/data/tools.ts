import { ArrowUp, Cable, CircleDollarSign, GitCompareArrows, Search, ShoppingCart, Stethoscope, Wrench } from 'lucide-react'

export const tools = [
  { id:'compatibility', title:'Will It Work?', description:'Check if two devices or accessories are compatible.', action:'Check compatibility', to:'/tools/will-it-work', group:'Check something', icon:Cable, tone:'blue' },
  { id:'fix', title:'Fix My Device', description:'Figure out what is wrong and what to do next.', action:'Diagnose now', to:'/tools/fix-my-device', group:'Solve a problem', icon:Wrench, tone:'orange' },
  { id:'upgrade', title:'Should I Upgrade?', description:'See whether an upgrade is actually worth it.', action:'See upgrade impact', to:'/tools/should-i-upgrade', group:'Make a decision', icon:ArrowUp, tone:'green' },
  { id:'repair', title:'Repair or Replace?', description:'Check whether a repair makes financial sense.', action:'Run analysis', to:'/tools/repair-or-replace', group:'Solve a problem', icon:Stethoscope, tone:'yellow' },
  { id:'value', title:'What’s It Worth?', description:'Estimate the current value of your tech.', action:'Get value estimate', to:'/tools/whats-it-worth', group:'Make a decision', icon:CircleDollarSign, tone:'violet' },
  { id:'need', title:'What Do I Need?', description:'Find the right cable, charger, adapter, or dock.', action:'Find what you need', to:'/tools/what-do-i-need', group:'Find something', icon:Search, tone:'cyan' },
  { id:'buy', title:'What Should I Buy?', description:'Get recommendations for your needs and budget.', action:'Get recommendations', to:'/tools/what-should-i-buy', group:'Find something', icon:ShoppingCart, tone:'gold' },
  { id:'compare', title:'Compare Devices', description:'Compare two products by real-world impact.', action:'Compare now', to:'/tools/compare', group:'Check something', icon:GitCompareArrows, tone:'navy' },
] as const
