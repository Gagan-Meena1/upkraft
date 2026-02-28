export async function sendExpoPushNotifications(
  tokens: (string | null | undefined)[],
  title: string,
  body: string,
  data: object = {}
) {
  const messages = (tokens.filter(t => t?.startsWith('ExponentPushToken[')) as string[])
    .map(to => ({ to, title, body, data, sound: 'default' }));
  if (!messages.length) return;
  fetch('https://exp.host/--/expo-server/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  }).catch(() => {});
}
