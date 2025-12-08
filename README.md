# JSP-Website

Short description

This repository contains the JSP-Website project. If your project uses Java Server Pages (JSP) and runs on a servlet container (e.g., Apache Tomcat), note that Vercel does NOT support running Java servlet containers. If this is a static site or a Node/Next.js/React app, the Vercel instructions below will work.

## How to tell what this project is

- If you see files like `pom.xml`, `build.gradle`, `WEB-INF`, or `.jsp` files — this is a Java/JSP web app that needs a servlet container (Tomcat, Jetty). Vercel cannot host that directly.
- If you see `package.json`, `next.config.js`, or `public/` + `src/` — this is likely a Node/React/Next.js project and can be deployed to Vercel.
- If it is a purely static site (HTML/CSS/JS) it can be deployed to Vercel.

## Local development

If Node-based:

1. Install dependencies

   npm install

2. Start dev server

   npm run dev

3. Build for production

   npm run build

4. Preview (if available)

   npm run start

If Java/JSP-based (Tomcat):

1. Build with Maven or Gradle

   mvn package   # or ./gradlew build

2. Deploy the generated WAR to a servlet container (Apache Tomcat)

## Deploying to Vercel

Note: Vercel supports static sites, Next.js, and many Node-based frameworks. It does NOT support Java servlet containers (so it cannot run JSP apps that require Tomcat). If your repo is Node/Next/static, follow these steps:

1. Create a Vercel account at https://vercel.com and connect your GitHub account.
2. In the Vercel dashboard, click "New Project" > "Import Git Repository" and choose this repository.
3. During import, Vercel usually detects the framework automatically. If not, set the framework and configure:
   - Build Command: the command that builds your app (e.g. `npm run build` or `next build`).
   - Output Directory: the folder Vercel should serve (examples below).

Common build/output settings:
- Next.js (recommended): Build Command: `npm run build`; Output: (leave empty — Vercel auto-detects Next)
- Create React App: Build Command: `npm run build`; Output Directory: `build`
- Static site (custom): Build Command: (if any, e.g., `npm run build`); Output Directory: `dist` or `public` (whatever your project produces)

4. Add any required Environment Variables in the Vercel project settings (e.g., API keys) and redeploy.
5. After deploy, Vercel provides a URL. Use that or set up a custom domain in the Vercel dashboard.

Vercel CLI (optional):

- Install: `npm i -g vercel`
- From the repo root, run: `vercel` and follow prompts to deploy.

## If this is a Java / JSP application

Because Vercel cannot host Java servlet containers (Tomcat/Jetty), you have two main options:

A) Use a Java-friendly host:
- Render.com, Railway, Fly.io, Google Cloud Run, AWS Elastic Beanstalk, or a VPS.
- Most of these can run your WAR file or Docker container.

B) Containerize and deploy to a provider that supports Docker:
1. Add a Dockerfile that runs your app on Tomcat or an embedded server.
2. Push the repository and deploy the container to Render, Fly.io, or Google Cloud Run.

Example minimal Dockerfile (Tomcat + WAR):

```dockerfile
FROM tomcat:9-jdk11
COPY target/*.war /usr/local/tomcat/webapps/ROOT.war
V1.3
