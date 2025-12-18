#!/usr/bin/env node

import prompts from "prompts";
import { renderProject } from "./render.js";

const response = await prompts([
    {
        type: "text",
        name: "name",
        message: "Project name:",
        initial: "my-fastify-app",
    },
    {
        type: "multiselect",
        name: "features",
        message: "Select Fastify plugins and middleware:",
        choices: [
            { title: "pino-pretty", value: "pino-pretty", selected: true },
            { title: "Mongoose", value: "mongoose" },
            { title: "CORS", value: "cors" },
            { title: "Formbody", value: "formbody" },
            { title: "Helmet", value: "helmet" },
            { title: "JWT", value: "jwt" },
            { title: "OAuth", value: "oauth" },
            { title: "Sensible", value: "sensible" },
            { title: "Swagger", value: "swagger" },
        ],
    },
    {
        type: (prev, values) =>
            values.features.includes("oauth") ? "select" : null,
        name: "oauthProvider",
        message: "Select Default OAuth provider:",
        choices: [
            { title: "Google", value: "google" },
            { title: "GitHub", value: "github" },
            { title: "Discord", value: "discord" },
        ],
        initial: 0,
    },
    {
        type: "multiselect",
        name: "infrastructure",
        message: "Select infrastructure features:",
        choices: [
            { title: "Docker", value: "docker", selected: true },
            {
                title: "IDE: JetBrains",
                value: "jetbrains",
            },
            {
                title: "IDE: VS Code",
                value: "vscode",
            },
        ],
    },
    {
        type: (prev, values) =>
            values.infrastructure.includes("jetbrains") ? "multiselect" : null,
        name: "jetbrains",
        message: "Select JetBrains project addons",
        choices: [
            { title: "Discord", value: "discord" },
            { title: "Coding assistance", value: "coding", selected: true },
            { title: "Prettier", value: "prettier" },
        ],
    },
    {
        type: "text",
        name: "envVars",
        message:
            "Enter ENV variable names, seperated by commas. Services you added will have default ENV variables assigned to them.",
        initial: "PORT",
    },
    {
        type: "toggle",
        name: "dynamicImports",
        message:
            "Enable dynamic imports with path aliases (e.g. '#constants/file')?",
        initial: true,
        active: "yes",
        inactive: "no",
    },
]);

// Abort if essential info missing
if (
    !response.name ||
    !response.features ||
    !response.envVars ||
    (response.features.includes("oauth") && !response.oauthProvider)
) {
    console.log("Aborted");
    process.exit(1);
}

let {
    name,
    features,
    oauthProvider,
    envVars,
    dynamicImports,
    infrastructure,
    jetbrains,
} = response;
features = [...features, ...infrastructure, ...jetbrains];

// Parse envVars into array of trimmed strings
const envVarList = envVars
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

// Call your render function with all info
await renderProject(name, features, oauthProvider, envVarList, dynamicImports);
