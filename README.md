<div align="center">
  <br />
  <img src="https://i.imgur.com/gL5gVw8.png" alt="Logo" width="120">
  <h1 align="center">Idea Hub</h1>
  <p align="center">
    A robust web application for the systematic storage, management, and tracking of application ideas.
    <br />
    <a href="https://github.com/ZiadKhaled999/ideahub/issues">Report Bug</a>
    ·
    <a href="https://github.com/ZiadKhaled999/ideahub/issues">Request Feature</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/license-Apache_2.0-blue.svg?style=for-the-badge" alt="License">
    <img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge" alt="Build Status">
    <img src="https://img.shields.io/badge/version-1.0.0-yellow.svg?style=for-the-badge" alt="Version">
  </p>
</div>

---

## About The Project

Idea Hub is designed to solve the problem of disorganized and ephemeral application concepts. Standard note-taking applications lack the specialized structure required to properly evaluate and track an idea's journey from conception to archival. This project provides that structure through a dedicated interface and a purpose-built data model.

The application utilizes a card-based, masonry grid layout for high-level visualization and a modal-based interface for detailed data entry and modification.

### Core Functionality

* **Secure User Authentication:** JWT-based authentication ensures all user data is private and secure.
* **CRUD Operations for Ideas:** Full create, read, update, and delete capabilities for all user-generated ideas.
* **Lifecycle Status Tracking:** Each idea can be assigned a status (e.g., `Idea`, `Researching`, `In Progress`, `Launched`, `Archived`).
* **Categorization & Tagging:** Support for multiple tags per idea enables complex filtering and organization.
* **Dynamic Filtering and Search:** A real-time search engine filters ideas by keywords, status, and tags.
* **Visual Organization:** Customizable color-coding for idea cards allows for at-a-glance grouping.

### Built With

This project is built on a modern, scalable technology stack.

* **[Next.js](https://nextjs.org/)** - React Framework for Production
* **[React](https://reactjs.org/)** - Front-End JavaScript Library
* **[Supabase](https://supabase.io/)** - Backend-as-a-Service (BaaS)
* **[PostgreSQL](https://www.postgresql.org/)** - Relational Database
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-First CSS Framework

---

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

Ensure you have the following software installed on your local development machine:

* Node.js (v18.x or later)
* npm, yarn, or pnpm package manager
* Git

### Installation

1.  **Clone the repository**
    ```sh
    git clone [https://github.com/ZiadKhaled999/ideahub.git](https://github.com/ZiadKhaled999/ideahub.git)
    cd ideahub
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up environment variables**
    Create a `.env.local` file in the root of the project. You can obtain these from your Supabase project dashboard.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
4.  **Initialize the database**
    Log in to your Supabase account and run the SQL script located at `db/schema.sql` to create the necessary tables and policies.

---

## Usage

### Running the Development Server

Execute the following command to start the Next.js development server.

```sh
npm run dev

Open http://localhost:3000 with your browser to see the result.
Building for Production
To create an optimized production build, run:
npm run build

This will generate a .next folder with the compiled application. To run the production build locally:
npm start

API Reference
Idea Endpoints
 * GET /api/ideas: Retrieves a list of all ideas for the authenticated user.
   * Query Parameters: status, tag, q (for search).
   * Response: 200 OK - An array of idea objects.
 * POST /api/ideas: Creates a new idea.
   * Request Body: A JSON object representing the new idea.
   * Response: 201 Created - The newly created idea object.
 * PUT /api/ideas/{id}: Updates an existing idea by its unique ID.
   * Request Body: A JSON object with the fields to be updated.
   * Response: 200 OK - The updated idea object.
 * DELETE /api/ideas/{id}: Deletes an idea by its unique ID.
   * Response: 204 No Content.
Database Schema
The primary data entity is the ideas table. Row Level Security (RLS) is enabled to ensure users can only access their own data.
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
Roadmap
 * [ ] Implement rich text editor for the description field.
 * [ ] Add file attachments for mockups and documents.
 * [ ] Introduce a "Team" feature for collaborative ideation.
 * [ ] Develop an analytics dashboard for idea metrics.
See the open issues for a full list of proposed features and known bugs.
Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.
Please refer to the CONTRIBUTING.md file for detailed guidelines.
 * Fork the Project
 * Create your Feature Branch (git checkout -b feature/AmazingFeature)
 * Commit your Changes (git commit -m 'Add some AmazingFeature')
 * Push to the Branch (git push origin feature/AmazingFeature)
 * Open a Pull Request
License
Distributed under the Apache 2.0 License. See LICENSE.txt for more information.
Contact
Ziad Khaled - @ZiadKhaled999 - albhyrytwamrwhy@gmail.com
Project Link: https://github.com/ZiadKhaled999/ideahub
Acknowledgements
 * Shields.io
 * Vercel
 * Imgur
<!-- end list -->
