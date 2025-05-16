# HETICVerse

## Overview
HETICVerse is a social metaverse platform developed as part of the HETIC (Hautes Études des Technologies de l'Information et de la Communication) Metaverse & Virtual Universes curriculum. This project creates a digital social environment where users can interact, share content, form communities, and engage in real-time communication.

## Features

### Frontend Features
- **Home Page**: Dynamic feed of posts and content from communities and followed users
- **Profile Page**: User profiles with customizable information and activity history
- **Login/Authentication**: Secure user authentication system
- **Posts**: View and interact with user-generated content
- **Create Post**: Interface for users to create and publish new content
- **Communities**: Browse and participate in topic-based communities
- **Create Community**: Tools for users to establish new community spaces

### Backend Features
- **Bookmarks**: Save and organize favorite content
- **Chat Messages**: Real-time messaging between users
- **Chat Rooms**: Group conversation spaces
- **Comments**: Discussion system for posts
- **Community Management**: Backend support for community creation and moderation
- **Community Invitations**: System for inviting users to join communities
- **Community Members**: Management of community membership and roles
- **Follow System**: Social network connections between users
- **Notifications**: Alert system for user interactions
- **Notification Preferences**: User-configurable notification settings
- **Posts Management**: Content creation, editing, and deletion
- **Search**: Find users, communities, and content
- **User Presence**: Track online status of users
- **Video Call**: Real-time video communication capabilities
- **Video Call Participants**: Management of users in video calls

## Technologies Used
- **Frontend**: Next.js for React-based web application
- **Backend**: Strapi CMS for content management and API creation
- **Database**: Neon (PostgreSQL-compatible serverless database)
- **Authentication**: Strapi built-in authentication
- **Real-time Communication**: WebSockets for chat and presence features

## Installation

### Prerequisites
- Node.js (v14.0.0 or later)
- npm or yarn
- PostgreSQL (for local development)

### Frontend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/loaiattar/HETICVerse.git
   cd HETICVerse
   ```

2. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

3. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

4. Configure environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Backend Setup
1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your database and Strapi configuration
   ```

4. Start the Strapi server
   ```bash
   npm run develop
   # or
   yarn develop
   ```

5. Access the Strapi admin panel at `http://localhost:1337/admin`

## Project Structure
```
HETICVerse/
├── frontend/                    # Next.js frontend application
│   ├── public/                  # Static assets
│   ├── src/                     # Source code
│   │   ├── components/          # UI components
│   │   ├── pages/               # Application pages
│   │   │   ├── index.js         # Home page
│   │   │   ├── profile/         # Profile pages
│   │   │   ├── login.js         # Login page
│   │   │   ├── posts/           # Post viewing pages
│   │   │   ├── create-post.js   # Post creation page
│   │   │   ├── community/       # Community pages
│   │   │   └── create-community.js # Community creation page
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   └── utils/               # Utility functions
│   ├── .env.local               # Environment variables
│   └── next.config.js           # Next.js configuration
│
├── backend/                     # Strapi CMS backend
│   ├── api/                     # API definitions
│   │   ├── bookmark/            # Bookmark content type
│   │   ├── chat-message/        # Chat message content type
│   │   ├── chat-room/           # Chat room content type
│   │   ├── comment/             # Comment content type
│   │   ├── community/           # Community content type
│   │   ├── community-invitation/ # Community invitation content type
│   │   ├── community-member/    # Community member content type
│   │   ├── follow/              # Follow content type
│   │   ├── notification/        # Notification content type
│   │   ├── notification-preference/ # Notification preferences content type
│   │   ├── post/                # Post content type
│   │   ├── search/              # Search service
│   │   ├── user-presence/       # User presence content type
│   │   ├── video-call/          # Video call service
│   │   └── video-call-participant/ # Video call participant content type
│   ├── config/                  # Strapi configuration
│   ├── .env                     # Environment variables
│   └── package.json             # Dependencies
```

## Usage

### User Journey
1. **Registration/Login**: Create an account or log in to access the platform
2. **Profile Setup**: Customize your profile with personal information and preferences
3. **Community Exploration**: Discover and join communities based on your interests
4. **Content Creation**: Share posts, comments, and engage with other users
5. **Real-time Interaction**: Chat with users, participate in video calls, and receive notifications

### Key Features
- Use the search function to find users, communities, and content
- Bookmark interesting posts to save them for later
- Follow users to receive their updates on your home feed
- Create and moderate your own communities
- Engage in real-time conversations through chat and video calls

## Contributing
We welcome contributions to the HETICVerse project! Please follow these steps to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Team
- [Loai Attar](https://github.com/loaiattar) - Backend Developer
- [Noa MIRAMONT] - [Frontend]
- [Youva HOUCHE] - [Integration]
- [Cherif KAMAL] - [Database]

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- HETIC for providing the educational framework and resources
- Next.js and Strapi communities for their excellent documentation
- Neon database for serverless PostgreSQL capabilities

---

*This project is part of the HETIC Metaverse & Virtual Universes program, exploring the intersection of social networking, virtual communities, and digital interaction.*
