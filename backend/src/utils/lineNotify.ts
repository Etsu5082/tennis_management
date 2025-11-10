import axios from 'axios';

const LINE_NOTIFY_API = 'https://notify-api.line.me/api/notify';

export const sendLineNotify = async (token: string, message: string): Promise<void> => {
  try {
    await axios.post(
      LINE_NOTIFY_API,
      `message=${encodeURIComponent(message)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error('LINE Notify error:', error);
    throw error;
  }
};

export const sendLineNotifyToMultiple = async (
  tokens: string[],
  message: string
): Promise<void> => {
  const promises = tokens.map(token => sendLineNotify(token, message));
  await Promise.allSettled(promises);
};
