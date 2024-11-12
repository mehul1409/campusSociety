# CampusSociety

## Overview
CampusSociety is a college hub management system designed to facilitate communication and coordination between colleges, hubs, coordinators, and students. The system allows an admin to add colleges and assign SPOCs (Single Point of Contact). SPOCs can create hubs and assign coordinators, who can post events and announcements. Students can register, log in, and view the content of their respective college hubs.

## Features
- **College Management**: Admin can add colleges to the system.
- **SPOC Management**: Assign a SPOC to each college for hub creation.
- **Hub Management**: SPOCs can create hubs and assign coordinators.
- **Event & Announcement Management**: Coordinators can post events and announcements for hubs.
- **Student Registration**: Students can register and log in to view the content from respective hubs.
  
## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (NoSQL)
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcrypt.js
- **Environment Variables**: dotenv

# Server Port
PORT=8003

# MongoDB connection string for development environment
MONGO_URL=mongodb://localhost:27017/campusSociety

# (Optional) MongoDB Atlas connection string for cloud deployments
# Uncomment this line and comment the above line if deploying to MongoDB Atlas
# MONGO_URL=mongodb+srv://mehulbansalswm1234:rnRhtwMOUtxOxtZg@cluster0.2pmql.mongodb.net/campusSociety?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret Key
JWT_SECRET="mehulbansal"

# Access Token (ensure this is securely generated and used in production)
accessToken="tcZALrHkfh0fSe5WQkCuTtHGJbvn4VI1"

# Node Environment (development, production)
NODE_ENV="development"

# Email Configuration (for notifications or verifications)
EMAIL_USER=""
EMAIL_PASS=""


## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
