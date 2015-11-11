{% import 'sso/init.sls' as vars %}

include:
  {% if vars.is_prod_build  %}
  - sso.copy-web-dist
  {% else %}
  - sso.build-fe-app
  {% endif %}

copy django admin site static assets to dist folder:
  cmd.run:
    - shell: /bin/bash
    - name: source {{ vars.home_dir }}/env_setup.sh && python manage.py collectstatic --noinput
    - cwd: {{ vars.home_dir }}/www/sse
    - user: {{ vars.user }}
    - require:
      {% if vars.is_prod_build  %}
      - sls: sso.copy-web-dist
      {% else %}
      - sls: sso.build-fe-app
      {% endif %}

