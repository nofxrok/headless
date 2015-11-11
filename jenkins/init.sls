jenkins:
  pkgrepo.managed:
    - humanname: Jenkins Debian
    - name: deb http://pkg.jenkins-ci.org/debian binary/
    - key_url: http://pkg.jenkins-ci.org/debian/jenkins-ci.org.key  
  pkg.latest:
    - refresh: True
    - require:
      - pkgrepo: jenkins
  service.running:
    - enable: True
    - watch:
      - pkg: jenkins
      - file: jenkins_portchange
     
#/usr/bin/jenkins-cli.jar:
#  file.managed:
#    - source: salt://files/bin/jenkins-cli.jar
#    - refresh: True
#    - mode: 755
#    - require:
#      - pkgrepo: jenkins
#      - pkg: jenkins

jenkins_portchange:
  file.managed:
    - name: /etc/init.d/jenkins
    - source: salt://jenkins/files/jenkins.init
    - refresh: True
    - require:
      - pkg: jenkins

jenkins_config:
  file.managed:
    - name: /etc/default/jenkins
    - source: salt://jenkins/files/jenkins.conf
    - refresh: True
    - require:
      - pkg: jenkins

jenkins-restart:
  module:
    - wait
    - name: service.restart
    - m_name: jenkins
    - require:
      - pkg: jenkins

#/etc/sudoers:
#  file.managed:
#    - source: salt://files/jenkins/sudoers
    



