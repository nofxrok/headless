include:
  - jboss.jboss-user


/usr/local/share/jboss:
  file.directory:
    - user: appserver
    - group: appserver
    - makedirs: True

jboss-unpack:
  archive.extracted:
    - name: /usr/local/share/jboss
    - source: salt://jboss/files/jboss-as-web-7.0.2.Final.tar.gz
    - tar_options: v
    - archive_format: tar
    - if_missing: /usr/local/share/jboss/jboss-as-web-7.0.2.Final

/etc/init.d/jboss:
  file.managed:
    - source: salt://jboss/files/jboss.init
    - mode: 755

/usr/local/share/jboss/jboss-as-web-7.0.2.Final/domain/configuration/host.xml:
  file.managed:
    - template: jinja
    - source: salt://jboss/files/host.xml

#start-jboss:
#  cmd.run:
#    - name: /etc/init.d/jboss start

jbossas4:
  pkg.installed

