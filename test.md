echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_state","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/MCP-server/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"wallet_list","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/mcp-test/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"network_status","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/MCP-server/dist/index.js

echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"ts_get_internal_account_info","arguments":{}}}' | API_KEY=bad61dcc-5470-4f16-b3d3-adde9e420e19 node /Users/tuan/Desktop/Tuanco/mcp-test/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"ts_get_internal_account_info","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/mcp-test/dist/index.js

echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node /Users/tuan/Desktop/Tuanco/mcp-server-tronlink/dist/index.js