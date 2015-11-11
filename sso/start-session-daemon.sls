{% import 'sso/init.sls' as vars %}

include:
  - sso.session-start-script
  - sso.virtualenv-setup

# gunicorn daemon
/etc/init/sso_session.conf:
  file.managed:
    - source: salt://sso/files/sse_session_daemon
    - template: jinja
    - defaults:
        home_dir: {{ vars.home_dir }}
    - require:
      - sls: sso.session-start-script
      - sls: sso.virtualenv-setup

sso_session:
  service:
    - running
    - enable: True
    - watch:
      - file: /etc/init/sso_session.conf

