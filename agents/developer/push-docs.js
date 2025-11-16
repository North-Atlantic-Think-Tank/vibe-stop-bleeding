import { execSync } from 'child_process';
import path from 'path';

/**
 * Developer Agent - Push Docs Task
 * Checks for JSON file changes in articles folder, switches to docs branch,
 * pushes to remote, and switches back to main branch
 */
async function pushDocsContent() {
  const articlesPath = path.join(process.cwd(), 'content/articles');

  console.log('🔍 Checking for JSON file changes in articles folder...\n');

  try {
    // Get current branch to return to
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim();

    console.log(`📌 Current branch: ${currentBranch}`);

    // // Check for JSON file changes in content/articles
    // let hasJsonChanges = false;
    // try {
    //   const status = execSync('git status --porcelain content/articles/*.json', {
    //     encoding: 'utf-8',
    //   }).trim();
    //   hasJsonChanges = status.length > 0;

    //   if (hasJsonChanges) {
    //     console.log('📝 Found JSON file changes:');
    //     console.log(status);
    //   }
    // } catch (e) {
    //   // No JSON files or no changes - check if any JSON exists
    //   const allStatus = execSync('git status --porcelain content/articles/', {
    //     encoding: 'utf-8',
    //   }).trim();

    //   const jsonChanges = allStatus
    //     .split('\n')
    //     .filter((line) => line.includes('.json'));
    //   hasJsonChanges = jsonChanges.length > 0;

    //   if (hasJsonChanges) {
    //     console.log('📝 Found JSON file changes:');
    //     jsonChanges.forEach((line) => console.log(line));
    //   }
    // }

    // if (!hasJsonChanges) {
    //   console.log('ℹ️  No JSON file changes detected in content/articles/');
    //   console.log('✅ Nothing to push to docs branch.');
    //   return;
    // }

    // // Stage JSON changes
    // console.log('\n📦 Staging JSON file changes...');
    // execSync('git add content/articles/*.json', { stdio: 'inherit' });

    // Commit changes on current branch first (if any)
    try {
      const stagedChanges = execSync('git diff --cached --name-only', {
        encoding: 'utf-8',
      }).trim();

      if (stagedChanges) {
        console.log('💾 Committing changes on current branch...');
        const timestamp = new Date().toISOString().split('T')[0];
        execSync(`git commit -m "Update article JSON files - ${timestamp}"`, {
          stdio: 'inherit',
        });
      }
    } catch (e) {
      console.log('ℹ️  No staged changes to commit.');
    }

    // Switch to docs branch
    console.log('\n🔄 Switching to docs branch...');
    try {
      execSync('git checkout docs', { stdio: 'inherit' });
    } catch (e) {
      console.log('📝 Creating docs branch...');
      execSync('git checkout -b docs', { stdio: 'inherit' });
    }

    // Merge changes from main/current branch
    console.log('\n🔀 Merging changes from main branch...');
    try {
      execSync(`git merge ${currentBranch} --no-edit`, { stdio: 'inherit' });
    } catch (e) {
      console.error('⚠️  Merge conflict detected. Please resolve manually.');
      execSync(`git checkout ${currentBranch}`, { stdio: 'inherit' });
      throw e;
    }

    // Push to remote
    console.log('\n🚀 Pushing docs branch to remote...');
    execSync('git push origin docs', { stdio: 'inherit' });

    console.log('\n✅ Successfully pushed to origin/docs!');

    // Switch back to original branch
    console.log(`\n🔄 Switching back to ${currentBranch} branch...`);
    execSync(`git checkout ${currentBranch}`, { stdio: 'inherit' });

    console.log('\n' + '='.repeat(50));
    console.log('✅ PUSH SUCCESS!');
    console.log('='.repeat(50));
    console.log(`📤 Docs branch pushed to remote successfully`);
    console.log(`📍 Now on branch: ${currentBranch}`);
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ Error during push operation:', error.message);

    // Try to recover to main branch
    try {
      console.log('🔄 Attempting to switch back to main branch...');
      execSync('git checkout main', { stdio: 'inherit' });
    } catch (e) {
      console.error('⚠️  Could not switch back to main branch automatically.');
    }

    process.exit(1);
  }
}

// CLI execution
pushDocsContent().catch(console.error);

export { pushDocsContent };
