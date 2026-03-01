const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Event = require('../models/Event.model');
const Category = require('../models/Category.model');
const User = require('../models/User.model');

// Custom date generator based on days from now
const getFutureDate = (daysToAdd) => {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d;
};

// Generates an agenda
const generateAgenda = (numItems, startHour) => {
  const agenda = [];
  for (let i = 0; i < numItems; i++) {
    const time = `${startHour + i}:00 ${startHour + i < 12 ? 'AM' : 'PM'}`;
    const titles = ['Registration & Check-in', 'Keynote Speech', 'Workshop Session', 'Coffee Break', 'Panel Discussion', 'Closing Remarks'];
    agenda.push({
      time,
      title: titles[i] || 'Session',
      description: 'Detailing the specific topics and discussions for this slot.',
      speaker: 'To be announced'
    });
  }
  return agenda;
};

// Main Seed Function
const seedEvents = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the environment variables.');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Get or create Organizer
    let organizer = await User.findOne({ email: 'organizer@eventrix.com' });
    if (!organizer) {
      organizer = await User.create({
        firstName: 'Demo',
        lastName: 'Organizer',
        email: 'organizer@eventrix.com',
        password: 'Password123!',
        role: 'organizer',
        isEmailVerified: true,
        authProvider: 'local'
      });
      console.log('✅ Created Demo Organizer account');
    }

    // 2. Fetch categories map
    const categoriesList = await Category.find({});
    if (categoriesList.length === 0) {
      throw new Error('❌ Please run the category seeder first! (node utils/seed.js)');
    }
    
    // Helper to find category by name
    const getCat = (name) => {
      const c = categoriesList.find(c => c.name.toLowerCase() === name.toLowerCase());
      // fallback to first category if not found
      return c ? c._id : categoriesList[0]._id;
    };

    // Keep track of counts for report
    const stats = { Business: 0, IT: 0, Engineering: 0 };

    const deleteResult = await Event.deleteMany({ organizer: organizer._id });
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing generated events`);

    const eventsToCreate = [
      // ================= BUSINESS EVENTS =================
      {
        title: 'Global Startup Pitch Day 2026',
        description: 'Watch the top 20 emerging tech startups pitch their innovative products to a panel of expert investors. Includes networking sessions, feedback rounds, and an award ceremony.',
        categoryId: getCat('Business'),
        faculty: 'Business',
        eventType: 'in-person',
        coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000',
        tags: ['startup', 'pitch', 'investment', 'entrepreneurship'],
        isFree: false,
        price: 50,
        capacity: 250,
        days: 10,
        speakers: [{ name: 'Sarah Connor', designation: 'Partner, TechVC', bio: 'Expert venture capitalist.' }],
        faqs: [{ question: 'Can I pitch my startup?', answer: 'Applications are closed for this year.' }]
      },
      {
        title: 'FinTech Innovation Seminar',
        description: 'Explore the future of finance, blockchain tech, and decentralized applications. Gain insights into the strategies defining the next decade of financial technology.',
        categoryId: getCat('Seminar'),
        faculty: 'Business',
        eventType: 'virtual',
        coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000',
        tags: ['fintech', 'finance', 'blockchain', 'innovation'],
        isFree: true,
        capacity: 500,
        days: 15,
        requiresApproval: true,
        virtualLink: 'https://zoom.us/webinar/fintech2026'
      },
      {
        title: 'Executive Leadership Summit',
        description: 'A transformative experience tailored for senior executives and aspiring leaders. Focus on crisis management, culture building, and driving organizational growth.',
        categoryId: getCat('Conference'),
        faculty: 'Business',
        eventType: 'hybrid',
        coverImage: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=1000',
        tags: ['leadership', 'management', 'executive'],
        isFree: false,
        price: 150,
        capacity: 150,
        days: 22,
        virtualLink: 'https://teams.microsoft.com/l/meetup-join/executive'
      },
      {
        title: 'Digital Marketing Masterclass',
        description: 'Learn modern SEO, paid acquisition, and growth marketing strategies from top industry CMOs. Hands-on exercises included.',
        categoryId: getCat('Education'),
        faculty: 'Business',
        eventType: 'virtual',
        coverImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=1000',
        tags: ['marketing', 'seo', 'growth'],
        isFree: true,
        capacity: 80,
        days: 30,
        virtualLink: 'https://meet.google.com/xyz-abcd-efg'
      },

      // ================= IT EVENTS =================
      {
        title: 'MERN Stack Crash Course',
        description: 'A comprehensive weekend bootcamp covering MongoDB, Express.js, React, and Node.js. Build a full-stack application from scratch with expert guidance.',
        categoryId: getCat('Technology'),
        faculty: 'IT',
        eventType: 'virtual',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
        tags: ['coding', 'web-development', 'react', 'nodejs', 'javascript'],
        isFree: true,
        capacity: 100,
        days: 5,
        speakers: [{ name: 'Alex Johnson', designation: 'Senior Software Engineer' }],
        virtualLink: 'https://zoom.us/webinar/mern2026'
      },
      {
        title: 'Global AI & Machine Learning Summit',
        description: 'Dive deep into Neural Networks, Generative AI, and LLMs. Featuring hands-on code labs and presentations from leading researchers.',
        categoryId: getCat('Conference'),
        faculty: 'IT',
        eventType: 'hybrid',
        coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000',
        tags: ['AI', 'machine-learning', 'data-science', 'LLM'],
        isFree: false,
        price: 25,
        capacity: 500,
        days: 12,
        virtualLink: 'https://ai-summit-virtual.com/join'
      },
      {
        title: 'Weekend Hackathon: Tech for Good',
        description: 'Join hundreds of developers, designers, and innovators to build software solutions that address real-world social problems. Free food, great prizes!',
        categoryId: getCat('Technology'),
        faculty: 'IT',
        eventType: 'in-person',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
        tags: ['hackathon', 'coding', 'software-engineering'],
        isFree: true,
        capacity: 150,
        days: 18,
        requiresApproval: true,
        faqs: [{ question: 'Do I need a team?', answer: 'You can register solo and join a team on the first day.' }]
      },
      {
        title: 'Cybersecurity Defense Bootcamp',
        description: 'Learn offensive and defensive security practices, penetration testing, and how to secure modern cloud infrastructure.',
        categoryId: getCat('Workshop'),
        faculty: 'IT',
        eventType: 'in-person',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000',
        tags: ['cybersecurity', 'security', 'devops'],
        isFree: false,
        price: 99,
        capacity: 50,
        days: 25
      },
      {
        title: 'Python for Data Science Beginners',
        description: 'Start your journey into data science using Python, Pandas, and Scikit-Learn. Perfect for complete beginners.',
        categoryId: getCat('Education'),
        faculty: 'IT',
        eventType: 'virtual',
        coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=1000',
        tags: ['python', 'data-science', 'programming'],
        isFree: true,
        capacity: 300,
        days: 7,
        virtualLink: 'https://zoom.us/data-science'
      },
      {
        title: 'Advanced Cloud & DevOps Engineering',
        description: 'Deep dive into Kubernetes, Terraform, AWS, and CI/CD pipelines. Learn how to architect highly scalable systems.',
        categoryId: getCat('Seminar'),
        faculty: 'IT',
        eventType: 'virtual',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
        tags: ['cloud', 'devops', 'aws', 'kubernetes'],
        isFree: true,
        capacity: 200,
        days: 28,
        virtualLink: 'https://zoom.us/devops-webinar'
      },
      {
        title: 'Competitive Programming Challenge',
        description: 'Test your algorithmic and data structure skills against top student programmers. Win cash prizes and internship opportunities!',
        categoryId: getCat('Sports'), // Or Technology
        faculty: 'IT',
        eventType: 'in-person',
        coverImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1000',
        tags: ['programming', 'algorithms', 'coding-challenge'],
        isFree: true,
        capacity: 100,
        days: 35
      },
      {
        title: 'Open Source Contribution Day',
        description: 'Learn how to navigate GitHub, create PRs, and submit your very first open source patch to major repositories.',
        categoryId: getCat('Networking'),
        faculty: 'IT',
        eventType: 'hybrid',
        coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000',
        tags: ['open-source', 'github', 'programming'],
        isFree: true,
        capacity: 250,
        days: 42,
        virtualLink: 'https://discord.gg/opensource'
      },
      {
        title: 'UI/UX Design for Developers',
        description: 'Bridge the gap between design and code. Learn Figma basics and how to translate designs into pixel-perfect CSS.',
        categoryId: getCat('Workshop'),
        faculty: 'IT',
        eventType: 'virtual',
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000',
        tags: ['ui-ux', 'design', 'frontend'],
        isFree: true,
        capacity: 120,
        days: 50,
        virtualLink: 'https://zoom.us/uiux'
      },

      // ================= ENGINEERING EVENTS =================
      {
        title: 'Next-Gen Robotics Showcase',
        description: 'Witness the latest advancements in autonomous robotics, drones, and mechatronics developed by senior engineering students.',
        categoryId: getCat('Exhibition'),
        faculty: 'Engineering',
        eventType: 'in-person',
        coverImage: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=1000',
        tags: ['robotics', 'hardware', 'mechatronics', 'innovation'],
        isFree: true,
        capacity: 300,
        days: 14
      },
      {
        title: 'IoT & Embedded Systems Workshop',
        description: 'Program ESP32 and Arduino boards, connect sensors, and interface with IoT cloud platforms in this practical workshop.',
        categoryId: getCat('Workshop'),
        faculty: 'Engineering',
        eventType: 'hybrid',
        coverImage: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1000',
        tags: ['iot', 'embedded-systems', 'arduino'],
        isFree: false,
        price: 40,
        capacity: 80,
        days: 21,
        virtualLink: 'https://zoom.us/iot-workshop'
      },
      {
        title: 'Sustainable Renewable Energy Conference',
        description: 'Discussions on solar tech, wind power, and modern grid infrastructure engineering for a greener future.',
        categoryId: getCat('Conference'),
        faculty: 'Engineering',
        eventType: 'in-person',
        coverImage: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        tags: ['energy', 'sustainability', 'civil-engineering'],
        isFree: true,
        capacity: 200,
        days: 26
      },
      {
        title: 'CAD & 3D Modeling Masterclass',
        description: 'Advanced techniques in AutoCAD and SolidWorks. Learn parametric design and preparation for 3D printing or CNC machining.',
        categoryId: getCat('Technology'),
        faculty: 'Engineering',
        eventType: 'virtual',
        coverImage: 'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&q=80&w=1000',
        tags: ['cad', '3d-modeling', 'mechanical-engineering'],
        isFree: true,
        capacity: 150,
        days: 32,
        virtualLink: 'https://meet.google.com/cad-model'
      },
      {
        title: 'Smart City Infrastructure Expo',
        description: 'Explore how civil and electronic engineering combine to create smart grids, automated traffic logic, and next-level urban development.',
        categoryId: getCat('Exhibition'),
        faculty: 'Engineering',
        eventType: 'in-person',
        coverImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1000',
        tags: ['smart-city', 'civil-engineering', 'urban-design'],
        isFree: false,
        price: 15,
        capacity: 500,
        days: 45
      }
    ];

    // Seed events
    for (const evt of eventsToCreate) {
      const startDate = getFutureDate(evt.days);
      const endDate = getFutureDate(evt.days);
      endDate.setHours(startDate.getHours() + 4); // 4 hour duration

      const venueName = evt.eventType === 'virtual' ? 'Online Webinar Room' : 'University Main Campus & Tech Park';
      
      const newEvent = new Event({
        title: evt.title,
        slug: slugify(evt.title, { lower: true, strict: true }) + '-' + Math.floor(Math.random() * 10000),
        description: evt.description,
        shortDescription: evt.description.substring(0, 100) + '...',
        category: evt.categoryId,
        faculty: evt.faculty,
        eventType: evt.eventType,
        status: 'published',
        startDate,
        endDate,
        venue: {
          name: venueName,
          address: {
            street: '123 Innovation Drive',
            city: 'Techville',
            state: 'State',
            country: 'Country'
          }
        },
        virtualLink: evt.virtualLink || '',
        coverImage: evt.coverImage,
        capacity: evt.capacity,
        isFree: evt.isFree,
        ticketPrice: evt.isFree ? 0 : evt.price,
        ticketTypes: [{
          name: 'General Admission',
          price: evt.isFree ? 0 : evt.price,
          quantity: evt.capacity,
          sold: 0
        }],
        organizer: organizer._id,
        tags: evt.tags,
        speakers: evt.speakers || [{ name: 'Dr. Jane Smith', designation: 'Industry Expert' }],
        agenda: generateAgenda(4, 9), // 9 AM to 1 PM schedule
        faqs: evt.faqs || [
          { question: 'Will there be food?', answer: 'Yes, refreshments will be provided.' },
          { question: 'Is parking available?', answer: 'Yes, visitor parking is open adjacent to the venue.' }
        ],
        isPublic: true,
        requiresApproval: evt.requiresApproval || false,
        allowWaitlist: true,
        viewCount: Math.floor(Math.random() * 500),
        likeCount: Math.floor(Math.random() * 100)
      });

      await newEvent.save();
      stats[evt.faculty]++;
    }

    console.log('\n🎉 EVENT SEEDING COMPLETE 🎉');
    console.log(`- Business events: ${stats.Business}`);
    console.log(`- IT events: ${stats.IT}`);
    console.log(`- Engineering events: ${stats.Engineering}`);
    console.log(`Total events created: ${stats.Business + stats.IT + stats.Engineering}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedEvents();
