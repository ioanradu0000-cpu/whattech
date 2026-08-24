import type { Device, DeviceCategory } from '../types/device.ts'

type ModelRow=[model:string,year:number,low:number,high:number]
type Family={brand:string;category:DeviceCategory;subcategory?:string;ports:string[];protocols:string[];models:ModelRow[];input?:number;output?:number;display?:Device['display']}

const families:Family[]=[
  {brand:'Apple',category:'phone',ports:['Lightning'],protocols:['USB PD','Qi','Bluetooth 5.0','Wi-Fi 5'],input:18,models:[['iPhone X',2017,70,120],['iPhone 8',2017,55,95],['iPhone 8 Plus',2017,70,120],['iPhone XS Max',2018,120,180],['iPhone SE 2nd generation',2020,75,125]]},
  {brand:'Samsung',category:'phone',ports:['USB-C'],protocols:['USB PD','PPS','Qi','Bluetooth 5.0','Wi-Fi 6'],input:25,models:[['Galaxy S20',2020,110,170],['Galaxy S20+',2020,125,190],['Galaxy S20 Ultra',2020,150,230],['Galaxy S20 FE',2020,100,160],['Galaxy S21',2021,140,210],['Galaxy S21+',2021,165,240],['Galaxy S22+',2022,210,290],['Galaxy Note20',2020,135,205],['Galaxy Note20 Ultra',2020,190,280]]},
  {brand:'Samsung',category:'phone',ports:['USB-C'],protocols:['USB PD','Bluetooth 5.2','Wi-Fi 5'],input:25,models:[['Galaxy A52 5G',2021,90,145],['Galaxy A53 5G',2022,110,170],['Galaxy A34 5G',2023,120,180],['Galaxy A15 5G',2023,80,125],['Galaxy A25 5G',2023,110,165]]},
  {brand:'Google',category:'phone',ports:['USB-C'],protocols:['USB PD','Qi','Bluetooth 5.0','Wi-Fi 6'],input:18,models:[['Pixel 4a',2020,75,120],['Pixel 5',2020,100,155],['Pixel 5a',2021,95,150],['Pixel 6',2021,130,190],['Pixel 6a',2022,120,180],['Pixel 7',2022,190,270]]},
  {brand:'OnePlus',category:'phone',ports:['USB-C'],protocols:['USB PD','Warp Charge','Bluetooth 5.2','Wi-Fi 6'],input:65,models:[['OnePlus 8 Pro',2020,120,190],['OnePlus 9',2021,145,215],['OnePlus 9 Pro',2021,175,260],['OnePlus 10 Pro',2022,220,310],['Nord 2 5G',2021,100,155],['Nord CE 3 Lite',2023,120,175]]},
  {brand:'Xiaomi',category:'phone',ports:['USB-C'],protocols:['USB PD','Quick Charge','Bluetooth 5.2','Wi-Fi 6'],input:67,models:[['Mi 11',2021,140,210],['Xiaomi 12',2022,200,285],['Xiaomi 13',2023,310,420],['POCO X6 Pro',2024,220,300],['Redmi Note 12 Pro 5G',2022,130,190]]},
  {brand:'Huawei',category:'phone',ports:['USB-C'],protocols:['USB PD','SuperCharge','Qi','Bluetooth 5.1','Wi-Fi 6'],input:66,models:[['P30 Pro',2019,100,165],['P40 Pro',2020,135,210],['Mate 50 Pro',2022,300,420]]},
  {brand:'OPPO',category:'phone',ports:['USB-C'],protocols:['USB PD','SuperVOOC','Qi','Bluetooth 5.2','Wi-Fi 6'],input:80,models:[['Find X5 Pro',2022,260,360],['Find X6 Pro',2023,420,560],['Reno 10 Pro',2023,220,310]]},
  {brand:'Sony',category:'phone',ports:['USB-C','3.5mm','microSD'],protocols:['USB PD','Qi','Bluetooth 5.3','Wi-Fi 6E'],input:30,models:[['Xperia 1 V',2023,430,580],['Xperia 5 V',2023,370,500],['Xperia 10 V',2023,190,270]]},
  {brand:'ASUS',category:'phone',ports:['USB-C','3.5mm'],protocols:['USB PD','PPS','Qi','Bluetooth 5.4','Wi-Fi 7'],input:65,models:[['ROG Phone 8 Pro',2024,650,850],['Zenfone 10',2023,380,500]]},
  {brand:'Fairphone',category:'phone',ports:['USB-C'],protocols:['USB PD','Bluetooth 5.1','Wi-Fi 6'],input:20,models:[['Fairphone 4',2021,220,310]]},
  {brand:'Nokia',category:'phone',ports:['USB-C','3.5mm','microSD'],protocols:['USB PD','Bluetooth 5.1','Wi-Fi 5'],input:20,models:[['G42 5G',2023,90,140],['XR21',2023,250,340]]},

  {brand:'Apple',category:'laptop',ports:['Thunderbolt 3','USB-C','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6','Bluetooth 5.0'],input:61,display:{maxResolution:'6K',maxRefreshHz:60},models:[['MacBook Pro 13 M1',2020,500,680],['MacBook Pro 13 M2',2022,700,900],['MacBook Air Intel 2020',2020,260,380]]},
  {brand:'Apple',category:'laptop',ports:['Thunderbolt 4','USB-C','MagSafe 3','HDMI 2.1','3.5mm','SDXC'],protocols:['USB PD','DisplayPort','Wi-Fi 6E','Bluetooth 5.3'],input:96,display:{maxResolution:'8K',maxRefreshHz:60,hdmiVersion:'2.1'},models:[['MacBook Pro 14 M2 Pro',2023,1050,1350],['MacBook Pro 14 M3 Pro',2023,1250,1580],['MacBook Pro 16 M2 Pro',2023,1300,1650]]},
  {brand:'Apple',category:'laptop',ports:['Thunderbolt 4','USB-C','MagSafe 3','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6E','Bluetooth 5.3'],input:70,display:{maxResolution:'6K',maxRefreshHz:60},models:[['MacBook Air M2 15-inch',2023,680,860],['MacBook Air M3 15-inch',2024,820,1020]]},
  {brand:'Dell',category:'laptop',ports:['Thunderbolt 4','USB-C','3.5mm'],protocols:['USB PD','DisplayPort 1.4','Wi-Fi 6E','Bluetooth 5.2'],input:65,display:{maxResolution:'4K',maxRefreshHz:60},models:[['XPS 13 9310',2020,330,470],['XPS 13 Plus 9320',2022,520,720],['XPS 15 9520',2022,650,880]]},
  {brand:'Dell',category:'laptop',ports:['USB-C','USB-A','HDMI 2.0','Ethernet','3.5mm'],protocols:['USB PD','DisplayPort 1.4','Wi-Fi 6','Bluetooth 5.2'],input:65,display:{maxResolution:'4K',maxRefreshHz:60,hdmiVersion:'2.0'},models:[['Latitude 5420',2021,280,410],['Latitude 5430',2022,380,520],['Inspiron 15 3530',2023,330,470]]},
  {brand:'Dell',category:'laptop',subcategory:'Gaming laptop',ports:['Thunderbolt 4','USB-C','USB-A','HDMI 2.1','Ethernet','3.5mm'],protocols:['DisplayPort 1.4','Wi-Fi 7','Bluetooth 5.4'],input:240,display:{maxResolution:'8K',maxRefreshHz:120,hdmiVersion:'2.1'},models:[['Alienware m16 R2',2024,1250,1650],['Alienware x16 R2',2024,1650,2150]]},
  {brand:'Lenovo',category:'laptop',ports:['USB-C','USB-A','HDMI','Ethernet','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6','Bluetooth 5.1'],input:65,display:{maxResolution:'4K',maxRefreshHz:60},models:[['ThinkPad T480',2018,160,260],['ThinkPad T14 Gen 2',2021,350,500],['ThinkPad X1 Carbon Gen 9',2021,430,600],['ThinkPad L14 Gen 4',2023,470,650],['ThinkPad E14 Gen 5',2023,430,590]]},
  {brand:'Lenovo',category:'laptop',subcategory:'Gaming laptop',ports:['USB-C','USB-A','HDMI 2.1','Ethernet','3.5mm'],protocols:['USB PD','DisplayPort 1.4','Wi-Fi 6E','Bluetooth 5.2'],input:230,display:{maxResolution:'8K',maxRefreshHz:60,hdmiVersion:'2.1'},models:[['Legion 5 Pro 16ACH6H',2021,650,880],['Legion Slim 5 16APH8',2023,780,1050]]},
  {brand:'Lenovo',category:'laptop',subcategory:'2-in-1',ports:['Thunderbolt 4','USB-C','USB-A','HDMI 2.0','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6E','Bluetooth 5.2'],input:65,display:{maxResolution:'4K',maxRefreshHz:60},models:[['Yoga 7i 14 Gen 8',2023,560,760],['Yoga Slim 7 Pro X',2022,620,830]]},
  {brand:'HP',category:'laptop',ports:['Thunderbolt 4','USB-C','USB-A','HDMI 2.0','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6E','Bluetooth 5.2'],input:65,display:{maxResolution:'4K',maxRefreshHz:60},models:[['EliteBook 840 G8',2021,320,470],['ProBook 450 G10',2023,480,680],['Spectre x360 13.5 2022',2022,620,850]]},
  {brand:'HP',category:'laptop',subcategory:'Gaming laptop',ports:['USB-C','USB-A','HDMI 2.1','Ethernet','3.5mm'],protocols:['DisplayPort 1.4','Wi-Fi 6E','Bluetooth 5.2'],input:230,display:{maxResolution:'8K',maxRefreshHz:60,hdmiVersion:'2.1'},models:[['Victus 16 2023',2023,650,900],['OMEN 16 2023',2023,850,1150]]},
  {brand:'ASUS',category:'laptop',ports:['USB-C','USB-A','HDMI 2.0','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6','Bluetooth 5.2'],input:65,display:{maxResolution:'4K',maxRefreshHz:60},models:[['VivoBook 15 X1504',2023,330,460],['Zenbook 14 UX3402',2022,520,700]]},
  {brand:'ASUS',category:'laptop',subcategory:'Gaming laptop',ports:['USB-C','USB-A','HDMI 2.1','Ethernet','3.5mm'],protocols:['DisplayPort 1.4','Wi-Fi 6E','Bluetooth 5.2'],input:240,display:{maxResolution:'8K',maxRefreshHz:60,hdmiVersion:'2.1'},models:[['ROG Zephyrus G14 2022',2022,750,1000],['TUF Gaming A15 2022',2022,570,790]]},
  {brand:'Acer',category:'laptop',ports:['USB-C','USB-A','HDMI 2.0','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6','Bluetooth 5.2'],input:65,display:{maxResolution:'4K',maxRefreshHz:60},models:[['Swift 3 SF314-512',2022,380,520],['TravelMate P2 TMP214-55',2023,430,590]]},
  {brand:'Acer',category:'laptop',subcategory:'Gaming laptop',ports:['USB-C','USB-A','HDMI 2.1','Ethernet','3.5mm'],protocols:['DisplayPort 1.4','Wi-Fi 6','Bluetooth 5.2'],input:180,display:{maxResolution:'8K',maxRefreshHz:60,hdmiVersion:'2.1'},models:[['Nitro 5 AN515-58',2022,560,780],['Nitro 16 AN16-41',2023,780,1050]]},
  {brand:'MSI',category:'laptop',ports:['USB-C','USB-A','HDMI 2.0','3.5mm'],protocols:['USB PD','DisplayPort','Wi-Fi 6','Bluetooth 5.2'],input:65,display:{maxResolution:'4K',maxRefreshHz:60},models:[['Modern 14 C13M',2023,340,480]]},
  {brand:'MSI',category:'laptop',subcategory:'Gaming laptop',ports:['USB-C','USB-A','HDMI 2.1','Ethernet','3.5mm'],protocols:['DisplayPort 1.4','Wi-Fi 6','Bluetooth 5.2'],input:180,display:{maxResolution:'8K',maxRefreshHz:60,hdmiVersion:'2.1'},models:[['Cyborg 15 A13V',2023,650,880],['Raider GE78 HX 13V',2023,1700,2300]]},

  {brand:'Dell',category:'monitor',ports:['HDMI 2.0','DisplayPort 1.4','USB-A'],protocols:['DisplayPort','AMD FreeSync'],display:{maxResolution:'1440p',maxRefreshHz:165,hdmiVersion:'2.0'},models:[['S2721DGF',2020,180,260],['S2722DGM',2021,150,220],['P2422H',2021,120,180]]},
  {brand:'LG',category:'monitor',ports:['HDMI 2.0','DisplayPort 1.4','USB-A','3.5mm'],protocols:['AMD FreeSync','G-SYNC Compatible'],display:{maxResolution:'1440p',maxRefreshHz:165,hdmiVersion:'2.0'},models:[['27GL850-B',2019,170,240],['27GP850-B',2021,210,290],['32GP850-B',2021,250,340]]},
  {brand:'Samsung',category:'monitor',ports:['HDMI 2.1','DisplayPort 1.4','USB-A'],protocols:['HDMI VRR','AMD FreeSync Premium Pro'],display:{maxResolution:'4K',maxRefreshHz:144,hdmiVersion:'2.1'},models:[['Odyssey G7 C32G75T',2020,270,380],['Odyssey Neo G7 S32BG75',2022,470,620],['Odyssey G5 S27CG55',2023,160,230]]},
  {brand:'ASUS',category:'monitor',ports:['HDMI 2.0','DisplayPort 1.4','USB-A','3.5mm'],protocols:['Adaptive-Sync','G-SYNC Compatible'],display:{maxResolution:'1440p',maxRefreshHz:170,hdmiVersion:'2.0'},models:[['TUF Gaming VG27AQ',2019,180,260],['ROG Swift PG279QM',2021,430,580],['ProArt PA278QV',2020,220,310]]},
  {brand:'BenQ',category:'monitor',ports:['HDMI 2.0','DisplayPort 1.4','USB-A'],protocols:['AMD FreeSync','DisplayPort'],display:{maxResolution:'1440p',maxRefreshHz:165,hdmiVersion:'2.0'},models:[['Mobiuz EX2710Q',2021,220,310],['PD2705Q',2020,260,350],['Zowie XL2566K',2022,400,520]]},

  {brand:'LG',category:'tv',ports:['HDMI 2.1','USB-A','Ethernet','Optical audio'],protocols:['HDMI VRR','eARC','G-SYNC Compatible','Wi-Fi 5'],display:{maxResolution:'4K',maxRefreshHz:120,hdmiVersion:'2.1'},models:[['OLED C1 55-inch',2021,520,700],['OLED C2 55-inch',2022,620,820],['OLED C3 55-inch',2023,720,950],['QNED85 65-inch',2023,700,920]]},
  {brand:'Samsung',category:'tv',ports:['HDMI 2.1','USB-A','Ethernet','Optical audio'],protocols:['HDMI VRR','eARC','AMD FreeSync Premium','Wi-Fi 5'],display:{maxResolution:'4K',maxRefreshHz:120,hdmiVersion:'2.1'},models:[['S95B OLED 55-inch',2022,650,850],['S95C OLED 55-inch',2023,820,1080],['QN90B 55-inch',2022,620,840]]},
  {brand:'Sony',category:'tv',ports:['HDMI 2.1','USB-A','Ethernet','Optical audio'],protocols:['HDMI VRR','eARC','Dolby Vision','Wi-Fi 5'],display:{maxResolution:'4K',maxRefreshHz:120,hdmiVersion:'2.1'},models:[['A80J OLED 55-inch',2021,650,880],['A80L OLED 55-inch',2023,820,1080],['X90L 65-inch',2023,780,1020]]},

  {brand:'Sony',category:'camera',subcategory:'Mirrorless',ports:['USB-C','HDMI Micro','3.5mm','SDXC'],protocols:['USB PD','UVC','Wi-Fi 5','Bluetooth'],input:15,models:[['Alpha 6400',2019,620,800],['Alpha 6600',2019,850,1050],['Alpha 7 III',2018,950,1200],['Alpha 7C',2020,1050,1300]]},
  {brand:'Canon',category:'camera',subcategory:'Mirrorless',ports:['USB-C','HDMI Micro','3.5mm','SDXC'],protocols:['USB PD','UVC','Wi-Fi 5','Bluetooth'],input:15,models:[['EOS R',2018,850,1100],['EOS RP',2019,620,800],['EOS R7',2022,1050,1300],['EOS R10',2022,650,850]]},
  {brand:'Nikon',category:'camera',subcategory:'Mirrorless',ports:['USB-C','HDMI Micro','3.5mm','SDXC'],protocols:['USB PD','UVC','Wi-Fi 5','Bluetooth'],input:15,models:[['Z5',2020,750,950],['Z6 II',2020,1100,1400],['Z7 II',2020,1600,1950],['Z50',2019,600,780]]},
  {brand:'Fujifilm',category:'camera',subcategory:'Mirrorless',ports:['USB-C','HDMI Micro','3.5mm','SDXC'],protocols:['USB PD','UVC','Wi-Fi 5','Bluetooth'],input:15,models:[['X-T4',2020,900,1150],['X-S10',2020,650,850],['X-H2S',2022,1900,2250]]},

  {brand:'Sony',category:'audio',subcategory:'Headphones',ports:['USB-C','3.5mm'],protocols:['Bluetooth 5.2','LDAC','AAC'],input:5,models:[['WH-CH720N',2023,65,100],['WH-XB910N',2021,90,140]]},
  {brand:'Bose',category:'audio',subcategory:'Headphones',ports:['USB-C','2.5mm'],protocols:['Bluetooth 5.1','AAC'],input:5,models:[['QuietComfort 45',2021,150,220],['Noise Cancelling Headphones 700',2019,160,230]]},
  {brand:'Sennheiser',category:'audio',subcategory:'Headphones',ports:['USB-C','3.5mm'],protocols:['Bluetooth 5.2','AAC','aptX Adaptive'],input:5,models:[['Momentum 3 Wireless',2019,110,170],['HD 450BT',2020,55,90],['Accentum Wireless',2023,90,140]]},
  {brand:'JBL',category:'audio',subcategory:'Speaker',ports:['USB-C'],protocols:['Bluetooth 5.1'],input:15,models:[['Go 3',2020,25,40],['Clip 4',2020,35,55],['Xtreme 3',2020,150,220],['Boombox 3',2022,320,430]]},
  {brand:'Apple',category:'audio',subcategory:'Earbuds',ports:['Lightning'],protocols:['Bluetooth 5.0','AAC','Qi'],input:5,models:[['AirPods 2nd generation',2019,55,90],['AirPods 3rd generation',2021,90,135],['AirPods Pro 1st generation',2019,75,120]]},

  {brand:'Apple',category:'wearable',subcategory:'Smartwatch',ports:['Magnetic charger'],protocols:['Bluetooth','Wi-Fi','NFC','GPS'],input:5,models:[['Watch Series 6',2020,100,160],['Watch Series 7',2021,130,190],['Watch Series 8',2022,170,240],['Watch Series 9',2023,220,300]]},
  {brand:'Samsung',category:'wearable',subcategory:'Smartwatch',ports:['Wireless charger'],protocols:['Bluetooth','Wi-Fi','NFC','GPS'],input:5,models:[['Galaxy Watch4',2021,70,110],['Galaxy Watch5',2022,90,140],['Galaxy Watch5 Pro',2022,150,220],['Galaxy Watch6',2023,130,190]]},
  {brand:'Garmin',category:'wearable',subcategory:'Sports watch',ports:['Proprietary charger'],protocols:['Bluetooth','ANT+','GPS'],input:5,models:[['Fenix 7',2022,320,430],['Forerunner 255',2022,180,260],['Forerunner 265',2023,300,400],['Vivoactive 5',2023,190,270]]},

  {brand:'Samsung',category:'storage',subcategory:'External SSD',ports:['USB-C'],protocols:['USB 3.2 Gen 2'],models:[['T5 1TB',2017,50,80],['T7 1TB',2020,65,100]]},
  {brand:'Crucial',category:'storage',subcategory:'External SSD',ports:['USB-C'],protocols:['USB 3.2 Gen 2'],models:[['X8 1TB',2019,60,90],['X9 Pro 2TB',2023,120,170]]},
  {brand:'TP-Link',category:'networking',subcategory:'Router',ports:['Ethernet','USB-A'],protocols:['Wi-Fi 6','1GbE','WPA3'],models:[['Archer AX73',2020,85,125],['Archer AXE75',2022,130,190],['Archer AX10',2020,40,65]]},
  {brand:'ASUS',category:'networking',subcategory:'Router',ports:['Ethernet','USB-A'],protocols:['Wi-Fi 6','2.5GbE','WPA3'],models:[['RT-AX58U',2019,70,110],['ROG Rapture GT-AX6000',2021,200,290]]},

  {brand:'Logitech',category:'peripheral',subcategory:'Mouse',ports:['USB-C','USB receiver'],protocols:['Bluetooth LE','2.4GHz wireless'],input:5,models:[['MX Anywhere 3S',2023,55,85],['G305 Lightspeed',2018,25,45],['G703 Lightspeed',2019,45,75]]},
  {brand:'Logitech',category:'peripheral',subcategory:'Webcam',ports:['USB-C'],protocols:['USB 3.0','UVC'],models:[['C920 HD Pro',2012,30,50],['StreamCam',2020,65,100],['Brio 500',2022,70,110]]},
  {brand:'Keychron',category:'peripheral',subcategory:'Keyboard',ports:['USB-C'],protocols:['Bluetooth','USB data'],input:5,models:[['K2 V2',2020,55,85],['K8 Pro',2022,80,120],['V1 Max',2024,85,125]]},
  {brand:'Epson',category:'other',subcategory:'Projector',ports:['HDMI 2.0','USB-A'],protocols:['HDMI','Wi-Fi 5'],display:{maxResolution:'4K',maxRefreshHz:60,hdmiVersion:'2.0'},models:[['Home Cinema 3800',2019,900,1200],['EpiqVision Mini EF12',2020,550,750]]},
  {brand:'BenQ',category:'other',subcategory:'Projector',ports:['HDMI 2.0','USB-A','3.5mm'],protocols:['HDMI','Android TV'],display:{maxResolution:'4K',maxRefreshHz:60,hdmiVersion:'2.0'},models:[['HT2060',2023,800,1050],['X3000i',2022,1300,1650]]},
]

const lifespan:Record<DeviceCategory,number>={phone:7,laptop:7,desktop:8,component:7,tablet:7,monitor:8,tv:9,console:9,handheld:6,audio:6,camera:9,charger:7,cable:10,adapter:8,dock:7,storage:7,networking:7,'smart-home':6,wearable:5,peripheral:7,other:7}
const slug=(value:string)=>value.toLowerCase().replace(/\+/g,' plus ').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
const clamp=(value:number)=>Math.max(25,Math.min(97,Math.round(value)))
const scores=(category:DeviceCategory,year:number):Record<string,number>=>{
  const freshness=clamp(48+(year-2017)*4)
  if(category==='phone')return {performance:freshness,battery:clamp(freshness+4),camera:clamp(freshness+2),display:clamp(freshness+3),portability:86}
  if(category==='laptop')return {performance:freshness,battery:clamp(freshness-2),display:clamp(freshness+1),productivity:clamp(freshness+6),portability:80}
  if(category==='monitor'||category==='tv')return {display:clamp(freshness+8),gaming:clamp(freshness+3),value:82}
  if(category==='camera')return {camera:clamp(freshness+10),performance:clamp(freshness+5),battery:76,portability:78}
  if(category==='audio')return {performance:clamp(freshness+4),battery:clamp(freshness+8),portability:88,value:86}
  if(category==='wearable')return {performance:freshness,battery:clamp(freshness+8),display:clamp(freshness+2),portability:97}
  return {performance:freshness,value:86}
}

export const catalogExpansionLegacy:Device[]=families.flatMap(family=>family.models.map(([model,releaseYear,low,high])=>({
  id:`${slug(family.brand)}-${slug(model)}`,brand:family.brand,model,category:family.category,subcategory:family.subcategory,
  releaseYear,aliases:[model,`${family.brand} ${model}`],ports:family.ports,protocols:family.protocols,maxInputWatts:family.input,maxOutputWatts:family.output,display:family.display,
  estimatedValueEur:[low,high],estimatedLifespanYears:lifespan[family.category],repairability:['desktop','component','peripheral'].includes(family.category)?'easy':['phone','monitor','tv','camera','wearable'].includes(family.category)?'professional':'moderate',
  source:`${family.brand} official legacy specifications and WhatTech reference profile`,updatedAt:'2026-08-13',confidence:'medium',highlights:scores(family.category,releaseYear),
})))
