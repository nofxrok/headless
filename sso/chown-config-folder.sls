{% import 'sso/init.sls' as vars %}

chown git config folder:
  cmd.run:
    - shell: /bin/bash
    - name: chown -R {{ vars.user }} {{ vars.home_dir }}/.config
    - onlyif: [ -d {{ vars.home_dir }}/.config ]

