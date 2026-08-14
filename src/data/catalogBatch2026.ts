import type { Device } from '../types/device'

type Scores=Record<string,number>
type PhoneRow=[brand:string,model:string,year:number,value:[number,number],input:number,protocols:string[],scores:Scores,support:number|undefined,source:string]
type MonitorRow=[brand:string,model:string,year:number,value:[number,number],ports:string[],protocols:string[],resolution:string,refresh:number,output:number|undefined,scores:Scores,source:string]

const apple='Apple iPhone Compare and technical specifications'
const samsung='Samsung official Galaxy specifications'
const google='Google Store Pixel hardware specifications'
const oneplus='OnePlus official product specifications'
const xiaomi='Xiaomi Global official product specifications'
const other='Manufacturer official product specifications'

const phoneRows:PhoneRow[]=[
  ['Apple','iPhone 17 Pro',2025,[900,1120],40,['USB PD','MagSafe','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:97,battery:90,camera:97,display:97,portability:84},undefined,apple],
  ['Apple','iPhone 17 Pro Max',2025,[1030,1280],40,['USB PD','MagSafe','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:97,battery:98,camera:97,display:98,portability:68},undefined,apple],
  ['Apple','iPhone Air',2025,[760,940],30,['USB PD','MagSafe','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:94,battery:81,camera:88,display:95,portability:98},undefined,apple],
  ['Apple','iPhone 17',2025,[700,850],30,['USB PD','MagSafe','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:92,battery:91,camera:92,display:94,portability:89},undefined,apple],
  ['Apple','iPhone 17e',2026,[560,690],20,['USB PD','Qi','Bluetooth 6','Wi-Fi 7'],{performance:90,battery:88,camera:85,display:84,portability:91,value:87},undefined,apple],
  ['Apple','iPhone 16 Pro Max',2024,[790,940],30,['USB PD','MagSafe','Qi2','Bluetooth 5.3','Wi-Fi 7'],{performance:93,battery:95,camera:95,display:94,portability:69},undefined,apple],
  ['Apple','iPhone 16e',2025,[430,540],20,['USB PD','Qi','Bluetooth 5.3','Wi-Fi 6'],{performance:86,battery:89,camera:82,display:78,portability:92,value:88},undefined,apple],
  ['Apple','iPhone 15 Pro Max',2023,[680,820],27,['USB PD','MagSafe','Qi2','Bluetooth 5.3','Wi-Fi 6E'],{performance:91,battery:91,camera:95,display:94,portability:70},undefined,apple],
  ['Apple','iPhone 15 Plus',2023,[470,590],27,['USB PD','MagSafe','Qi2','Bluetooth 5.3','Wi-Fi 6'],{performance:82,battery:94,camera:84,display:84,portability:73},undefined,apple],
  ['Apple','iPhone 14 Pro',2022,[420,540],20,['USB PD','MagSafe','Qi','Bluetooth 5.3','Wi-Fi 6'],{performance:84,battery:80,camera:90,display:92,portability:84},undefined,apple],
  ['Apple','iPhone 14 Pro Max',2022,[500,630],20,['USB PD','MagSafe','Qi','Bluetooth 5.3','Wi-Fi 6'],{performance:84,battery:91,camera:90,display:93,portability:67},undefined,apple],
  ['Apple','iPhone 14 Plus',2022,[350,450],20,['USB PD','MagSafe','Qi','Bluetooth 5.3','Wi-Fi 6'],{performance:80,battery:94,camera:82,display:82,portability:71},undefined,apple],
  ['Apple','iPhone 13 Pro',2021,[330,430],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:79,battery:82,camera:88,display:90,portability:85},undefined,apple],
  ['Apple','iPhone 13 Pro Max',2021,[400,510],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:79,battery:92,camera:88,display:91,portability:66},undefined,apple],
  ['Apple','iPhone 13 mini',2021,[230,310],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:77,battery:68,camera:80,display:79,portability:99},undefined,apple],
  ['Apple','iPhone 13',2021,[260,350],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:77,battery:82,camera:80,display:79,portability:91},undefined,apple],
  ['Apple','iPhone SE 3rd generation',2022,[150,220],20,['USB PD','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:74,battery:62,camera:69,display:58,portability:98,value:87},undefined,apple],
  ['Apple','iPhone 12 Pro',2020,[230,310],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:71,battery:68,camera:79,display:78,portability:87},undefined,apple],
  ['Apple','iPhone 12 Pro Max',2020,[280,370],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:71,battery:79,camera:82,display:80,portability:68},undefined,apple],
  ['Apple','iPhone 12 mini',2020,[150,220],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:70,battery:57,camera:74,display:75,portability:99},undefined,apple],
  ['Apple','iPhone 12',2020,[180,250],20,['USB PD','MagSafe','Qi','Bluetooth 5.0','Wi-Fi 6'],{performance:70,battery:70,camera:74,display:75,portability:91},undefined,apple],

  ['Samsung','Galaxy S25 FE',2025,[520,650],45,['USB PD','PPS','Qi2 Ready','Bluetooth 5.4','Wi-Fi 6E'],{performance:89,battery:90,camera:87,display:93,portability:76,value:88},2032,samsung],
  ['Samsung','Galaxy S26+',2026,[840,990],45,['USB PD','PPS','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:96,battery:95,camera:93,display:97,portability:75},2033,samsung],
  ['Samsung','Galaxy S26 Ultra',2026,[1060,1320],60,['USB PD','PPS','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:99,battery:96,camera:99,display:99,portability:62},2033,samsung],
  ['Samsung','Galaxy S25+',2025,[630,760],45,['USB PD','PPS','Qi2 Ready','Bluetooth 5.4','Wi-Fi 7'],{performance:95,battery:93,camera:92,display:96,portability:73},2032,samsung],
  ['Samsung','Galaxy S24+',2024,[450,570],45,['USB PD','PPS','Qi','Bluetooth 5.3','Wi-Fi 7'],{performance:89,battery:91,camera:89,display:94,portability:74},2031,samsung],
  ['Samsung','Galaxy S24 Ultra',2024,[650,790],45,['USB PD','PPS','Qi','Bluetooth 5.3','Wi-Fi 7'],{performance:93,battery:92,camera:96,display:97,portability:61},2031,samsung],
  ['Samsung','Galaxy S24 FE',2024,[330,430],25,['USB PD','PPS','Qi','Bluetooth 5.3','Wi-Fi 6E'],{performance:82,battery:86,camera:84,display:90,portability:70,value:89},2031,samsung],
  ['Samsung','Galaxy Z Fold7',2025,[1250,1550],25,['USB PD','PPS','Qi2 Ready','Bluetooth 5.4','Wi-Fi 7'],{performance:97,battery:82,camera:91,display:99,portability:58,productivity:98},2032,samsung],
  ['Samsung','Galaxy Z Flip7',2025,[720,900],25,['USB PD','PPS','Qi2 Ready','Bluetooth 5.4','Wi-Fi 7'],{performance:91,battery:82,camera:84,display:94,portability:99},2032,samsung],
  ['Samsung','Galaxy A56 5G',2025,[300,390],45,['USB PD','PPS','Bluetooth 5.3','Wi-Fi 6'],{performance:76,battery:92,camera:80,display:89,portability:78,value:93},2031,samsung],
  ['Samsung','Galaxy A36 5G',2025,[230,310],45,['USB PD','PPS','Bluetooth 5.3','Wi-Fi 6'],{performance:70,battery:91,camera:75,display:87,portability:80,value:95},2031,samsung],
  ['Samsung','Galaxy A26 5G',2025,[170,240],25,['USB PD','Bluetooth 5.3','Wi-Fi 5'],{performance:64,battery:89,camera:70,display:82,portability:79,value:96},2031,samsung],

  ['Google','Pixel 10',2025,[560,690],30,['USB PD','PPS','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:90,battery:88,camera:95,display:93,portability:89},2032,google],
  ['Google','Pixel 10 Pro',2025,[720,890],30,['USB PD','PPS','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:93,battery:89,camera:98,display:97,portability:87},2032,google],
  ['Google','Pixel 10 Pro XL',2025,[840,1020],45,['USB PD','PPS','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:93,battery:95,camera:98,display:98,portability:69},2032,google],
  ['Google','Pixel 10 Pro Fold',2025,[1250,1540],30,['USB PD','PPS','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:92,battery:83,camera:94,display:99,portability:57,productivity:97},2032,google],
  ['Google','Pixel 9 Pro XL',2024,[590,730],37,['USB PD','PPS','Qi2','Bluetooth 5.3','Wi-Fi 7'],{performance:85,battery:91,camera:97,display:96,portability:69},2031,google],
  ['Google','Pixel 9a',2025,[340,430],23,['USB PD','PPS','Qi','Bluetooth 5.3','Wi-Fi 6E'],{performance:79,battery:91,camera:91,display:87,portability:86,value:94},2032,google],
  ['Google','Pixel 8 Pro',2023,[380,490],30,['USB PD','PPS','Qi','Bluetooth 5.3','Wi-Fi 7'],{performance:80,battery:83,camera:96,display:94,portability:73},2030,google],
  ['Google','Pixel 8',2023,[300,390],27,['USB PD','PPS','Qi','Bluetooth 5.3','Wi-Fi 7'],{performance:80,battery:81,camera:92,display:88,portability:89},2030,google],

  ['OnePlus','OnePlus 15',2025,[700,860],80,['USB PD','PPS','SuperVOOC','Qi2','Bluetooth 6','Wi-Fi 7'],{performance:99,battery:98,camera:92,display:97,portability:76},undefined,oneplus],
  ['OnePlus','OnePlus 13R',2025,[430,540],80,['USB PD','PPS','SuperVOOC','Bluetooth 5.4','Wi-Fi 7'],{performance:91,battery:96,camera:80,display:92,portability:77,value:94},undefined,oneplus],
  ['OnePlus','Nord 5',2025,[330,420],80,['USB PD','SuperVOOC','Bluetooth 5.4','Wi-Fi 6'],{performance:84,battery:94,camera:76,display:89,portability:80,value:95},undefined,oneplus],
  ['Xiaomi','15 Ultra',2025,[850,1040],90,['USB PD','PPS','HyperCharge','Qi','Bluetooth 6','Wi-Fi 7'],{performance:98,battery:93,camera:99,display:98,portability:66},undefined,xiaomi],
  ['Xiaomi','15',2025,[560,700],90,['USB PD','PPS','HyperCharge','Qi','Bluetooth 6','Wi-Fi 7'],{performance:96,battery:92,camera:94,display:95,portability:88},undefined,xiaomi],
  ['Nothing','Phone (3)',2025,[580,710],65,['USB PD','PPS','Qi','Bluetooth 5.4','Wi-Fi 7'],{performance:90,battery:91,camera:88,display:92,portability:79},undefined,other],
  ['Nothing','Phone (3a) Pro',2025,[390,490],50,['USB PD','PPS','Bluetooth 5.4','Wi-Fi 6'],{performance:80,battery:93,camera:86,display:89,portability:79,value:92},undefined,other],
  ['Motorola','Razr 60 Ultra',2025,[760,930],68,['USB PD','Qi','Bluetooth 5.4','Wi-Fi 7'],{performance:95,battery:88,camera:84,display:96,portability:99},undefined,other],
  ['Motorola','Edge 60 Pro',2025,[430,540],90,['USB PD','TurboPower','Qi','Bluetooth 5.4','Wi-Fi 6E'],{performance:86,battery:96,camera:87,display:93,portability:84,value:91},undefined,other],
  ['Fairphone','Fairphone 6',2025,[510,620],30,['USB PD','Qi','Bluetooth 5.4','Wi-Fi 6E'],{performance:78,battery:88,camera:80,display:86,portability:82,repairability:99},undefined,other],
  ['Sony','Xperia 1 VII',2025,[900,1120],30,['USB PD','Qi','Bluetooth 6','Wi-Fi 7'],{performance:94,battery:92,camera:96,display:97,portability:75},undefined,other],
]

const monitorRows:MonitorRow[]=[
  ['LG','UltraGear 27GX790A-B',2025,[720,900],['DisplayPort 2.1','HDMI 2.1','USB-A','3.5mm'],['DisplayPort DSC','HDMI VRR','G-SYNC Compatible','AMD FreeSync Premium Pro'],'1440p',480,undefined,{display:99,gaming:99,value:82},'LG official 27GX790A-B specifications'],
  ['Dell','UltraSharp U3225QE',2025,[820,1020],['Thunderbolt 4','USB-C','USB-A','HDMI 2.1','DisplayPort 1.4','Ethernet','3.5mm'],['USB PD','DisplayPort DSC','DisplayPort MST','KVM'],'4K',120,140,{display:96,productivity:99,creative:96,value:80},'Dell official U3225QE specifications'],
  ['Dell','UltraSharp U2725QE',2025,[600,780],['Thunderbolt 4','USB-C','USB-A','HDMI 2.1','DisplayPort 1.4','Ethernet'],['USB PD','DisplayPort DSC','DisplayPort MST','KVM'],'4K',120,140,{display:95,productivity:98,creative:95,value:85},'Dell official U2725QE specifications'],
  ['Samsung','Odyssey OLED G8 G81SF 27-inch',2025,[760,940],['HDMI 2.1','DisplayPort 1.4','USB-A'],['HDMI VRR','DisplayPort DSC','G-SYNC Compatible'],'4K',240,undefined,{display:99,gaming:99,value:79},'Samsung official G81SF specifications'],
  ['Samsung','Odyssey OLED G8 G80SH 27-inch',2026,[930,1120],['DisplayPort 2.1','HDMI 2.1','USB-C','USB-A'],['USB PD','DisplayPort DSC','HDMI VRR','G-SYNC Compatible'],'4K',240,98,{display:99,gaming:99,productivity:89,value:75},'Samsung official G80SH specifications'],
  ['Samsung','Odyssey OLED G6 G60SF 27-inch',2025,[720,880],['HDMI 2.1','DisplayPort 1.4','USB-A'],['HDMI VRR','DisplayPort DSC','G-SYNC Compatible'],'1440p',500,undefined,{display:98,gaming:99,value:82},'Samsung official OLED monitor lineup'],
  ['ASUS','ProArt Display PA32QCV',2025,[900,1100],['Thunderbolt 4','USB-C','USB-A','HDMI 2.1','DisplayPort 1.4'],['USB PD','DisplayPort DSC','DisplayPort MST','KVM'],'6K',60,96,{display:99,creative:99,productivity:98,value:78},'ASUS official PA32QCV specifications'],
  ['ASUS','ROG Swift OLED PG27AQDP',2024,[780,950],['HDMI 2.1','DisplayPort 1.4','USB-A','3.5mm'],['HDMI VRR','DisplayPort DSC','G-SYNC Compatible','AMD FreeSync Premium Pro'],'1440p',480,undefined,{display:98,gaming:99,value:80},'ASUS official PG27AQDP specifications'],
  ['MSI','MPG 321URX QD-OLED',2024,[780,980],['HDMI 2.1','DisplayPort 1.4a','USB-C','USB-A'],['USB PD','DisplayPort DSC','HDMI VRR','KVM'],'4K',240,90,{display:99,gaming:99,productivity:86,value:84},'MSI official MPG 321URX specifications'],
]

const slug=(value:string)=>value.toLowerCase().replace(/\+/g,' plus ').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
const lightningModels=new Set(['iPhone 14 Pro','iPhone 14 Pro Max','iPhone 14 Plus','iPhone 13 Pro','iPhone 13 Pro Max','iPhone 13 mini','iPhone 13','iPhone SE 3rd generation','iPhone 12 Pro','iPhone 12 Pro Max','iPhone 12 mini','iPhone 12'])

export const phoneBatch2026:Device[]=phoneRows.map(([brand,model,releaseYear,estimatedValueEur,maxInputWatts,protocols,highlights,softwareSupportUntil,source])=>({
  id:`${slug(brand)}-${slug(model)}`,brand,model,category:'phone',releaseYear,aliases:[model,`${brand} ${model}`],ports:[lightningModels.has(model)?'Lightning':'USB-C'],protocols,maxInputWatts,estimatedValueEur,estimatedLifespanYears:7,repairability:brand==='Fairphone'?'easy':'professional',softwareSupportUntil,source,updatedAt:'2026-08-10',confidence:'medium',highlights,
}))

export const monitorBatch2026:Device[]=monitorRows.map(([brand,model,releaseYear,estimatedValueEur,ports,protocols,maxResolution,maxRefreshHz,maxOutputWatts,highlights,source])=>({
  id:`${slug(brand)}-${slug(model)}`,brand,model,category:'monitor',releaseYear,aliases:[model,`${brand} ${model}`],ports,protocols,maxOutputWatts,display:{maxResolution,maxRefreshHz,hdmiVersion:ports.some(port=>port==='HDMI 2.1')?'2.1':undefined},estimatedValueEur,estimatedLifespanYears:8,repairability:'professional',source,updatedAt:'2026-08-10',confidence:'medium',highlights,
}))

export const catalogBatch2026=[...phoneBatch2026,...monitorBatch2026]
