export type LinkResourceAuthTypes = 'basic' | 'token' | 'oauth-credentials';

export type LinkResourceAuthDto = {
  username?: string;
  password?: string;
  tokenPrefix?: string;
  tokenString?: string;
  clientKey?: string;
  clientSecret?: string;
  type?: LinkResourceAuthTypes;
} & (
  // Enforce that either (username and password) or (tokenPrefix and tokenString) or (client_key and client_secret) are present
  ({}
  | {
    type: 'basic';
    username: string;
    password: string;
    tokenPrefix?: never;
    tokenString?: never;
    clientKey?: never;
    clientSecret?: never;
  }
  | {
    type: 'token';
    tokenPrefix: string;
    tokenString: string;
    username?: never;
    password?: never;
    clientKey?: never;
    clientSecret?: never;
  }
  | {
    type: 'oauth-credentials';
    clientKey: string;
    clientSecret: string;
    username?: never;
    password?: never;
    tokenPrefix?: never;
    tokenString?: never;
  })
);