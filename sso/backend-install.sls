{% import 'sso/init.sls' as vars %}

include:
  - sso.pkgs-install
  - sso.database-install
  - sso.virtualenv-setup
  - sso.db-setup
  - sso.db-conf-file
  - sso.copy-api-code
  - sso.change-django-settings
  - sso.activate-script
  - sso.pyopenssl-install
  - sso.create-ssl-certs
  - sso.migrate-seed-db
  - sso.setup-gunicorn-daemon
  - sso.setup-session-daemon
  - sso.setup-superuser
  - sso.load_beacons
