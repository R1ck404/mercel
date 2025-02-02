# Mercel - Mini Vercel Clone

Mercel is a small-scale clone of Vercel, designed to mimic the UI and functionality of Vercel as closely as possible. It is a personal project and is not intended for production use. The project is still under development and may contain bugs, non-optimal code, and unoptimized performance. If the repository gains enough stars, I will continue to work on it to make it production-ready.

---

## 🛠️ Technologies Used

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PocketBase
- **Deployment**: Docker, Nginx

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Docker** (with Docker CLI installed and running)
- **Docker Image**: Ensure you have the `node:23-alpine` Docker image installed. You can pull it using:
  ```bash
  docker pull node:23-alpine
  ```
- **PocketBase** (Download from [here](https://pocketbase.io/docs/))
- **GitHub OAuth App** (for authentication)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/R1ck404/mercel.git
   cd mercel
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090/
   NEXT_PUBLIC_API_URL=http://127.0.0.1:3000/
   NEXT_PUBLIC_SERVER_IP=127.0.0.1
   GITHUB_WEBHOOK_SECRET=abc
   ```

4. **Set Up PocketBase**

   - Download PocketBase from the [official documentation](https://pocketbase.io/docs/).
   - Launch PocketBase and go to `Settings` -> `Import Collections`. Import the `pb_schema.json` file found in the root of the repository.
   - Set up GitHub OAuth:
     - Go to `Collections` -> `Users` -> `Settings` -> `Options` -> `OAuth2`.
     - Add GitHub as a provider if it’s not already there.
     - Enter the Client ID and Secret from your GitHub OAuth App.

5. **Set Up GitHub OAuth App**

   - Go to GitHub -> Settings -> Developer Settings -> OAuth Apps -> New OAuth App.
   - Set the **Homepage URL** to your app's URL (e.g., `http://127.0.0.1:3000/`).
   - Set the **Authorization callback URL** to `http://127.0.0.1:3000/api/oauth2-redirect`.

6. **Run the Application**

   - Start the Next.js development server:

     ```bash
     npm run start
     ```

   - Ensure Docker and Nginx are running if you plan to deploy the app.

---

## 🐛 Known Issues

- The project is not fully complete and may contain bugs.
- The code is not optimized and should not be used in production.
- Some features may not work as expected.

---

## 🤝 Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## ⭐️ Support

If you find this project interesting or useful, please give it a ⭐️ on GitHub! If the repository gains enough stars, I will continue to work on it to make it production-ready.

Maybe you can buy me a coffee too! [Buy me a coffee](https://buymeacoffee.com/r1ck404)!

---

## 📧 Contact

For any questions or feedback, feel free to reach out to me at [rickhuijser898@gmail.com](mailto:rickhuijser898@gmail.com).

---

Happy coding! 🚀