# Use this package to prep a master for managing vmware cloud

vmware_packages:
  pkg.installed:
    - name: python-pip

vmware_pip:
  pip.installed:
    - name: pyvmomi
  require:
    - pkg: vmware_packages
