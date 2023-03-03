const permissionsPrefix = 'plugins.mqtt-aws-iot';

const permissionNames = {
  config: `${permissionsPrefix}.config`,
};

const permissions = [
  {
    permissionName: permissionNames.config,
    actions: ['admin'],
    localizationName: { es: 'Configuración AWS IOT', en: 'AWS IOT config' },
  },
];

const permissionsBundles = {
  config: {
    admin: {
      permission: permissionNames.config,
      actions: ['admin'],
    },
  },
};

const menuItems = [
  // Main
  {
    item: {
      order: 103,
      key: 'aws-iot',
      iconSvg: '/public/mqtt-aws-iot/menu-icon.svg',
      url: '/private/mqtt-aws-iot/config',
      activeIconSvg: '/public/mqtt-aws-iot/menu-icon-active.svg',
      label: { es: 'Configuración AWS IOT', en: 'AWS IOT config' },
    },
    permissions: [
      {
        permissionName: permissionNames.config,
        actionNames: ['admin'],
      },
    ],
  },
];

module.exports = {
  pluginName: permissionsPrefix,
  permissions: {
    permissions,
    names: permissionNames,
    bundles: permissionsBundles,
  },
  menuItems,
};