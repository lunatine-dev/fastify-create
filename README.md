# fastify-create

Script I made for myself to easily generate Fastify APIs as I found myself just writing the same base code for all my backend projects. You can add more plugins simply by adding a "service" in the templates, \_\_depends.json contains the dependencies and environment variables. Files without the hbs extension are simply copied over, but files like script.js.hbs are rendered through handlebars and then copied as script.js.

## TODO:

- Add more oauth providers
- Add more features or "services"

## Run Locally

Clone the project

```bash
  git clone https://github.com/lunatine-dev/fastify-create
```

Go to the project directory

```bash
  cd fastify-create
```

Install dependencies

```bash
  npm install
```

Link as global package

```bash
  npm link --global
```

Run package, follow prompts to create your fastify project in the CWD

```
fastify-create
```
