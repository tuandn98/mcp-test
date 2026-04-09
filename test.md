echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_state","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/MCP-server/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"wallet_list","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/mcp-test/dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"network_status","arguments":{}}}' | node /Users/tuan/Desktop/Tuanco/MCP-server/dist/index.js

echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"tronsave.internal.account.get","arguments":{}}}' | TRONSAVE_API_KEY=bad61dcc-5470-4f16-b3d3-adde9e420e19 node dist/index.js
<!-- internal.order.history -->
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"tronsave_internal_order_history","arguments":{}}}' | TRONSAVE_API_KEY=bad61dcc-5470-4f16-b3d3-adde9e420e19 node dist/index.js
<!-- internal.order.details -->
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"tronsave_internal_order_details","arguments":{"orderId":"687f0527065bf9930c6b1422"}}}' | TRONSAVE_API_KEY=808b4d99-8fa0-43b6-a8e8-2a143936d297 node dist/index.js
<!-- get deposit address -->
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"tronsave_get_deposit_address","arguments":{"amountTrx":10}}}' | TRONSAVE_API_KEY=808b4d99-8fa0-43b6-a8e8-2a143936d297 node dist/index.js
<!-- internal_order_book -->
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"tronsave_internal_order_book","arguments":{"resourceType":"ENERGY"}}}' | TRONSAVE_API_KEY=bad61dcc-5470-4f16-b3d3-adde9e420e19 node dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"tronsave.internal.account.get","arguments":{}}}' | node dist/index.js

echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node /Users/tuan/Desktop/Tuanco/mcp-server-tronlink/dist/index.js
