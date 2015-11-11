{% import 'sso/init.sls' as vars %}

# This installs all the prerequisite packages using apt
prereq-packages:
  pkg.installed:
    - pkgs:
      - git
      - build-essential
      - python-dev
      - python3
      - python3.4-dev
      - python-pip
      - software-properties-common
      - nginx
      - libssl-dev
      - libffi-dev
      - openssl
    - order: 1
    - failhard: True
