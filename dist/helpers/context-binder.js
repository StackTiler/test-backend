"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThisContextBinder = void 0;
class ThisContextBinder {
    static bindControllerMethods(controller) {
        const proto = Object.getPrototypeOf(controller);
        Object.getOwnPropertyNames(proto).forEach((key) => {
            const value = controller[key];
            if (typeof value === "function") {
                controller[key] = value.bind(controller);
            }
        });
    }
}
exports.ThisContextBinder = ThisContextBinder;
