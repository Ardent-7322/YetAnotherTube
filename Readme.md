# YetAnotherTube

YetAnotherTube is a video streaming platform, where users can create accounts, log in, manage sessions with access and refresh tokens, and subscribe to other users' channels. This backend project is built to support core functionalities such as user authentication, subscription management, and session handling.

## Features

- **User Authentication**:

  - **Sign Up**: Users can create an account with their details.
  - **Login**: Users can log in using their credentials.
  - **Logout**: Users can log out of the platform, invalidating their session.
  - **Access Token & Refresh Token**: Secure token-based authentication with support for refreshing sessions.

- **Subscriptions**:
  - **Subscribe/Unsubscribe**: Users can subscribe to other channels and manage their subscriptions.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token) for access and refresh tokens

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/username/YetAnotherTube.git

   ```

2. **Navigate to the project directory**:

cd YetAnotherTube

3.**Install dependencies**:

npm install
Environment Variables: Create a .env file in the root directory and add the following variables:

DATABASE_URI=<Your MongoDB URI>
ACCESS_TOKEN_SECRET=<Your Access Token Secret>
REFRESH_TOKEN_SECRET=<Your Refresh Token Secret>
Start the server:

npm start
The server will start on http://localhost:8000.
````
