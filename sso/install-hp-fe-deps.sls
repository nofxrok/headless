{% import 'sso/init.sls' as vars %}

include:
  - sso.install-grunt-bower

install frontend deps:
  cmd.run:
    - shell: /bin/bash
    - name: npm install && bower install --allow-root
    - cwd: {{ vars.gui_dir_path }}
    - require:
      - sls: sso.install-grunt-bower

