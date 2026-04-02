echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node /Users/tuan/Desktop/Tuanco/MCP-server/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_state","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/MCP-server/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"wallet_list","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/mcp-test/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"network_status","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/MCP-server/dist/index.js

echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_order_by_id","arguments":{"orderId": "order1"}}}' | node /Users/tuan/Desktop/Tuanco/mcp-test/dist/index.js

echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node /Users/tuan/Desktop/Tuanco/mcp-server-tronlink/dist/index.js