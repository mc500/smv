export PORT=3000
export SMV_BADGE_BASE_URL=http://localhost:6001
export SMV_USERAUTH_BASE_URL=http://localhost:6002
export SMV_USERINFO_BASE_URL=http://localhost:6003
export SMV_VISIT_BASE_URL=http://localhost:6004
export VCAP_SERVICES=$(node vcap-local.js)
npm start
