/**
 * GitHub OAuth Device Flow handler for CLI authentication
 * Uses OAuth 2.0 Device Authorization Grant flow
 */

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * GitHub OAuth client configuration
 * In a production environment, these should come from environment variables
 * or a configuration file
 */
const GITHUB_OAUTH_CONFIG = {
  client_id: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
  scope: 'user:email repo read:org',
  device_auth_url: 'https://github.com/login/device/code',
  token_url: 'https://github.com/login/oauth/access_token',
};

/**
 * Request device code from GitHub
 */
export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await fetch(GITHUB_OAUTH_CONFIG.device_auth_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      client_id: GITHUB_OAUTH_CONFIG.client_id,
      scope: GITHUB_OAUTH_CONFIG.scope,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to request device code: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Poll for access token using device code
 */
export async function pollForAccessToken(
  deviceCode: string,
  interval: number,
  expirationTime: number
): Promise<AccessTokenResponse> {
  const startTime = Date.now();

  while (Date.now() - startTime < expirationTime * 1000) {
    try {
      const response = await fetch(GITHUB_OAUTH_CONFIG.token_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          client_id: GITHUB_OAUTH_CONFIG.client_id,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If authorization is still pending, continue polling
        if (errorData.error === 'authorization_pending') {
          await new Promise(resolve => setTimeout(resolve, interval * 1000));
          continue;
        }
        
        // If user denied or other error, stop polling
        if (errorData.error === 'access_denied') {
          throw new Error('Authorization denied by user');
        }
        
        throw new Error(`Failed to get access token: ${errorData.error || response.status}`);
      }

      return response.json();
    } catch (err) {
      // Network errors, continue polling
      if (err instanceof Error && err.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Authorization timeout: User did not authorize within the time limit');
}

/**
 * Open browser automatically based on the platform
 */
export async function openBrowser(url: string): Promise<boolean> {
  try {
    const { platform } = process;
    
    switch (platform) {
      case 'darwin': // macOS
        await import('node:child_process').then(({ execSync }) => {
          execSync(`open "${url}"`);
        });
        return true;
        
      case 'win32': // Windows
        await import('node:child_process').then(({ execSync }) => {
          execSync(`start "" "${url}"`);
        });
        return true;
        
      case 'linux': // Linux
        await import('node:child_process').then(({ execSync }) => {
          execSync(`xdg-open "${url}"`);
        });
        return true;
        
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Main function to handle GitHub Device Flow authentication
 * Returns the access token when successful
 */
export async function githubDeviceFlow(timeout?: number): Promise<string> {
  // Request device code
  const deviceCodeResponse = await requestDeviceCode();
  
  const {
    device_code,
    user_code,
    verification_uri,
    expires_in,
    interval,
  } = deviceCodeResponse;

  const effectiveTimeout = timeout || expires_in || 300; // Default 5 minutes

  // Display instructions
  console.log('');
  console.log('GitHub Authentication');
  console.log('====================');
  console.log(`1. Open your browser and go to: ${verification_uri}`);
  console.log(`2. Enter this code: ${user_code}`);
  console.log('3. Authorize the application');
  console.log('');
  console.log(`This code expires in ${expires_in} seconds.`);
  console.log('');

  // Optionally open browser
  const shouldOpenBrowser = await import('../lib/ui.js').then(async ({ confirm }) => {
    return await confirm('Would you like to open the browser automatically?', true);
  });

  if (shouldOpenBrowser) {
    const opened = await openBrowser(verification_uri);
    if (!opened) {
      console.log('Could not open browser automatically. Please open it manually.');
    }
  }

  // Poll for access token
  const tokenResponse = await pollForAccessToken(device_code, interval, effectiveTimeout);
  
  return tokenResponse.access_token;
}
