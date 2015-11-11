#############################################
# This sets your user that will be used below
# Please change line below
# to your linux user name
{% set user = 'salt' %}
#############################################

{% set home_dir = '/home/{0}'.format(user) %}

# PEP8 command will execute successfully if there are no warnings
execute-pep8:
  cmd.run:
    - shell: /bin/bash
    - name: pep8 --config={{ home_dir }}/www/sse/pep8.config {{ home_dir }}/www/sse/

