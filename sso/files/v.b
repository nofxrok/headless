<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<html>
 <head>
  <title>Version</title>
 </head>
 <body>
  <h1>Install Version Information</h1>
  <hr align=left width=420>
  <pre>
        Release: sso-v1.0.1
  </pre>
  <hr align=left width=420>
  <pre>
{{ salt['test.versions_report']() }}
  </pre>
  <hr align=left width=420>
  <pre>
             Nginx: {{ salt['pkg.version']('nginx') }}
        PostgreSQL: {{ salt['pkg.version']('postgresql-9.4') }}
 PostgreSQL Server: {{ salt['pkg.version']('postgresql-server-dev-9.4') }}
  </pre>
  <hr align=left width=420>
  <pre>
     OS Release: {{ salt['grains.get']('lsb_distrib_description') }}
         Kernel: {{ salt['grains.get']('kernel') }} {{ salt['grains.get']('kernelrelease') }}
            CPU: {{ salt['grains.get']('cpu_model') }}, {{ salt['grains.get']('cpuarch') }}, {{ salt['grains.get']('num_cpus') }} CPUs
         Memory: {{ salt['grains.get']('mem_total') }} MB
  </pre>
  <hr align=left width=420>
 </body>
</html>
