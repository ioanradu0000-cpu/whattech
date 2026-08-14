import type { ForumTopic } from '../types/forum'

export const forumTopics:Array<{id:ForumTopic;label:string}>=[
  {id:'charging-power',label:'Charging & power'},{id:'display',label:'Display & picture'},{id:'performance',label:'Performance'},
  {id:'software',label:'Software & updates'},{id:'connectivity',label:'Wi-Fi & connectivity'},{id:'audio',label:'Audio'},
  {id:'accessories',label:'Accessories & cables'},{id:'other',label:'Other'},
]

export const forumTopicLabel=new Map(forumTopics.map(topic=>[topic.id,topic.label]))

