# Approved Premises

Apply for and manage approved premises

## Prerequisites

- Docker
- NodeJS

## Setup

When running the application for the first time, run the following command:

```bash
script/setup
```

This will tear down and setup the application, create .env files and bootstrap the application.

If you're coming back to the application after a certain amount of time, you can run:

```bash
script/bootstrap
```

## Running the application

To run the application there are two options.

### 1. Using AP Tools

In order to spin up a full stack of a working API and other [dependant
services](./docker-compose.yml) we recommend using the [AP
tahb marked this conversation as resolved.
Tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools).

NB. The approach AP Tools takes solves a critical limitation for working in
development. Due to how the frontend and API authenticate requests they both
require access to _the same_ instance of hmpps-auth. This project is the focus
of our development tooling across all CAS services and is most likely to receive
future updates.

After following the set up the common commands are:

```bash
ap-tools server start --local-ui --local-api
```

```bash
ap-tools server stop
```

The service should then be available at <http://localhost:3000>

[Log in credentials are documented within AP
tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools#start-server).

### 2. Manually

tahb marked this conversation as resolved.
This option has the benefit of a quicker initial startup and enables us to
develop features that aren't yet supported by the API through the use of
Wiremock.

To run the server against a fake API go to the root directory and run:

### End to end tests

As well as unit and integration tests, there are also a [smaller suite of
end-to-end tests](https://github.com/ministryofjustice/hmpps-approved-premises-ui/tree/main/e2e/tests)
that run in [Circle CI](https://circleci.com/) post-deploy to the `dev`
environment.

If you want to run these tests against a local version of the full stack, then
you can run the End to End tests against Docker containers running the full stack with:

```bash
script/local_e2e
```

Note: This requires `ap-tools` to be installed (<https://github.com/ministryofjustice/hmpps-approved-premises-tools>)

## Release process

Our release process aligns with the other CAS teams and as such [lives in
Confluence](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4247847062/Release+process).
The steps are also available in the
[PULL_REQUEST_TEMPLATE](/.github/PULL_REQUEST_TEMPLATE.md#release-checklist).

## Manage infrastructure & view logs

This application is hosted on the MoJ Cloud Platform. For further details
head over to [our infrastructure documentation](/doc/how-to/manage-infrastructure.md).
