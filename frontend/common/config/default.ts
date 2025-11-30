export default {
  cookies: {
    sessionKey: 'sessionIdCookie',
    tokenKey: 'token',
    refreshTokenKey: 'refresh_token',
  },
  revalidate: {
    short: 60,
    normal: 3600,
  },
};
