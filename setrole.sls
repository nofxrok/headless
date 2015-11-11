{% if grains['qemu_kvm'] != True %}
set_roles_grain:
  module:
    - run
    - name: grains.setval
    - key: roles
    - val: vector
{% else %}
set_roles_grain:
  module:
    - run
    - name: grains.setval
    - key: roles
    - val: kvm_hypervisor
{% endif %}

