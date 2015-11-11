pyopenssl:
  pip.installed:
    - name: PyOpenSSL
    - exists_action: i
    - reload_modules: True
