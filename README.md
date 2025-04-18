**BeFit - Gym Management and Fitness Tracking Platform (MERN Stack)**


Overview

BeFit is a full-stack MERN application designed to bridge the gap between gym owners, trainers, and fitness enthusiasts ("hustlers"). The platform allows for gym management, communication, diet/macro tracking, body progress tracking, and personalized fitness/diet plan generation using AI. BeFit is built with a focus on scalability, usability, and innovation to qualify for the HackIndia Open Track.


🚀 Tech Stack

•	Frontend: Vite + React + JavaScript (SWC)
•	Styling: Tailwind CSS
•	Backend: Node.js + Express.js
•	Database: MongoDB Atlas
•	Media Management: Cloudinary
•	Testing: Postman
•	AI Integration: Custom AI chatbot using OpenAI/Gemini API (planned)


🎯 User Roles

1. Admin (You)
•	Full access to manage all gyms, trainers, and members.
•	View overall statistics: total gyms, total members, total trainers.

2. Gym Profile
•	Signup with gym name, address, images, and owner details.
•	Manage trainers, members, announcements.

3. Trainer
•	Signup with name, experience, and contact info.
•	Can apply to gyms and respond to member requests.

4. Member
•	Signup with personal and contact details.
•	Join gyms, request diet/workout plans, and track progress.


🛠 Functionalities

✅ For Members
•	Macro Tracker: Log food with macros, edit/delete logs, auto timestamped.
•	Body Progress: Track weight, fat %, muscle mass + daily image uploads.
•	Workout/Diet Plan Requests: Weekly requests sent to trainers.
•	Join Gym System: View gym list, apply with membership timeline.
•	Chat System: One-to-one messaging with gym trainers/owners.
•	Announcements: See updates from their joined gym.

✅ For Trainers
•	Apply to Gyms: Apply to multiple gyms but join one only.
•	Dashboard: See gym info, announcements.
•	Assign Plans: Respond to member requests with diet/workout plans.
•	Chat with Members & Gym Owners

✅ For Gym Owners
•	Dashboard: Manage memberships, trainers, announcements, and media.
•	Accept Member/Trainer Requests
•	Make Announcements
•	Chat System
•	Profile Management: Upload/delete gym images.


🔐 Rules & Restrictions

•	Member can join only one gym.
•	Trainer can join only one gym.
•	Gym can accept unlimited members/trainers.


🧠 AI Feature (HackIndia Open Track)

•	AI Diet & Workout Chatbot:
o	Generates weekly diet and workout plans.
o	Personalized based on user input: goal (fat loss/muscle gain), body stats, dietary preference, budget.
o	Can suggest foods, exercises, track performance improvements.

🧠 Future AI Ideas

•	AI Form-Checker using body images.
•	AI-based nutrition validator (detect unhealthy patterns).
•	AI Workout Optimizer.

📂 Folder Structure

client/               # Vite + React frontend
  └── src/
      ├── components/
      ├── pages/
      ├── context/
      ├── utils/
      └── App.jsx

server/               # Express + Node backend
  ├── controllers/
  ├── models/
  ├── routes/
  ├── config/         # MongoDB, Cloudinary config
  ├── middleware/
  └── index.js


🧪 Postman Testing Guide

•	Base URL: http://localhost:5000/api
•	Test Users: Create gym, trainer, and member accounts.
•	Endpoints:
o	POST /signup for gym/trainer/member
o	POST /login
o	POST /macro-log
o	GET /gym-list
o	POST /apply-gym
o	POST /chat/send


☁️ MongoDB Atlas Setup

1.	Create an account at MongoDB Atlas.
2.	Create a cluster.
3.	Create a DB user and whitelist your IP.
4.	Replace the DB URI in server/config/db.js with your connection string.
const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
module.exports = connectDB;


☁️ Cloudinary Setup

1.	Create account at Cloudinary.
2.	Get your cloud_name, api_key, and api_secret.
3.	Use the following config:
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
module.exports = cloudinary;


🏁 Submission Ready

This project falls under HackIndia's Open Track. It includes:
•	Custom gym management ecosystem
•	Smart diet/workout assistant powered by AI
•	Scalable role-based architecture
•	Cloud-integrated, mobile-responsive frontend

BeFit is your AI-powered gym manager and fitness tracker. Let’s make the world fit, one rep at a time! 💪

