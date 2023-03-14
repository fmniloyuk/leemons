module.exports = {
  modelName: 'assignations',
  options: {
    useTimestamps: true,
  },
  attributes: {
    instance: {
      type: 'string',
      options: {
        notNull: true,
      },
    },
    indexable: {
      type: 'boolean',
      options: {
        notNull: true,
      },
    },
    user: {
      type: 'string',
      options: {
        notNull: true,
      },
    },
    classes: {
      type: 'text',
      textType: 'mediumText',
      options: {
        notNull: true,
      },
    },
    group: {
      type: 'string',
    },
    status: {
      type: 'string',
    },
    metadata: {
      type: 'text',
      textType: 'mediumText',
    },
    emailSended: {
      type: 'boolean',
    },
    rememberEmailSended: {
      type: 'boolean',
    },
  },
  primaryKey: {
    name: 'id',
    type: 'uuid',
  },
};
