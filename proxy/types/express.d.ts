declare global {
  namespace Express {
    interface Request {
      accessToken?: AccessToken;
    }
  }
}
