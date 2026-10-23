# Changesets

Every pull request that changes a published package adds a changeset: `yarn changeset`, pick the
packages and the bump (patch, minor, major) and write one line for the changelog. The release
workflow turns the changesets into the "Version Packages" pull request; merging it publishes to npm.
