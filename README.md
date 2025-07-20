
<div align="center">

# Idea Hub

A full-stack web application for systematically managing and tracking your application ideas from conception to completion.

<div>
    <img src="https://img.shields.io/badge/license-Apache-blue.svg?style=for-the-badge" alt="License">
    <img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge" alt="Build Status">
    <img src="https://img.shields.io/badge/version-1.0.0-informational.svg?style=for-the-badge" alt="Version">
</div>

</div>

---

### **Idea Hub is the structured home your best ideas deserve.**
Standard note-taking apps are great, but they lack the specialized tools to track an idea's lifecycle. Idea Hub provides that structure through a dedicated interface and a purpose-built data model, ensuring no concept gets lost or forgotten.

## Table of Contents
1.  [✨ Features](#-features)
2.  [🛠️ Tech Stack](#️-tech-stack)
3.  [🚀 Getting Started](#-getting-started)
4.  [⚙️ Configuration](#️-configuration)
5.  [▶️ Usage](#️-usage)
6.  [📄 API Reference](#-api-reference)
7.  [🗄️ Database Schema](#️-database-schema)
8.  [🗺️ Roadmap](#️-roadmap)
9.  [❤️ Contributing](#️-contributing)
10. [📜 License](#-license)
11. [📬 Contact](#-contact)

---

## ✨ Features

* 🔐 **Secure User Authentication:** JWT-based authentication ensures all user data is private and secure.
* 📝 **Full CRUD for Ideas:** Complete Create, Read, Update, and Delete capabilities for your ideas.
* 📊 **Lifecycle Status Tracking:** Assign a status to each idea (`Idea`, `Researching`, `In Progress`, `Launched`, `Archived`) to monitor progress.
* 🏷️ **Dynamic Categorization:** Add multiple tags to each idea for powerful filtering and organization.
* 🔍 **Real-time Search & Filter:** Instantly find ideas by keyword, status, or tag.
* 🎨 **Visual Organization:** Customize the color of idea cards for at-a-glance grouping and prioritization.

---

## 🛠️ Tech Stack

This project is built on a modern, scalable technology stack.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have the following software installed on your development machine:
* Node.js (v18.x or later)
* npm, yarn, or pnpm
* Git

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/ZiadKhaled999/ideahub.git](https://github.com/ZiadKhaled999/ideahub.git)
    cd ideahub
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the project root and add your Supabase project credentials.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
4.  **Initialize the database:**
    Log in to your Supabase project dashboard and run the SQL script located at `db/schema.sql` to create the necessary tables and policies.

---

## ⚙️ Configuration

The application requires the following environment variables to connect to the Supabase backend.

| Variable                      | Description                                           | Required |
| ----------------------------- | ----------------------------------------------------- | :------: |
| `NEXT_PUBLIC_SUPABASE_URL`    | The unique URL for your Supabase project API.         |  `true`  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The public "anonymous" key for your Supabase project. |  `true`  |

---

## ▶️ Usage

### Development Server

Run the following command to start the Next.js development server with Fast Refresh.
```sh
npm run dev
```
Open http://localhost:3000 in your browser to see the application.
Production Build
To create an optimized production build, run:
npm run build

This generates a .next folder. To run the production server locally:
npm start

📄 API Reference
The application communicates with the backend via a RESTful API.
Idea Endpoints
 * GET /api/ideas: Retrieves all ideas for the authenticated user.
   * Query Params: status, tag, q (for search).
   * Response: 200 OK - An array of idea objects.
 * POST /api/ideas: Creates a new idea.
   * Request Body: A JSON object for the new idea.
   * Response: 201 Created - The newly created idea object.
 * PUT /api/ideas/{id}: Updates an existing idea by its ID.
   * Request Body: A JSON object with the fields to update.
   * Response: 200 OK - The updated idea object.
 * DELETE /api/ideas/{id}: Deletes an idea by its ID.
   * Response: 204 No Content.
🗄️ Database Schema
The primary data entity is the ideas table, with Row Level Security (RLS) enabled to ensure users can only access their own data.
ideas Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PRIMARY KEY, default: uuid_generate_v4() | Unique identifier for the idea. |
| user_id | uuid | FOREIGN KEY to auth.users(id) | The user who owns the idea. |
| title | text | NOT NULL | The title of the idea. |
| description | text |  | A detailed description of the idea. |
| status | text | default: 'Idea' | The current stage of the idea. |
| tags | text[] |  | An array of text tags for categorization. |
| color | varchar(7) | default: '#ffffff' | Hex color code for the idea card. |
| created_at | timestamptz | default: now() | Timestamp of when the idea was created. |
| updated_at | timestamptz | default: now() | Timestamp of the last update. |
🗺️ Roadmap
 * [ ] Implement a rich text editor for the description field.
 * [ ] Add file attachments for mockups and documents.
 * [ ] Introduce a "Teams" feature for collaborative ideation.
 * [ ] Develop an analytics dashboard for idea metrics.
See the open issues for a full list of proposed features and known bugs.
❤️ Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.
Please see the CONTRIBUTING.md file for detailed guidelines.
 * Fork the Project
 * Create your Feature Branch (git checkout -b feature/AmazingFeature)
 * Commit your Changes (git commit -m 'Add some AmazingFeature')
 * Push to the Branch (git push origin feature/AmazingFeature)
 * Open a Pull Request
📜 License
Distributed under the Apache 2.0 License. See LICENSE.txt for more information.
📬 Contact
Ziad Khaled - @ZiadKhaled999 - albhyrytwamrwhy@gmail.com
Project Link: https://github.com/ZiadKhaled999/ideahub
