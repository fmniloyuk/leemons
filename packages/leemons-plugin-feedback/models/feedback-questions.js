module.exports = {
  modelName: 'feedback-questions',
  collectionName: 'feedback-questions',
  options: {
    useTimestamps: true,
  },
  attributes: {
    assignable: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    required: {
      type: 'boolean',
    },
    question: {
      type: 'text',
      required: true,
    },
    // ES: Aqui se almacena toda la configuración adicional segun el tipo de pregunta
    properties: {
      type: 'json',
    },
  },
  primaryKey: {
    type: 'uuid',
  },
};