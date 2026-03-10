import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Create Account (Strict unique check to prevent repeating usernames)
export const createAccount = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Search for any existing user with this exact username
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    if (existing) {
      // This error will be sent back to your script.js handleAuth function
      throw new Error("That name is already taken! Choose a different legend.");
    }

    await ctx.db.insert("users", { 
      username: args.username, 
      password: args.password,
      created: Date.now() 
    });
    return { success: true };
  },
});

// 2. Check Login
export const checkLogin = query({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("username"), args.username),
          q.eq(q.field("password"), args.password)
        )
      )
      .first();
    return user ? { username: user.username } : null;
  },
});

// 3. Add Score
export const addScore = mutation({
  args: { name: v.string(), score: v.number(), level: v.number(), time: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("scores", {
      name: args.name,
      score: args.score,
      level: args.level,
      time: args.time,
      date: Date.now(),
    });
  },
});

// 4. Get Leaderboard (Everyone included, default to 0 if no score exists)
export const getTopScores = query({
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const allScores = await ctx.db.query("scores").collect();

    const leaderboard = allUsers.map((user) => {
      // Find all scores for this specific user (Trimmed to prevent mismatch)
      const userScores = allScores.filter((s) => s.name.trim() === user.username.trim());
      
      if (userScores.length > 0) {
        // Return their highest score entry
        return userScores.sort((a, b) => b.score - a.score)[0];
      } else {
        // Create a default entry for users who haven't played yet
        return {
          name: user.username,
          score: 0,
          level: 0,
          time: 0,
          date: user.created || Date.now(),
        };
      }
    });

    // Sort by score (highest first)
    return leaderboard.sort((a, b) => b.score - a.score);
  },
});

// 5. Get Online Count
export const getOnlineCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});