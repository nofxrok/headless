{% import 'sso/init.sls' as vars %}

# file to start gunicorn
{{ vars.home_dir }}/session_start.sh:
  file.managed:
    - source: salt://sso/files/session_start
    - user: {{ vars.user }}
    - mode: 744
    - template: jinja
    - defaults:
      home_dir: {{ vars.home_dir }}

