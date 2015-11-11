/etc/postgresql/9.4/main/pg_hba.conf:
  file.managed:
    - source: salt://sso/files/pg_hba.conf
    - user: root
    - group: root
    - mode: 644

/etc/postgresql/9.4/main/postgresql.conf:
  file.managed:
    - source: salt://sso/files/postgresql.conf
    - user: root
    - group: root
    - mode: 644

postgresql:
  service:
    - running
    - enable: True
    - reload: True
    - watch:
      - file: /etc/postgresql/9.4/main/pg_hba.conf
      - file: /etc/postgresql/9.4/main/postgresql.conf

