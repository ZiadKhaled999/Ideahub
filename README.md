# Idea Hub

![License](https://img.shields.io/badge/license-Apache-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Version](https://img.shields.io/badge/version-1.0.0-informational.svg)

A robust, full-stack web application for the systematic storage, management, and tracking of application ideas. The system provides a secure, single-user or multi-tenant environment for ideation lifecycle management, from conception to archival.

## Table of Contents

1.  [About The Project](#about-the-project)
    * [Core Functionality](#core-functionality)
    * [Built With](#built-with)
2.  [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
3.  [Configuration](#configuration)
4.  [Usage](#usage)
    * [Running the Development Server](#running-the-development-server)
    * [Building for Production](#building-for-production)
5.  [API Reference](#api-reference)
    * [Idea Endpoints](#idea-endpoints)
6.  [Database Schema](#database-schema)
    * [`ideas` Table](#ideas-table)
7.  [Roadmap](#roadmap)
8.  [Contributing](#contributing)
9.  [License](#license)
10. [Contact](#contact)
11. [Acknowledgements](#acknowledgements)

---

## About The Project

Idea Hub is designed to solve the problem of disorganized and ephemeral application concepts. Standard note-taking applications lack the specialized structure required to properly evaluate and track an idea's journey. This project provides that structure through a dedicated interface and a purpose-built data model.

The application utilizes a card-based, masonry grid layout for high-level visualization and a modal-based interface for detailed data entry and modification.

### Core Functionality

* **Secure User Authentication:** JWT-based authentication ensures all user data is private and secure.
* **CRUD Operations for Ideas:** Full create, read, update, and delete capabilities for all user-generated ideas.
* **Lifecycle Status Tracking:** Each idea can be assigned a status (e.g., `Idea`, `Researching`, `In Progress`, `Launched`, `Archived`).
* **Categorization:** Support for multiple tags per idea enables complex filtering and organization.
* **Dynamic Filtering and Search:** A real-time search engine filters ideas by keywords, status, and tags.
* **Visual Organization:** Customizable color-coding for idea cards allows for at-a-glance grouping.

### Built With

This project is built on a modern, scalable technology stack.

* **[Next.js](https://nextjs.org/)** - React Framework for production.
* **[React](https://reactjs.org/)** - Front-end JavaScript library.
* **[Supabase](https://supabase.io/)** - Backend-as-a-Service (BaaS) for database, authentication, and storage.
* **[PostgreSQL](https://www.postgresql.org/)** - The underlying relational database.
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for styling.

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
    git clone [https://github.com/ZiadKhaled99 9/ideahub.git](https://github.com/ZiadKhaled99 9/ideahub.git)
    cd idea-hub
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    # or
    yarn install
    ```
3.  **Set up environment variables**
    Create a `.env.local` file in the root of the project and add your Supabase credentials. You can obtain these from your Supabase project dashboard.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
4.  **Initialize the database**
    Log in to your Supabase account and run the SQL script located at `db/schema.sql` to create the necessary tables and policies.

---

## Configuration

The application requires the following environment variables to connect to the backend service:

| Variable                     | Description                                          | Required |
| ---------------------------- | ---------------------------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`   | The unique URL for your Supabase project API.        | `true`   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The public "anonymous" key for your Supabase project. | `true`   |

---

## Usage

### Running the Development Server

Execute the following command to start the Next.js development server, which includes Fast Refresh.

```sh
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To create an optimized production build, run:

```sh
npm run build
```
This will generate a `.next` folder with the compiled, optimized application. To run the production build locally:

```sh
npm start
```

---

## API Reference

The application's core logic is handled via a RESTful API.

### Idea Endpoints

* **`GET /api/ideas`**: Retrieves a list of all ideas for the authenticated user.
    * **Query Parameters**: `status`, `tag`, `q` (for search).
    * **Response**: `200 OK` - An array of idea objects.

* **`POST /api/ideas`**: Creates a new idea.
    * **Request Body**: A JSON object representing the new idea.
    * **Response**: `201 Created` - The newly created idea object.

* **`PUT /api/ideas/{id}`**: Updates an existing idea by its unique ID.
    * **Request Body**: A JSON object with the fields to be updated.
    * **Response**: `200 OK` - The updated idea object.

* **`DELETE /api/ideas/{id}`**: Deletes an idea by its unique ID.
    * **Response**: `204 No Content`.

---

## Database Schema

The primary data entity is the `ideas` table.

### `ideas` Table

| Column      | Type        | Constraints                             | Description                                 |
| ----------- | ----------- | --------------------------------------- | ------------------------------------------- |
| `id`        | `uuid`      | `PRIMARY KEY`, `default: uuid_generate_v4()` | Unique identifier for the idea.             |
| `user_id`   | `uuid`      | `FOREIGN KEY` to `auth.users(id)`     | The user who owns the idea.                 |
| `title`     | `text`      | `NOT NULL`                              | The title of the idea.                      |
| `description` | `text`      |                                         | A detailed description of the idea.         |
| `status`    | `text`      | `default: 'Idea'`                         | The current stage of the idea.              |
| `tags`      | `text[]`    |                                         | An array of text tags for categorization.   |
| `color`     | `varchar(7)`| `default: '#ffffff'`                    | Hex color code for the idea card.           |
| `created_at`| `timestamptz` | `default: now()`                        | Timestamp of when the idea was created.     |
| `updated_at`| `timestamptz` | `default: now()`                        | Timestamp of the last update.               |

Row Level Security (RLS) is enabled to ensure users can only access their own data.

---

## Roadmap

* [ ] Implement rich text editor for the `description` field.
* [ ] Add file attachments for mockups and documents.
* [ ] Introduce a "Team" feature for collaborative ideation.
* [ ] Develop an analytics dashboard for idea metrics.

See the [open issues](https://github.com/ZiadKhaled99 9/ideahub/issues) for a full list of proposed features and known bugs.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please refer to the `CONTRIBUTING.md` file for detailed guidelines on how to contribute to this project.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the Apache License. See `LICENSE.txt` for more information.

---

## Contact

Project Maintainer: [ZiadKhaled999] - [albhyrytwamrwhy@gmail.com](mailto:albhyrytwamrwhy@gmail.com)

Project Link: [https://github.com/ZiadKhaled999/ideahub]([https://github.com/your-username/idea-hub]

---

## Acknowledgements

* [Shields.io](https://shields.io)
* [Vercel](https://vercel.com)
* [Google Fonts](https://fonts.google.com/)
