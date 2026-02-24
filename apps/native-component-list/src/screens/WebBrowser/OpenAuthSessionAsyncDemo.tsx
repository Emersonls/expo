import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

import { getGUID } from '../../api/guid';
import FunctionDemo, { FunctionDescription } from '../../components/FunctionDemo';

const customSchemeRedirectUrl = Linking.createURL('redirect');
// For testing HTTPS universal link callbacks (iOS 17.4+/macOS 14.4+)
// To test this, configure associated domains for the app and replace with your universal link domain
const httpsRedirectUrl = 'https://your-app.com/auth/callback';

function getGithubClientId() {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return '7eb5d82d8f160a434564';
  }
  if (Platform.OS === 'web') {
    return 'fd9b07204f9d325e8f0e';
  }
  // Native bare apps
  return '498f1fae3ae16f066f34';
}

function buildGoogleAuthUrl(redirectUrl: string, shouldPrompt: boolean) {
  const clientId = `${getGUID()}.apps.googleusercontent.com`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUrl,
    response_type: 'token',
    scope: 'openid profile email',
    state: Math.random().toString(36).slice(2),
  });
  if (shouldPrompt) {
    params.set('prompt', 'consent');
  }
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function buildGithubAuthUrl(redirectUrl: string) {
  const params = new URLSearchParams({
    client_id: getGithubClientId(),
    redirect_uri: redirectUrl,
    scope: 'read:user',
    state: Math.random().toString(36).slice(2),
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

function buildSpotifyAuthUrl(redirectUrl: string, shouldPrompt: boolean) {
  const params = new URLSearchParams({
    client_id: 'a946eadd241244fd88d0a4f3d7dea22f',
    redirect_uri: redirectUrl,
    response_type: 'token',
    scope: 'user-read-email user-read-private',
    state: Math.random().toString(36).slice(2),
    show_dialog: shouldPrompt ? 'true' : 'false',
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

const FUNCTION_DESCRIPTION: FunctionDescription = {
  name: 'openAuthSessionAsync',
  parameters: [
    {
      name: 'url',
      type: 'constant',
      value: 'url',
    },
    {
      name: 'redirectUrl',
      type: 'enum',
      values: [
        { name: 'Custom Scheme', value: customSchemeRedirectUrl },
        { name: 'HTTPS (Universal Link)', value: httpsRedirectUrl },
      ],
    },
    {
      name: 'options',
      type: 'object',
      properties: [
        { name: 'createTask', type: 'boolean', initial: true },
        { name: 'preferEphemeralSession', type: 'boolean', platforms: ['ios'], initial: false },
      ],
    },
  ],
  additionalParameters: [{ name: 'shouldPrompt', type: 'boolean', initial: false }],
  actions: [
    {
      name: 'Google',
      action: (
        _: string,
        redirectUrl: string,
        options: WebBrowser.WebBrowserOpenOptions,
        shouldPrompt: boolean
      ) => {
        const url = buildGoogleAuthUrl(redirectUrl, shouldPrompt);
        return WebBrowser.openAuthSessionAsync(url, redirectUrl, options);
      },
    },
    {
      name: 'GitHub',
      action: (_: string, redirectUrl: string, options: WebBrowser.WebBrowserOpenOptions) => {
        const url = buildGithubAuthUrl(redirectUrl);
        return WebBrowser.openAuthSessionAsync(url, redirectUrl, options);
      },
    },
    {
      name: 'Spotify',
      action: (
        _: string,
        redirectUrl: string,
        options: WebBrowser.WebBrowserOpenOptions,
        shouldPrompt: boolean
      ) => {
        const url = buildSpotifyAuthUrl(redirectUrl, shouldPrompt);
        return WebBrowser.openAuthSessionAsync(url, redirectUrl, options);
      },
    },
  ],
};

export default function OpenAuthSessionAsyncDemo() {
  return <FunctionDemo namespace="WebBrowser" {...FUNCTION_DESCRIPTION} />;
}
