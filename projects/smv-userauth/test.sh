export PORT=6002
export VCAP_SERVICES=$(node vcap-local.js)
npm test
