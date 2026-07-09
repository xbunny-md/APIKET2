import { Statistic } from '../models/index.js';

export const incrementStat = async (key: string, amount: number = 1) => {
  try {
    await Statistic.findOneAndUpdate(
      { key },
      { $inc: { value: amount }, lastUpdated: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error(`Failed to increment stat ${key}`, err);
  }
};
