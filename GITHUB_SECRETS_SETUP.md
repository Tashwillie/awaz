# GitHub Secrets Setup Guide

This guide explains how to configure the required secrets for the CI/CD pipeline to work with Vercel deployments.

## Required Secrets

The following secrets need to be configured in your GitHub repository:

### 1. VERCEL_TOKEN
- **Purpose**: Authenticates with Vercel API for deployments
- **How to get it**:
  1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
  2. Click "Create Token"
  3. Give it a name (e.g., "GitHub Actions")
  4. Select the appropriate scope (usually "Full Account" or your organization)
  5. Copy the generated token

### 2. VERCEL_SCOPE
- **Purpose**: Specifies which Vercel team/organization to deploy to
- **How to get it**:
  1. Go to your Vercel dashboard
  2. If you're using a team, the scope is usually your team name
  3. If you're using a personal account, the scope is usually your username
  4. You can also find this in your Vercel project settings

## How to Configure Secrets in GitHub

1. **Navigate to your repository** on GitHub
2. **Go to Settings** (tab at the top of the repository)
3. **Click on "Secrets and variables"** in the left sidebar
4. **Click on "Actions"**
5. **Click "New repository secret"** for each required secret:
   - Name: `VERCEL_TOKEN`, Value: [your Vercel token]
   - Name: `VERCEL_SCOPE`, Value: [your Vercel scope/team name]

## Verification

After configuring the secrets:

1. **Push a change** to the `develop` branch to trigger staging deployment
2. **Push a change** to the `main` branch to trigger production deployment
3. **Check the Actions tab** in your GitHub repository to see the workflow execution
4. **Look for any error messages** in the deployment steps

## Troubleshooting

### Common Issues

1. **"VERCEL_TOKEN secret is not configured"**
   - Make sure you've added the `VERCEL_TOKEN` secret in GitHub repository settings
   - Verify the secret name is exactly `VERCEL_TOKEN` (case-sensitive)

2. **"VERCEL_SCOPE secret is not configured"**
   - Make sure you've added the `VERCEL_SCOPE` secret in GitHub repository settings
   - Verify the secret name is exactly `VERCEL_SCOPE` (case-sensitive)

3. **Deployment fails with authentication error**
   - Verify your Vercel token is valid and has the correct permissions
   - Check that your Vercel scope is correct for your team/organization

4. **"Context access might be invalid" warnings**
   - These are just warnings from the GitHub Actions linter
   - They will disappear once the secrets are properly configured
   - The workflow will still work correctly

### Getting Help

If you continue to have issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Check the [Vercel CLI documentation](https://vercel.com/docs/cli)
3. Review the workflow logs in the GitHub Actions tab for specific error messages

## Security Notes

- **Never commit secrets** to your repository
- **Use GitHub Secrets** for all sensitive configuration
- **Rotate tokens regularly** for security
- **Use least-privilege access** - only give tokens the minimum required permissions
