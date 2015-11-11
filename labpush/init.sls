# This lab will work to push files to salted lab boxes:

pushapache:
  file.recurse:
    - source: salt://apache/
    - name: /srv/salt/apache/

