{% import 'sso/init.sls' as vars %}

include:
  - sso.db-setup
  - sso.activate-script

load default-beacons:
  cmd.run:
    - shell: /bin/bash
    - name: source {{ vars.home_dir }}/env_setup.sh && python load_beacons.py
    - cwd: {{ vars.home_dir }}/www/sse
    - user: {{ vars.user }}
    - require:
      - sls: sso.db-setup
      - sls: sso.activate-script

