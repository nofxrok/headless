include:
  - sso.pyopenssl-install

create cert for salt-api:
  module.run:
    - name: tls.create_self_signed_cert
    - tls_dir: salt_api
    - require:
      - sls: sso.pyopenssl-install

create cert for tornado:
  module.run:
    - name: tls.create_self_signed_cert
    - tls_dir: tornado
    - require:
      - sls: sso.pyopenssl-install

create cert for nginx:
  module.run:
    - name: tls.create_self_signed_cert
    - tls_dir: nginx
    - require:
      - sls: sso.pyopenssl-install

create cert for mysql:
  module.run:
    - name: tls.create_self_signed_cert
    - tls_dir: mysql
    - require:
      - sls: sso.pyopenssl-install

concatenate mysql certs into pem:
  cmd.run:
    - name: cat localhost.crt localhost.key > localhost.pem
    - cwd: /etc/pki/mysql/certs

