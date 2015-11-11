# Install basic PHP for lamp stack

install_php:
  pkg.installed:
    - name: php3
 

install_apachephp:
  pkg.installed:
    - name: libapache
    - refresh: True
  require:
    - pkg: php3

libapache2-mod-php5:
  pkg:
    - installed
