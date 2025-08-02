import Handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import deepmerge from "deepmerge";
import prettier from "prettier";
import { log } from "./log.js";

const __dirname = import.meta.dirname;

// Helper to check if array includes value (for Handlebars)
Handlebars.registerHelper("includes", function (array, value) {
    return Array.isArray(array) && array.includes(value);
});
Handlebars.registerHelper("json", function (context) {
    return JSON.stringify(context, null, 2);
});
Handlebars.registerHelper("ifeq", function (a, b, options) {
    if (a == b) {
        return options.fn(this);
    }
    return options.inverse(this);
});
Handlebars.registerHelper("ifnoteq", function (a, b, options) {
    if (a != b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Load dependencies from __depends.json if exists
async function loadDependencies(dir) {
    const dependsPath = path.join(dir, "__depends.json");
    try {
        const content = await fs.readFile(dependsPath, "utf-8");
        const json = JSON.parse(content);
        if (!json?.environmentVariables?.length) {
            json.environmentVariables = [];
        }
        return json;
    } catch (err) {
        return {
            dependencies: {},
            devDependencies: {},
            environmentVariables: [],
        };
    }
}

// Recursively render folder templates (excluding __depends.json and package.json.hbs)
async function renderFolder(srcDir, destDir, context) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        if (
            entry.name === "__depends.json" ||
            entry.name === "package.json.hbs"
        ) {
            // skip dependency file and package template (handled separately)
            continue;
        }

        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(
            destDir,
            entry.name.endsWith(".hbs") ? entry.name.slice(0, -4) : entry.name
        );

        if (entry.isDirectory()) {
            await fs.mkdir(destPath, { recursive: true });
            await renderFolder(srcPath, destPath, context);
        } else {
            const content = await fs.readFile(srcPath, "utf-8");

            if (entry.name.endsWith(".hbs")) {
                const template = Handlebars.compile(content);
                const rendered = template(context);

                // Prettify JS or JSON files, otherwise write raw
                if (destPath.endsWith(".js") || destPath.endsWith(".json")) {
                    const parser = destPath.endsWith(".json")
                        ? "json"
                        : "babel";
                    const pretty = await prettier.format(rendered, {
                        parser,
                        arrowParens: "always",
                        bracketSpacing: true,
                        endOfLine: "lf",
                        printWidth: 80,
                        semi: true,
                        tabWidth: 4,
                        proseWrap: "preserve",
                    });
                    await fs.writeFile(destPath, pretty);
                } else {
                    await fs.writeFile(destPath, rendered);
                }

                log.info(`Rendered template: ${destPath}`);
            } else {
                // Copy non-template files as is
                await fs.copyFile(srcPath, destPath);
                log.info(`Copied file: ${destPath}`);
            }
        }
    }
}

export async function renderProject(
    name,
    features,
    oauthProvider,
    environmentVariables,
    dynamicImports
) {
    log.debug(`Starting project generation for: ${name}`);
    const outDir = path.resolve(process.cwd(), name);
    const baseDir = path.join(__dirname, "templates/base");
    const servicesDir = path.join(__dirname, "templates/services");

    await fs.mkdir(outDir, { recursive: true });

    // Load base dependencies
    let combinedDeps = await loadDependencies(baseDir);

    // Load and merge dependencies from selected features/services
    for (const feature of features) {
        const serviceDir = path.join(servicesDir, feature);
        try {
            const stat = await fs.stat(serviceDir);
            if (!stat.isDirectory()) {
                continue;
            }
        } catch (err) {
            if (err.code === "ENOENT") {
                continue;
            }
            throw err;
        }

        const serviceDeps = await loadDependencies(serviceDir);
        combinedDeps = deepmerge(combinedDeps, serviceDeps);
    }

    //merge array with a new Set to avoid duplications.
    const env = [
        ...new Set([
            ...combinedDeps.environmentVariables,
            ...environmentVariables,
        ]),
    ];

    // Context to pass to templates
    const context = {
        name,
        features,
        oauthProvider,
        environmentVariables: env,
        dynamicImports,
        dependencies: combinedDeps.dependencies,
        devDependencies: combinedDeps.devDependencies,
    };

    // Render base folder (excluding __depends.json and package.json.hbs)
    await renderFolder(baseDir, outDir, context);

    // Render selected services
    for (const feature of features) {
        const serviceDir = path.join(servicesDir, feature);

        try {
            const stat = await fs.stat(serviceDir);
            if (!stat.isDirectory()) {
                log.warn(
                    `Warning: Service "${feature}" exists but is not a directory, skipping render.`
                );
                continue; // skip this service
            }
        } catch (err) {
            if (err.code === "ENOENT") {
                log.warn(
                    `Warning: Service "${feature}" directory not found, skipping render.`
                );
                continue; // skip this service
            }
            throw err; // rethrow unexpected errors
        }

        // Only call renderFolder if directory exists
        await renderFolder(serviceDir, outDir, context);
    }

    // Manually render package.json.hbs with merged dependencies
    const packageTemplatePath = path.join(baseDir, "package.json.hbs");
    const packageContent = await fs.readFile(packageTemplatePath, "utf-8");
    const packageTemplate = Handlebars.compile(packageContent);
    const packageJson = packageTemplate(context);

    const formattedPackageJson = await prettier.format(packageJson, {
        parser: "json",
    });
    await fs.writeFile(path.join(outDir, "package.json"), formattedPackageJson);
    log.info("Rendered package.json with merged dependencies");
}
