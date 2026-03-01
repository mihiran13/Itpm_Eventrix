const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Event = require('../models/Event.model');
const Session = require('../models/Session.model');
const Announcement = require('../models/Announcement.model');
const Survey = require('../models/Survey.model');
const User = require('../models/User.model');

const realisticData = {
    speakers: [
        { name: 'Dr. Evelyn Reed', designation: 'AI Researcher', bio: 'Pioneer in neural network architecture.' },
        { name: 'Marcus Vance', designation: 'Cybersecurity Expert', bio: '20 years of experience in digital forensics.' },
        { name: 'Dr. Alan Grant', designation: 'Paleontologist', bio: 'World-renowned dinosaur expert.' },
        { name: 'John Hammond', designation: 'CEO of InGen', bio: 'Visionary entrepreneur in biotech.' },
        { name: 'Dr. Ian Malcolm', designation: 'Mathematician', bio: 'Specialist in chaos theory.' },
        { name: 'Lex Murphy', designation: 'System Administrator', bio: 'Unix systems expert.' },
        { name: 'Tim Murphy', designation: 'Dinosaur Enthusiast', bio: 'Aspiring paleontologist.' },
    ],
    sessionTitles: {
        Business: ['Opening Keynote: The Future of Business', 'Panel: Leadership in the Digital Age', 'Workshop: Agile Strategies', 'Networking Mixer'],
        IT: ['Intro to MERN Stack', 'Deep Dive into Docker', 'Live Coding: Building a REST API', 'Q&A with a Senior Dev'],
        Engineering: ['Keynote: The Future of Robotics', 'Workshop: 3D Printing & Prototyping', 'Case Study: Sustainable Infrastructure', 'Meet the Engineers'],
    },
    announcements: {
        Business: [
            { title: 'Dress Code', message: 'Please adhere to a business casual dress code.', priority: 'low' },
            { title: 'Networking Session', message: 'The networking session starts at 3 PM. Don\'t miss it!', priority: 'medium' },
            { title: 'Parking Information', message: 'Parking is available in Lot B. Please follow the signs.', priority: 'low' },
            { title: 'Keynote Speaker Change', message: 'Please note a change in our keynote speaker. Dr. Evelyn Reed will be presenting.', priority: 'high' },
        ],
        IT: [
            { title: 'Bring Your Laptops', message: 'A laptop is required for the hands-on workshops.', priority: 'high' },
            { title: 'Software Prerequisites', message: 'Please install Node.js and VS Code before the event.', priority: 'medium' },
            { title: 'Code Repository', message: 'All code examples are available on our GitHub repo. Link will be shared during the session.', priority: 'low' },
            { title: 'Wi-Fi Access', message: 'Wi-Fi details: Network: EventNet, Password: password123', priority: 'medium' },
        ],
        Engineering: [
            { title: 'Safety First', message: 'Please wear closed-toe shoes for the workshop sessions.', priority: 'high' },
            { title: 'Lab Access', message: 'Access to the engineering lab is restricted. Please follow your guide.', priority: 'medium' },
            { title: 'Project Demos', message: 'Project demos will be held in the main hall at 2 PM.', priority: 'medium' },
            { title: 'Ask an Engineer', message: 'Our "Ask an Engineer" booth is open all day. Come and chat with our experts!', priority: 'low' },
        ]
    },
    surveys: {
        Business: {
            title: 'Pre-Event Business Survey',
            description: 'Help us tailor the event to your needs.',
            questions: [
                { text: 'Which industry are you most interested in?', type: 'checkbox', options: ['Finance', 'Marketing', 'Management', 'HR'] },
                { text: 'What do you hope to gain from this event?', type: 'text' },
                { text: 'How did you hear about us?', type: 'radio', options: ['Social Media', 'Email', 'Friend', 'Other'] },
            ]
        },
        IT: {
            title: 'Technical Skill Level Survey',
            description: 'Let us know your current skill level.',
            questions: [
                { text: 'Rate your JavaScript proficiency.', type: 'radio', options: ['Beginner', 'Intermediate', 'Advanced'] },
                { text: 'Which backend framework are you most familiar with?', type: 'checkbox', options: ['Express', 'Django', 'Ruby on Rails', 'None'] },
                { text: 'What do you want to learn most about?', type: 'text' },
                { text: 'Are you interested in future advanced workshops?', type: 'radio', options: ['Yes', 'No'] },
            ]
        },
        Engineering: {
            title: 'Engineering Interests Survey',
            description: 'Share your interests with us.',
            questions: [
                { text: 'Which field of engineering are you in?', type: 'radio', options: ['Mechanical', 'Civil', 'Electrical', 'Software'] },
                { text: 'What topics would you like to see in future events?', type: 'text' },
                { text: 'Are you interested in a plant tour?', type: 'radio', options: ['Yes', 'No'] },
            ]
        }
    }
};


const seedDetails = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables.');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const organizer = await User.findOne({ role: 'organizer' });
        if (!organizer) {
            console.error('❌ No organizer found. Please seed an organizer first.');
            process.exit(1);
        }

        const events = await Event.find();
        if (events.length === 0) {
            console.error('❌ No events found. Please seed events first.');
            process.exit(1);
        }

        // Clear existing data
        await Session.deleteMany({});
        await Announcement.deleteMany({});
        await Survey.deleteMany({});
        console.log('✅ Cleared existing sessions, announcements, and surveys.');

        let sessionsCount = 0;
        let announcementsCount = 0;
        let surveysCount = 0;

        for (const event of events) {
            const faculty = event.faculty || 'IT'; // Default to IT if faculty is not set
            const sessionTitles = realisticData.sessionTitles[faculty] || realisticData.sessionTitles.IT;
            const announcements = realisticData.announcements[faculty] || realisticData.announcements.IT;
            const surveyData = realisticData.surveys[faculty] || realisticData.surveys.IT;

            // Create Sessions
            for (let i = 0; i < sessionTitles.length; i++) {
                const sessionTitle = sessionTitles[i];
                const speaker = realisticData.speakers[i % realisticData.speakers.length];
                const session = new Session({
                    event: event._id,
                    title: sessionTitle,
                    description: `An in-depth look at ${sessionTitle}.`,
                    speaker: speaker,
                    startTime: new Date(event.startDate.getTime() + i * 60 * 60 * 1000),
                    endTime: new Date(event.startDate.getTime() + (i + 1) * 60 * 60 * 1000),
                    location: 'Hall ' + (i + 1),
                    capacity: Math.max(1, Math.floor(event.capacity / sessionTitles.length)),
                    order: i
                });
                await session.save();
                sessionsCount++;
            }

            // Create Announcements
            for (const ann of announcements) {
                const announcement = new Announcement({
                    event: event._id,
                    author: organizer._id,
                    title: ann.title,
                    message: ann.message,
                    priority: ann.priority
                });
                await announcement.save();
                announcementsCount++;
            }

            // Create Survey
            const survey = new Survey({
                event: event._id,
                createdBy: organizer._id,
                title: surveyData.title,
                description: surveyData.description,
                questions: surveyData.questions,
                isActive: true,
                deadline: event.endDate
            });
            await survey.save();
            surveysCount++;
        }

        console.log('\n🎉 DETAILS SEEDING COMPLETE 🎉');
        console.log(`- Sessions created: ${sessionsCount}`);
        console.log(`- Announcements created: ${announcementsCount}`);
        console.log(`- Surveys created: ${surveysCount}`);
        console.log(`Total items created: ${sessionsCount + announcementsCount + surveysCount}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDetails();
