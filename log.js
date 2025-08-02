import pc from "picocolors";

const symbolMap = {
    info: "i ",
    success: "√ ",
    error: "× ",
    warn: "! ",
    debug: "… ",
};

export const log = {
    info: (msg) => console.log(pc.gray(msg)),
    success: (msg) => console.log(pc.green(symbolMap.success + msg)),
    error: (msg) => console.log(pc.red(symbolMap.error + msg)),
    warn: (msg) => console.log(pc.yellow(symbolMap.warn + msg)),
    debug: (msg) => console.log(pc.cyan(symbolMap.info + msg)),
    bold: (msg) => console.log(pc.bold(symbolMap.info + msg)),
};
