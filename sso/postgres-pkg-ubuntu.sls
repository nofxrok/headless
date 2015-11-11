# This state adds the Postgres project's official repos and installs PostgreSQL 9.4
# It also installs the Pg packages

/etc/apt/sources.list.d/pgdg.list:
  file.managed:
    - contents: deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main
    - user: root
    - group: root
    - mode: '644'

pgdg-key:
  cmd.run:
    - shell: /bin/bash
    - name: wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    - unless: apt-key list | grep -qi ACCC4CF8
    - require:
      - file: /etc/apt/sources.list.d/pgdg.list

postgresql-9.4:
  pkg.installed:
    - refresh: True

postgresql-server-dev-9.4:
  pkg.installed



