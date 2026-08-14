import type { DeviceCategoryDefinition } from '../types/device'

export const categories: DeviceCategoryDefinition[] = [
  { id:'phone',label:'Phones',shortLabel:'Phones' },
  { id:'monitor',label:'Monitors',shortLabel:'Monitors' },
  { id:'laptop',label:'Laptops',shortLabel:'Laptops' },
  { id:'desktop',label:'Desktop PCs',shortLabel:'PCs' },
  { id:'component',label:'PC Components',shortLabel:'Components',subcategories:['CPU','GPU','Motherboard','RAM','PSU','Storage','Case','CPU Cooler','Fans'] },
  { id:'tablet',label:'Tablets',shortLabel:'Tablets' },
  { id:'tv',label:'TVs',shortLabel:'TVs' },
  { id:'console',label:'Game Consoles',shortLabel:'Consoles' },
  { id:'handheld',label:'Handhelds',shortLabel:'Handhelds' },
  { id:'audio',label:'Headphones & Audio',shortLabel:'Audio' },
  { id:'camera',label:'Cameras',shortLabel:'Cameras' },
  { id:'charger',label:'Chargers',shortLabel:'Chargers',subcategories:['USB-C chargers','Laptop chargers','Wireless chargers','Multi-port chargers','Other'] },
  { id:'cable',label:'Cables',shortLabel:'Cables',subcategories:['USB-C','USB-A to USB-C','USB-B','Micro-USB','Mini-USB','Lightning','Thunderbolt','HDMI','DisplayPort','USB-C video','Legacy video','Ethernet','Fiber optic','Direct attach','Telephone','Coaxial','Analog audio','Balanced audio','Digital audio','Speaker wire','MIDI','Internal storage','External storage','Camera cable','AC power','PC power','Solar power','EV charging','Other'] },
  { id:'adapter',label:'Adapters',shortLabel:'Adapters' },
  { id:'dock',label:'Docks & Hubs',shortLabel:'Docks' },
  { id:'storage',label:'Storage',shortLabel:'Storage' },
  { id:'networking',label:'Networking',shortLabel:'Networking' },
  { id:'smart-home',label:'Smart Home',shortLabel:'Smart Home' },
  { id:'wearable',label:'Wearables',shortLabel:'Wearables' },
  { id:'peripheral',label:'Peripherals',shortLabel:'Peripherals' },
  { id:'other',label:'Other Tech',shortLabel:'Other' },
]

export const categoryById = new Map(categories.map(category => [category.id, category]))
