{% import 'sso/init.sls' as vars %}

include:
  - sso.virtualenv-setup
  - sso.gunicorn-start-script

# gunicorn daemon
/etc/init/sso_gunicorn.conf:
  file.managed:
    - source: salt://sso/files/sse_gunicorn_daemon
    - template: jinja
    - defaults:
        home_dir: {{ vars.home_dir }}
        user: {{ vars.user }}
        group: {{ vars.group }}
        num_workers: 3
    - require:
      - sls: sso.gunicorn-start-script
      - sls: sso.virtualenv-setup

sso_gunicorn:
  service:
    - running
    - enable: True
    - watch:
      - file: /etc/init/sso_gunicorn.conf

