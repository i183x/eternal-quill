Here's a comprehensive README file for your Eternal Quill project on GitHub:

---

# Eternal Quill

<!-- ![Eternal Quill Logo](https://your-logo-url) Replace with your logo URL -->

**Eternal Quill** is an online platform designed for writers to share, explore, and celebrate the beauty of literature. Whether you’re a seasoned writer or just starting, Eternal Quill provides the perfect space to frame your words and shape your destiny.

## Table of Contents

- [Eternal Quill](#eternal-quill)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
    - [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
    - [Guidelines for Contributions](#guidelines-for-contributions)
  - [License](#license)
  - [Contact](#contact)

## Features

- **User Authentication:** Secure login and signup functionality using Firebase Authentication.
- **Profile Management:** Users can create and update their profiles with a profile picture and a personal introduction.
- **Write & Share:** Create and share writeups with up to 20,000 characters.
- **Follow System:** Follow your favorite writers and see their latest posts in your feed.
- **Comment & Like:** Engage with the community by liking posts and leaving comments.
- **Rich Text Editor:** Utilize a rich text editor to format your posts.
- **Competitions:** Participate in upcoming writing competitions with exciting prizes.
- **Mobile Responsive:** Fully responsive design for an optimal experience on any device.

## Getting Started

### Prerequisites

- **Node.js**: Make sure you have Node.js installed on your machine.
- **Firebase Account**: You need a Firebase account to set up the backend.

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/i183x/eternal-quill.git
   cd eternal-quill
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Firebase:**

   - Create a Firebase project and set up authentication (Email/Password).
   - Copy your Firebase configuration and replace the existing config in `firebase.js`.

4. **Run the Application:**

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`.

## Usage

- **Login/Signup:** Create an account or log in to access the platform.
- **Create a Post:** Navigate to the "Write" page, use the rich text editor to craft your writeup, and publish it.
- **View Profiles:** Visit user profiles to see their writeups and follow them.
- **Interact:** Like and comment on posts to engage with other writers.

## Contributing

We welcome contributions to Eternal Quill! To maintain the quality and consistency of the project, please follow these guidelines.

### Contributor License Agreement (CLA)

Before contributing, you must sign the Contributor License Agreement (CLA). This agreement ensures that you retain ownership of your contributions while giving us permission to use, distribute, and modify them as part of the project.

**How to Sign the CLA:**

1. **Read the CLA:** The `CLA.md` file is available in the repository.
2. **Sign the CLA:**
   - Fork the repository.
   - Create a branch named `cla-signature`.
   - Add a file in the `cla/` directory named after your GitHub username (e.g., `cla/your-username.md`).
   - In the file, add the following text:
     ```
     I, [Your Full Name], agree to the terms of the Contributor License Agreement for the Eternal Quill project.

     Date: [Date]
     ```
   - Submit a pull request from your `cla-signature` branch to the `main` branch.

### Guidelines for Contributions

- **Fork the repository** and create a new branch for your feature or bug fix.
- **Submit a pull request** after making your changes.
- **Ensure** that your code follows the project’s coding standards and is well-documented.

## License

The project is licensed under a Contributor License Agreement (CLA). This agreement ensures that contributors retain ownership of their contributions while granting the project owner rights to use, distribute, and modify those contributions.

## Contact

If you have any questions or need further assistance, please feel free to contact us at [purwarkevin@gmail.com].

---