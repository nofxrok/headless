#############################################
# This sets your user that will be used from the pillar
# It defaults to root, to change from the cli:
# salt-call --local state.sls sso pillar='{"sso": {"user": "vagrant", "group": "vagrant"}}'
{% set user = salt['pillar.get']('sso:user', 'root') %}
{% set group = salt['pillar.get']('sso:group', 'root') %}
{% set dev = False %}
{% set ssl = True %}
{% set is_fe_build = False %}
{% set is_prod_build = True %}
#############################################
#############################################
# This sets your database user and password
# Please change these as per your requirement
{% set db_user = 'saltadmin' %}
{% set db_password = salt['pillar.get']('sso:db_password', 'saltadmin') %}
#############################################

#############################################
# set virtual env name
{% set virtual_env = 'sse_gui' %}
#############################################

{% if user == 'root' %}
{% set home_dir = '/opt/salt/sso' %}
{% else %}
{% set home_dir = '/home/{0}'.format(user) %}
{% endif %}

{% set gui_dir_path = '{0}/www/sse_fe'.format(home_dir) %}
{% set api_dir_path = '{0}/www/sse'.format(home_dir) %}
{% set django_settings_file = '{0}/sse/settings.py'.format(api_dir_path) %}
{% set dist_dir_path = '{0}/www/sse_fe/dist'.format(home_dir) %}

include:
  - sso.backend-install
  - sso.frontend-install
  - sso.cherrypy-install
  - sso.version-install
