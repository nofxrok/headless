

# Create mount points for iso's

#{% set mounts = pillar['mountpoints'] %}




{% for distro, info in salt['pillar.get']('distro', {}).iteritems() %}

{% for value in info  %}
  
{{ value }}:{{ info['mount']}}:
  file.directory:
    - makedirs: True

{{ value }}:{{ info['mount'] }}:
mount.mounted:
    - device: {{ value }}:{{ info['iso'] }}
    - fstype: iso9660
    - mkmnt: True
    - opts:
      - loop,ro

{% endfor %}

{% endfor %}



