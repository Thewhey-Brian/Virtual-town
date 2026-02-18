import { prisma } from '@/lib/prisma'

// Glendale, CA coordinates and places
const GLENDALE_PLACES = [
  {
    name: "Porto's Bakery & Cafe",
    address: '315 N Brand Blvd, Glendale, CA 91203',
    lat: 34.1495,
    lng: -118.2541,
    placeType: 'CAFE',
    description: 'Famous Cuban bakery known for cheese rolls and potato balls',
    rating: 4.7,
  },
  {
    name: 'Americana at Brand',
    address: '889 Americana Way, Glendale, CA 91210',
    lat: 134.1445,
    lng: -118.2565,
    placeType: 'SHOP',
    description: 'Upscale outdoor shopping center with fountain shows',
    rating: 4.6,
  },
  {
    name: 'Brand Park',
    address: '1601 W Mountain St, Glendale, CA 91201',
    lat: 34.1715,
    lng: -118.2865,
    placeType: 'PARK',
    description: 'Historic park with Japanese garden and city views',
    rating: 4.5,
  },
  {
    name: 'Glendale Galleria',
    address: '100 W Broadway, Glendale, CA 91210',
    lat: 34.1465,
    lng: -118.2575,
    placeType: 'SHOP',
    description: 'Large indoor shopping mall',
    rating: 4.4,
  },
  {
    name: 'Din Tai Fung',
    address: '177 Caruso Ave, Glendale, CA 91210',
    lat: 34.1445,
    lng: -118.2555,
    placeType: 'RESTAURANT',
    description: 'Famous Taiwanese dumpling restaurant',
    rating: 4.6,
  },
  {
    name: 'Kings Row Coffee',
    address: '212 S Brand Blvd, Glendale, CA 91204',
    lat: 34.1435,
    lng: -118.2551,
    placeType: 'CAFE',
    description: 'Artisan coffee shop with specialty roasts',
    rating: 4.5,
  },
  {
    name: 'Glendale Central Library',
    address: '222 E Harvard St, Glendale, CA 91205',
    lat: 34.1485,
    lng: -118.2535,
    placeType: 'LIBRARY',
    description: 'Award-winning modern architecture library',
    rating: 4.7,
  },
  {
    name: 'Verdugo Park',
    address: '3201 W Verdugo Ave, Glendale, CA 91208',
    lat: 34.1755,
    lng: -118.2465,
    placeType: 'PARK',
    description: 'Large sports park with pool and recreation center',
    rating: 4.4,
  },
  {
    name: 'Alex Theatre',
    address: '216 N Brand Blvd, Glendale, CA 91203',
    lat: 34.1495,
    lng: -118.2545,
    placeType: 'ENTERTAINMENT',
    description: 'Historic 1925 theater with neon tower',
    rating: 4.6,
  },
  {
    name: 'Raffi\'s Place',
    address: '211 E Broadway, Glendale, CA 91205',
    lat: 34.1465,
    lng: -118.2535,
    placeType: 'RESTAURANT',
    description: 'Popular Middle Eastern restaurant',
    rating: 4.5,
  },
  {
    name: 'Target',
    address: '2425 Colorado Blvd, Glendale, CA 91208',
    lat: 34.1635,
    lng: -118.2375,
    placeType: 'SHOP',
    description: '24-hour department store',
    rating: 4.3,
  },
  {
    name: 'Glendale Community College',
    address: '1500 N Verdugo Rd, Glendale, CA 91208',
    lat: 34.1675,
    lng: -118.2275,
    placeType: 'SCHOOL',
    description: 'Community college with beautiful campus',
    rating: 4.4,
  },
]

// Residential areas (approximate locations)
const RESIDENTIAL_AREAS = [
  {
    name: 'Wilson Ave Loft',
    address: '500 Wilson Ave, Glendale, CA 91206',
    lat: 34.1525,
    lng: -118.2475,
    placeType: 'HOME',
    description: 'Modern loft apartment in downtown area',
  },
  {
    name: 'Chevy Chase Canyon',
    address: 'Chevy Chase Dr, Glendale, CA 91206',
    lat: 34.1815,
    lng: -118.2175,
    placeType: 'HOME',
    description: 'Mountain residential area with large homes',
  },
  {
    name: 'Rossmoyne Historic District',
    address: 'Rossmoyne Ave, Glendale, CA 91207',
    lat: 34.1615,
    lng: -118.2375,
    placeType: 'HOME',
    description: 'Historic neighborhood with period homes',
  },
  {
    name: 'Brand Blvd Apartments',
    address: '400 S Brand Blvd, Glendale, CA 91204',
    lat: 34.1435,
    lng: -118.2555,
    placeType: 'HOME',
    description: 'Apartment complex on main boulevard',
  },
  {
    name: 'Adams Hill',
    address: 'E Adobe Dr, Glendale, CA 91205',
    lat: 34.1375,
    lng: -118.2475,
    placeType: 'HOME',
    description: 'Hilly residential neighborhood',
  },
  {
    name: 'Glenoaks Canyon',
    address: 'Glenoaks Blvd, Glendale, CA 91206',
    lat: 34.1715,
    lng: -118.2275,
    placeType: 'HOME',
    description: 'Quiet canyon neighborhood',
  },
]

const SAMPLE_CHARACTERS = [
  {
    name: '林小雨',
    age: 28,
    gender: 'female',
    bio: '在Kings Row Coffee工作的插画师，喜欢清晨的阳光',
    personality: {
      traits: ['creative', 'introverted', 'organized'],
      mbti: 'INFJ',
      bigFive: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.3, agreeableness: 0.8, neuroticism: 0.4 },
    },
    occupation: '插画师 / 咖啡师',
    wealth: 45000,
    income: 4000,
    lifestyle: {
      sleepSchedule: { wake: '06:30', sleep: '22:30' },
      dietary: ['vegetarian', 'coffee-lover'],
      hobbies: ['painting', 'reading', 'yoga'],
    },
    goals: ['出版个人画集', '开一间自己的工作室'],
    habits: {
      morning: ['yoga', 'sketching', 'coffee'],
      evening: ['reading', 'journaling'],
      weekend: ['art-gallery', 'hiking'],
    },
    preferences: {
      food: ['salad', 'pasta', 'sushi'],
      activities: ['painting', 'hiking', 'reading'],
      music: ['indie', 'folk', 'jazz'],
    },
    homeIndex: 0,
    workIndex: 5,
  },
  {
    name: '陈大伟',
    age: 32,
    gender: 'male',
    bio: '在Americana附近科技公司工作的软件工程师',
    personality: {
      traits: ['analytical', 'friendly', 'ambitious'],
      mbti: 'ENTJ',
      bigFive: { openness: 0.6, conscientiousness: 0.8, extraversion: 0.7, agreeableness: 0.6, neuroticism: 0.3 },
    },
    occupation: '软件工程师',
    wealth: 85000,
    income: 9000,
    lifestyle: {
      sleepSchedule: { wake: '07:00', sleep: '23:30' },
      dietary: ['omnivore'],
      hobbies: ['gaming', 'basketball', 'cooking'],
    },
    goals: ['晋升技术主管', '买房置业'],
    habits: {
      morning: ['gym', 'protein-shake'],
      evening: ['gaming', 'meal-prep'],
      weekend: ['basketball', 'brunch'],
    },
    preferences: {
      food: ['burgers', 'sushi', 'bbq'],
      activities: ['gaming', 'sports', 'tech-events'],
      music: ['electronic', 'hip-hop'],
    },
    homeIndex: 3,
    workIndex: 1,
  },
  {
    name: '王小美',
    age: 26,
    gender: 'female',
    bio: '住在Chevy Chase Canyon的时尚博主',
    personality: {
      traits: ['outgoing', 'stylish', 'spontaneous'],
      mbti: 'ENFP',
      bigFive: { openness: 0.9, conscientiousness: 0.5, extraversion: 0.9, agreeableness: 0.7, neuroticism: 0.5 },
    },
    occupation: '时尚博主',
    wealth: 65000,
    income: 6000,
    lifestyle: {
      sleepSchedule: { wake: '08:00', sleep: '00:00' },
      dietary: ['pescatarian'],
      hobbies: ['photography', 'shopping', 'traveling'],
    },
    goals: ['达到100万粉丝', '创立自己的品牌'],
    habits: {
      morning: ['skincare-routine', 'content-creation'],
      evening: ['social-events', 'photo-editing'],
      weekend: ['shopping', 'brunch', 'parties'],
    },
    preferences: {
      food: ['avocado-toast', 'acai-bowl', 'cocktails'],
      activities: ['shopping', 'networking', 'traveling'],
      music: ['pop', 'edm'],
    },
    homeIndex: 1,
    workIndex: 1,
  },
  {
    name: '张思远',
    age: 45,
    gender: 'male',
    bio: '常去Central Library的大学教授，研究文学历史',
    personality: {
      traits: ['intellectual', 'calm', 'wise'],
      mbti: 'INTP',
      bigFive: { openness: 0.9, conscientiousness: 0.8, extraversion: 0.2, agreeableness: 0.6, neuroticism: 0.2 },
    },
    occupation: '大学教授',
    wealth: 120000,
    income: 8000,
    lifestyle: {
      sleepSchedule: { wake: '05:30', sleep: '22:00' },
      dietary: ['tea-enthusiast'],
      hobbies: ['reading', 'writing', 'classical-music'],
    },
    goals: ['出版学术专著', '培养优秀学生'],
    habits: {
      morning: ['tea-ceremony', 'writing'],
      evening: ['reading', 'jazz-records'],
      weekend: ['bookstore', 'museum'],
    },
    preferences: {
      food: ['chinese-cuisine', 'tea', 'pastries'],
      activities: ['reading', 'lectures', 'classical-concerts'],
      music: ['classical', 'jazz'],
    },
    homeIndex: 2,
    workIndex: 6,
  },
  {
    name: '刘阳光',
    age: 24,
    gender: 'male',
    bio: '骑遍全城的快递员，熟悉每条街道',
    personality: {
      traits: ['energetic', 'optimistic', 'hardworking'],
      mbti: 'ESFP',
      bigFive: { openness: 0.6, conscientiousness: 0.7, extraversion: 0.9, agreeableness: 0.8, neuroticism: 0.3 },
    },
    occupation: '快递员',
    wealth: 35000,
    income: 3500,
    lifestyle: {
      sleepSchedule: { wake: '06:00', sleep: '21:30' },
      dietary: ['high-calorie'],
      hobbies: ['cycling', 'street-food', 'photography'],
    },
    goals: ['攒钱开店', '带父母旅游'],
    habits: {
      morning: ['early-route', 'breakfast-taco'],
      evening: ['gym', 'early-sleep'],
      weekend: ['long-rides', 'exploring'],
    },
    preferences: {
      food: ['tacos', 'burgers', 'pho'],
      activities: ['cycling', 'exploring', 'street-photography'],
      music: ['reggaeton', 'hip-hop'],
    },
    homeIndex: 4,
    workIndex: 0,
  },
]

export async function seedDatabase() {
  console.log('Starting database seed...')

  // Check if town already exists
  const existingTown = await prisma.town.findFirst()
  if (existingTown) {
    console.log('Town already exists, skipping seed')
    return { message: 'Database already seeded' }
  }

  // Create town
  const town = await prisma.town.create({
    data: {
      name: 'Glendale',
      region: 'CA',
      country: 'USA',
      currentDate: new Date(),
      currentTime: '08:00',
      timeSpeed: 60, // 1 minute real time = 1 hour game time
      weather: 'SUNNY',
      temperature: 72,
      season: 'SPRING',
      isHoliday: false,
    },
  })

  console.log('Created town:', town.name)

  // Create places
  const allPlaces = [...GLENDALE_PLACES, ...RESIDENTIAL_AREAS]
  const createdPlaces = await Promise.all(
    allPlaces.map((place: any) =>
      prisma.place.create({
        data: {
          townId: town.id,
          name: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          placeType: place.placeType as any,
          description: place.description,
          rating: place.rating || null,
          types: [place.placeType.toLowerCase()],
        },
      })
    )
  )

  console.log(`Created ${createdPlaces.length} places`)

  // Create characters
  const createdCharacters = await Promise.all(
    SAMPLE_CHARACTERS.map((char, index) =>
      prisma.character.create({
        data: {
          townId: town.id,
          name: char.name,
          age: char.age,
          gender: char.gender,
          bio: char.bio,
          personality: char.personality,
          occupation: char.occupation,
          homeLocationId: createdPlaces[char.homeIndex].id,
          workLocationId: char.workIndex !== undefined ? createdPlaces[char.workIndex].id : null,
          wealth: char.wealth,
          income: char.income,
          lifestyle: char.lifestyle,
          goals: char.goals,
          habits: char.habits,
          preferences: char.preferences,
          isUserCreated: false,
          isActive: true,
          currentStatus: 'IDLE',
          currentMood: 'neutral',
        },
      })
    )
  )

  console.log(`Created ${createdCharacters.length} characters`)

  // Create some initial relationships
  const relationships = [
    { a: 0, b: 1, type: 'FRIEND', intimacy: 60 },
    { a: 0, b: 2, type: 'ACQUAINTANCE', intimacy: 30 },
    { a: 1, b: 2, type: 'FRIEND', intimacy: 45 },
    { a: 3, b: 0, type: 'ACQUAINTANCE', intimacy: 20 },
  ]

  await Promise.all(
    relationships.map((rel) =>
      prisma.characterRelationship.create({
        data: {
          characterAId: createdCharacters[rel.a].id,
          characterBId: createdCharacters[rel.b].id,
          relationshipType: rel.type as any,
          intimacy: rel.intimacy,
          trust: 50,
          status: 'NEUTRAL',
        },
      })
    )
  )

  console.log('Created relationships')

  return {
    message: 'Database seeded successfully',
    townId: town.id,
    placesCount: createdPlaces.length,
    charactersCount: createdCharacters.length,
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then((result) => {
      console.log(result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed error:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
