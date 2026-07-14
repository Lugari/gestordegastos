#!/usr/bin/env bash
# Conmuta el backend activo de la app: sandbox (dev) o producción.
# Uso: ./scripts/backend.sh dev|prod|status
set -e
cd "$(dirname "$0")/.."
case "${1:-status}" in
  dev)  cp amplify_outputs.sandbox.json amplify_outputs.json; echo "backend activo: SANDBOX (dev)";;
  prod) cp amplify_outputs.prod.json amplify_outputs.json; echo "backend activo: PRODUCCIÓN";;
  status)
    ACTIVE=$(node -e "console.log(require('./amplify_outputs.json').auth.user_pool_id)")
    PROD=$(node -e "console.log(require('./amplify_outputs.prod.json').auth.user_pool_id)" 2>/dev/null || echo '?')
    [ "$ACTIVE" = "$PROD" ] && echo "backend activo: PRODUCCIÓN ($ACTIVE)" || echo "backend activo: SANDBOX ($ACTIVE)";;
  *) echo "uso: $0 dev|prod|status"; exit 1;;
esac
