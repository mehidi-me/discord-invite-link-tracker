const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

const InvitesTracker = require("@androz2091/discord-invites-tracker");
const tracker = InvitesTracker.init(client, {
  fetchGuilds: true,
  fetchVanity: true,
  fetchAuditLogs: true,
});

require("dotenv").config();

async function verifyInviteCode(inviteCode) {
  const url = `${process.env.CHECK_URL}${inviteCode}`; // Replace with your API endpoint

  try {
    const response = await fetch(url);
    const data = await response.json();
    //console.log(response);
    return data.valid;
  } catch (error) {
    console.error("Error verifying invite code:", error);
    return false;
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

tracker.on("guildMemberAdd", async (member, type, invite) => {
  // const welcomeChannel = member.guild.channels.cache.find((ch) => ch.name === 'welcome');
  console.log("invite :", invite);
  const usedInvite = invite;
  if (usedInvite && usedInvite.code) {
    console.log(`${member.user.tag} joined using invite: ${usedInvite.code}`);
    // Update the database or perform actions for the user who joined
    try {
      const isValidUser = await verifyInviteCode(usedInvite.code);

      if (isValidUser) {
        // Find the role by ID
        const role = member.guild.roles.cache.get(process.env.ROLE_ID);

        // Ensure the role exists before trying to assign it
        if (role) {
          await member.roles.add(role); // Add the role to the member
          console.log(`Assigned role ${role.name} to ${member.user.tag}`);
        } else {
          console.log("Role not found!");
        }
      }
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  }

  if (type === "normal") {
    console.log(
      `Welcome ${member}! You were invited by ${invite.inviter.username}!`
    );
  } else if (type === "vanity") {
    console.log(`Welcome ${member}! You joined using a custom invite!`);
  } else if (type === "permissions") {
    console.log(
      `Welcome ${member}! I can't figure out how you joined because I don't have the "Manage Server" permission!`
    );
  } else if (type === "unknown") {
    console.log(
      `Welcome ${member}! I can't figure out how you joined the server...`
    );
  }
});

client.login(process.env.BOT_TOKEN);
