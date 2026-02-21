import { Share } from 'react-native';

/**
 * Share a streak achievement with engaging copy
 * @param count - The current streak count
 */
export const shareStreak = async (count: number): Promise<void> => {
  // Array of engaging messages - rotated based on streak count for variety
  const messages = [
    `🔥 I'm on a ${count}-day streak on Snapstreak! Can you beat me? Download now and challenge me!`,
    `📸 ${count} days and counting! My Snapstreak game is strong 🔥 Join the challenge!`,
    `🎯 Day ${count} of my photo streak! Building habits one snap at a time. Join me on Snapstreak!`,
    `⚡ ${count}-day streak unlocked! Consistency is key. Start your own streak on Snapstreak!`,
    `🌟 I've maintained a ${count}-day photo streak! What's your longest streak? Let's compete on Snapstreak!`,
  ];

  // Select message based on streak count for variety
  const message = messages[count % messages.length];

  try {
    await Share.share({
      message,
      title: 'My Snapstreak Achievement',
    });
  } catch (error) {
    console.error('Error sharing streak:', error);
  }
};

/**
 * Share a milestone achievement with custom message
 * @param milestone - The milestone number (e.g., 7, 30, 100)
 */
export const shareMilestone = async (milestone: number): Promise<void> => {
  const message = `🎉 MILESTONE ACHIEVED! 🎉\n\nI just hit a ${milestone}-day streak on Snapstreak!\n\nThis calls for celebration! Can you match my dedication? 🔥`;

  try {
    await Share.share({
      message,
      title: `${milestone}-Day Milestone!`,
    });
  } catch (error) {
    console.error('Error sharing milestone:', error);
  }
};

/**
 * Share a general result card
 * @param title - The title of the result
 * @param result - The result text to share
 */
/**
 * Share a snap with its caption
 * @param caption - The snap caption to share
 */
export const shareSnap = async (caption: string): Promise<void> => {
  try {
    await Share.share({
      message: `Check out my snap: "${caption}" - Snapstreak`,
      title: 'My Snap',
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};

/**
 * Share a general result card
 * @param title - The title of the result
 * @param result - The result text to share
 */
export const shareResult = async (title: string, result: string): Promise<void> => {
  const message = `${title}\n\n${result}\n\nShared from Snapstreak - Build your daily photo habit!`;

  try {
    await Share.share({
      message,
      title,
    });
  } catch (error) {
    console.error('Error sharing result:', error);
  }
};
