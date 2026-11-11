# Koinoda MCP server

[Koinoda](https://koinoda.com) is a free carpool app for families and youth sports teams. Its remote **Model Context Protocol (MCP)** server lets a parent's AI assistant read the carpool week and act for them: see who's driving, claim a ride, mark a kid out, send "on my way", and post in the carpool chat.

| | |
|---|---|
| **Server URL** | `https://koinoda.com/mcp` |
| **Transport** | Streamable HTTP (stateless, JSON responses) |
| **Auth** | OAuth 2.1: authorization code + PKCE (S256), dynamic client registration |
| **Server card** | [`/.well-known/mcp/server-card.json`](https://koinoda.com/.well-known/mcp/server-card.json) |
| **Registry name** | `com.koinoda/carpool` ([server.json](server.json)) |

This repository holds documentation and examples. The server itself runs at koinoda.com; there is nothing to install or host.

## Connect your assistant

| Assistant | How |
|---|---|
| **Claude** (claude.ai, Desktop, mobile) | Settings → Connectors → Add custom connector → `https://koinoda.com/mcp` |
| **ChatGPT** | Settings → Apps & Connectors → Advanced → Developer mode, then create a connector with `https://koinoda.com/mcp` |
| **Claude Code** | `claude mcp add --transport http koinoda https://koinoda.com/mcp` |
| **VS Code / GitHub Copilot** | Add [examples/vscode-mcp.json](examples/vscode-mcp.json) to `.vscode/mcp.json` |
| **Cursor** | Add [examples/cursor-mcp.json](examples/cursor-mcp.json) to `~/.cursor/mcp.json` |
| **Clients without remote MCP** | Bridge with `mcp-remote`: [examples/claude-desktop-mcp-remote.json](examples/claude-desktop-mcp-remote.json) |
| **Grok** | Ask Grok to add a connection to `https://koinoda.com/mcp` |

The assistant opens Koinoda's sign-in (an email link or code, no password), then a consent screen where the parent picks the permissions. Parents can disconnect an assistant at any time in **Profile → Connected apps**.

## Permissions

| Scope | Tools |
|---|---|
| `schedule` (always) | `list_carpools`, `get_week`, `my_upcoming_rides`, `get_drive_plan` |
| `rides` | `set_kid_going`, `claim_ride`, `give_back_ride`, `take_over_ride`, `on_my_way`, `here_at_stop`, `finish_ride`, `mark_rides_complete`, `undo_ride_step` |
| `chat` | `read_chat`, `post_chat`, `react_to_message` |
| `settings` | `get_communication_preferences`, `set_communication_preference` |

Tools follow the same rules as the app: only a kid's own parent can mark them going, not going or one way only, and only the driver can send "on my way" or "here". Ride and chat tools alert other parents, so they're marked `readOnlyHint: false` and assistants ask before running them.

## Example prompts

See [examples/prompts.md](examples/prompts.md) for more, with the tool calls each one makes.

- "What does the carpool look like this week?"
- "Which rides am I driving, and when do I need to leave Thursday?"
- "Mia is sick Wednesday, she's not going."
- "Theo has a ride home from Grandma on Friday."
- "I'll take the pick-up on Thursday."
- "Tell the carpool I'm running five minutes late."

## Typical flow

```text
list_carpools                         → carpool_id
get_week { carpool_id }               → events with event_id, drivers, open rides, riders (kid_id)
claim_ride { event_id, slot: "pick_up" }
get_drive_plan { event_id, slot: "pick_up" } → leave time, pickup order, addresses
on_my_way { event_id, slot: "pick_up" }
here_at_stop { event_id, slot: "pick_up", kid_id }
finish_ride { event_id, slot: "pick_up" }
```

`slot` is `drop_off` (to practice) or `pick_up` (home); `claim_ride` and `give_back_ride` also accept `both`. `set_kid_going` takes `ride: both | there_only | home_only | not_going`.

## Use it from code

[examples/typescript](examples/typescript) connects with the official TypeScript SDK and lists your carpools. It needs an access token; the quickest way to get one is the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which runs the OAuth flow for you.

## Endpoints

| Path | What |
|---|---|
| `/mcp` | The MCP server. `401` with `WWW-Authenticate: Bearer resource_metadata=…` without a valid token |
| `/.well-known/oauth-protected-resource/mcp` | RFC 9728 protected resource metadata |
| `/.well-known/oauth-authorization-server` | RFC 8414 authorization server metadata |
| `/oauth/register` | RFC 7591 dynamic client registration |
| `/oauth/authorize`, `/oauth/token`, `/oauth/revoke` | OAuth 2.1 |
| `/.well-known/mcp/server-card.json` | MCP server card |

Access tokens last 1 hour, refresh tokens 60 days (rotated on use).

## Links

- [Koinoda](https://koinoda.com) · [AI carpool assistant](https://koinoda.com/ai-carpool-assistant) · [Help: AI assistants](https://koinoda.com/help/assistants)
- [Privacy](https://koinoda.com/privacy) · [Terms](https://koinoda.com/terms)

Examples in this repository are MIT licensed.
