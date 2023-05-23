# Leemons

The powerful flexible friendly Learning Experience Platform you’re waiting for.

- **Keep control over your data**. With Leemons, you know where your data is stored, and you keep full control at all times.
- **Self-hosted**. You can host and scale Leemons the way you want. You can choose any hosting platform you want: AWS, Render, Netlify, Heroku, a VPS, or a dedicated server. You can scale as you grow, 100% independent.
- **Customizable**. You can quickly build your logic by fully customizing plugins to fit your needs perfectly.

## 🚀 Installation

Complete installation and requirements can be found in the documentation under [Installation](https://leemonade.github.io/leemons-docs/getting-started/installation)

**Supported operating systems**:

- Ubuntu LTS/Debian 9.x
- CentOS/RHEL 8
- macOS Mojave
- Windows 10
- Docker - Coming soon

(Please note that Leemons may work on other operating systems, but these are not tested nor officially supported at this time.)

**Node:**

- NodeJS >= 16.x
- NPM >= 7.x

**Database:**

- MySQL >= 5.6
- MariaDB >= 10.1
- PostgreSQL >= 10
- MongoDB (comming soon)

## Features

See feature list at [Overview](https://leemonade.github.io/leemons-docs)

## Contributors

<a href="https://github.com/leemonade/leemons/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=leemonade/leemons" />
</a>

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request to the project.

## Community support

For general help using Leemons, please refer to - the official Leemons documentation (Coming soon) -. For additional help, you can use one of these channels to ask a question:

- [GitHub](https://github.com/leemonade/leemons) (Bug reports, Contributions)

### How to run using pm2

```
pm2 start yarn --name leemons-backend -- dev
pm2 start yarn --name leemons-frontend -- front
```

Or run the following commands to start without building the frontend:

```
pm2 start yarn --name leemons-backend -- start
pm2 start yarn --name leemons-frontend -- front:preview
```

### How to migrate the database to a new server?

1. Import the database dump of the old server

2. Update the paths of the plugins and providers table

```
UPDATE `models::plugins` SET path = REPLACE(path, 'OLD LEEMONS PATH', 'NEW LEEMONS PATH') WHERE path LIKE 'OLD LEEMONS PATH/%%';
 UPDATE `models::providers` SET path = REPLACE(path, 'OLD LEEMONS PATH', 'NEW LEEMONS PATH') WHERE path LIKE 'NEW LEEMONS PATH/%%';
```

3. Update the server IP address

```
UPDATE `leemons`.`plugins_users::config` SET `value` = 'NEW URL' WHERE `id` = 'id';
```

### How to activate user accounts manually?

1. Connect to your database

2. Paste this queries

```
use `leemons`;
SET @email = "example@leemons.io";

SELECT value FROM `plugins_users::config` WHERE `key` = "jwt-private-key";

SELECT code, user FROM `plugins_users::user-register-password` WHERE user = (
    SELECT id FROM `plugins_users::users` WHERE email = @email
);
```

3. Replace all in the first line leemons by your database

4. Replace the email in the second line by your user email

5. Replace the given info in the following object:

```
{
  "id": "USER",
  "code": "CODE,
  "iat": 1668679279,       // From epoch converter
  "exp": 1669679279        // I've just changed a number and verify the new date is greater enough.
}
```

6. entre jwt.io and replace the payload by that object and the secret key by the jwt-private-key, and copy the jwt

7. Create the url replacing the host by your domain and YOUR_JWT by the copied JWT

```
HOST/users/register-password?token=YOUR_JWT
```
