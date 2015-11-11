{% if grains['os_family'] == 'RedHat' %}

wordpress-packages:
  pkg.latest:
    - pkgs:
      - php-mysql
      - MySQL-python
    - require:
      - pkg: mysql-packages

wordpress-database:
  mysql_database.present:
    - name: {{ pillar['wordpress']['wp-database'] }}
    - require:
      - service: mysqld
      - pkg: wordpress-packages
  mysql_user.present:
    - name: {{ pillar['wordpress']['wp-username'] }}
    - host: localhost
    - password: {{ pillar['wordpress']['wp-passwords']['wordpress'] }}
    - require:
      - service: mysqld
      - pkg: wordpress-packages
  mysql_grants.present:
    - database: {{ pillar['wordpress']['wp-database'] }}.*
    - grant: all privileges
    - user: {{ pillar['wordpress']['wp-username'] }}
    - host: localhost
    - require:
      - mysql_database: {{ pillar['wordpress']['wp-database'] }}
      - mysql_user: {{ pillar['wordpress']['wp-username'] }}

get-wordpress:
  cmd.run:
    - name: 'curl -O http://wordpress.org/latest.tar.gz && tar xvzf latest.tar.gz && /bin/rm latest.tar.gz'
    - cwd: /var/www/html/
    - unless: test -d /var/www/html/wordpress
    - require:
      - pkg: httpd-packages
    - require_in:
      - file: /var/www/html/wordpress/wp-config.php
  
wordpress-keys-file:
  cmd.run:
    - name: /usr/bin/curl -s -o /var/www/html/wordpress/wp-keys.php https://api.wordpress.org/secret-key/1.1/salt/ && /bin/sed -i "1i\\<?php" /var/www/html/wordpress/wp-keys.php && chown -R apache:apache /var/www/html/wordpress
    - unless: test -e /var/www/html/wordpress/wp-keys.php
    - require_in:
      - file: /var/www/html/wordpress/wp-config.php
  
wordpress-config:
  file.managed:
    - name: /var/www/html/wordpress/wp-config.php
    - source: salt://mysql/files/wp-config.php
    - mode: 0644
    - user: apache
    - group: apache
    - template: jinja
    - context:
      username: {{ pillar['wordpress']['wp-username'] }}
      database: {{ pillar['wordpress']['wp-database'] }}
      password: {{ pillar['wordpress']['wp-passwords']['wordpress'] }}
    - require:
      - cmd: get-wordpress

{% endif %}
