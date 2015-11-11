{% import 'sso/init.sls' as vars %}

/opt/salt/sso:
  file.directory:
    - user: {{ vars.user }}
    - group: {{ vars.group }}
    - makedirs: True
    - dir_mode: 755

