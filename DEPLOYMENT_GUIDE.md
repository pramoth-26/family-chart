# Deployment Guide: GitHub & Netlify

Your project is ready to be deployed! Follow these specific steps to push your code to GitHub and host it on Netlify.

## Part 1: Push to GitHub

1.  **Create a New Repository on GitHub**:
    *   Go to [GitHub.com](https://github.com) and sign in.
    *   Click the **+** icon in the top right and select **New repository**.
    *   Name it `generation-chart` (or whatever you prefer).
    *   **Do NOT** check "Add a README", ".gitignore", or "license" (we already have these locally).
    *   Click **Create repository**.

2.  **Link and Push Code** (Run these commands in your terminal):
    *   *Copy the exact commands GitHub gives you under "…or push an existing repository from the command line", which look like this:*

    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/generation-chart.git
    git branch -M main
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

## Part 2: Deploy to Netlify

1.  **Log in to Netlify**:
    *   Go to [Netlify.com](https://www.netlify.com/) and sign in (you can use your GitHub account).

2.  **Import from GitHub**:
    *   Click **"Add new site"** > **"Import an existing project"**.
    *   Select **GitHub**.
    *   Authorize Netlify to access your GitHub repositories if asked.
    *   Search for and select your `generation-chart` repository.

3.  **Configure Build Settings**:
    *   Netlify should auto-detect the settings for Vite:
        *   **Build command**: `npm run build` (or `vite build`)
        *   **Publish directory**: `dist`
    *   Click **Deploy code**.

4.  **Done!**
    *   Netlify will build your site and give you a public URL (e.g., `https://random-name.netlify.app`).
    *   You can change the site name in "Site settings" > "Change site name".

## Updating the Site
*   Whenever you make changes, just commit and push to GitHub:
    ```bash
    git add .
    git commit -m "Update message"
    git push
    ```
*   Netlify will detect the push and automatically re-deploy your site!
