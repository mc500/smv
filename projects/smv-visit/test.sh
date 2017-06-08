export PORT=6004
export VCAP_SERVICES=$(node vcap-local.js)
export SMV_USERAUTH_BASE_URL=http://localhost:6002
npm test