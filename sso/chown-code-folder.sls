{% import 'sso/init.sls' as vars %}

chown code directory:
  cmd.run:
    - shell: /bin/bash
    - name: chown -R {{ vars.user }} {{ vars.home_dir }}/www
  
