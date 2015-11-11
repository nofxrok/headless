run_load_generator:  
  cmd.script:
    - name: loadgenerator.sh
    - source: salt://loadgenerator/loadgenerator.sh
    - cwd: /var/tmp
