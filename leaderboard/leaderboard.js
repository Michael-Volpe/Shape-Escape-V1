// Connect to your specific Convex project using the global window object
const client = new window.convex.ConvexClient("https://famous-skunk-169.convex.cloud");

async function displayLeaderboard() {
    const leaderboardBody = document.getElementById("leaderboardBody");
    
    // Get the logged-in username to highlight your own row
    const myName = localStorage.getItem("gameUsername");
    
    try {
        // Clear "Loading..." state immediately
        leaderboardBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Fetching Hall of Fame...</td></tr>`;

        // Fetch the list (This now includes all users even with 0 scores per your backend)
        const scores = await client.query("functions:getTopScores");
        
        // Debugging: Open F12 console to see if Michael and Test are in this array
        console.log("Leaderboard Data Received:", scores);

        leaderboardBody.innerHTML = "";

        if (!scores || scores.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No accounts found in database.</td></tr>`;
            return;
        }

        // Map every account into the table
        leaderboardBody.innerHTML = scores.map((entry, index) => {
            // Logic to check if this is the logged-in user
            const isMe = myName && entry.name === myName;
            
            // Visual feedback for the player's own row
            const rowStyle = isMe ? 'background: rgba(255, 68, 68, 0.2); border-left: 4px solid #ff4444;' : '';
            const nameStyle = isMe ? 'color: #ff4444; font-weight: 900;' : 'color: #ffffff; font-weight: bold;';

            // Ensure we handle missing levels or times for new accounts
            const displayLevel = entry.level !== undefined ? entry.level : 0;
            const displayTime = entry.time !== undefined ? entry.time : 0;

            return `
                <tr style="${rowStyle}">
                    <td>${(index + 1 === 1 && entry.score > 0) ? '👑' : '#' + (index + 1)}</td>
                    <td style="${nameStyle}">${entry.name}</td>
                    <td style="color: #ffeb3b; font-weight: bold;">${entry.score}</td>
                    <td>${displayLevel}</td>
                    <td>${displayTime}s</td>
                    <td style="font-size: 10px; color: #888;">${new Date(entry.date).toLocaleDateString()}</td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Leaderboard Error:", err);
        leaderboardBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red; padding: 20px;">Connection Error: ${err.message}</td></tr>`;
    }
}

// Initial call
displayLeaderboard();