# Lenky Melky

## Description

Welcome to the fancy app that allows a seamless integration of the vulnerable URLs to be opened in a secured sandbox application within a browser using Docker technology.

### Idea

In Argos for specific links (Alert Phishing, RI Indicator URL) is exposed "Safely open this link" icon when hovered.
If clicked: New panel with New Component is opened and showing loading indication
This Component sends request to this middleware app.
Request contains URL to be opened.
The app creates new technical user.
The app creates new session (Chrome).
The app returns the expected URL to be used in a panel.

## Prerequisites

- [Node.js](https://nodejs.org/]) installed
- Install all dependencies
```shell
npm i
```

## Configuration

Update the `.env` file with corresponding values
```
APP_PORT=80
ENABLE_FORCE_KASM_DESTROY=true
KASM_BASE_URL=https://10.211.55.3
KASM_CLIENT_ID=rH2VeGNWeEQJ
KASM_CLIENT_SECRET=74JmLQ2pdYBEASCAAjVEQs9EvvRV1p1z
KASM_IMAGE_NAME=Chromium
```
- `APP_PORT` - the port for the running middleware app
- `ENABLE_FORCE_KASM_DESTROY` - forces destroy of live Kasm sessions, if "No resources are available" exception is raised
- `KASM_BASE_URL` - base URL of the running Kasm service
- `KASM_CLIENT_ID` - Kasm API client_id ([read more](https://www.kasmweb.com/docs/latest/developers/developer_api.html#api-keys))
- `KASM_CLIENT_SECRET` - Kasm API client_secret ([read more](https://www.kasmweb.com/docs/latest/developers/developer_api.html#api-keys))
- `KASM_IMAGE_NAME` - Kasm image name to open the link in (`Chromium` or `Firefox`)

## Run

```shell
node app.js
```

## How to integrate

Use the link

**View link**

> `http://domain/url?image=Chrome&value=aHR0cHM6Ly9jeWJlcmludC5jb20=`

- `value` is Base64 encoded URL, where `aHR0cHM6Ly9jeWJlcmludC5jb20=` value is encoded cyberint.com
- `image` is Kasm image name (Kasm image that is based off of the desktop container)

The app responds with direct link to created Kasm session.

*Example*

`https://10.211.55.3/#/connect/kasm/7d78b5fa-0b9b-4301-a0d0-7195cae5f64f/f99db96972504d1ca2cc0cb5d1b75e4b/d528263f-fa01-4446-bc5e-024b33be99e0?disable_control_panel=1&disable_tips=1&disable_chat=1&disable_fixed_res=1`

**Open binary**

> `http://domain/binary?value=aHR0cHM6Ly9jeWJlcmludC5jb20=`

- `value` is Base64 encoded URL, where `aHR0cHM6Ly9jeWJlcmludC5jb20=` value is encoded cyberint.com (direct path to a binary file for downloading)

