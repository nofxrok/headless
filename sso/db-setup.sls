{% import 'sso/init.sls' as vars %}

######################################################
# setup the database
# DBNAME: saltdb
# DBUSER: variable set above
# DBPASS: variable set above
# 
######################################################       
create-salt-db:
  postgres_user.present:
    - name: {{ vars.db_user }}
    - password: {{ vars.db_password }}
  postgres_database.present:
    - name: saltdb
    - owner: {{ vars.db_user }}

