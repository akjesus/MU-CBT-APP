## Maduka University CBT App

A comprehensive Computer-Based Testing (CBT) software for Maduka University, designed to streamline the examination process and improve student experience.

Table of Contents

- #overview
- #features
- #installation
- #usage
- #contributing
- #license

Overview

This software is designed to provide a secure, efficient, and user-friendly platform for conducting computer-based tests in the school. It includes features such as automated bulk question upload, test scheduling, and result analysis.

Features

- Automated Question Generation: Generate questions from a database and randomize them for each student.
- Test Scheduling: Schedule tests for specific dates and times, and set duration limits.
- Result Analysis: Automatically grade tests and provide detailed analysis of student performance.
- Secure Login: Secure login system for students and administrators.
- User-Friendly Interface: Intuitive interface for students to take tests and for administrators to manage tests.

Installation

1. Clone the repository: git clone https://github.com/akjesus/MU-CBT-APP.git
2. Install dependencies: navigate to frontend folder and run npm install 
3. Navigate to backend folder and run npm install 
3. Configure the database: backend/src/config/database.js


Usage

1. Start the frontend server by navigating to the frontend folder and running: nodemon server. 
2. Start the backend server by navigating to backend/src and running: pm2 start server.js
3. Access the software: http://localhost:3001 (or the configured URL)
4. Login as an administrator or student to use the software.

Contributing

We welcome contributions to this project. To contribute, please:

1. Fork the repository.
2. Create a new branch: git checkout -b feature/new-feature
3. Make changes and commit: git commit -m "Added new feature"
4. Push changes: git push origin feature/new-feature
5. Submit a pull request.

License

This software is licensed under the https://opensource.org/licenses/MIT.

