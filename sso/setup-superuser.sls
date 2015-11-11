{% import 'sso/init.sls' as vars %}

#################################################################
# Create Django Superuser for admin using the 
# sso:su_user and sso:su_pass pillars passed in on the commandline
# 
# sudo salt-call --local state.sls setup-superuser pillar='{"sso": {"su_user": "vagrant", "su_pass": "vagrant", "group": "vagrant"}}'
#
#################################################################
create_superuser:
  cmd.run:
    - shell: /bin/bash
    - name: source {{ vars.home_dir }}/env_setup.sh && echo "from django.contrib.auth.models import User; User.objects.create_superuser('{{ salt['pillar.get']('sso:su_user', 'saltadmin') }}', '', '{{ salt['pillar.get']('sso:su_pass', 'saltadmin') }}')" | python3 manage.py shell
    - cwd: {{ vars.home_dir }}/www/sse
    - user: {{ vars.user }}
