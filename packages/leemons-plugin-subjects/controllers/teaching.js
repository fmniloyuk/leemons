module.exports = {
  existsItem: async (ctx) => {
    const result = await leemons.plugin.services.teaching.existsItem(ctx.request.body.items, {
      useNames: ctx.request.body.useNames,
    });
    ctx.body = { result };
  },
  createItem: async (ctx) => {
    const result = await leemons.plugin.services.teaching.createItem(ctx.request.body.items);
    ctx.body = { result };
  },
  updateItem: async (ctx) => {
    const result = await leemons.plugin.services.teaching.updateItem(ctx.request.body.items);
    ctx.body = { result };
  },
  deleteItem: async (ctx) => {
    const result = await leemons.plugin.services.teaching.deleteItem(ctx.request.body.items);
    ctx.body = result;
  },
  getItem: async (ctx) => {
    const { items, locale } = ctx.request.query;
    let result = {};
    if (items === '') {
      ctx.body = {};
    } else {
      result = await leemons.plugin.services.teaching.getItem(items.trim().split(','), locale);
    }
    ctx.body = { result };
  },
  listItem: async (ctx) => {
    const result = await leemons.plugin.services.teaching.listItem(ctx.request.query.locale);
    ctx.body = { result };
  },

  add: async (ctx) => {
    const result = await leemons.plugin.services.teaching.add(
      ctx.request.params.id,
      ctx.request.body.items
    );
    ctx.body = { result };
  },
  // update: async (ctx) => {
  //   const result = await leemons.plugin.services.teaching.update(ctx.request.body.items);
  //   ctx.body = { result };
  // },
  // delete: async (ctx) => {
  //   const result = await leemons.plugin.services.teaching.delete(ctx.request.body.items);
  //   ctx.body = result;
  // },
  // get: async (ctx) => {
  //   const { items, locale } = ctx.request.query;
  //   let result = {};
  //   if (items === '') {
  //     ctx.body = {};
  //   } else {
  //     result = await leemons.plugin.services.teaching.get(items.trim().split(','), locale);
  //   }
  //   ctx.body = { result };
  // },
  // list: async (ctx) => {
  //   const result = await leemons.plugin.services.teaching.list(ctx.request.query.locale);
  //   ctx.body = { result };
  // },
};
