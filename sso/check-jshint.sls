{% import 'sso/init.sls' as vars %}

include:
  - sso.install-grunt-bower
  - sso.install-hp-fe-deps

check jshint to make sure build will pass:
  cmd.run:
    - shell: /bin/bash
    - name: grunt jshint
    - cwd: {{ vars.gui_dir_path }}
    - require:
      - sls: sso.install-grunt-bower
      - sls: sso.install-hp-fe-deps

