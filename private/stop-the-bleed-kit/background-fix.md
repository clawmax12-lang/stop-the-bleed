# The Background Check Fix

Open your HEARTBEAT.md file in your OpenClaw workspace.

Find this line (or similar):
  Runs every 15 minutes

Change it to:
  Runs every 2 hours

Then find your AGENTS.md and look for the heartbeat model setting.
Change whatever model is set there to: claude-haiku-4-5-20251001

Save both files. That's it. Your agent will pick up the change on the next check.

Most people see 40–60% of their idle spend disappear from this alone.
