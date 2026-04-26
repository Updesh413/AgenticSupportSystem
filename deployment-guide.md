# Deployment Guide: Agentic Support System

Follow these steps to take your project live and outshine your resume!

## 1. Backend Deployment (Railway or Render)
I recommend **Railway.app** as it's extremely easy for Spring Boot.

1.  **Push to GitHub:** Create a new repository and push your entire project (including the new `Dockerfile`).
2.  **Connect to Railway:** 
    *   Create a New Project -> Deploy from GitHub.
    *   Select your repository.
3.  **Set Environment Variables:** In the Railway "Variables" tab, add:
    *   `SUPABASE_DB_URL`: (Your JDBC URL)
    *   `SUPABASE_DB_USER`: `postgres`
    *   `SUPABASE_DB_PASSWORD`: (Your DB Password)
    *   `GEMINI_API_KEY`: (Your Google AI Key)
    *   `CLERK_JWKS_URL`: (From Clerk Dashboard -> API Keys -> Advanced)
    *   `PORT`: `8080`
4.  **Deployment:** Railway will detect the `Dockerfile`, build the image, and give you a public URL (e.g., `https://backend-production.up.railway.app`).

---

## 2. Frontend Deployment (Vercel)
Vercel is the gold standard for Next.js.

1.  **Connect to Vercel:**
    *   Import your GitHub repository.
    *   **Root Directory:** Set this to `client` (since your Next.js app is in the subfolder).
2.  **Set Environment Variables:** 
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: (Your Key)
    *   `CLERK_SECRET_KEY`: (Your Secret)
    *   `NEXT_PUBLIC_ADMIN_EMAIL`: (Your Email)
    *   **Crucial:** Change the fetch URLs in your code to point to your **Railway URL** instead of `localhost:8080`.
3.  **Deploy:** Vercel will build your app and give you a URL (e.g., `https://agentic-portal.vercel.app`).

---

## 3. Final Step: CORS Update
Once you have your Vercel URL:
1.  Go back to your Spring Boot `WebConfig.java`.
2.  Add your production Vercel URL to the `.allowedOrigins(...)` list.
3.  Push the change to GitHub. Railway will automatically redeploy!

## 4. Interview Tip 💡
When showcasing this, highlight:
*   **Architecture:** "I built a decoupled system with a Java/Spring Boot microservice and a Next.js serverless frontend."
*   **Security:** "I used Clerk for OIDC-compliant authentication and implemented JWT validation on the backend."
*   **AI:** "The system uses an autonomous Agentic AI that integrates with legacy systems via n8n workflows."
