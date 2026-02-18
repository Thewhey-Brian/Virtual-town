import { Agent, Location, Activity, Conversation, Memory, JournalEntry } from './types';

export const agents: Agent[] = [
  {
    id: 'agent-1',
    name: '林小雨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linxiaoyu&backgroundColor=ffdfbf',
    bio: '25岁，独立插画师，热爱咖啡和猫咪。性格温柔内敛，喜欢观察生活中的小细节。',
    personality: '内向、敏感、有创造力',
    occupation: '插画师',
    homeLocation: 'loc-home-1',
    stats: { clothing: 85, food: 70, housing: 90, transport: 60 },
    currentLocation: 'loc-cafe-1',
    status: 'active',
    routine: {
      wakeUp: '07:30',
      sleep: '23:30',
      workHours: '09:00-18:00',
      preferences: ['画画', '喝咖啡', '逛书店']
    }
  },
  {
    id: 'agent-2',
    name: '陈大伟',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chendawei&backgroundColor=c0aede',
    bio: '32岁，软件工程师，热爱健身和烹饪。性格开朗直率，是朋友圈里的开心果。',
    personality: '外向、幽默、可靠',
    occupation: '软件工程师',
    homeLocation: 'loc-home-2',
    stats: { clothing: 75, food: 95, housing: 85, transport: 80 },
    currentLocation: 'loc-restaurant-1',
    status: 'active',
    routine: {
      wakeUp: '06:30',
      sleep: '22:30',
      workHours: '09:00-18:00',
      preferences: ['健身', '做饭', '看电影']
    }
  },
  {
    id: 'agent-3',
    name: '王小美',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangxiaomei&backgroundColor=ffd5dc',
    bio: '28岁，时尚博主，对穿搭有独到见解。性格活泼开朗，喜欢尝试新鲜事物。',
    personality: '外向、时尚、追求完美',
    occupation: '时尚博主',
    homeLocation: 'loc-home-3',
    stats: { clothing: 98, food: 65, housing: 88, transport: 75 },
    currentLocation: 'loc-shop-1',
    status: 'active',
    routine: {
      wakeUp: '08:00',
      sleep: '00:00',
      workHours: '10:00-20:00',
      preferences: ['购物', '拍照', '探店']
    }
  },
  {
    id: 'agent-4',
    name: '张思远',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsiyuan&backgroundColor=b6e3f4',
    bio: '35岁，大学教授，热爱阅读和古典音乐。性格沉稳内敛，喜欢深度思考。',
    personality: '内向、理性、博学',
    occupation: '大学教授',
    homeLocation: 'loc-home-4',
    stats: { clothing: 70, food: 80, housing: 95, transport: 50 },
    currentLocation: 'loc-library-1',
    status: 'active',
    routine: {
      wakeUp: '06:00',
      sleep: '22:00',
      workHours: '08:00-17:00',
      preferences: ['阅读', '古典音乐', '散步']
    }
  },
  {
    id: 'agent-5',
    name: '刘阳光',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liuyangguang&backgroundColor=d1d4f9',
    bio: '23岁，自行车快递员，热爱户外运动。性格阳光热情，总是充满正能量。',
    personality: '外向、活力、乐观',
    occupation: '快递员',
    homeLocation: 'loc-home-5',
    stats: { clothing: 60, food: 75, housing: 65, transport: 100 },
    currentLocation: 'loc-park-1',
    status: 'active',
    routine: {
      wakeUp: '05:30',
      sleep: '21:30',
      workHours: '07:00-19:00',
      preferences: ['骑行', '跑步', '野餐']
    }
  }
];

export const locations: Location[] = [
  { id: 'loc-home-1', name: '林小雨的家', type: 'home', x: 20, y: 30, icon: '🏠', description: '温馨的单人公寓，墙上挂满了插画作品' },
  { id: 'loc-home-2', name: '陈大伟的家', type: 'home', x: 70, y: 25, icon: '🏠', description: '现代化的两居室，厨房设备齐全' },
  { id: 'loc-home-3', name: '王小美的家', type: 'home', x: 50, y: 70, icon: '🏠', description: '时尚的loft公寓，衣帽间占据一半空间' },
  { id: 'loc-home-4', name: '张思远的家', type: 'home', x: 15, y: 60, icon: '🏠', description: '书香气息浓厚的老房子，藏书万卷' },
  { id: 'loc-home-5', name: '刘阳光的家', type: 'home', x: 80, y: 75, icon: '🏠', description: '简约的单间，墙上贴着骑行路线图' },
  { id: 'loc-cafe-1', name: '慢时光咖啡馆', type: 'cafe', x: 35, y: 40, icon: '☕', description: '安静的咖啡馆，手工烘焙的精品咖啡', hours: '08:00-22:00', rating: 4.8 },
  { id: 'loc-cafe-2', name: '猫咪咖啡厅', type: 'cafe', x: 60, y: 45, icon: '🐱', description: '可以和猫咪一起玩耍的主题咖啡厅', hours: '10:00-21:00', rating: 4.6 },
  { id: 'loc-restaurant-1', name: '老街面馆', type: 'restaurant', x: 45, y: 35, icon: '🍜', description: '传承三代的传统面馆，招牌牛肉面', hours: '07:00-21:00', rating: 4.7 },
  { id: 'loc-restaurant-2', name: '绿野仙踪', type: 'restaurant', x: 55, y: 60, icon: '🥗', description: '有机素食餐厅，主打健康饮食', hours: '11:00-21:00', rating: 4.5 },
  { id: 'loc-shop-1', name: '时尚买手店', type: 'shop', x: 65, y: 55, icon: '👗', description: '精选国内外设计师品牌的买手店', hours: '10:00-22:00', rating: 4.4 },
  { id: 'loc-shop-2', name: '24小时便利店', type: 'shop', x: 40, y: 50, icon: '🏪', description: '24小时营业的社区便利店', hours: '全天', rating: 4.2 },
  { id: 'loc-park-1', name: '阳光公园', type: 'park', x: 75, y: 50, icon: '🌳', description: '城市中央公园，适合晨跑和野餐', hours: '06:00-22:00', rating: 4.9 },
  { id: 'loc-library-1', name: '市立图书馆', type: 'library', x: 25, y: 45, icon: '📚', description: '历史悠久的公共图书馆，藏书丰富', hours: '09:00-21:00', rating: 4.8 },
  { id: 'loc-work-1', name: '创意园区', type: 'work', x: 30, y: 20, icon: '💼', description: '艺术家和创意工作者的聚集地', hours: '09:00-18:00', rating: 4.3 },
  { id: 'loc-transport-1', name: '中心地铁站', type: 'transport', x: 50, y: 50, icon: '🚇', description: '连接全城的主要交通枢纽', hours: '05:30-23:30', rating: 4.5 },
  { id: 'loc-transport-2', name: '公交总站', type: 'transport', x: 45, y: 15, icon: '🚌', description: '公交线路覆盖全市各区域', hours: '05:00-23:00', rating: 4.0 },
];

export const mockActivities: Activity[] = [
  { id: 'act-1', agentId: 'agent-1', type: 'move', location: 'loc-home-1', timestamp: new Date('2026-02-16T07:30:00'), description: '起床准备新的一天' },
  { id: 'act-2', agentId: 'agent-1', type: 'move', location: 'loc-cafe-1', timestamp: new Date('2026-02-16T08:15:00'), description: '去咖啡馆吃早餐' },
  { id: 'act-3', agentId: 'agent-1', type: 'work', location: 'loc-cafe-1', timestamp: new Date('2026-02-16T09:00:00'), description: '开始一天的插画工作' },
  { id: 'act-4', agentId: 'agent-2', type: 'move', location: 'loc-restaurant-1', timestamp: new Date('2026-02-16T07:00:00'), description: '来面馆吃早餐' },
  { id: 'act-5', agentId: 'agent-2', type: 'talk', location: 'loc-restaurant-1', timestamp: new Date('2026-02-16T07:30:00'), description: '和老板聊天', relatedAgents: ['agent-1'] },
  { id: 'act-6', agentId: 'agent-3', type: 'move', location: 'loc-shop-1', timestamp: new Date('2026-02-16T10:30:00'), description: '来服装店挑选新衣服' },
  { id: 'act-7', agentId: 'agent-4', type: 'move', location: 'loc-library-1', timestamp: new Date('2026-02-16T08:00:00'), description: '到图书馆阅读' },
  { id: 'act-8', agentId: 'agent-5', type: 'move', location: 'loc-park-1', timestamp: new Date('2026-02-16T06:00:00'), description: '晨跑开始' },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['agent-1', 'agent-2'],
    messages: [
      { id: 'msg-1', senderId: 'agent-2', content: '早啊，小雨！今天也在咖啡馆工作吗？', timestamp: new Date('2026-02-16T08:20:00') },
      { id: 'msg-2', senderId: 'agent-1', content: '是啊，大伟哥。这里的拿铁很好喝呢！', timestamp: new Date('2026-02-16T08:22:00') },
      { id: 'msg-3', senderId: 'agent-2', content: '哈哈，我也喜欢这里的咖啡。你最近在画什么？', timestamp: new Date('2026-02-16T08:25:00') },
    ],
    location: 'loc-cafe-1',
    startedAt: new Date('2026-02-16T08:20:00'),
    topic: '日常问候'
  },
  {
    id: 'conv-2',
    participants: ['agent-3', 'agent-5'],
    messages: [
      { id: 'msg-4', senderId: 'agent-3', content: '阳光，你这件外套哪里买的？很适合你！', timestamp: new Date('2026-02-16T11:00:00') },
      { id: 'msg-5', senderId: 'agent-5', content: '谢谢小美！这是运动品牌的新款，很透气。', timestamp: new Date('2026-02-16T11:02:00') },
    ],
    location: 'loc-park-1',
    startedAt: new Date('2026-02-16T11:00:00'),
    topic: '时尚交流'
  }
];

export const mockMemories: Memory[] = [
  { id: 'mem-1', agentId: 'agent-1', category: 'people', content: '陈大伟是个热心肠的人，经常给我推荐好吃的', date: new Date('2026-02-15'), importance: 8 },
  { id: 'mem-2', agentId: 'agent-1', category: 'places', content: '慢时光咖啡馆的角落位置最适合画画', date: new Date('2026-02-14'), importance: 9 },
  { id: 'mem-3', agentId: 'agent-2', category: 'preferences', content: '发现一家很棒的健身餐餐厅', date: new Date('2026-02-15'), importance: 7 },
  { id: 'mem-4', agentId: 'agent-3', category: 'events', content: '参加了新品发布会，认识了很多同行', date: new Date('2026-02-14'), importance: 8 },
  { id: 'mem-5', agentId: 'agent-4', category: 'daily', content: '今天读完了《百年孤独》，感触很深', date: new Date('2026-02-15'), importance: 6 },
];

export const mockJournals: JournalEntry[] = [
  {
    id: 'journal-1',
    agentId: 'agent-1',
    date: new Date('2026-02-15'),
    content: '今天又是充实的一天。早上在咖啡馆完成了客户委托的插画，下午去书店发现了一本很棒的画册。晚上回家给猫咪梳毛，它舒服得直打呼噜。生活中的小确幸，就是这样简单而美好。',
    mood: '平静愉悦',
    highlights: ['完成插画作品', '发现好书画册', '和猫咪的温馨时光']
  },
  {
    id: 'journal-2',
    agentId: 'agent-2',
    date: new Date('2026-02-15'),
    content: '今天在公司解决了一个棘手的技术问题，感觉很有成就感！晚上回家做了红烧肉，味道还不错。给爸妈打了电话，他们身体都挺好的。明天周末，计划去爬山。',
    mood: '充实满足',
    highlights: ['解决技术难题', '做红烧肉', '和家人通话']
  },
  {
    id: 'journal-3',
    agentId: 'agent-3',
    date: new Date('2026-02-15'),
    content: '今天的拍摄很顺利！新款春装搭配出来效果特别好，粉丝们的反响也很热烈。下午和助理去喝了下午茶，聊了很多关于时尚趋势的话题。晚上整理照片，看着一张张精美的作品，觉得所有的努力都值得。',
    mood: '兴奋满足',
    highlights: ['拍摄顺利', '粉丝反响好', '时尚趋势讨论']
  },
  {
    id: 'journal-4',
    agentId: 'agent-4',
    date: new Date('2026-02-15'),
    content: '今天在图书馆待了一整天，读完了马尔克斯的《百年孤独》。这种沉浸式的阅读体验真是难得。晚上回家听了一场柏林爱乐的演奏会直播，心灵得到了极大的满足。明天要准备下周的讲座内容。',
    mood: '宁静深远',
    highlights: ['读完《百年孤独》', '听柏林爱乐直播', '充实的一天']
  },
  {
    id: 'journal-5',
    agentId: 'agent-5',
    date: new Date('2026-02-15'),
    content: '今天的 deliveries 都准时送到了！虽然有点累，但是看到客户满意的笑容就觉得值得。傍晚去公园跑了五公里，感觉身体状态不错。晚上和室友一起吃了火锅，聊到很晚。年轻就是要这样有冲劲！',
    mood: '活力满满',
    highlights: ['准时送达所有快递', '公园跑步五公里', '和朋友吃火锅']
  }
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return locations.find(l => l.id === id);
}

export function getActivitiesByAgent(agentId: string): Activity[] {
  return mockActivities.filter(a => a.agentId === agentId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getConversationsByAgent(agentId: string): Conversation[] {
  return mockConversations.filter(c => c.participants.includes(agentId));
}

export function getMemoriesByAgent(agentId: string): Memory[] {
  return mockMemories.filter(m => m.agentId === agentId).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getJournalByAgent(agentId: string): JournalEntry[] {
  return mockJournals.filter(j => j.agentId === agentId).sort((a, b) => b.date.getTime() - a.date.getTime());
}
