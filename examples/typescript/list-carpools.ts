// Connect to Koinoda's MCP server with the official TypeScript SDK, list the
// tools this token may use, then list your carpools and this week's rides.
//
//   KOINODA_TOKEN=<access token> npm start
//
// Get a token by connecting the MCP Inspector (npx @modelcontextprotocol/inspector)
// to https://koinoda.com/mcp: it registers a client, opens Koinoda's sign-in and
// shows the access token. Tokens last an hour.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const token = process.env.KOINODA_TOKEN;
if (!token) throw new Error("Set KOINODA_TOKEN to an access token for https://koinoda.com/mcp");

const transport = new StreamableHTTPClientTransport(new URL("https://koinoda.com/mcp"), {
  requestInit: { headers: { Authorization: `Bearer ${token}` } },
});
const client = new Client({ name: "koinoda-example", version: "1.0.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log("Tools:", tools.map((t) => t.name).join(", "));

const text = (r: Awaited<ReturnType<typeof client.callTool>>) =>
  (r.content as { type: string; text?: string }[]).map((c) => c.text ?? "").join("\n");

const carpools: { carpool_id: string; name: string }[] = JSON.parse(
  text(await client.callTool({ name: "list_carpools", arguments: {} })),
);
console.log("Carpools:", carpools.map((c) => c.name).join(", ") || "none");

if (carpools[0]) {
  const week = await client.callTool({ name: "get_week", arguments: { carpool_id: carpools[0].carpool_id } });
  console.log(text(week));
}

await client.close();
