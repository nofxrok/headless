#
# CWT Demo Top File
# Author: Nathan Brooks (nbrooks@saltstack.com)
#
# This file wil be referenced when a state.highstate is initiated from the master
# This file should be placed in the root of /srv/salt on the master.
# It references a file structure where as the state of module exsists at /srv/salt/apache/

base:
  '*':
    - tools
  'opglpa*':
    - opg-lpa
    - jenkins-user
  'test*':
    - apache
    - apache.config
    - java 
    - jenkins
    - logrotate
    - logrotate.config
    - jboss
  'cwtjboss*':
    - jboss
