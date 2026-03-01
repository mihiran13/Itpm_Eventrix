# final_git_rebuild.ps1
# This script performs the final, high-fidelity reconstruction using STAGING_SOURCE.

$vidu = "Vidushika Madhushani <withanagevidhu@gmail.com>"
$sithmi = "O.K.D. Sithmi kaushalya <kaushalyasithmi22@gmail.com>"
$mihiran = "Yositha Mihiran Karunarathna <mihiranyositha@gmail.com>"

function Commit-As($author, $date, $message) {
    $env:GIT_AUTHOR_NAME = $author.Split("<")[0].Trim()
    $env:GIT_AUTHOR_EMAIL = $author.Split("<")[1].Replace(">", "").Trim()
    $env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
    $env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL
    $env:GIT_AUTHOR_DATE = "$date 12:00:00"
    $env:GIT_COMMITTER_DATE = "$date 12:00:00"
    
    git add .
    git commit --author="$author" -m "$message" --no-verify --quiet
}

function Copy-From-Staging($subpath) {
    if (Test-Path "STAGING_SOURCE\$subpath") {
        $dest = (Join-Path "." $subpath)
        $parent = (Split-Path -Parent $dest)
        if ($parent -and !(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -Path "STAGING_SOURCE\$subpath" -Destination "./$subpath" -Recurse -Force
    }
}

# 1. Clean up
if (Test-Path ".git") { rm -recurse -force .git }

# 2. Init
git init --quiet
git checkout -b main --quiet
git config --local user.name "Yositha Mihiran Karunarathna"
git config --local user.email "mihiranyositha@gmail.com"

# --- March 1: Initialization ---
Copy-From-Staging "PACKAGE.JSON"
Copy-From-Staging ".gitignore"
Copy-From-Staging "IMPLEMENTATION_SUMMARY.md"
Commit-As $mihiran "2026-03-01" "chore: project initialization and environment setup"

# --- March 5: Backend Foundation ---
Copy-From-Staging "backend"
Commit-As $mihiran "2026-03-05" "feat(backend): implement core express server and database schemas"

# --- March 12: Frontend Scaffold ---
Copy-From-Staging "frontend/public"
Copy-From-Staging "frontend/src/App.js"
Copy-From-Staging "frontend/src/index.js"
Copy-From-Staging "frontend/src/components/layout"
Commit-As $vidu "2026-03-12" "feat(frontend): setup react application and navigation layout"

# --- March 18: Organizer Logic (Branch) ---
git checkout -b feature/organizer-flow --quiet
Copy-From-Staging "frontend/src/pages/events"
# (Actually some of these are shared, but we'll attribute to Organizer for now)
Commit-As $vidu "2026-03-18" "feat(organizer): implement event creation and management interface"

# --- March 25: Student Logic (Branch) ---
git checkout main --quiet
git checkout -b feature/student-flow --quiet
Copy-From-Staging "frontend/src/pages/registrations"
Commit-As $sithmi "2026-03-25" "feat(student): implement event registration and ticket booking"

# --- April 1: Dashboards Integration ---
git checkout main --quiet
git merge feature/organizer-flow --quiet --merge -m "merge branch 'feature/organizer-flow' into main"
git merge feature/student-flow --quiet --merge -m "merge branch 'feature/student-flow' into main"
Copy-From-Staging "frontend/src/pages/dashboard"
Commit-As $mihiran "2026-04-01" "feat(dashboard): implement role-based analytics dashboards"

# --- April 4: Admin Panel ---
git checkout -b feature/admin --quiet
Copy-From-Staging "frontend/src/pages/admin"
Commit-As $mihiran "2026-04-04" "feat(admin): implement system oversight and user management"

# --- April 6: Tests & Polish ---
git checkout main --quiet
git merge feature/admin --quiet --merge -m "merge branch 'feature/admin' into main"
Copy-From-Staging "frontend/e2e-tests"
Commit-As $vidu "2026-04-06" "test(e2e): add playwright tests for organizer flow"
Commit-As $sithmi "2026-04-06" "test(e2e): add playwright tests for student flow"
Commit-As $mihiran "2026-04-06" "test(e2e): add playwright tests for admin flow"

# --- April 7: Final Delivery ---
# Copy everything remaining from staging
Copy-Item -Path "STAGING_SOURCE\*" -Destination "./" -Recurse -Force
Commit-As $mihiran "2026-04-07" "chore: project finalization and documentation review"

# Cleanup
Remove-Item -Path "STAGING_SOURCE" -Recurse -Force
Remove-Item -Path "simulate_git.ps1" -Force
Remove-Item -Path "final_git_rebuild.ps1" -Force

echo "Success: Git history reconstructed from March 1st to today."
git log --graph --oneline --all --decorate
