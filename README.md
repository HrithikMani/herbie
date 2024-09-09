
# Herbie Documentation

This repository contains the documentation for the Herbie project. The documentation is built using Docusaurus and deployed to GitHub Pages.

## Prerequisites

Ensure the following are installed before starting:

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)

## Setup Instructions

1. **Clone the Repository**

   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/HrithikMani/herbie.git
   cd herbie
   ```

2. **Pull All Branches**

   After cloning, pull all remote branches to your local repository:

   ```bash
   git fetch --all
   ```

   To check all the branches, use:

   ```bash
   git branch -a
   ```

3. **Switch to the Documentation Branch**

   Switch to the branch that contains the documentation:

   ```bash
   git checkout documentation
   ```

4. **Navigate to the Documentation Folder**

   Navigate to the `my-website` folder where the Docusaurus documentation is located:

   ```bash
   cd my-website
   ```

5. **Install Dependencies**

   Inside the `my-website` folder, install the necessary npm packages:

   ```bash
   npm install
   ```

6. **Build the Documentation**

   Build the Docusaurus site:

   ```bash
   npm run build
   ```

7. **Serve Locally (Optional)**

   To preview the build locally, use the following command:

   ```bash
   npm run serve
   ```

   You can access the site locally at `http://localhost:3000`.

8. **Deploy to GitHub Pages**

   Deploy the site to GitHub Pages:

   ```bash
   npm run deploy
   ```

   This pushes the build to the `gh-pages` branch using `gh-pages`.

## Repository Structure

- **`my-website/`**: Contains the Docusaurus documentation site.
- **`docs/`**: Contains the markdown files for the documentation.
- **`docusaurus.config.js`**: Configuration file for Docusaurus.
- **`sidebars.js`**: Defines the sidebar structure for the documentation.

## Customization

Modify the `docusaurus.config.js` and `sidebars.js` files to customize the sidebar, theme, or other settings.

## License

This project is licensed under the MIT License.
