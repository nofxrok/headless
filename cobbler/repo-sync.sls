

# Write a state to only run the reposync command if the cobbler check returns true


sync_repos:
  cmd.run:
      - cobbler reposync    # This will sync any added repo's
      - cobbler hardlink    # This will save space  by eliminating duplicate trees

       #- onlyif:

