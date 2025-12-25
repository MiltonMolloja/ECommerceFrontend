#!/bin/sh
set -e

# Script para inyectar variables de entorno en runtime
# Esto permite configurar la app sin rebuild

# Crear archivo de configuración con variables de entorno
cat > /usr/share/nginx/html/assets/env.js << EOF
(function(window) {
  window.__env = window.__env || {};
  window.__env.apiGatewayUrl = '${API_GATEWAY_URL:-http://localhost:45000}';
  window.__env.identityUrl = '${IDENTITY_URL:-http://localhost:45001}';
  window.__env.loginServiceUrl = '${LOGIN_SERVICE_URL:-https://localhost:4400}';
  window.__env.mercadoPagoPublicKey = '${MERCADOPAGO_PUBLIC_KEY:-}';
  window.__env.sentryDsn = '${SENTRY_DSN:-}';
  window.__env.production = ${PRODUCTION:-true};
  window.__env.devMode = '${DEV_MODE:-false}';
})(this);
EOF

# Inyectar el script en index.html si no existe (con ruta absoluta)
if ! grep -q "/assets/env.js" /usr/share/nginx/html/index.html; then
  sed -i 's|<head>|<head>\n  <script src="/assets/env.js"></script>|' /usr/share/nginx/html/index.html
  echo "✅ env.js script injected into index.html"
fi

echo "Environment configuration injected:"
echo "  API_GATEWAY_URL: ${API_GATEWAY_URL:-http://localhost:45000}"
echo "  IDENTITY_URL: ${IDENTITY_URL:-http://localhost:45001}"
echo "  LOGIN_SERVICE_URL: ${LOGIN_SERVICE_URL:-https://localhost:4400}"
echo "  DEV_MODE: ${DEV_MODE:-false}"

# Ejecutar comando pasado (nginx)
exec "$@"
