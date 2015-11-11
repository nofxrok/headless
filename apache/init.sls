{% from "apache/map.jinja" import apache with context %}

apache:
  pkg.installed:
    - name: {{ apache.server }}
  service.running:
    - name: {{ apache.service }}
    - enable: True

<<<<<<< HEAD
# The following states are inert by default and can be used by other states to
# trigger a restart or reload as needed.
=======
>>>>>>> 38c404a66e6628dfa78c7427ff3ff324ac15afeb
apache-reload:
  module.wait:
    - name: service.reload
    - m_name: {{ apache.service }}

apache-restart:
  module.wait:
    - name: service.restart
    - m_name: {{ apache.service }}
