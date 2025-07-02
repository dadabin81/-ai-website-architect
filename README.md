# AI Website Architect (Firebase Studio)

This is a Next.js project for the AI Website Architect, built inside Firebase Studio.

## Deployment with Firebase App Hosting

This project is configured to be deployed using Firebase App Hosting, which provides a seamless, git-based workflow.

### One-Time Setup

1.  **Create a GitHub Repository:** Create a new, empty repository on GitHub. For this project, the correct repository is: `https://github.com/dadabin81/-ai-website-architect.git`.

2.  **Publish from Studio:** Inside Firebase Studio, use the "Source Control" view (the icon with branching lines) to **Publish to GitHub**. Connect your GitHub account and select the repository you just created. This will push your project code to the repository.

3.  **Configure App Hosting:**
    *   Go to the Firebase Console for your project.
    *   Navigate to the **Build > App Hosting** section.
    *   Click **"Get Started"** or **"Create backend"**.
    *   Connect to GitHub and select your repository.
    *   Use the following settings:
        *   **Root directory:** `/`
        *   **Live branch:** `main`
    *   Save and deploy. Firebase will build and host your application.

### Automatic Deployments

After the initial setup, every time you push new changes to your `main` branch in GitHub, Firebase App Hosting will automatically build and deploy the new version of your site.
