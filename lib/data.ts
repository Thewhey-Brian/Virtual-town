import { Agent, Location, Activity, Conversation, Memory, JournalEntry, DailySchedule } from './types';

// ============================================
// REAL GLENDALE LOCATIONS
// ============================================

export const realGlendalePlaces = {
  cafes: [
    { name: "Kings Row Coffee", address: "1031 E Broadway, Glendale, CA", rating: 4.5, hours: "07:00-19:00", lat: 34.1465, lng: -118.2465 },
    { name: "Café Broadway", address: "120 E Broadway, Glendale, CA", rating: 4.3, hours: "06:30-20:00", lat: 34.1468, lng: -118.2545 },
    { name: "Recess Eatery", address: "111 N Brand Blvd, Glendale, CA", rating: 4.6, hours: "08:00-22:00", lat: 34.1475, lng: -118.2550 },
  ],
  restaurants: [
    { name: "Porto's Bakery & Cafe", address: "315 N Brand Blvd, Glendale, CA", rating: 4.8, hours: "06:00-21:00", lat: 34.1505, lng: -118.2551 },
    { name: "Din Tai Fung", address: "177 Caruso Ave, Glendale, CA", rating: 4.7, hours: "11:00-21:00", lat: 34.1440, lng: -118.2575 },
    { name: "Raffi's Place", address: "211 E Broadway, Glendale, CA", rating: 4.6, hours: "11:30-22:00", lat: 34.1460, lng: -118.2540 },
    { name: "Shake Shack", address: "242 N Brand Blvd, Glendale, CA", rating: 4.4, hours: "11:00-22:00", lat: 34.1485, lng: -118.2550 },
    { name: "Lee's Sandwiches", address: "181 S Brand Blvd, Glendale, CA", rating: 4.3, hours: "07:00-21:00", lat: 34.1450, lng: -118.2550 },
  ],
  parks: [
    { name: "Brand Park", address: "1601 W Mountain St, Glendale, CA", rating: 4.7, hours: "06:00-22:00", lat: 34.1625, lng: -118.2680 },
    { name: "Verdugo Park", address: "3201 W Verdugo Ave, Burbank, CA", rating: 4.5, hours: "05:00-22:00", lat: 34.1720, lng: -118.2410 },
    { name: "Glendale Central Park", address: "1600 S Brand Blvd, Glendale, CA", rating: 4.4, hours: "06:00-22:00", lat: 34.1260, lng: -118.2550 },
  ],
  shopping: [
    { name: "Americana at Brand", address: "889 Americana Way, Glendale, CA", rating: 4.6, hours: "10:00-21:00", lat: 34.1445, lng: -118.2570 },
    { name: "Glendale Galleria", address: "100 W Broadway, Glendale, CA", rating: 4.3, hours: "10:00-21:00", lat: 34.1465, lng: -118.2590 },
    { name: "Target", address: "2425 Colorado Blvd, Los Angeles, CA", rating: 4.2, hours: "08:00-22:00", lat: 34.1390, lng: -118.2370 },
    { name: "Ralphs", address: "750 W Glenoaks Blvd, Glendale, CA", rating: 4.1, hours: "06:00-23:00", lat: 34.1610, lng: -118.2650 },
  ],
  libraries: [
    { name: "Glendale Central Library", address: "222 E Harvard St, Glendale, CA", rating: 4.6, hours: "09:00-21:00", lat: 34.1480, lng: -118.2530 },
    { name: "Grandview Library", address: "1535 E Colorado St, Glendale, CA", rating: 4.4, hours: "10:00-18:00", lat: 34.1415, lng: -118.2470 },
  ],
  landmarks: [
    { name: "Alex Theatre", address: "216 N Brand Blvd, Glendale, CA", rating: 4.7, hours: "Varies", lat: 34.1480, lng: -118.2555 },
    { name: "Forest Lawn Museum", address: "1712 S Glendale Ave, Glendale, CA", rating: 4.8, hours: "10:00-17:00", lat: 34.1230, lng: -118.2280 },
  ],
  transport: [
    { name: "Glendale Station", address: "400 W Cerritos Ave, Glendale, CA", rating: 4.2, hours: "04:30-23:00", lat: 34.1360, lng: -118.2590 },
    { name: "Metro Bus Stop", address: "Brand & Broadway", rating: 4.0, hours: "05:00-23:00", lat: 34.1470, lng: -118.2550 },
  ],
  homes: [
    { name: "Wilson Ave Apartments", address: "523 E Wilson Ave, Glendale, CA", lat: 34.1490, lng: -118.2510 },
    { name: "Glendale Luxury Lofts", address: "125 E Broadway, Glendale, CA", lat: 34.1468, lng: -118.2540 },
    { name: "Chevy Chase Canyon", address: "2200 E Chevy Chase Dr, Glendale, CA", lat: 34.1550, lng: -118.2400 },
    { name: "Rossmoyne Historic District", address: "Rossmoyne Ave, Glendale, CA", lat: 34.1600, lng: -118.2450 },
    { name: "Casa Adobe", address: "1129 E Mountain St, Glendale, CA", lat: 34.1630, lng: -118.2420 },
  ]
};

// ============================================
// COORDINATE CONVERSION
// ============================================

function toMapX(lng: number): number {
  return ((lng + 118.28) / 0.06) * 100;
}

function toMapY(lat: number): number {
  return 100 - ((lat - 34.12) / 0.06) * 100;
}

// ============================================
// AGENTS (Residents)
// ============================================

export const agents: Agent[] = [
  {
    id: 'agent-1',
    name: '林小雨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linxiaoyu&backgroundColor=ffdfbf',
    bio: '25岁，独立插画师，住在Glendale的Wilson Ave公寓。热爱在Kings Row Coffee工作，周末常去Brand Park写生。性格温柔内敛，善于观察生活细节。',
    personality: '内向、敏感、有创造力',
    occupation: '插画师',
    homeLocation: 'loc-home-1',
    stats: { clothing: 85, food: 70, housing: 90, transport: 60 },
    currentLocation: 'loc-home-1',
    status: 'active',
    routine: {
      wakeUp: '07:30',
      sleep: '23:30',
      workHours: '09:00-18:00',
      preferences: ['画画', '喝咖啡', '逛书店', '摄影']
    }
  },
  {
    id: 'agent-2',
    name: '陈大伟',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chendawei&backgroundColor=c0aede',
    bio: '32岁，软件工程师，在Americana附近的科技公司工作。Porto\'s的拿破仑蛋糕是他的最爱。性格开朗直率，是朋友圈里的开心果，健身狂热者。',
    personality: '外向、幽默、可靠',
    occupation: '软件工程师',
    homeLocation: 'loc-home-2',
    stats: { clothing: 75, food: 95, housing: 85, transport: 80 },
    currentLocation: 'loc-home-2',
    status: 'active',
    routine: {
      wakeUp: '06:30',
      sleep: '22:30',
      workHours: '09:00-18:00',
      preferences: ['健身', '做饭', '看电影', '科技']
    }
  },
  {
    id: 'agent-3',
    name: '王小美',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangxiaomei&backgroundColor=ffd5dc',
    bio: '28岁，时尚博主，住在Chevy Chase Canyon的山景房。Americana at Brand是她的第二个家，几乎每天都去拍照打卡。性格活泼开朗，对时尚有独到见解。',
    personality: '外向、时尚、追求完美',
    occupation: '时尚博主',
    homeLocation: 'loc-home-3',
    stats: { clothing: 98, food: 65, housing: 95, transport: 75 },
    currentLocation: 'loc-home-3',
    status: 'active',
    routine: {
      wakeUp: '08:00',
      sleep: '00:00',
      workHours: '10:00-20:00',
      preferences: ['购物', '拍照', '探店', '社交媒体']
    }
  },
  {
    id: 'agent-4',
    name: '张思远',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsiyuan&backgroundColor=b6e3f4',
    bio: '35岁，UCLA客座教授，住在安静的Rossmoyne历史区。Glendale Central Library是他最常去的地方，藏书丰富且建筑优美。性格沉稳内敛，喜欢深度思考。',
    personality: '内向、理性、博学',
    occupation: '大学教授',
    homeLocation: 'loc-home-4',
    stats: { clothing: 70, food: 80, housing: 92, transport: 50 },
    currentLocation: 'loc-home-4',
    status: 'active',
    routine: {
      wakeUp: '06:00',
      sleep: '22:00',
      workHours: '08:00-17:00',
      preferences: ['阅读', '古典音乐', '散步', '写作']
    }
  },
  {
    id: 'agent-5',
    name: '刘阳光',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liuyangguang&backgroundColor=d1d4f9',
    bio: '23岁，自行车快递员，住在Wilson Ave公寓。每天骑遍Glendale的大街小巷送餐，Verdugo Park是他的秘密基地。性格阳光热情，总是充满正能量。',
    personality: '外向、活力、乐观',
    occupation: '快递员',
    homeLocation: 'loc-home-5',
    stats: { clothing: 60, food: 75, housing: 65, transport: 100 },
    currentLocation: 'loc-home-5',
    status: 'active',
    routine: {
      wakeUp: '05:30',
      sleep: '21:30',
      workHours: '07:00-19:00',
      preferences: ['骑行', '跑步', '野餐', '街头美食']
    }
  }
];

// ============================================
// LOCATIONS (Map Data)
// ============================================

export const locations: Location[] = [
  // Homes
  { id: 'loc-home-1', name: 'Wilson Ave Loft', type: 'home', x: toMapX(-118.2510), y: toMapY(34.1490), icon: '🏠', description: '林小雨的温馨loft公寓，采光极佳，墙上挂满插画作品' },
  { id: 'loc-home-2', name: 'Glendale Luxury Apt', type: 'home', x: toMapX(-118.2540), y: toMapY(34.1468), icon: '🏠', description: '陈大伟的现代化两居室，有完整的家庭健身房' },
  { id: 'loc-home-3', name: 'Chevy Chase Canyon', type: 'home', x: toMapX(-118.2400), y: toMapY(34.1550), icon: '🏠', description: '王小美的山景豪宅，落地窗俯瞰整个城市' },
  { id: 'loc-home-4', name: 'Rossmoyne Historic', type: 'home', x: toMapX(-118.2450), y: toMapY(34.1600), icon: '🏠', description: '张思远的1920年代老宅，书香气息浓厚，藏书三千册' },
  { id: 'loc-home-5', name: 'Wilson Ave Studio', type: 'home', x: toMapX(-118.2515), y: toMapY(34.1485), icon: '🏠', description: '刘阳光的简约单间，骑行装备占满整面墙' },
  
  // Cafes
  { id: 'loc-cafe-1', name: "Kings Row Coffee", type: 'cafe', x: toMapX(-118.2465), y: toMapY(34.1465), icon: '☕', description: '精品咖啡馆，手工烘焙，林小雨的最爱工作地点', hours: '07:00-19:00', rating: 4.5 },
  { id: 'loc-cafe-2', name: "Café Broadway", type: 'cafe', x: toMapX(-118.2545), y: toMapY(34.1468), icon: '☕', description: 'Glendale最古老的咖啡馆，氛围复古温馨', hours: '06:30-20:00', rating: 4.3 },
  { id: 'loc-cafe-3', name: "Recess Eatery", type: 'cafe', x: toMapX(-118.2550), y: toMapY(34.1475), icon: '☕', description: '时尚休闲餐厅，早午餐和咖啡都很棒', hours: '08:00-22:00', rating: 4.6 },
  
  // Restaurants
  { id: 'loc-restaurant-1', name: "Porto's Bakery", type: 'restaurant', x: toMapX(-118.2551), y: toMapY(34.1505), icon: '🥐', description: '传奇古巴面包店，拿破仑蛋糕和芝士卷必吃', hours: '06:00-21:00', rating: 4.8 },
  { id: 'loc-restaurant-2', name: "Din Tai Fung", type: 'restaurant', x: toMapX(-118.2575), y: toMapY(34.1440), icon: '🥟', description: '米其林推荐，小笼包和炒饭是招牌', hours: '11:00-21:00', rating: 4.7 },
  { id: 'loc-restaurant-3', name: "Raffi's Place", type: 'restaurant', x: toMapX(-118.2540), y: toMapY(34.1460), icon: '🍖', description: '正宗地中海料理，烤肉拼盘和鹰嘴豆泥绝赞', hours: '11:30-22:00', rating: 4.6 },
  { id: 'loc-restaurant-4', name: "Shake Shack", type: 'restaurant', x: toMapX(-118.2550), y: toMapY(34.1485), icon: '🍔', description: '网红汉堡店，芝士薯条和奶昔必点', hours: '11:00-22:00', rating: 4.4 },
  { id: 'loc-restaurant-5', name: "Lee's Sandwiches", type: 'restaurant', x: toMapX(-118.2550), y: toMapY(34.1450), icon: '🥪', description: '越南三明治，快速便宜又美味', hours: '07:00-21:00', rating: 4.3 },
  
  // Parks
  { id: 'loc-park-1', name: "Brand Park", type: 'park', x: toMapX(-118.2680), y: toMapY(34.1625), icon: '🌳', description: '山顶公园，可以俯瞰整个Glendale和远处Downtown LA', hours: '06:00-22:00', rating: 4.7 },
  { id: 'loc-park-2', name: "Verdugo Park", type: 'park', x: toMapX(-118.2410), y: toMapY(34.1720), icon: '🌲', description: '大型运动公园，有篮球场、网球场和环形跑道', hours: '05:00-22:00', rating: 4.5 },
  { id: 'loc-park-3', name: "Central Park", type: 'park', x: toMapX(-118.2550), y: toMapY(34.1260), icon: '🌿', description: '市中心绿地，适合野餐和遛狗', hours: '06:00-22:00', rating: 4.4 },
  
  // Shopping
  { id: 'loc-shop-1', name: "Americana at Brand", type: 'shop', x: toMapX(-118.2570), y: toMapY(34.1445), icon: '🛍️', description: '高端户外购物中心，有喷泉、电车和Apple Store', hours: '10:00-21:00', rating: 4.6 },
  { id: 'loc-shop-2', name: "Glendale Galleria", type: 'shop', x: toMapX(-118.2590), y: toMapY(34.1465), icon: '🏬', description: '大型室内购物中心，品牌齐全', hours: '10:00-21:00', rating: 4.3 },
  { id: 'loc-shop-3', name: "Target", type: 'shop', x: toMapX(-118.2370), y: toMapY(34.1390), icon: '🎯', description: '24小时Target超市，生活所需一应俱全', hours: '08:00-22:00', rating: 4.2 },
  { id: 'loc-shop-4', name: "Ralphs", type: 'shop', x: toMapX(-118.2650), y: toMapY(34.1610), icon: '🛒', description: '本地连锁超市，生鲜品质好', hours: '06:00-23:00', rating: 4.1 },
  
  // Libraries
  { id: 'loc-library-1', name: "Glendale Central Library", type: 'library', x: toMapX(-118.2530), y: toMapY(34.1480), icon: '📚', description: '获奖现代建筑，藏书丰富，三楼有安静阅读角', hours: '09:00-21:00', rating: 4.6 },
  { id: 'loc-library-2', name: "Grandview Library", type: 'library', x: toMapX(-118.2470), y: toMapY(34.1415), icon: '📖', description: '社区图书馆，氛围温馨安静', hours: '10:00-18:00', rating: 4.4 },
  
  // Landmarks & Work
  { id: 'loc-work-1', name: "Tech Hub Glendale", type: 'work', x: toMapX(-118.2560), y: toMapY(34.1450), icon: '💼', description: '科技公司共享办公空间，陈大伟的工作地点', hours: '08:00-20:00', rating: 4.5 },
  { id: 'loc-landmark-1', name: "Alex Theatre", type: 'work', x: toMapX(-118.2555), y: toMapY(34.1480), icon: '🎭', description: '1925年建成的Art Deco复古剧院，经常有演出', hours: 'Varies', rating: 4.7 },
  { id: 'loc-landmark-2', name: "Forest Lawn Museum", type: 'work', x: toMapX(-118.2280), y: toMapY(34.1230), icon: '🏛️', description: '艺术博物馆，珍藏名家作品和雕塑', hours: '10:00-17:00', rating: 4.8 },
  
  // Transport
  { id: 'loc-transport-1', name: "Glendale Station", type: 'transport', x: toMapX(-118.2590), y: toMapY(34.1360), icon: '🚆', description: 'Metrolink火车站，去Downtown LA很方便', hours: '04:30-23:00', rating: 4.2 },
  { id: 'loc-transport-2', name: "Metro Bus Stop", type: 'transport', x: toMapX(-118.2550), y: toMapY(34.1470), icon: '🚌', description: 'Brand & Broadway公交站，线路覆盖全城', hours: '05:00-23:00', rating: 4.0 },
];

// ============================================
// DETAILED DAILY SCHEDULES (10+ actions per resident)
// ============================================

// 林小雨 - 插画师的一天 (13 actions)
export const scheduleLinXiaoyu: DailySchedule = {
  agentId: 'agent-1',
  date: '2026-02-16',
  actions: [
    {
      id: 'lin-01',
      time: '07:30',
      type: 'wake',
      fromLocation: 'loc-home-1',
      toLocation: 'loc-home-1',
      description: '被阳光照醒，赖床10分钟刷Instagram看插画作品',
      involvedAgents: [],
      details: { activity: '起床', mood: ' sleepy but happy' }
    },
    {
      id: 'lin-02',
      time: '08:00',
      type: 'home',
      fromLocation: 'loc-home-1',
      toLocation: 'loc-home-1',
      description: '在家做牛油果吐司+煎蛋，搭配燕麦拿铁',
      involvedAgents: [],
      details: { activity: '做早餐', food: '牛油果吐司+煎蛋', drink: '燕麦拿铁' }
    },
    {
      id: 'lin-03',
      time: '08:45',
      type: 'travel',
      fromLocation: 'loc-home-1',
      toLocation: 'loc-cafe-1',
      description: '步行12分钟去Kings Row Coffee，沿途拍摄街景',
      involvedAgents: [],
      details: { transport: '步行', duration: '12分钟', route: 'Wilson Ave → Broadway' }
    },
    {
      id: 'lin-04',
      time: '09:00',
      type: 'work',
      fromLocation: 'loc-cafe-1',
      toLocation: 'loc-cafe-1',
      description: '点了冷萃咖啡，开始画客户的品牌插画，听Lo-fi音乐',
      involvedAgents: [],
      details: { activity: '工作', workType: '品牌插画', order: '冷萃咖啡$5.5', music: 'Lo-fi' }
    },
    {
      id: 'lin-05',
      time: '11:30',
      type: 'social',
      fromLocation: 'loc-cafe-1',
      toLocation: 'loc-cafe-1',
      description: '偶遇陈大伟，聊了15分钟，交换了各自的早餐推荐',
      involvedAgents: ['agent-2'],
      details: { activity: '聊天', topic: '美食推荐', duration: '15分钟' }
    },
    {
      id: 'lin-06',
      time: '12:00',
      type: 'meal',
      fromLocation: 'loc-cafe-1',
      toLocation: 'loc-restaurant-5',
      description: '去Lee\'s Sandwiches买越南三明治当午餐，加冰咖啡套餐',
      involvedAgents: [],
      details: { activity: '午餐', food: '越南三明治', drink: '冰咖啡', cost: '$12' }
    },
    {
      id: 'lin-07',
      time: '13:00',
      type: 'travel',
      fromLocation: 'loc-restaurant-5',
      toLocation: 'loc-cafe-1',
      description: '走回咖啡馆，路上在书店橱窗看了新到的画册',
      involvedAgents: [],
      details: { transport: '步行', duration: '8分钟' }
    },
    {
      id: 'lin-08',
      time: '13:15',
      type: 'work',
      fromLocation: 'loc-cafe-1',
      toLocation: 'loc-cafe-1',
      description: '继续工作，回复客户邮件，修改插画细节',
      involvedAgents: [],
      details: { activity: '工作', workType: '客户沟通+修改' }
    },
    {
      id: 'lin-09',
      time: '16:30',
      type: 'travel',
      fromLocation: 'loc-cafe-1',
      toLocation: 'loc-shop-3',
      description: '骑车去Target买生活用品和零食',
      involvedAgents: [],
      details: { transport: '自行车', duration: '10分钟', shopping: '生活用品+零食' }
    },
    {
      id: 'lin-10',
      time: '17:30',
      type: 'shopping',
      fromLocation: 'loc-shop-3',
      toLocation: 'loc-shop-3',
      description: '在Target买了洗发水、面膜、薯力和绿茶，花了$45',
      involvedAgents: [],
      details: { activity: '购物', items: ['洗发水', '面膜', '薯力', '绿茶'], cost: '$45' }
    },
    {
      id: 'lin-11',
      time: '18:00',
      type: 'travel',
      fromLocation: 'loc-shop-3',
      toLocation: 'loc-home-1',
      description: '骑车回家，路上晚霞很美，停车拍了照片',
      involvedAgents: [],
      details: { transport: '自行车', duration: '12分钟', note: '拍了晚霞照片' }
    },
    {
      id: 'lin-12',
      time: '18:30',
      type: 'home',
      fromLocation: 'loc-home-1',
      toLocation: 'loc-home-1',
      description: '做晚餐：三文鱼沙拉+味噌汤，边吃饭边看Netflix',
      involvedAgents: [],
      details: { activity: '晚餐', food: '三文鱼沙拉+味噌汤', entertainment: 'Netflix' }
    },
    {
      id: 'lin-13',
      time: '20:00',
      type: 'home',
      fromLocation: 'loc-home-1',
      toLocation: 'loc-home-1',
      description: '继续画自己的个人项目，给猫咪梳毛，准备睡觉',
      involvedAgents: [],
      details: { activity: '个人创作', pet: '给猫咪梳毛', sleepTime: '23:30' }
    }
  ]
};

// 陈大伟 - 软件工程师的一天 (12 actions)
export const scheduleChenDawei: DailySchedule = {
  agentId: 'agent-2',
  date: '2026-02-16',
  actions: [
    {
      id: 'chen-01',
      time: '06:30',
      type: 'wake',
      fromLocation: 'loc-home-2',
      toLocation: 'loc-home-2',
      description: '闹钟响，立刻起床，做20个俯卧撑清醒一下',
      involvedAgents: [],
      details: { activity: '起床', exercise: '20个俯卧撑' }
    },
    {
      id: 'chen-02',
      time: '06:45',
      type: 'home',
      fromLocation: 'loc-home-2',
      toLocation: 'loc-home-2',
      description: '做高蛋白早餐：燕麦+蛋白粉+蓝莓+坚果',
      involvedAgents: [],
      details: { activity: '早餐', food: '燕麦蛋白粉碗', macros: '35g蛋白质' }
    },
    {
      id: 'chen-03',
      time: '07:30',
      type: 'travel',
      fromLocation: 'loc-home-2',
      toLocation: 'loc-gym',
      description: '开车去Equinox健身房，路上听科技播客',
      involvedAgents: [],
      details: { transport: '开车', duration: '8分钟', podcast: 'TechCrunch Daily' }
    },
    {
      id: 'chen-04',
      time: '08:30',
      type: 'travel',
      fromLocation: 'loc-gym',
      toLocation: 'loc-work-1',
      description: '健身完开车去公司，顺路在Porto\'s买拿破仑蛋糕',
      involvedAgents: [],
      details: { transport: '开车', duration: '12分钟', purchase: 'Porto\'s拿破仑蛋糕' }
    },
    {
      id: 'chen-05',
      time: '09:00',
      type: 'work',
      fromLocation: 'loc-work-1',
      toLocation: 'loc-work-1',
      description: '到公司，开早会，开始写代码解决API性能问题',
      involvedAgents: [],
      details: { activity: '工作', workType: '代码开发', task: 'API性能优化' }
    },
    {
      id: 'chen-06',
      time: '12:00',
      type: 'meal',
      fromLocation: 'loc-work-1',
      toLocation: 'loc-restaurant-3',
      description: '和同事去Raffi\'s Place吃地中海午餐，点了烤肉拼盘',
      involvedAgents: [],
      details: { activity: '午餐', food: '烤肉拼盘+鹰嘴豆泥', cost: '$18', with: '同事' }
    },
    {
      id: 'chen-07',
      time: '13:00',
      type: 'travel',
      fromLocation: 'loc-restaurant-3',
      toLocation: 'loc-work-1',
      description: '步行回公司，路上买了冰美式',
      involvedAgents: [],
      details: { transport: '步行', drink: '冰美式', duration: '6分钟' }
    },
    {
      id: 'chen-08',
      time: '15:00',
      type: 'social',
      fromLocation: 'loc-work-1',
      toLocation: 'loc-cafe-1',
      description: '去Kings Row Coffee偶遇林小雨，聊了健身和咖啡',
      involvedAgents: ['agent-1'],
      details: { activity: '社交', topic: '健身+咖啡', duration: '15分钟' }
    },
    {
      id: 'chen-09',
      time: '15:30',
      type: 'work',
      fromLocation: 'loc-cafe-1',
      toLocation: 'loc-work-1',
      description: '回公司继续工作，参加下午的code review会议',
      involvedAgents: [],
      details: { activity: '工作', workType: 'code review' }
    },
    {
      id: 'chen-10',
      time: '18:00',
      type: 'travel',
      fromLocation: 'loc-work-1',
      toLocation: 'loc-home-2',
      description: '下班开车回家，路上给妈妈打电话',
      involvedAgents: [],
      details: { transport: '开车', duration: '15分钟', call: '妈妈' }
    },
    {
      id: 'chen-11',
      time: '19:00',
      type: 'home',
      fromLocation: 'loc-home-2',
      toLocation: 'loc-home-2',
      description: '做晚餐：香煎牛排+芦笋+红薯，配红酒',
      involvedAgents: [],
      details: { activity: '晚餐', food: '牛排+芦笋+红薯', drink: '红酒' }
    },
    {
      id: 'chen-12',
      time: '21:00',
      type: 'home',
      fromLocation: 'loc-home-2',
      toLocation: 'loc-home-2',
      description: '看NBA比赛，做拉伸运动，准备睡觉',
      involvedAgents: [],
      details: { activity: '娱乐', entertainment: 'NBA比赛', exercise: '拉伸', sleepTime: '22:30' }
    }
  ]
};

// 王小美 - 时尚博主的一天 (14 actions)
export const scheduleWangXiaomei: DailySchedule = {
  agentId: 'agent-3',
  date: '2026-02-16',
  actions: [
    {
      id: 'wang-01',
      time: '08:00',
      type: 'wake',
      fromLocation: 'loc-home-3',
      toLocation: 'loc-home-3',
      description: '闹钟响了三次才起床，先看手机回粉丝留言',
      involvedAgents: [],
      details: { activity: '起床', socialMedia: '回复Instagram留言50条' }
    },
    {
      id: 'wang-02',
      time: '08:30',
      type: 'home',
      fromLocation: 'loc-home-3',
      toLocation: 'loc-home-3',
      description: '精致护肤routine，敷面膜同时策划今天拍摄内容',
      involvedAgents: [],
      details: { activity: '护肤', routine: '精华+面膜+防晒', planning: '拍摄脚本' }
    },
    {
      id: 'wang-03',
      time: '09:30',
      type: 'travel',
      fromLocation: 'loc-home-3',
      toLocation: 'loc-cafe-3',
      description: '开车下山去Recess Eatery，准备在那里拍摄早午餐',
      involvedAgents: [],
      details: { transport: '开车', duration: '15分钟', purpose: '拍摄早午餐' }
    },
    {
      id: 'wang-04',
      time: '10:00',
      type: 'work',
      fromLocation: 'loc-cafe-3',
      toLocation: 'loc-cafe-3',
      description: '点了班尼迪克蛋+冰拿铁，拍摄食物和平板修图',
      involvedAgents: [],
      details: { activity: '拍摄+工作', food: '班尼迪克蛋', drink: '冰拿铁', editing: '修图30张' }
    },
    {
      id: 'wang-05',
      time: '11:30',
      type: 'travel',
      fromLocation: 'loc-cafe-3',
      toLocation: 'loc-shop-1',
      description: '步行去Americana at Brand，准备拍摄春季穿搭',
      involvedAgents: [],
      details: { transport: '步行', duration: '5分钟', purpose: '春季穿搭拍摄' }
    },
    {
      id: 'wang-06',
      time: '12:00',
      type: 'shopping',
      fromLocation: 'loc-shop-1',
      toLocation: 'loc-shop-1',
      description: '在Zara试了三套衣服，买了一件风衣$89，拍摄试衣间OOTD',
      involvedAgents: [],
      details: { activity: '购物+拍摄', store: 'Zara', purchase: '风衣$89', content: '试衣间OOTD' }
    },
    {
      id: 'wang-07',
      time: '13:30',
      type: 'meal',
      fromLocation: 'loc-shop-1',
      toLocation: 'loc-restaurant-2',
      description: '和助理去Din Tai Fung吃午餐，拍摄小笼包吃播视频',
      involvedAgents: [],
      details: { activity: '午餐+拍摄', food: '小笼包+炒饭', cost: '$35', content: '吃播视频' }
    },
    {
      id: 'wang-08',
      time: '14:30',
      type: 'social',
      fromLocation: 'loc-restaurant-2',
      toLocation: 'loc-shop-1',
      description: '在Americana偶遇刘阳光，聊了新开的咖啡店',
      involvedAgents: ['agent-5'],
      details: { activity: '社交', topic: '新开咖啡店', duration: '10分钟' }
    },
    {
      id: 'wang-09',
      time: '15:00',
      type: 'shopping',
      fromLocation: 'loc-shop-1',
      toLocation: 'loc-shop-1',
      description: '去Sephora补妆+试新品，买了新款唇釉$28',
      involvedAgents: [],
      details: { activity: '购物', store: 'Sephora', purchase: '唇釉$28' }
    },
    {
      id: 'wang-10',
      time: '16:00',
      type: 'travel',
      fromLocation: 'loc-shop-1',
      toLocation: 'loc-park-3',
      description: '开车去Central Park拍户外写真',
      involvedAgents: [],
      details: { transport: '开车', duration: '8分钟', purpose: '户外写真' }
    },
    {
      id: 'wang-11',
      time: '16:30',
      type: 'work',
      fromLocation: 'loc-park-3',
      toLocation: 'loc-park-3',
      description: '在公园拍春季赏花穿搭，换了3套衣服',
      involvedAgents: [],
      details: { activity: '拍摄', location: 'Central Park', outfitChanges: 3 }
    },
    {
      id: 'wang-12',
      time: '18:00',
      type: 'travel',
      fromLocation: 'loc-park-3',
      toLocation: 'loc-home-3',
      description: '开车回家，路上剪辑今天拍的视频',
      involvedAgents: [],
      details: { transport: '开车', duration: '12分钟', activity: '视频剪辑' }
    },
    {
      id: 'wang-13',
      time: '19:00',
      type: 'home',
      fromLocation: 'loc-home-3',
      toLocation: 'loc-home-3',
      description: '做轻食沙拉晚餐，继续修图剪视频',
      involvedAgents: [],
      details: { activity: '晚餐+工作', food: '沙拉', work: '修图+剪辑' }
    },
    {
      id: 'wang-14',
      time: '22:00',
      type: 'home',
      fromLocation: 'loc-home-3',
      toLocation: 'loc-home-3',
      description: '敷面膜，回复粉丝评论，准备明天拍摄计划',
      involvedAgents: [],
      details: { activity: '护肤+规划', socialMedia: '回复评论', planning: '明天计划', sleepTime: '00:00' }
    }
  ]
};

// 张思远 - 大学教授的一天 (12 actions)
export const scheduleZhangSiyuan: DailySchedule = {
  agentId: 'agent-4',
  date: '2026-02-16',
  actions: [
    {
      id: 'zhang-01',
      time: '06:00',
      type: 'wake',
      fromLocation: 'loc-home-4',
      toLocation: 'loc-home-4',
      description: '自然醒，煮一壶龙井茶，坐在阳台看书',
      involvedAgents: [],
      details: { activity: '起床', tea: '龙井', book: '《西方哲学史》' }
    },
    {
      id: 'zhang-02',
      time: '07:00',
      type: 'home',
      fromLocation: 'loc-home-4',
      toLocation: 'loc-home-4',
      description: '做中式早餐：小米粥+咸菜+水煮蛋',
      involvedAgents: [],
      details: { activity: '早餐', food: '小米粥+咸菜+水煮蛋' }
    },
    {
      id: 'zhang-03',
      time: '08:00',
      type: 'travel',
      fromLocation: 'loc-home-4',
      toLocation: 'loc-library-1',
      description: '开车去Glendale Central Library，准备今天的讲座资料',
      involvedAgents: [],
      details: { transport: '开车', duration: '12分钟', purpose: '准备讲座' }
    },
    {
      id: 'zhang-04',
      time: '08:30',
      type: 'work',
      fromLocation: 'loc-library-1',
      toLocation: 'loc-library-1',
      description: '在三楼安静角落阅读学术期刊，做笔记',
      involvedAgents: [],
      details: { activity: '研究', location: '图书馆三楼', material: '学术期刊' }
    },
    {
      id: 'zhang-05',
      time: '10:00',
      type: 'travel',
      fromLocation: 'loc-library-1',
      toLocation: 'loc-cafe-2',
      description: '步行去Café Broadway，换个环境继续工作',
      involvedAgents: [],
      details: { transport: '步行', duration: '8分钟' }
    },
    {
      id: 'zhang-06',
      time: '10:15',
      type: 'work',
      fromLocation: 'loc-cafe-2',
      toLocation: 'loc-cafe-2',
      description: '点了美式咖啡，写讲座PPT，回复学生邮件',
      involvedAgents: [],
      details: { activity: '工作', drink: '美式咖啡', tasks: ['写PPT', '回复邮件'] }
    },
    {
      id: 'zhang-07',
      time: '12:00',
      type: 'meal',
      fromLocation: 'loc-cafe-2',
      toLocation: 'loc-restaurant-1',
      description: '去Porto\'s买古巴三明治和咖啡，坐在户外吃',
      involvedAgents: [],
      details: { activity: '午餐', food: '古巴三明治', drink: '咖啡', location: '户外座位' }
    },
    {
      id: 'zhang-08',
      time: '13:00',
      type: 'travel',
      fromLocation: 'loc-restaurant-1',
      toLocation: 'loc-landmark-1',
      description: '步行去Alex Theatre附近散步，思考讲座内容',
      involvedAgents: [],
      details: { transport: '步行', duration: '10分钟', activity: '散步+思考' }
    },
    {
      id: 'zhang-09',
      time: '14:00',
      type: 'travel',
      fromLocation: 'loc-landmark-1',
      toLocation: 'loc-library-1',
      description: '返回图书馆，整理今天的笔记',
      involvedAgents: [],
      details: { transport: '步行', duration: '12分钟' }
    },
    {
      id: 'zhang-10',
      time: '15:00',
      type: 'social',
      fromLocation: 'loc-library-1',
      toLocation: 'loc-library-1',
      description: '偶遇也在图书馆的林小雨，交流了插画和哲学的联系',
      involvedAgents: ['agent-1'],
      details: { activity: '学术交流', topic: '插画与哲学', duration: '20分钟' }
    },
    {
      id: 'zhang-11',
      time: '17:00',
      type: 'travel',
      fromLocation: 'loc-library-1',
      toLocation: 'loc-home-4',
      description: '开车回家，听古典音乐放松',
      involvedAgents: [],
      details: { transport: '开车', duration: '12分钟', music: '贝多芬钢琴奏鸣曲' }
    },
    {
      id: 'zhang-12',
      time: '18:00',
      type: 'home',
      fromLocation: 'loc-home-4',
      toLocation: 'loc-home-4',
      description: '做简单晚餐，继续阅读，晚上听柏林爱乐直播',
      involvedAgents: [],
      details: { activity: '晚餐+阅读+音乐', dinner: '简单晚餐', entertainment: '柏林爱乐直播', sleepTime: '22:00' }
    }
  ]
};

// 刘阳光 - 快递员的一天 (15 actions)
export const scheduleLiuYangguang: DailySchedule = {
  agentId: 'agent-5',
  date: '2026-02-16',
  actions: [
    {
      id: 'liu-01',
      time: '05:30',
      type: 'wake',
      fromLocation: 'loc-home-5',
      toLocation: 'loc-home-5',
      description: '闹钟响，立刻起床，喝一大杯温水',
      involvedAgents: [],
      details: { activity: '起床', drink: '温水500ml' }
    },
    {
      id: 'liu-02',
      time: '05:45',
      type: 'travel',
      fromLocation: 'loc-home-5',
      toLocation: 'loc-park-2',
      description: '骑车去Verdugo Park晨跑',
      involvedAgents: [],
      details: { transport: '自行车', duration: '10分钟' }
    },
    {
      id: 'liu-03',
      time: '06:00',
      type: 'exercise',
      fromLocation: 'loc-park-2',
      toLocation: 'loc-park-2',
      description: '晨跑5公里，用时22分钟，做拉伸',
      involvedAgents: [],
      details: { activity: '跑步', distance: '5km', duration: '22分钟', extra: '拉伸10分钟' }
    },
    {
      id: 'liu-04',
      time: '06:45',
      type: 'travel',
      fromLocation: 'loc-park-2',
      toLocation: 'loc-restaurant-5',
      description: '骑车去Lee\'s Sandwiches买早餐',
      involvedAgents: [],
      details: { transport: '自行车', duration: '8分钟' }
    },
    {
      id: 'liu-05',
      time: '07:00',
      type: 'meal',
      fromLocation: 'loc-restaurant-5',
      toLocation: 'loc-restaurant-5',
      description: '买了越南三明治+冰咖啡，在店外快速吃完',
      involvedAgents: [],
      details: { activity: '早餐', food: '越南三明治', drink: '冰咖啡', cost: '$8' }
    },
    {
      id: 'liu-06',
      time: '07:20',
      type: 'travel',
      fromLocation: 'loc-restaurant-5',
      toLocation: 'loc-transport-1',
      description: '骑车去Glendale Station取第一批快递',
      involvedAgents: [],
      details: { transport: '自行车', duration: '12分钟' }
    },
    {
      id: 'liu-07',
      time: '07:35',
      type: 'work',
      fromLocation: 'loc-transport-1',
      toLocation: 'loc-work-1',
      description: '送第一批快递到Tech Hub，3个包裹',
      involvedAgents: [],
      details: { activity: '送快递', location: 'Tech Hub', packages: 3 }
    },
    {
      id: 'liu-08',
      time: '08:30',
      type: 'work',
      fromLocation: 'loc-work-1',
      toLocation: 'loc-home-1',
      description: '送快递到Wilson Ave区域，包括林小雨的公寓',
      involvedAgents: ['agent-1'],
      details: { activity: '送快递', area: 'Wilson Ave', packages: 5, note: '送到林小雨家' }
    },
    {
      id: 'liu-09',
      time: '09:30',
      type: 'work',
      fromLocation: 'loc-home-1',
      toLocation: 'loc-shop-1',
      description: '送快递到Americana at Brand的商家',
      involvedAgents: [],
      details: { activity: '送快递', location: 'Americana', packages: 8 }
    },
    {
      id: 'liu-10',
      time: '10:30',
      type: 'social',
      fromLocation: 'loc-shop-1',
      toLocation: 'loc-restaurant-2',
      description: '在Din Tai Fung门口偶遇王小美，聊了会儿',
      involvedAgents: ['agent-3'],
      details: { activity: '休息+社交', duration: '10分钟', topic: '工作日常' }
    },
    {
      id: 'liu-11',
      time: '11:00',
      type: 'work',
      fromLocation: 'loc-restaurant-2',
      toLocation: 'loc-library-1',
      description: '继续送快递，送到图书馆',
      involvedAgents: [],
      details: { activity: '送快递', location: 'Central Library', packages: 4 }
    },
    {
      id: 'liu-12',
      time: '12:30',
      type: 'meal',
      fromLocation: 'loc-library-1',
      toLocation: 'loc-restaurant-4',
      description: '在Shake Shack吃午餐：招牌汉堡+薯条+可乐',
      involvedAgents: [],
      details: { activity: '午餐', food: '汉堡+薯条', drink: '可乐', cost: '$15' }
    },
    {
      id: 'liu-13',
      time: '13:30',
      type: 'work',
      fromLocation: 'loc-restaurant-4',
      toLocation: 'loc-park-1',
      description: '继续送快递，送到Brand Park附近',
      involvedAgents: [],
      details: { activity: '送快递', area: 'Brand Park区域', packages: 6 }
    },
    {
      id: 'liu-14',
      time: '16:00',
      type: 'work',
      fromLocation: 'loc-park-1',
      toLocation: 'loc-home-5',
      description: '送完最后一批快递，骑车回家',
      involvedAgents: [],
      details: { activity: '下班', totalPackages: 26 }
    },
    {
      id: 'liu-15',
      time: '17:00',
      type: 'home',
      fromLocation: 'loc-home-5',
      toLocation: 'loc-home-5',
      description: '做晚餐：鸡胸肉+蔬菜，看Netflix，做肌肉放松',
      involvedAgents: [],
      details: { activity: '晚餐+休息', food: '鸡胸肉+蔬菜', entertainment: 'Netflix', sleepTime: '21:30' }
    }
  ]
};

// Export all schedules
export const dailySchedules: DailySchedule[] = [
  scheduleLinXiaoyu,
  scheduleChenDawei,
  scheduleWangXiaomei,
  scheduleZhangSiyuan,
  scheduleLiuYangguang
];

// ============================================
// LEGACY MOCK DATA (for compatibility)
// ============================================

export const mockActivities: Activity[] = [
  { id: 'act-1', agentId: 'agent-1', type: 'move', location: 'loc-home-1', timestamp: new Date('2026-02-16T07:30:00'), description: '在Wilson Ave公寓起床，开始新的一天' },
  { id: 'act-2', agentId: 'agent-1', type: 'move', location: 'loc-cafe-1', timestamp: new Date('2026-02-16T08:15:00'), description: '步行到Kings Row Coffee，点了冷萃咖啡' },
  { id: 'act-3', agentId: 'agent-1', type: 'work', location: 'loc-cafe-1', timestamp: new Date('2026-02-16T09:00:00'), description: '在咖啡馆角落开始画客户的品牌插画' },
  { id: 'act-4', agentId: 'agent-2', type: 'move', location: 'loc-restaurant-1', timestamp: new Date('2026-02-16T07:30:00'), description: '健身完来Porto\'s买拿破仑蛋糕当早餐' },
  { id: 'act-5', agentId: 'agent-2', type: 'work', location: 'loc-work-1', timestamp: new Date('2026-02-16T09:00:00'), description: '到公司开始写代码，解决API性能问题' },
  { id: 'act-6', agentId: 'agent-3', type: 'move', location: 'loc-shop-1', timestamp: new Date('2026-02-16T10:30:00'), description: '在Americana拍摄春季穿搭内容' },
  { id: 'act-7', agentId: 'agent-4', type: 'move', location: 'loc-library-1', timestamp: new Date('2026-02-16T08:00:00'), description: '到Glendale Central Library阅读学术期刊' },
  { id: 'act-8', agentId: 'agent-5', type: 'move', location: 'loc-park-2', timestamp: new Date('2026-02-16T06:00:00'), description: '在Verdugo Park完成5公里晨跑' },
  { id: 'act-9', agentId: 'agent-5', type: 'work', location: 'loc-transport-1', timestamp: new Date('2026-02-16T07:20:00'), description: '在火车站附近开始送第一批快递' },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['agent-1', 'agent-2'],
    messages: [
      { id: 'msg-1', senderId: 'agent-2', content: '早啊小雨！又来Kings Row工作？今天也画插画吗？', timestamp: new Date('2026-02-16T08:20:00') },
      { id: 'msg-2', senderId: 'agent-1', content: '是啊，这里的氛围最适合画画了。你呢？又去健身了？', timestamp: new Date('2026-02-16T08:22:00') },
      { id: 'msg-3', senderId: 'agent-2', content: '刚健身完！一会儿去Porto\'s买拿破仑蛋糕当早餐，要帮你带什么吗？', timestamp: new Date('2026-02-16T08:25:00') },
    ],
    location: 'loc-cafe-1',
    startedAt: new Date('2026-02-16T08:20:00'),
    topic: '日常问候与美食'
  },
  {
    id: 'conv-2',
    participants: ['agent-3', 'agent-5'],
    messages: [
      { id: 'msg-4', senderId: 'agent-3', content: '阳光！在送快递吗？看你骑车好快', timestamp: new Date('2026-02-16T11:00:00') },
      { id: 'msg-5', senderId: 'agent-5', content: '是啊小美！Americana这边好多包裹要送。听说新开了一家咖啡店，你有去吗？', timestamp: new Date('2026-02-16T11:02:00') },
      { id: 'msg-6', senderId: 'agent-3', content: '还没呢！改天一起去探店？我可以帮你拍照', timestamp: new Date('2026-02-16T11:05:00') },
    ],
    location: 'loc-shop-1',
    startedAt: new Date('2026-02-16T11:00:00'),
    topic: '工作与探店'
  },
  {
    id: 'conv-3',
    participants: ['agent-1', 'agent-4'],
    messages: [
      { id: 'msg-7', senderId: 'agent-4', content: '小雨，你也常来图书馆？', timestamp: new Date('2026-02-16T15:00:00') },
      { id: 'msg-8', senderId: 'agent-1', content: '张教授！是啊，有时候换个环境工作。您在准备讲座吗？', timestamp: new Date('2026-02-16T15:02:00') },
      { id: 'msg-9', senderId: 'agent-4', content: '对。你的插画作品很有哲学意味，让我想起海德格尔的存在主义...', timestamp: new Date('2026-02-16T15:05:00') },
      { id: 'msg-10', senderId: 'agent-1', content: '哇，从来没从这个角度想过！可以请教您更多吗？', timestamp: new Date('2026-02-16T15:08:00') },
    ],
    location: 'loc-library-1',
    startedAt: new Date('2026-02-16T15:00:00'),
    topic: '艺术与哲学'
  }
];

export const mockMemories: Memory[] = [
  { id: 'mem-1', agentId: 'agent-1', category: 'places', content: 'Kings Row Coffee的角落位置最适合画画，窗外是Brand Blvd的街景，阳光从落地窗洒进来', date: new Date('2026-02-15'), importance: 9 },
  { id: 'mem-2', agentId: 'agent-1', category: 'people', content: '陈大伟推荐了Porto\'s的拿破仑蛋糕，确实很美味', date: new Date('2026-02-15'), importance: 7 },
  { id: 'mem-3', agentId: 'agent-2', category: 'preferences', content: 'Equinox健身房的早晨人少，适合专注训练', date: new Date('2026-02-15'), importance: 8 },
  { id: 'mem-4', agentId: 'agent-3', category: 'places', content: 'Americana at Brand的喷泉晚上会亮灯，是拍照的绝佳背景', date: new Date('2026-02-14'), importance: 9 },
  { id: 'mem-5', agentId: 'agent-4', category: 'places', content: 'Glendale Central Library三楼有最安静的阅读角落，适合深度阅读', date: new Date('2026-02-14'), importance: 9 },
  { id: 'mem-6', agentId: 'agent-5', category: 'places', content: 'Verdugo Park的环形跑道刚好2公里，是晨跑的最佳路线', date: new Date('2026-02-15'), importance: 10 },
];

export const mockJournals: JournalEntry[] = [
  {
    id: 'journal-1',
    agentId: 'agent-1',
    date: new Date('2026-02-15'),
    content: '今天在Kings Row完成了客户委托的插画作品。窗外的Brand Blvd人来人往，给了我很多灵感。下午去了Brand Park写生，山顶的夕阳太美了。晚上遇到了陈大伟，他推荐的拿破仑蛋糕果然名不虚传。Glendale真的是个适合艺术创作的地方，每个角落都有故事。',
    mood: '平静愉悦',
    highlights: ['完成插画作品', 'Brand Park写生', '发现美食', 'Kings Row的美好时光']
  },
  {
    id: 'journal-2',
    agentId: 'agent-2',
    date: new Date('2026-02-15'),
    content: '早上在Equinox练了胸和肩，感觉很棒。在公司解决了一个棘手的技术问题，感觉很有成就感！晚上回家做了红烧肉，味道还不错。给爸妈打了电话，他们身体都挺好的。明天周末，计划去Brand Park爬山。Glendale的生活节奏刚刚好。',
    mood: '充实满足',
    highlights: ['健身打卡', '解决技术难题', '做红烧肉', '和家人通话']
  },
  {
    id: 'journal-3',
    agentId: 'agent-3',
    date: new Date('2026-02-15'),
    content: '今天的拍摄很顺利！新款春装搭配出来效果特别好，Americana的喷泉背景绝了。粉丝们的反响也很热烈，留言都回不过来了。下午和助理去Din Tai Fung喝了下午茶，聊了很多关于时尚趋势的话题。晚上整理照片，看着一张张精美的作品，觉得所有的努力都值得。明天继续！',
    mood: '兴奋满足',
    highlights: ['拍摄顺利', '粉丝反响热烈', 'Din Tai Fung下午茶', '时尚趋势讨论']
  },
  {
    id: 'journal-4',
    agentId: 'agent-4',
    date: new Date('2026-02-15'),
    content: '今天在图书馆待了一整天，读完了海德格尔的《存在与时间》相关章节。这种沉浸式的阅读体验真是难得。傍晚在Rossmoyne的街道上散步，老房子的韵味让人沉醉。晚上回家听了一场柏林爱乐的演奏会直播，心灵得到了极大的满足。明天要准备下周的讲座内容，主题是技术与人类存在。',
    mood: '宁静深远',
    highlights: ['深度阅读', 'Rossmoyne历史区漫步', '柏林爱乐直播', '思考讲座内容']
  },
  {
    id: 'journal-5',
    agentId: 'agent-5',
    date: new Date('2026-02-15'),
    content: '今天的deliveries都准时送到了！虽然有点累，但是看到客户满意的笑容就觉得值得。一共送了26个包裹，创历史新高！傍晚去Verdugo Park跑了五公里，用时22分钟，感觉身体状态不错。晚上和室友一起吃了火锅，聊到很晚。年轻就是要这样有冲劲！明天继续加油！',
    mood: '活力满满',
    highlights: ['准时送达所有快递', '26个包裹新纪录', 'Verdugo Park跑步', '和朋友吃火锅']
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return locations.find(l => l.id === id);
}

export function getScheduleByAgent(agentId: string): DailySchedule | undefined {
  return dailySchedules.find(s => s.agentId === agentId);
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

// Get current action for an agent based on time
export function getCurrentAction(agentId: string, hour: number, minute: number = 0) {
  const schedule = getScheduleByAgent(agentId);
  if (!schedule) return null;
  
  const currentTime = hour * 60 + minute;
  
  for (const action of schedule.actions) {
    const [actionHour, actionMinute] = action.time.split(':').map(Number);
    const actionTime = actionHour * 60 + actionMinute;
    
    if (actionTime <= currentTime) {
      // Check if next action exists and if current time is before it
      const nextAction = schedule.actions[schedule.actions.indexOf(action) + 1];
      if (nextAction) {
        const [nextHour, nextMinute] = nextAction.time.split(':').map(Number);
        const nextTime = nextHour * 60 + nextMinute;
        if (currentTime < nextTime) {
          return action;
        }
      } else {
        // Last action of the day
        return action;
      }
    }
  }
  
  return schedule.actions[0];
}

// Get journey between two locations
export function getJourney(fromId: string, toId: string) {
  const from = getLocationById(fromId);
  const to = getLocationById(toId);
  if (!from || !to) return null;
  
  return {
    from,
    to,
    distance: Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)),
    estimatedTime: Math.ceil(Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)) * 2) // rough estimate
  };
}
