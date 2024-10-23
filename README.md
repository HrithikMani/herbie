
# Chrome Extension Publishing Workflow

This repository contains the code and workflow for publishing the Chrome extension. This document provides instructions on how to test the GitHub Actions workflow locally using the `act` CLI and how to set up the necessary secrets in your GitHub repository.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installing `act` CLI](#installing-act-cli)
- [Setting Up Secrets for Local Testing](#setting-up-secrets-for-local-testing)
- [Running the Workflow Locally](#running-the-workflow-locally)
- [Setting Up Secrets in GitHub Repository](#setting-up-secrets-in-github-repository)
- [Notes](#notes)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## Prerequisites

- **Docker**: Ensure that Docker is installed and running on your machine.
- **Node.js**: Version 18 or higher is recommended.
- **`act` CLI**: A tool to run GitHub Actions workflows locally.

## Installing `act` CLI

`act` allows you to run your GitHub Actions workflows locally.

### Installation Steps

1. **Install `act`**:

   - **Homebrew (macOS/Linux)**:

     ```bash
     brew install act
     ```

   - **Scoop (Windows)**:

     ```bash
     scoop install act
     ```

   - **Using Curl**:

     ```bash
     curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
     ```

   - **Using Go**:

     ```bash
     go install github.com/nektos/act@latest
     ```

2. **Verify Installation**:

   ```bash
   act --version
   ```

   You should see the version information for `act`.

## Setting Up Secrets for Local Testing

To simulate GitHub repository secrets when testing locally with `act`, you need to create a `.secrets` file.

### Steps to Create a `.secrets` File

1. **Navigate to the Root Directory**:

   Ensure you are in the root directory of your repository.

2. **Create a `.secrets` File**:

   Create a file named `.secrets` (no file extension).

3. **Add Your Secrets**:

   Open the `.secrets` file in a text editor and add the following content:

   ```ini
   CHROME_APP_ID=your_extension_id
   CHROME_CLIENT_ID=your_client_id
   CHROME_CLIENT_SECRET=your_client_secret
   CHROME_REFRESH_TOKEN=your_refresh_token
   ```

   Replace:

   - `your_extension_id` with your Chrome extension's ID.
   - `your_client_id` with your OAuth client ID.
   - `your_client_secret` with your OAuth client secret.
   - `your_refresh_token` with your OAuth refresh token.

4. **Secure Your Secrets**:

   - **Do Not Commit**: Add `.secrets` to your `.gitignore` file to prevent it from being committed to version control.
   - **Example `.gitignore` Entry**:

     ```gitignore
     # Ignore secrets file
     .secrets
     ```

## Running the Workflow Locally

With `act` installed and secrets set up, you can now run your workflow locally.

### Steps to Run

1. **Open Terminal**:

   Navigate to the root directory of your repository.

2. **Run `act`**:

   ```bash
   act
   ```

   - This command will execute the default event (`push`).
   - If you have multiple workflows or need to specify the workflow file, use:

     ```bash
     act -W .github/workflows/publish.yml
     ```

3. **Verbose Output** (Optional):

   For detailed logs, run:

   ```bash
   act -v
   ```

4. **Monitor the Output**:

   - Ensure that all steps run successfully.
   - Check for any errors or issues in the logs.

## Setting Up Secrets in GitHub Repository

To run the workflow on GitHub Actions, you need to set up the secrets in your repository settings.

### Steps to Add Secrets

1. **Navigate to Your Repository**:

   Go to your GitHub repository in your web browser.

2. **Access Repository Settings**:

   Click on the **Settings** tab.

3. **Go to Secrets**:

   - In the left sidebar, click on **Secrets and variables**.
   - Select **Actions**.

4. **Add New Secrets**:

   For each secret, follow these steps:

   - Click on **"New repository secret"**.
   - **Name**: Enter the secret name.
   - **Value**: Enter the corresponding value.
   - Click **Add secret**.

   **Secrets to Add**:

   - **`CHROME_APP_ID`**

     - **Name**: `CHROME_APP_ID`
     - **Value**: Your Chrome extension's ID.

   - **`CHROME_CLIENT_ID`**

     - **Name**: `CHROME_CLIENT_ID`
     - **Value**: Your OAuth client ID.

   - **`CHROME_CLIENT_SECRET`**

     - **Name**: `CHROME_CLIENT_SECRET`
     - **Value**: Your OAuth client secret.

   - **`CHROME_REFRESH_TOKEN`**

     - **Name**: `CHROME_REFRESH_TOKEN`
     - **Value**: Your OAuth refresh token.

5. **Verify Secrets**:

   - Ensure that all secrets are correctly named.
   - Double-check for typos or incorrect values.

## Notes

- **Security Best Practices**:

  - Never commit sensitive information like client secrets or refresh tokens to version control.
  - Always use GitHub Secrets to store sensitive data.

- **Consistency**:

  - Ensure that the secret names in your GitHub repository match exactly with those used in your workflow files and scripts.
  - Secret names are case-sensitive.

- **Workflow Reference**:

  - In your workflow YAML file (`.github/workflows/publish.yml`), secrets are accessed using `${{ secrets.SECRET_NAME }}`.

    ```yaml
    env:
      CHROME_APP_ID: ${{ secrets.CHROME_APP_ID }}
      CHROME_CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
      CHROME_CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
      CHROME_REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
    ```

## Troubleshooting

- **Docker Not Running**:

  - Ensure that Docker Desktop is installed and running.
  - Test Docker by running:

    ```bash
    docker run hello-world
    ```

- **Secrets Not Set**:

  - If you encounter errors about missing `extensionId` or other variables, verify that your `.secrets` file is correctly set up.
  - Ensure that variable names match between the `.secrets` file, workflow, and scripts.

- **Variable Names Case Sensitivity**:

  - Remember that environment variable names are case-sensitive.
  - Consistency is key to avoiding undefined variables.

- **Debugging Workflow Steps**:

  - Use the `-v` flag with `act` to get verbose logs.
  - Add temporary `console.log` statements in your scripts to check if variables are set (avoid printing sensitive values).

- **Workflow Errors**:

  - Check the output logs carefully to identify where the workflow fails.
  - Ensure all dependencies are installed, and paths are correct.

## Additional Resources

- **act Documentation**:

  - [nektos/act GitHub Repository](https://github.com/nektos/act)

- **Docker Installation**:

  - [Docker Desktop for Windows/Mac](https://www.docker.com/products/docker-desktop)
  - [Docker Installation Guides](https://docs.docker.com/get-docker/)

- **GitHub Actions Documentation**:

  - [Understanding GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)
