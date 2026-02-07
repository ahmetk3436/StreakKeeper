import { Share } from 'react-native';

export const shareStreak = async (streakCount: number) => {
  try {
    await Share.share({
      message: `I'm on a ${streakCount}-day streak on Snapstreak! Can you beat my streak?`,
      title: 'My Snapstreak',
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};

export const shareSnap = async (caption: string) => {
  try {
    await Share.share({
      message: `Check out my snap: "${caption}" - Snapstreak`,
      title: 'My Snap',
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};
