{% import 'sso/init.sls' as vars %}

include:
  - sso.install-grunt-bower
  - sso.install-hp-fe-deps
  - sso.check-jshint

build frontend artifacts for sso:
  cmd.run:
    - shell: /bin/bash
    - name: grunt build
    - cwd: {{ vars.gui_dir_path }}
    - user: {{ vars.user }}
    - require:
      - sls: sso.install-grunt-bower
      - sls: sso.install-hp-fe-deps
      - sls: sso.check-jshint

