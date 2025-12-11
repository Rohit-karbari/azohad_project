// Wrapper entrypoint for Docker image
// The TypeScript build emits files under dist/src; this file re-exports the compiled app.
module.exports = require('./src/index.js');
