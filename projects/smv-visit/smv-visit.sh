export PORT=6004
export VCAP_SERVICES=$(node vcap-local.js)
export SMV_USERAUTH_BASE_URL=http://localhost:6002
export SMV_UI_APP_BASE_URL=http://localhost:3000
npm start
