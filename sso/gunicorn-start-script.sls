{% import 'sso/init.sls' as vars %}

include:
  - sso.create-sock-folder

# file to start gunicorn
{{ vars.home_dir }}/gunicorn_start.sh:
  file.managed:
    - source: salt://sso/files/gunicorn_start
    - user: {{ vars.user }}
    - mode: 744
    - template: jinja
    - defaults:
      home_dir: {{ vars.home_dir }}
    - require:
      - sls: sso.create-sock-folder

