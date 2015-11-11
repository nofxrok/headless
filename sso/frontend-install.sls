{% import 'sso/init.sls' as vars %}

include:
  {% if not vars.is_prod_build %}
  - sso.gem-install
  - sso.install-grunt-bower
  - sso.install-hp-fe-deps
  - sso.chown-config-folder
  - sso.chown-code-folder
  - sso.build-fe-app
  - sso.migrate-seed-db
  {% endif %}
  - sso.copy-web-dist
  - sso.collect-django-static-assets
  - sso.nginx-setup

