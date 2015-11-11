{% import 'sso/init.sls' as vars %}

include:
  - sso.db-setup
  - sso.bounce-database-service
  - sso.activate-script

migrate db and seed db:
  cmd.run:
    - shell: /bin/bash
    - name: source {{ vars.home_dir }}/env_setup.sh && python manage.py migrate --noinput && python manage.py loaddata initial_fixture.json
    - cwd: {{ vars.home_dir }}/www/sse
    - user: {{ vars.user }}
    - require:
      - sls: sso.db-setup
      - sls: sso.bounce-database-service
      - sls: sso.activate-script

