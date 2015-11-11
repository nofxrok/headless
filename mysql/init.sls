mysql-server:
  pkg.installed:
    {% if grains['os_family'] == 'RedHat' %}
    - pkgs:
      - mysql-server
      - MySQL-python
    {% elif grains['os_family'] == 'Debian' %}
    - pkgs:
      - mysql-server
      - mysql-client
      - python-mysql.connector
      - python-mysqldb
    {% endif %}
  service.running:
    - require:
      - pkg: mysql-server 
    - names:
    {% if grains['os_family'] == 'RedHat' %}
      - mysqld
    {% elif grains['os_family'] == 'Debian' %}
      - mysql
    {% endif %}

