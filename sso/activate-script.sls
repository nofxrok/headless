{% import 'sso/init.sls' as vars %}

# file to activate virtual env
{{ vars.home_dir }}/env_setup.sh:
  file.managed:
    - source: salt://sso/files/env_setup.sh
    - user: {{ vars.user }}
    - mode: 640
    - template: jinja
    - defaults:
      virtual_env: {{ vars.virtual_env }}
      home_dir: {{ vars.home_dir }}

