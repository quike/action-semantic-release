import * as core from "@actions/core";

export const verifyRelease = async (_, context) => {
  const parsedRelease = JSON.stringify(context.nextRelease);
  const nextRelease = JSON.parse(parsedRelease);

  core.info(`Release ${nextRelease.type} with Version ${nextRelease.version}`);

  const { version, notes, type, channel, gitHead, gitTag, name } = nextRelease;
  const [major, minor, patch] = version.split(".");
  core.exportVariable("NEW_RELEASE_PUBLISHED", "true");
  core.exportVariable("RELEASE_VERSION", version);
  core.exportVariable("RELEASE_MAJOR", major);
  core.exportVariable("RELEASE_MINOR", minor);
  core.exportVariable("RELEASE_PATCH", patch);
  core.exportVariable("RELEASE_NOTES", notes);
  core.exportVariable("RELEASE_TYPE", type);
  core.exportVariable("RELEASE_CHANNEL", channel);
  core.exportVariable("RELEASE_GIT_HEAD", gitHead);
  core.exportVariable("RELEASE_GIT_TAG", gitTag);
  core.exportVariable("RELEASE_NAME", name);
  core.setOutput("new-release-published", "true");
  core.setOutput("release-version", version);
  core.setOutput("release-major", major);
  core.setOutput("release-minor", minor);
  core.setOutput("release-patch", patch);
  core.setOutput("release-notes", notes);
  core.setOutput("type", type);
  core.setOutput("channel", channel);
  core.setOutput("git-head", gitHead);
  core.setOutput("git-tag", gitTag);
  core.setOutput("name", name);
};
