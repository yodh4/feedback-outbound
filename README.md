# Smart Feedback Portal

A Customer Feedback Portal built with Next.js, Supabase, and n8n. Users can submit feedback that gets automatically classified and prioritized using an automated backend workflow.

## Application Overview

This project demonstrates a complete integration between a modern frontend, a Backend-as-a-Service (BaaS) provider, and an automation platform.

**Core Technologies:**
*   **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
*   **Database & Auth:** Supabase (PostgreSQL, RLS, Auth Helpers)
*   **Automation:** n8n (Webhook triggers, Conditional logic, HTTP Requests)

## Features

*   **Authentication:** Secure Email/Password login flows protected by Middleware.
*   **Real-time Dashboard:** Live updates for feedback status using Supabase Realtime (WebSocket).
*   **Automated Classification:** Backend workflows analyze description text to assign Priority (High/Low) and Category (Bug/General).
*   **Row Level Security (RLS):** Strict database policies ensuring users access only their own data.
*   **Responsive UI:** Clean interface built with shadcn/ui components.

## Prerequisites

Ensure you have the following services and tools ready:

1.  **Node.js Runtime:** Node.js v18+ or Bun.
2.  **Supabase Account:** A free tier project.
3.  **n8n Account:** n8n Cloud (trial) or a self-hosted instance reachable by Supabase.

## Setup Instructions

### 1. Repository Setup

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd feedback-portal
bun install
# or npm install
```

### 2. Supabase Configuration

1.  Create a new project at Supabase.
2.  Navigate to **Settings > API** and note down:
    *   Project URL
    *   Project API Key (anon/public)
    *   Service Role Key (secret) - *Required for n8n*
3.  Navigate to the **SQL Editor** in the side menu.
4.  Copy the contents of `supabase/schema.sql` from this repository and run the query. This will:
    *   Create the `feedback` table.
    *   Enable Row Level Security (RLS).
    *   Create necessary RLS policies.
    *   Enable Realtime replication for the table.
5.  Navigate to **Authentication > Providers** and ensure **Email** is enabled.

### 3. Environment Variables

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. n8n Workflow Setup

The automation logic is defined in `workflows/feedback-classification.json`.

1.  **Import Workflow:**
    *   Open your n8n dashboard.
    *   Select **Workflows** > **Import from File**.
    *   Upload `workflows/feedback-classification.json`.

2.  **Configure Credentials (Groq AI):**
    *   Sign up at [Groq Cloud](https://console.groq.com) and create an API Key.
    *   In n8n, open the **AI Classifier** node.
    *   Under **Authentication**, create a new credential (Header Auth) or update the existing one.
    *   **Header Name:** `Authorization`
    *   **Value:** `Bearer YOUR_GROQ_API_KEY`

3.  **Configure Supabase Connection:**
    Open the **Supabase Update** node in n8n and update the following fields manually:
    *   **URL:** Replace `{{ $env.SUPABASE_URL }}` with your Supabase Project URL.
    *   **Headers:**
        *   Replace `{{ $env.SUPABASE_SERVICE_KEY }}` in `apikey` with your **Service Role Key**.
        *   Replace `{{ $env.SUPABASE_SERVICE_KEY }}` in `Authorization` with your **Service Role Key**.

4.  **Activate Webhook:**
    *   Toggle the workflow status to **Active** (Green).
    *   Double-click the **Webhook** node and copy the **Production URL**.

4.  **Connect Supabase Trigger:**
    *   Go to Supabase Dashboard > **Database > Webhooks**.
    *   Create a new webhook:
        *   **Name:** `feedback-classifier`
        *   **Table:** `public.feedback`
        *   **Events:** Select `INSERT`.
        *   **Method:** `POST`
        *   **URL:** Paste the n8n Production URL copied in the previous step.

### 5. Running the Application

Start the development server:

```bash
bun dev
# or npm run dev
```

Navigate to `http://localhost:3000` to access the portal.

## Row Level Security (RLS) Policies

To ensure data security, the following strict policies are applied to the `feedback` table:

| Policy Name | Action | Logic |
| :--- | :--- | :--- |
| **Users can view own feedback** | SELECT | `auth.uid() = user_id` |
| **Users can insert own feedback** | INSERT | `auth.uid() = user_id` |
| **Service role can update feedback** | UPDATE | `auth.role() = 'service_role'` |

### RLS Policy SQL Implementation

```sql
-- Users can only view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update any feedback (for n8n webhook)
CREATE POLICY "Service role can update feedback" ON feedback
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

This configuration ensures that users cannot access or modify others' feedback, while allowing the automation service (n8n) to categorize entries via the Service Role.

## Automation Logic (AI-Powered)

The n8n workflow processes incoming data using an LLM (Large Language Model) for intelligent classification:

1.  **Trigger:** Listens for new rows inserted into the `feedback` table via Supabase Webhook.
2.  **AI Analysis:** Sends the feedback description to **Groq (Llama-3.3)** via API.
3.  **Prompt Engineering:** The system prompt instructs the AI to identify issues (bugs, crashes, urgency) vs general feedback.
4.  **Structured Output:** The AI returns a strict JSON object: `{ "category": "Bug"|"General", "priority": "High"|"Low" }`.
5.  **Update:** The workflow parses the JSON and updates the record in Supabase with the confirmed classification.
