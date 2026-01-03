<h1>🎬 Stream Party</h1>

<p>
A real-time watch party application where users can join a room, chat, and watch
YouTube videos together in sync.
</p>

<p>
This project was built from scratch to understand how real-time systems work in
production — especially how REST APIs, WebSockets, and frontend state interact.
</p>

<br/>

<h2>🚀 What this app does</h2>

<ul>
  <li>Create or join a room using a room ID</li>
  <li>Enter a username (no hardcoded users)</li>
  <li>Chat with everyone in the room (live + history)</li>
  <li>Paste any YouTube link and load it for everyone</li>
  <li>Sync play, pause, and seek across all users in real time</li>
</ul>

<p>
No refreshes. No polling. Everyone stays in sync.
</p>

<br/>

<h2>🛠️ Tech Stack</h2>

<h3>Frontend</h3>
<ul>
  <li>React (Vite)</li>
  <li>React Router</li>
  <li>Tailwind CSS</li>
  <li>Socket.IO Client</li>
  <li>YouTube IFrame API</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Node.js</li>
  <li>Express</li>
  <li>Socket.IO</li>
  <li>MongoDB + Mongoose</li>
</ul>

<h3>Deployment</h3>
<ul>
  <li>Frontend: Vercel</li>
  <li>Backend: Render</li>
  <li>Database: MongoDB Atlas</li>
</ul>

<br/>

<h2>🧠 Key Learnings</h2>

<ul>
  <li>Difference between REST and WebSockets in real-time applications</li>
  <li>Correct usage of Socket.IO rooms for multi-user sync</li>
  <li>Preventing infinite sync loops on the frontend</li>
  <li>Configuring CORS for both Express and Socket.IO</li>
  <li>Debugging real production issues during deployment</li>
</ul>
