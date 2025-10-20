const mongoose = require('mongoose');
// Load env from multiple possible locations
require('../config/loadEnv');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars (noop if already loaded)
dotenv.config();

// Load models
const User = require('../models/User');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const categories = [
  {
    name: '희귀 아로이드',
    nameEn: 'Rare Aroids',
    description: '몬스테라, 필로덴드론 등 희귀한 아로이드 식물',
    icon: 'fa-leaf',
    order: 1
  },
  {
    name: '다육식물',
    nameEn: 'Succulents',
    description: '선인장과 다양한 다육식물',
    icon: 'fa-seedling',
    order: 2
  },
  {
    name: '관엽식물',
    nameEn: 'Foliage Plants',
    description: '실내 관엽식물',
    icon: 'fa-spa',
    order: 3
  },
  {
    name: '꽃식물',
    nameEn: 'Flowering Plants',
    description: '열대 꽃식물',
    icon: 'fa-flower',
    order: 4
  }
];

const users = [
  {
    name: '관리자',
    email: 'admin@thaiexoticplants.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Tropical Paradise Owner',
    email: 'tropical@example.com',
    password: 'shop123',
    role: 'shop_owner'
  },
  {
    name: 'Green Garden Owner',
    email: 'green@example.com',
    password: 'shop123',
    role: 'shop_owner'
  },
  {
    name: '고객 테스트',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer'
  }
];

// Import data
const importData = async () => {
  try {
    console.log('🌱 Seeding database...'.green.bold);

    // Delete all data
    await User.deleteMany();
    await Shop.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('✅ Data destroyed'.red);

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log('✅ Categories created'.green);

    // Create users
    const createdUsers = await User.create(users);
    console.log('✅ Users created'.green);

    // Create shops
    const shops = [
      {
        name: 'Tropical Paradise',
        description: '희귀 열대식물 전문 샵. 태국 전역에서 엄선한 최고급 식물들을 제공합니다.',
        owner: createdUsers[1]._id,
        contact: {
          email: 'tropical@example.com',
          phone: '+66-123-456-789'
        },
        address: {
          city: 'Bangkok',
          country: 'Thailand'
        },
        isVerified: true
      },
      {
        name: 'Green Garden',
        description: '다육식물과 선인장 전문. 초보자부터 전문가까지 모두를 위한 식물.',
        owner: createdUsers[2]._id,
        contact: {
          email: 'green@example.com',
          phone: '+66-987-654-321'
        },
        address: {
          city: 'Chiang Mai',
          country: 'Thailand'
        },
        isVerified: true
      }
    ];

    const createdShops = await Shop.create(shops);
    console.log('✅ Shops created'.green);

    // Update users with shop references
    createdUsers[1].shop = createdShops[0]._id;
    await createdUsers[1].save();
    createdUsers[2].shop = createdShops[1]._id;
    await createdUsers[2].save();

    // Create products
    const products = [
      {
        shop: createdShops[0]._id,
        name: 'Monstera Albo Variegata',
        koreanName: '몬스테라 알보 바리에가타',
        thaiName: 'มอนสเตอร่า อัลโบ',
        scientificName: 'Monstera deliciosa var. borsigiana',
        description: '희귀한 흰무늬 몬스테라. 건강한 성체로 즉시 감상 가능합니다.',
        category: createdCategories[0]._id,
        price: 15000,
        stockQuantity: 5,
        images: [{
          url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
          isPrimary: true
        }],
        difficultyLevel: 'medium',
        isRare: true,
        isFeatured: true,
        specifications: {
          sunlight: '밝은 간접광',
          watering: '주 1-2회',
          humidity: '60-80%'
        },
        tags: ['몬스테라', '무늬식물', '희귀식물']
      },
      {
        shop: createdShops[1]._id,
        name: 'Echeveria Black Prince',
        koreanName: '에케베리아 블랙 프린스',
        thaiName: 'เอเคเวเรีย แบล็ค พรินซ์',
        scientificName: 'Echeveria Black Prince',
        description: '검은색 잎이 아름다운 다육식물. 초보자도 키우기 쉽습니다.',
        category: createdCategories[1]._id,
        price: 800,
        stockQuantity: 25,
        images: [{
          url: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800',
          isPrimary: true
        }],
        difficultyLevel: 'easy',
        isRare: false,
        isFeatured: false,
        specifications: {
          sunlight: '직사광선',
          watering: '월 2-3회',
          humidity: '30-50%'
        },
        tags: ['다육식물', '에케베리아', '초보자용']
      },
      {
        shop: createdShops[0]._id,
        name: 'Philodendron Pink Princess',
        koreanName: '필로덴드론 핑크 프린세스',
        thaiName: 'ฟิโลเดนดรอน พิงค์ พริ้นเซส',
        scientificName: 'Philodendron erubescens',
        description: '핑크색 무늬가 매력적인 필로덴드론. 인스타그램에서 인기!',
        category: createdCategories[0]._id,
        price: 12000,
        stockQuantity: 8,
        images: [{
          url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
          isPrimary: true
        }],
        difficultyLevel: 'medium',
        isRare: true,
        isFeatured: true,
        specifications: {
          sunlight: '밝은 간접광',
          watering: '주 1회',
          humidity: '50-70%'
        },
        tags: ['필로덴드론', '핑크', '희귀식물']
      }
    ];

    await Product.create(products);
    console.log('✅ Products created'.green);

    // Update shop statistics
    for (const shop of createdShops) {
      await shop.updateStatistics();
    }

    console.log('✅ Data imported successfully!'.green.bold);
    console.log('\n📧 Admin credentials:'.cyan);
    console.log('   Email: admin@thaiexoticplants.com'.cyan);
    console.log('   Password: admin123\n'.cyan);

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`.red);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Shop.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('✅ Data destroyed'.red.bold);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`.red);
    process.exit(1);
  }
};

// Run seeder
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use: npm run seed -i (import) or npm run seed -d (delete)');
  process.exit();
}
