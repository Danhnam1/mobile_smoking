export default ({ config }) => ({
  ...config,
  extra: {
    JITSI_APP_ID: process.env.JITSI_APP_ID,
    JITSI_ROOM_DEFAULT: process.env.JITSI_ROOM_DEFAULT,
    JITSI_JWT_TOKEN: process.env.JITSI_JWT_TOKEN,
  },
});
