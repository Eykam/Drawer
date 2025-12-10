declare const app: import("hono/hono-base").HonoBase<{}, {
    "*": {};
} & {
    "/login": {
        $post: {
            input: {
                json: {
                    username: string;
                    password: string;
                };
            };
            output: {
                status: "failure";
            };
            outputFormat: "json";
            status: 403;
        } | {
            input: {
                json: {
                    username: string;
                    password: string;
                };
            };
            output: {
                status: "success";
                token: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/logout": {
        $post: {
            input: {};
            output: {
                status: "logged out";
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/checkAuth": {
        $post: {
            input: {};
            output: {
                authenticated: true;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {};
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        };
    };
} & {
    "/test": {
        $get: {
            input: {};
            output: "test";
            outputFormat: "text";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/testAuth": {
        $get: {
            input: {};
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {};
            output: "Authorized!";
            outputFormat: "text";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/rename": {
        $post: {
            input: {
                json: {
                    type: "file" | "dir";
                    source: string;
                    dest: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    type: "file" | "dir";
                    source: string;
                    dest: string;
                };
            };
            output: {
                success: true;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    type: "file" | "dir";
                    source: string;
                    dest: string;
                };
            };
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {
                json: {
                    type: "file" | "dir";
                    source: string;
                    dest: string;
                };
            };
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/delete": {
        $post: {
            input: {
                json: {
                    names: string[];
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    names: string[];
                };
            };
            output: {
                success: true;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    names: string[];
                };
            };
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {
                json: {
                    names: string[];
                };
            };
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/mkdir": {
        $post: {
            input: {
                json: {
                    name: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    name: string;
                };
            };
            output: {
                success: true;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    name: string;
                };
            };
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {
                json: {
                    name: string;
                };
            };
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/upload": {
        $post: {
            input: {};
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {};
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {};
            output: {
                success: true;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {};
            output: {
                success: false;
                error: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/directory": {
        $post: {
            input: {
                json: {
                    path?: string | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    path?: string | undefined;
                };
            };
            output: {
                mimeType: string | false;
                name?: string | undefined;
                size?: number | undefined;
                lastModified?: string | undefined;
            }[];
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                json: {
                    path?: string | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 404;
        };
    };
} & {
    "/file": {
        $post: {
            input: {
                json: {
                    path: string;
                };
            };
            output: {};
            outputFormat: string;
            status: import("hono/utils/http-status").StatusCode;
        } | {
            input: {
                json: {
                    path: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        };
    };
}, "/">;
export type AppType = typeof app;
declare const _default: {
    port: number;
    fetch: (request: Request, Env?: unknown, executionCtx?: import("hono").ExecutionContext) => Response | Promise<Response>;
};
export default _default;
