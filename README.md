# fastify-create

Script I made for myself to easily generate Fastify APIs as I found myself just writing the same base code for all my backend projects. You can add more plugins simply by adding a "service" in the templates, \_\_depends.json contains the dependencies and environment variables. Files without the hbs extension are simply copied over, but files like script.js.hbs are rendered through handlebars and then copied as script.js.

## TODO:

- Add more oauth providers
- Add more features or "services"

## Run Locally

```bash
    # npm
    npx github:lunatine-dev/fastify-create
    #pnpm
    pnpm dlx github:lunatine-dev/fastify-create
```
